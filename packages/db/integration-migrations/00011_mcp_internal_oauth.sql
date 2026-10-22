-- Persist only opaque, hashed authorization artifacts for SAM's built-in OAuth server.
CREATE TABLE mcp_oauth_clients (
  client_id TEXT PRIMARY KEY,
  redirect_uris TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE mcp_oauth_requests (
  request_hash TEXT PRIMARY KEY,
  csrf_hash TEXT NOT NULL,
  client_id TEXT NOT NULL REFERENCES mcp_oauth_clients(client_id) ON DELETE CASCADE,
  redirect_uri TEXT NOT NULL,
  state TEXT NOT NULL,
  code_challenge TEXT NOT NULL,
  scope TEXT NOT NULL,
  resource TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX mcp_oauth_requests_expiry ON mcp_oauth_requests(expires_at);

CREATE TABLE mcp_oauth_codes (
  code_hash TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES mcp_oauth_clients(client_id) ON DELETE CASCADE,
  redirect_uri TEXT NOT NULL,
  code_challenge TEXT NOT NULL,
  scope TEXT NOT NULL,
  resource TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX mcp_oauth_codes_expiry ON mcp_oauth_codes(expires_at);

CREATE TABLE mcp_oauth_refresh_tokens (
  token_hash TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES mcp_oauth_clients(client_id) ON DELETE CASCADE,
  scope TEXT NOT NULL,
  resource TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX mcp_oauth_refresh_expiry ON mcp_oauth_refresh_tokens(expires_at);
