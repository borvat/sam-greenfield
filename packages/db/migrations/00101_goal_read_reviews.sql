CREATE TABLE IF NOT EXISTS goal_read_reviews (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 goal_id UUID NOT NULL REFERENCES goals(id),
 plan_id UUID NOT NULL REFERENCES plans(id),
 round INTEGER NOT NULL CHECK(round BETWEEN 1 AND 5),
 decision JSONB NOT NULL,
 report_hash TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(goal_id,plan_id)
);
REVOKE ALL ON goal_read_reviews FROM PUBLIC;
CREATE INDEX IF NOT EXISTS goal_read_reviews_goal ON goal_read_reviews(goal_id,round);
