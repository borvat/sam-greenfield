-- Keep the original immutable report; permit at most one explicitly linked same-plan revision.
ALTER TABLE goal_read_reviews ADD COLUMN revision INTEGER NOT NULL DEFAULT 1 CHECK(revision BETWEEN 1 AND 2);
ALTER TABLE goal_read_reviews ADD COLUMN supersedes_report_id UUID;
ALTER TABLE goal_read_reviews DROP CONSTRAINT goal_read_reviews_goal_id_plan_id_key;
ALTER TABLE goal_read_reviews ADD CONSTRAINT goal_read_reviews_goal_plan_revision_key UNIQUE(goal_id,plan_id,revision);
ALTER TABLE goal_read_reviews ADD CONSTRAINT goal_read_reviews_identity_scope_key UNIQUE(id,goal_id,plan_id);
ALTER TABLE goal_read_reviews ADD CONSTRAINT goal_read_reviews_supersedes_key UNIQUE(supersedes_report_id);
ALTER TABLE goal_read_reviews ADD CONSTRAINT goal_read_reviews_supersedes_scope_fk
 FOREIGN KEY(supersedes_report_id,goal_id,plan_id) REFERENCES goal_read_reviews(id,goal_id,plan_id);
ALTER TABLE goal_read_reviews ADD CONSTRAINT goal_read_reviews_revision_link_check
 CHECK((revision=1 AND supersedes_report_id IS NULL) OR (revision=2 AND supersedes_report_id IS NOT NULL AND supersedes_report_id<>id));
-- Existing RLS and SELECT/INSERT grants remain unchanged. No UPDATE/DELETE grant.
