-- 00016_vault_shred_revoked
--
-- Crypto-shredding of revoked credentials. A REVOKED vault row is never read again (only
-- ACTIVE rows are decrypted), but its ciphertext used to stay wrapped under whatever master
-- key version it was written with, which made an old master key impossible to retire.
--   * New column shredded_at. A REVOKED row may be shredded exactly once: the six secret-
--     material columns become empty and shredded_at is set. The row itself stays, so version
--     numbers, history and the "no env fallback after revoke" rule are unchanged.
--   * Nothing else about secret material becomes mutable: ACTIVE rows, and REVOKED rows that
--     have not been shredded, still reject any change to it. A shredded row is final.
--   * Shredding goes through vault_shred_revoked() (SECURITY DEFINER, EXECUTE for the vault role
--     only); the vault role gets no UPDATE privilege on the material columns.

ALTER TABLE credential_vault ADD COLUMN IF NOT EXISTS shredded_at TIMESTAMPTZ;

ALTER TABLE credential_vault DROP CONSTRAINT IF EXISTS credential_vault_dek_nonce_check;
ALTER TABLE credential_vault DROP CONSTRAINT IF EXISTS credential_vault_wrapped_dek_check;
ALTER TABLE credential_vault DROP CONSTRAINT IF EXISTS credential_vault_dek_tag_check;
ALTER TABLE credential_vault DROP CONSTRAINT IF EXISTS credential_vault_nonce_check;
ALTER TABLE credential_vault DROP CONSTRAINT IF EXISTS credential_vault_ciphertext_check;
ALTER TABLE credential_vault DROP CONSTRAINT IF EXISTS credential_vault_auth_tag_check;
ALTER TABLE credential_vault DROP CONSTRAINT IF EXISTS credential_vault_material_shape;
ALTER TABLE credential_vault ADD CONSTRAINT credential_vault_material_shape CHECK (
  (shredded_at IS NULL
     AND octet_length(dek_nonce) = 12 AND octet_length(wrapped_dek) = 32 AND octet_length(dek_tag) = 16
     AND octet_length(nonce) = 12 AND octet_length(ciphertext) BETWEEN 2 AND 65536 AND octet_length(auth_tag) = 16)
  OR
  (shredded_at IS NOT NULL AND status = 'REVOKED'
     AND octet_length(dek_nonce) = 0 AND octet_length(wrapped_dek) = 0 AND octet_length(dek_tag) = 0
     AND octet_length(nonce) = 0 AND octet_length(ciphertext) = 0 AND octet_length(auth_tag) = 0)
);

CREATE OR REPLACE FUNCTION credential_vault_guard_update() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  v_material_changed BOOLEAN;
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.legal_entity_id IS DISTINCT FROM OLD.legal_entity_id
     OR NEW.provider IS DISTINCT FROM OLD.provider
     OR NEW.name IS DISTINCT FROM OLD.name
     OR NEW.secret_version IS DISTINCT FROM OLD.secret_version
     OR NEW.key_version IS DISTINCT FROM OLD.key_version
     OR NEW.created_by IS DISTINCT FROM OLD.created_by
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'credential_vault secret material is immutable; rotate by inserting a new version';
  END IF;
  v_material_changed := NEW.dek_nonce IS DISTINCT FROM OLD.dek_nonce
     OR NEW.wrapped_dek IS DISTINCT FROM OLD.wrapped_dek
     OR NEW.dek_tag IS DISTINCT FROM OLD.dek_tag
     OR NEW.nonce IS DISTINCT FROM OLD.nonce
     OR NEW.ciphertext IS DISTINCT FROM OLD.ciphertext
     OR NEW.auth_tag IS DISTINCT FROM OLD.auth_tag;
  IF OLD.shredded_at IS NOT NULL THEN
    IF v_material_changed OR NEW.shredded_at IS DISTINCT FROM OLD.shredded_at THEN
      RAISE EXCEPTION 'a shredded credential is final';
    END IF;
  ELSIF v_material_changed OR NEW.shredded_at IS NOT NULL THEN
    -- the only permitted material change: shredding a REVOKED row to empty values
    IF NOT (OLD.status = 'REVOKED' AND NEW.status = 'REVOKED' AND NEW.shredded_at IS NOT NULL
            AND octet_length(NEW.dek_nonce) = 0 AND octet_length(NEW.wrapped_dek) = 0
            AND octet_length(NEW.dek_tag) = 0 AND octet_length(NEW.nonce) = 0
            AND octet_length(NEW.ciphertext) = 0 AND octet_length(NEW.auth_tag) = 0) THEN
      RAISE EXCEPTION 'credential_vault secret material is immutable; rotate by inserting a new version';
    END IF;
  END IF;
  IF OLD.status = 'REVOKED' AND (NEW.status IS DISTINCT FROM 'REVOKED'
     OR NEW.revoked_by IS DISTINCT FROM OLD.revoked_by
     OR NEW.revoked_at IS DISTINCT FROM OLD.revoked_at) THEN
    RAISE EXCEPTION 'a revoked credential is final';
  END IF;
  RETURN NEW;
END $$;

DO $mig$ BEGIN EXECUTE format($f$
CREATE OR REPLACE FUNCTION vault_shred_revoked(p_other_than_key_version INTEGER, p_older_than_days INTEGER)
RETURNS SETOF UUID LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, %1$I, pg_temp AS $body$
  UPDATE credential_vault SET dek_nonce = decode('', 'hex'), wrapped_dek = decode('', 'hex'),
         dek_tag = decode('', 'hex'), nonce = decode('', 'hex'), ciphertext = decode('', 'hex'),
         auth_tag = decode('', 'hex'), shredded_at = now()
   WHERE status = 'REVOKED' AND shredded_at IS NULL
     AND (p_other_than_key_version IS NULL OR key_version <> p_other_than_key_version)
     AND (p_older_than_days IS NULL OR revoked_at < now() - make_interval(days => p_older_than_days))
  RETURNING id;
$body$;
$f$, current_schema()); END $mig$;

REVOKE ALL ON FUNCTION vault_shred_revoked(INTEGER, INTEGER) FROM PUBLIC;
