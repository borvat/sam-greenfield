-- Operator-only profile, deliberately outside automatic core/integration startup.
-- Historical rows remain unassigned until an explicit reviewed client mapping.
ALTER TABLE mcp_oauth_clients ADD COLUMN sam_org_id uuid REFERENCES organizations(id);
ALTER TABLE mcp_oauth_clients ADD COLUMN sam_entity_id uuid REFERENCES legal_entities(id);
ALTER TABLE mcp_oauth_clients ALTER COLUMN sam_org_id SET DEFAULT current_org_id();
ALTER TABLE mcp_oauth_clients ALTER COLUMN sam_entity_id SET DEFAULT current_legal_entity_id();
CREATE TABLE sam_service_bindings (
 role_name text PRIMARY KEY, kind text NOT NULL CHECK(kind IN ('runtime','mcp')),
 org_id uuid NOT NULL REFERENCES organizations(id), entity_id uuid NOT NULL REFERENCES legal_entities(id),
 google_owner text NOT NULL, google_client text NOT NULL, oauth_resource text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON sam_service_bindings FROM PUBLIC;
