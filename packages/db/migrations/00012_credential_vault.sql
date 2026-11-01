-- 00012_credential_vault
--
-- Per-legal-entity integration credentials (bol.com, Gmail, e-Boekhouden, ...),
-- stored ONLY as envelope-encrypted ciphertext.
--
--   * Encryption happens in the application (packages/db/src/credentialVault.ts,
--     AES-256-GCM). Plaintext secrets and key material never reach SQL text, so they
--     cannot appear in statement logs, pg_stat_statements or dumps. The key-encryption
--     keys live in the service environment / secret store, never in this database.
--   * Each row holds a fresh data key wrapped by a versioned master key. The
--     authenticated data binds a row to (legal_entity_id, provider, name, version,
--     key_version), so ciphertext copied to another entity or name fails to decrypt.
--   * Append-only secret material: a trigger forbids changing any ciphertext column.
--     Rotation inserts a new version and revokes the old one; history is kept.
--   * Access: only members of the group role sam_credential_vault (granted to the
--     runtime worker alone) can touch the table; see provision-roles.sql. This file
--     creates no roles or grants, so managed-provider paths can still apply it.
--     Without that role the policy below matches nobody (fail closed).

CREATE TABLE IF NOT EXISTS credential_vault (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_entity_id UUID NOT NULL REFERENCES legal_entities(id),
  provider        TEXT NOT NULL CHECK (provider ~ '^[a-z][a-z0-9_]{1,63}$'),
  name            TEXT NOT NULL CHECK (name ~ '^[a-z0-9][a-z0-9_.-]{0,63}$'),
  secret_version  INTEGER NOT NULL CHECK (secret_version >= 1),
  key_version     INTEGER NOT NULL CHECK (key_version >= 1),
  dek_nonce       BYTEA NOT NULL CHECK (octet_length(dek_nonce) = 12),
  wrapped_dek     BYTEA NOT NULL CHECK (octet_length(wrapped_dek) = 32),
  dek_tag         BYTEA NOT NULL CHECK (octet_length(dek_tag) = 16),
  nonce           BYTEA NOT NULL CHECK (octet_length(nonce) = 12),
  ciphertext      BYTEA NOT NULL CHECK (octet_length(ciphertext) BETWEEN 2 AND 65536),
  auth_tag        BYTEA NOT NULL CHECK (octet_length(auth_tag) = 16),
  status          TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','REVOKED')),
  created_by      TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_by      TEXT,
  revoked_at      TIMESTAMPTZ,
  CONSTRAINT credential_vault_revocation_consistent
    CHECK ((status = 'ACTIVE' AND revoked_at IS NULL AND revoked_by IS NULL)
        OR (status = 'REVOKED' AND revoked_at IS NOT NULL AND revoked_by IS NOT NULL)),
  CONSTRAINT credential_vault_version_unique
    UNIQUE (legal_entity_id, provider, name, secret_version)
);

-- At most one ACTIVE secret per (entity, provider, name).
CREATE UNIQUE INDEX IF NOT EXISTS credential_vault_one_active
  ON credential_vault (legal_entity_id, provider, name) WHERE status = 'ACTIVE';

CREATE OR REPLACE FUNCTION credential_vault_guard_update() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.legal_entity_id IS DISTINCT FROM OLD.legal_entity_id
     OR NEW.provider IS DISTINCT FROM OLD.provider
     OR NEW.name IS DISTINCT FROM OLD.name
     OR NEW.secret_version IS DISTINCT FROM OLD.secret_version
     OR NEW.key_version IS DISTINCT FROM OLD.key_version
     OR NEW.dek_nonce IS DISTINCT FROM OLD.dek_nonce
     OR NEW.wrapped_dek IS DISTINCT FROM OLD.wrapped_dek
     OR NEW.dek_tag IS DISTINCT FROM OLD.dek_tag
     OR NEW.nonce IS DISTINCT FROM OLD.nonce
     OR NEW.ciphertext IS DISTINCT FROM OLD.ciphertext
     OR NEW.auth_tag IS DISTINCT FROM OLD.auth_tag
     OR NEW.created_by IS DISTINCT FROM OLD.created_by
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'credential_vault secret material is immutable; rotate by inserting a new version';
  END IF;
  IF OLD.status = 'REVOKED' AND NEW.status IS DISTINCT FROM 'REVOKED' THEN
    RAISE EXCEPTION 'a revoked credential cannot be reactivated';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS credential_vault_guard_update ON credential_vault;
CREATE TRIGGER credential_vault_guard_update BEFORE UPDATE ON credential_vault
  FOR EACH ROW EXECUTE FUNCTION credential_vault_guard_update();

ALTER TABLE credential_vault ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS credential_vault_sam_credential_vault ON credential_vault;
CREATE POLICY credential_vault_sam_credential_vault ON credential_vault FOR ALL
  USING ((SELECT sam_has_role('sam_credential_vault')))
  WITH CHECK ((SELECT sam_has_role('sam_credential_vault')));
