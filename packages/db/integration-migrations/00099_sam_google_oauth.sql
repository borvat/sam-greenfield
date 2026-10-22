-- Isolated pilot schema; do not apply to production until approved and tested.
CREATE TABLE IF NOT EXISTS sam_google_oauth_states (
 state_hash text PRIMARY KEY,
 verifier_sealed text NOT NULL,
 redirect_uri text NOT NULL,
 created_at timestamptz NOT NULL,
 CONSTRAINT sam_google_state_hash_valid CHECK (length(state_hash)=64)
);
CREATE INDEX IF NOT EXISTS sam_google_oauth_states_created_idx ON sam_google_oauth_states(created_at);

CREATE TABLE IF NOT EXISTS sam_google_oauth_tokens (
 owner_id text NOT NULL,
 client_id text NOT NULL,
 refresh_sealed text NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (owner_id,client_id)
);
-- Access to these tables must be restricted to SAM server DB role.
-- Never expose them to public API readers or log query row contents.
