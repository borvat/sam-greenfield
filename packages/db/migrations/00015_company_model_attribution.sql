-- Explicit ledger-to-work links. No historical inference, price estimates or grants.
CREATE TABLE company_model_call_attributions (
 model_call_id uuid PRIMARY KEY REFERENCES model_calls(id),
 queue_id uuid NOT NULL REFERENCES work_queue(id),
 legal_entity_id uuid NOT NULL REFERENCES legal_entities(id),
 attributed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE company_model_call_attributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_call_attributions_current ON company_model_call_attributions FOR SELECT
 USING(legal_entity_id=current_legal_entity_id() AND EXISTS(SELECT 1 FROM work_queue w JOIN goals g ON g.id=w.goal_id WHERE w.id=queue_id AND g.company_scope=legal_entity_id));
CREATE POLICY company_call_attributions_insert ON company_model_call_attributions FOR INSERT
 WITH CHECK(legal_entity_id=current_legal_entity_id()
  AND EXISTS(SELECT 1 FROM model_calls m WHERE m.id=model_call_id AND m.legal_entity_id=company_model_call_attributions.legal_entity_id)
  AND EXISTS(SELECT 1 FROM work_queue w JOIN goals g ON g.id=w.goal_id WHERE w.id=queue_id AND g.company_scope=legal_entity_id));
REVOKE ALL ON company_model_call_attributions FROM PUBLIC;
