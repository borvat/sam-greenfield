-- Additive runtime fields; OAuth credentials never enter general SAM evidence tables.
ALTER TABLE sam_google_oauth_states ADD COLUMN IF NOT EXISTS owner_id text;
ALTER TABLE sam_google_oauth_states ADD COLUMN IF NOT EXISTS client_id text;
ALTER TABLE sam_google_oauth_tokens ADD COLUMN IF NOT EXISTS access_sealed text;
ALTER TABLE sam_google_oauth_tokens ADD COLUMN IF NOT EXISTS access_expires_at timestamptz;
ALTER TABLE sam_google_oauth_tokens ADD COLUMN IF NOT EXISTS discovered_tools jsonb;
REVOKE ALL ON sam_google_oauth_states, sam_google_oauth_tokens FROM PUBLIC;
