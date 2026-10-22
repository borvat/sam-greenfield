-- Staged generic verification contract for capability IDs created from an
-- operator-allowlisted, read-only MCP source. Runtime still requires a fresh
-- exact-response readback before returning VERIFIED.
ALTER TABLE verification_contracts ADD COLUMN capability_pattern TEXT UNIQUE;

INSERT INTO verification_contracts
  (capability_id, capability_pattern, description, verification_method,
   required_evidence_fields, independent_query_template, must_not_trust_execution_result)
VALUES
  ('research_mcp_*', '^research_mcp_[a-z0-9_]+$',
   'Verify an allowlisted read-only MCP source with an exact fresh readback',
   'api_readback',
   '{"fresh_response_hash":"string","execution_response_hash":"string"}'::jsonb,
   '{"source":"operator-allowlisted-mcp","method":"repeat same read with identical parameters"}'::jsonb,
   true);
