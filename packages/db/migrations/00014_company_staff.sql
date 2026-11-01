-- Additive staff attribution; does not create capability owners or grant privileges.
ALTER TABLE work_queue ADD COLUMN company_profile_id text CHECK(company_profile_id IN
 ('operations','projects','accountant','finance','sales','marketplace','suppliers','negotiation','warehouse','shipping','research','content','developer','systems','auditor'));
CREATE TABLE company_skill_proposals (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), legal_entity_id uuid NOT NULL REFERENCES legal_entities(id),
 profile_id text NOT NULL, source_url text NOT NULL, source_commit text NOT NULL CHECK(source_commit ~ '^[0-9a-f]{40}$'),
 source_hash text NOT NULL CHECK(source_hash ~ '^[0-9a-f]{64}$'), proposed_by text NOT NULL,
 state text NOT NULL DEFAULT 'QUARANTINED' CHECK(state IN('QUARANTINED','REVIEWED','ADOPTED','REJECTED')),
 review jsonb, reviewed_by text, reviewed_hash text, adopted_by text, rollback_ref text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(reviewed_by IS NULL OR reviewed_by<>proposed_by),
 CHECK(state NOT IN('REVIEWED','ADOPTED') OR (reviewed_by IS NOT NULL AND reviewed_hash=source_hash)),
 CHECK(state<>'ADOPTED' OR adopted_by IS NOT NULL)
);
ALTER TABLE company_skill_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_skills_current ON company_skill_proposals FOR ALL
 USING(legal_entity_id=current_legal_entity_id()) WITH CHECK(legal_entity_id=current_legal_entity_id());
REVOKE ALL ON company_skill_proposals FROM PUBLIC;
