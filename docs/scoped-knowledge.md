# Scoped knowledge cycle (staged, not deployed)

This change is based on release af4be2e. It must remain on its own branch while
SAM-SOAK-24H-AF4-20261021 runs. No production migration, environment flag,
restart or deploy is part of this change. Production memory remains unchanged.

## Implemented behavior

`SAM_KNOWLEDGE_ENABLED=true` enables the new capture/recall path after migration
00102. With the flag absent, neither path touches the new table. Existing legacy
memory retrieval now fails closed: only records whose scope.legal_entity_id
matches the current legal entity enter planning. Unscoped legacy records need
explicit attribution before use; do not infer their company from text.

On a complete read report accepted by the existing independent objective review,
the report transaction captures each finding's literal source quotation. It
rechecks the execution belongs to this goal and its latest verification is
VERIFIED. The model's summary/paraphrase is not promoted into business truth.
The knowledge insert and report completion commit atomically. Report replay is
idempotent. Failed read attempts and model control history are not sources.

The legal entity comes from the persisted goal, never a model-selected field.
A SOURCE_FACT means "the verified source contained this quotation", not "the
business claim is objectively true". Its timestamp is observation/read time;
the underlying document may be historical. A quotation can contain malicious
instructions: planner policy treats all memory as untrusted DATA. Stored text
never enlarges the capability allowlist or owner authority.

Both initial planning and replanning recall a bounded set of matching, unexpired,
non-superseded records for that company. The current objective supplies the
lexical search; there is no embedding model or cross-language semantic search.
The recall window defaults to 30 days and is an upper bound, not a live-data SLA.
Stock, price, permission and other current-state tasks still need fresh reads.
Each recalled record includes its type, provenance, timestamp and expiry.
`sam_list_knowledge` is an owner-only existing tool-surface read requiring an
explicit legal_entity_id, and labels ACTIVE / EXPIRED / SUPERSEDED history.

INFERENCE is an explicitly uncertain annotation. OWNER_DECISION can be written
only through an internal trusted function with an existing unexpired APPROVED
approval for capability `knowledge_owner_decision`, this goal and company, and
params_hash = sha256Hex({statement}). It retains the approval ID and approver.
No new owner-approval creation tool or model-callable knowledge mutation tool
is introduced. Source text cannot generate an owner decision automatically.
The existing authority checks remain responsible for every executable action.

Explicit corrections retain the old row and link a newer replacement. They
reject cross-company, cross-kind, backward-time or already superseded changes.
The caller must use a database transaction. Contradictory quotations from
separate sources coexist; this patch does not guess which is true or infer
semantic contradictions. Model-generated annotations are not automatic.

## Validation and limits

`npm run test:knowledge` exercises real isolated PostgreSQL-compatible SQL using
PGlite. It covers automatic capture at report completion, rollback, quotation
forgery, wrong-goal evidence, latest failed verification, durable close/reopen,
independent goal context assembly through the actual orchestrator, planner
handoff, expiry, company isolation in application SQL and non-owner RLS, explicit
corrections, decision approvals, uncertainty and disabled-feature behavior.
The planner gateway is deterministic in tests; this is not a live DeepSeek or
production restart acceptance test. Test companies and prices are synthetic.

`npm run test:sam-google` and the planner scope tests retain existing recovery,
read-only authority and evidence protections. The Phase 5 legacy learning
fixture now assigns explicit company scope to memory records; its live database
suite was not run against production.

## Deployment gates after the existing soak

1. Review this branch. Preserve the completed soak's exact version/evidence.
2. Apply migration on staging and deploy this branch with the flag initially off.
3. Enable in staging and run a real source-reading task that captures a useful
   quotation. Submit a second independently worded task with no repeated fact;
   inspect the planner input/provenance, not just the COMPLETED label.
4. Restart staging and repeat the retrieval task; inspect company A/B separation,
   explicit owner decisions, expiry and an evidence-backed correction.
5. Only then deploy/enable production and repeat bounded read-only acceptance.
   Disabling the flag stops capture/recall without deleting evidence history.

Broader work remains: semantic conflict detection, multilingual relevance,
company-structure attribution from source evidence, an authenticated owner
annotation workflow, and verified experience learning from recovery events.
Do not call this full autonomous long-term learning yet.
