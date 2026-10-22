# SAM Greenfield — one launch decision gate

**PASS_LOCAL_PREPARATION / BLOCKED_PUBLISH_AND_UNKNOWN_SPEND.**
Local Setup Mode is now implemented and tested; see `SETUP-MODE.md` and
`setup-evidence.json`. The template leaves it OFF. It does not remove this gate
or grant Publish/production activation.
No Publish, paid resource, production DDL, grant to an existing service, company connection or model
request was performed. The platform reports no active deployment and no service
URL. `launch-evidence.json` contains the current observations.
Disposable test schemas/roles/grants were removed by the regression runner.

## Completed on Replit

- Actual next-publish configuration: Reserved VM, `npm run start:release`,
  build `npm ci && npm run typecheck`. Neither build nor startup migrates a DB.
- Production-path bundle: `apps/production/src/localReleaseBundleModule.ts`,
  containing existing `local.calculate` / `local.statistics` only. No model,
  connector, sandbox identity, knowledge lookup or environment-based plugin loader.
- Shared existing executor arithmetic and independent bound PostgreSQL aggregate.
  Development keeps its original sandbox, artifacts, provenance and learning.
  Release accepts a narrower integer-only list (1–16 values, each ±1,000,000);
  references, memory, entity/file fields and unknown operations are denied.
- No new schema/tables. Core SAM still owns plans, queue, authority, leases,
  idempotency, execution, independent verification and goal acceptance.
- `SAM_RELEASE_DATABASE_URL` permits an independently approved app LOGIN without
  overwriting Replit-managed `DATABASE_URL`. An explicit invalid/empty override
  fails closed. No SET ROLE substitution for privileged login is accepted.
- Single public supervisor port; worker/CC/optional MCP children use private
  dynamic loopback ports. MCP remains off in the pilot template.
- Real native service startup/readiness/auth/ticks/graceful stop passed on an
  isolated fixture DB role. This is not full production `start:release` acceptance.
- 30 regression suites, strict typecheck, 115 preflight refusal cases and 12 new
  bounded-parameter/adversarial cases passed. Contract/preflight tests were
  repeated after the app-connection change. No live model acceptance was rerun.

## Minimum unmet requirements — do not Publish around them

1. **Account quote and consent.** Inspect Reserved VM + PostgreSQL pricing,
   current plan/credit balance, backup/storage/transfer costs and enforceable
   spending controls. Agree a 24-hour deadline and responsible shutdown operator.
   This Agent session has no verified account billing/credit quote.
2. **Isolated pilot database and restricted LOGIN.** Read-only production metadata
   inspection failed (exit 1); this does not prove absence. Development's current
   managed connection bypasses RLS and its metadata showed no limited LOGIN.
   Neither is an acceptable production app identity.
   Owner must provision/review the independent pilot DB and nonowner
   NOSUPERUSER/NOBYPASSRLS/NOCREATEDB/NOCREATEROLE/NOREPLICATION LOGIN through the supported administrative surface.
   Check membership/inherited ownership as well as direct role flags; do not
   make the app a member of privileged or table-owning roles.
   No administrative permissions were changed here.
3. **Private production settings.** Production secret presence checks show both
   `SAM_RELEASE_DATABASE_URL` and `SAM_COMMAND_CENTER_BEARER_TOKEN` absent.
   Put them in production Secrets, never chat/Git or dev secrets. Use the actual
   restricted app URL with TLS. Review ordinary settings in
   `env.production.example`: exact schema, pilot org/entity, approved capability
   IDs, bundle path, reserved HTTPS hostname and matching origin.
   No wildcard, fabricated domain, reused development bearer or inference key.
4. **Schema and trusted metadata.** For managed PostgreSQL, review the platform
   Publish schema diff; do not add custom production migration/build hooks.
   Do not copy development data/sandbox sessions/test namespaces into production.
   Separately approve catalog/verification-contract metadata for the local
   capabilities. The narrower release bundle does not load dev artifact contracts.
   Test every granted tenant-data path with the actual application login:
   allowed tenant, other tenant, missing context, RLS and least-privilege ACL.
   Native startup's six-table RLS check alone is not that complete proof.
5. **Backup, monitoring and rollback.** Agree retention/RPO/RTO and production
   restore coverage. Prior isolated synthetic DB/ACT/lease/restore evidence is
   useful, not production acceptance. Keep restored queue/outbox and workers
   quarantined. Validate protected health/heartbeat/queue/errors/cost alerts,
   operator stop controls and an immutable schema-compatible rollback build.
6. **Final source/security acceptance.** Freeze a clean GitHub-matched SHA.
   Raw Replit SAST now reports 40 Critical / 0 Medium: 38 unchanged fingerprints,
   one position replacement and one aggregate-query finding. Changed sites were
   independently reviewed with parameter-binding evidence; no suppression.
   Dependency and privacy scans have zero findings. Review the ledger, not just
   the green test count. Keep the owner approval flag unset until acceptance.

## Cost and capacity — evidence, not a promise

The prior idle profile nominates 0.5 vCPU / 2 GiB, not production capacity.
Public VM rate: $0.0208/hour, hence $0.4992 for 24 hours. PostgreSQL public rates:
$0.16 per billed compute-hour and $0.35/GiB/month storage. The conditional VM +
24 billed DB hours arithmetic is $4.3392, **not an all-in quote or upper bound**.
Worker polling may defeat DB idling; stopping VM does not prove all DB/storage
charges stopped. Credits may cover usage but eligibility/balance are unknown.
Model requests remain disabled: no new model budget is authorized.

There is no proven cost-free Reserved VM route in this session. Actual continuous
hosting requires the platform's Publish/provisioning step and a metered resource.
After prerequisites and separately confirmed Publish, measure that VM's actual
startup, quota/latency, memory, worker progress and authenticated access before
claiming stable service or 24/7 operation.

This initial pilot is local arithmetic/runtime validation, **not autonomous
natural-language planning**: production models and verified-knowledge references
remain disabled. They require separate model/data/cost acceptance, not reviving
expired development authorizations.

## Stop / rollback

Use `OPERATIONS.md` and `PILOT-PLAN.md`: stop intake, SIGTERM supervisor, bounded
drain/SIGKILL; review durable receipts before resume. Roll back only to an
approved immutable build whose schema is compatible. New quarantined DB for
restore; no blind replay, destructive downgrade, force push or parallel worker
without verified fencing. Shut down/unpublish in Publishing to stop VM hosting;
review PostgreSQL/storage costs separately.

**Owner decision gate:** provide the non-secret account quote/credit coverage
and total 24-hour usage cap, finish restricted DB + production secret/origin
setup, then permit independent acceptance checks. Publish confirmation comes
only after those checks pass. No production URL is supplied before platform proof.
