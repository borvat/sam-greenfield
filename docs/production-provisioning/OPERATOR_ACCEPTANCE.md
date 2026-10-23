# Render-like operator acceptance

The sequential provisioning gap is reproduced and corrected. The previous operator fixture was a superuser; the new regression uses a synthetic owning LOGIN with NOSUPERUSER, NOBYPASSRLS, CREATEDB, CREATEROLE, INHERIT and sole effective membership `pg_database_owner`. No production data, credentials or queries were used.

Tested source: `676c910cad77fa35e2cf8c8bbaf026d67b4959f4`, tree `e361db41519484394b4d6262db28738db1311333`, on the existing `codex/sam-production-provisioning-rehearsal` branch. This follows published `5e80fdf4075d9812e2c67e4e0ed3ad461358783f`, preserving its original evidence. Subsequent evidence publication changes documentation only.

**59/59 required stages PASS, 0 failed, 0 not run**, 2026-10-22 20:31:20–20:46:37 UTC:

```text
npm run verify:full -- --output /workspace/sam-operator-provisioning-acceptance/full
```

[Full report](operator-evidence/report.json) · [stage summary](operator-evidence/report.md) · [complete archive](operator-evidence/external-acceptance.tar.gz) · [new operator stage](operator-evidence/operator-provisioning.log). Archive SHA256: `4c2daef31454aeaa8005f8da2d27fa3a4112e6aba4b82f758ec3371559fc07f5`. Extract to resolve the original per-stage links and internal SHA256SUMS.

[Failing-before evidence](operator-evidence/failing-before.log): against the prior implementation, first runtime provisioning succeeds, then MCP provisioning fails with `RUNTIME_TENANT_MISMATCH`. The first call enables FORCE RLS; without tenant context, the owning operator cannot see the required legal entity. This is an operator procedure gap, not evidence that application `withTenantTransaction` is broken.

The correction rejects missing/mismatched operator context **before mutation** in service provisioning and historical OAuth-client adoption. Each call must use an explicit operator transaction with reviewed organization/entity settings set locally, then COMMIT or ROLLBACK. Existing tenant and registry SELECT policies suffice. No new operator policy, grant, BYPASSRLS, SET ROLE, SECURITY DEFINER function, RLS disablement or FORCE RLS removal was added. See the exact [transaction procedure](RUNBOOK.md#render-like-operator-correction).

The new real-PostgreSQL stage proves:

- Historical 14→16 core migration and 8 integration / 1 service-profile entries through the constrained table owner.
- Sequential runtime and MCP provisioning, missing/wrong operator context denial, local-context expiry, scoped inspection and explicit already-bound-role rejection.
- Exact registry inspection through existing SELECT policies; missing context fails parity against the nonempty manifest.
- Restarted migrations/profiles remain idempotent after FORCE RLS. Application GUC spoofing still cannot change their fixed tenant boundaries.
- Unchanged PR50 runtime/MCP production entrypoints start and stop twice under restricted application logins against this operator-provisioned database. FORCE RLS flags, operator privilege flags and membership remain unchanged.
- A `row_security=off` read fails under FORCE RLS for the owning non-BYPASSRLS operator, matching the default logical-backup restriction. This is an intentional fail-closed assertion, **not** a successful full dump.

The complete run also passes prior provisioning, backup mechanics, Google/OAuth fixtures, recovery, fairness, budget/evidence, tenant isolation, PostgreSQL restart, Docker build, startup, source-integrity and cleanup stages. Targeted operator and service provisioning checks passed; full TypeScript validation passed. Synthetic role passwords, tenant records and adapters only; no live Google/provider use is certified.

## Remaining production gates

Application rollback compatibility is tested with the constrained owner. A complete production backup/restore path is still not certified: the earlier quarantine restore uses synthetic data and a superuser dump fixture. Before cutover, approve and verify a complete pre-change backup; for post-cutover full backup, verify managed backup/snapshot authority or separately review recovery design. Do not call a row-filtered export complete or relax RLS to make a backup pass.

Actual service-local MCP database principal remains unverified. Parent confirmed masked OAuth owner-password-hash, signing-key, internal-OAuth and Google configuration names only; no values or validity were inferred. Exact client/tenant mappings, registry parity and pre-upgrade Google evidence disposition remain production preflight inputs. Production provisioning, security changes, deployment and activation still require separate approval.

This is AI technical review and isolated evidence, not a human approval or blanket production readiness claim. PR creation remains denied/pending explicit approval and has not been retried. PR50 and all other PRs/bases remain untouched; no merge attempt, production mutation, paid call or new soak occurred. Hosted CI is separate from these external results.
