-- executive_brief verification contract (approved provisioning)
-- Run once with an admin connection in psql. Idempotent: the update branch writes the
-- exact reviewed content instead of accepting whatever is already there.

-- 1) حالة الصف قبل الكتابة (يجب أن يكون فارغاً أو لا يطابق المحتوى المعتمد)
SELECT capability_id, verification_method, must_not_trust_execution_result,
       required_evidence_fields, independent_query_template, created_at
FROM verification_contracts
WHERE capability_id = 'executive_brief';

-- 2) التهيئة
INSERT INTO verification_contracts
  (capability_id, description, verification_method,
   required_evidence_fields, independent_query_template, must_not_trust_execution_result)
VALUES (
  'executive_brief',
  'An executive brief is verified only when its trace id names a stored model_calls row for this company, that call succeeded with billed tokens, and the stored brief keeps the same facts hash.',
  'db_query',
  '{"callId":"uuid","factsHash":"string","provider":"string","model":"string","tokens":"integer"}'::jsonb,
  '{"query":"select id,provider,model,tokens,cost,success,legal_entity_id from model_calls where task like (''executive_briefing:''||$1||'':%'') order by created_at desc limit 1"}'::jsonb,
  true
)
ON CONFLICT (capability_id) DO UPDATE SET
  description = EXCLUDED.description,
  verification_method = EXCLUDED.verification_method,
  required_evidence_fields = EXCLUDED.required_evidence_fields,
  independent_query_template = EXCLUDED.independent_query_template,
  must_not_trust_execution_result = true;

-- 3) التحقق بعد الكتابة: صف واحد، db_query، لا ثقة بنتيجة التنفيذ، والربط على task
SELECT capability_id,
       verification_method,
       must_not_trust_execution_result,
       required_evidence_fields->>'callId'    AS call_id_type,
       required_evidence_fields->>'factsHash' AS facts_hash_type,
       independent_query_template->>'query'   AS independent_query,
       created_at
FROM verification_contracts
WHERE capability_id = 'executive_brief';
