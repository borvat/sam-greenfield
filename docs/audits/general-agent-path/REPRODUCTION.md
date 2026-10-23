# Isolated capture mismatch reproduction

Base: 1370842ad3d3f0ecf63ef5227e10386a69690b74.
Apply seal-reproduction.patch to a separate checkout. It uses existing PostgreSQL
fixture provisioning and the actual composition to complete three child goals, then
asserts sealEvaluationTrial rejects with EVALUATION_VERIFIED_FINAL_REPORT_REQUIRED.
No production or provider access. The successful rejection is a reproduced product
limitation, not acceptance success for the general-agent objective.

Command (disposable localhost database only):

```
SAM_CORE_TEST_DATABASE_URL=postgresql://postgres:generic-test-fixture@127.0.0.1:55439/sam_core_test node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```

This separate diagnostic exits after the relevant fixture path and capture assertion;
it is not a replacement for the complete unmodified acceptance suite. The initial
attempt ran the entire unrelated cancellation race sequence first and hit its short
agent deadline under concurrent full-suite load before reaching capture. That failure
is retained in initial-diagnostic.log. The focused diagnostic preserves all assertions
on the path being reproduced; it reached the capture rejection at 15:36:12 UTC.
No application source change is included in this audit branch beyond its base.
