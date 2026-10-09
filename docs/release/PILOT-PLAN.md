# Safe Reserved VM pilot — proposal, NOT authorization

## Current decision

**PASS_LOCAL_PREPARATION / BLOCKED_PURCHASE_AND_PUBLISH.**
No VM, database resource, paid model request, company connection or OAuth
permission was created. Only documentation/test files changed. The existing
development workflows and every native release guard remain unchanged.

## Measured local profile

See `pilot-profile.json`, sampled at 2026-10-09 09:52 UTC:

| Quantity | Measured value |
|---|---:|
| Native child startup until readiness + authenticated goal API | 1.598 seconds |
| Aggregate startup CPU | 1.470 CPU-seconds |
| Idle sample | 12.056 seconds / 48 samples |
| Aggregate steady average CPU | 0.04645 CPU cores |
| Sampled 250ms peak CPU | 0.43845 CPU cores |
| Peak simultaneous summed RSS | 406.97 MiB |
| Sum of each process's memory high-water mark | 431.85 MiB |
| Worker progress | 12 ticks; zero errors |
| Model/business requests | zero |

These are THREE real native child services plus the test-harness supervisor.
PostgreSQL memory is excluded; RSS double-counts some shared memory. Parent
fixture setup makes this conservative for supervisor RAM but not a production
load test. Child services started fresh; parent was already warm. Existing
synthetic goals/owner-authored plans are fixtures, not live model acceptance.
The local cgroup allows FOUR CPU cores. No 0.5-core throttling, concurrent
business traffic, long-duration soak, production TLS/region or production
bundle was tested.

Full `start:release` correctly refused without owner approval. Measurement used
its unchanged native supervisor/child-environment factory; the native guards
forbid editor targets and test bundles. **No approval flag or test-bundle ban
was bypassed. This is not a full entrypoint production-start benchmark.**

### Capacity recommendation

**0.5 vCPU / 2 GiB is the smallest documented candidate for a zero-model,
no-side-effect pilot, NOT proven minimum production capacity.** The idle average
is approximately 9.3% of 0.5 core. The measured transient peak nearly uses that
capacity. RAM leaves room for OS/runtime overhead, but startup and p99 latency
under a 0.5-core quota remain unknown. Startup needs at least about 2.94 seconds
of CPU delivery at 0.5 core; this is an arithmetic lower bound, not a predicted
wall-clock startup time.

Do not buy a larger VM based on this idle measurement alone. After owner
approval, validate real VM startup/steady memory, request latency, queue depth
and heartbeat first; stop or resize only by a separate cost decision.

## Automated evidence preflight

Run `node tests/release/prelaunch.cjs` before a purchase/Publish decision.
It reads source/Git/config presence and the empty-by-default
`pilot-requirements.json`; **exit 2 means BLOCKED**. It never connects to a DB,
prints secret values, changes permissions, generates credentials, or launches.

It evaluates exact approved SHA, clean tree, direct GitHub SHA match, native
`validateRelease`, each required setting's presence, and owner-reviewed recent
evidence for DB identity, nonowner/nonbypass application LOGIN, migrations,
negative tenant RLS, least privilege, one public port, hosts/origins, capability
allowlist, backup/restore, retention/RPO/RTO, monitoring/stop controls, spending
caps, security review and frozen-build acceptance.

**Limits:** Presence does not prove an approved production target. Records must
refer to the exact SHA, recent LIVE-reviewed evidence, not fixtures. References
and owner attestations are not independently verified or cryptographically
authenticated by this offline checklist. Real production read-only inspection
is still required once separately authorized. Even fully formed declarations
remain **BLOCKED**, with `declarationsComplete=true` only indicating their syntax
and review metadata passed. This test-only gate is not wired into startup;
existing runtime checks remain authoritative. The current manifest contains no
approval or evidence; production readiness is deliberately BLOCKED.

## Budget proposal (public prices, not an account quote)

Official sources consulted 2026-10-09:
- https://docs.replit.com/billing/aug-cloud-billing-updates
- https://docs.replit.com/billing/managing-spend
- https://docs.replit.com/billing/about-usage-based-billing

| Item | Price / arithmetic scenario | Remaining uncertainty |
|---|---|---|
| VM 0.5 vCPU / 2 GiB | $0.0208/hour; 24h = $0.4992; 730h = $15.184 | Account eligibility/credits, actual quote, regional/resource settings not inspected |
| Production PostgreSQL compute | $0.16 × billed compute-hours; 24 billed compute-hours = $3.84 | Billed compute-hours are NOT assumed equal to wall-clock hours; size/provider/idle policy and quote required |
| PostgreSQL storage | $0.35 × GiB/month | Storage, backup retention/billing and actual quote required |
| Models | $0 proposed/authorized; provider keys/configs disabled in pilot | Enabling a model requires separate scope/cost/acceptance authorization |
| Transfer / other resources | UNKNOWN, not zero | Publishing/Billing quote and limits required |

**No defensible all-in cap has been established.** Worker DB polling may prevent
database idling; do not estimate a continuously queried database as free.
The arithmetic VM+24 billed DB hours subtotal is $4.3392, NOT an all-in daily
price or maximum. Account-wide budget/usage settings are not assumed to be an
instant per-process circuit breaker. Owner must approve the quote, credit use,
pilot duration and enforceable spending/stop policy before buying.

## Pilot runbook — execute only after separate owner approval

1. Select a frozen, clean, GitHub-matched SHA; independently approve LIVE build
   acceptance and documented raw 39 Critical scanner reviews. Do not revive
   old closed inference sessions.
2. Approve the hosting quote and pilot deadline (24 hours is a proposal only).
   Establish account spending controls and an operator responsible for shutdown.
3. Select a genuinely independent production-pilot database. Owner provisions
   secrets privately and separately authorizes role/migration setup. Use
   nonowner NOSUPERUSER/NOBYPASSRLS LOGIN; separate migration role; TLS, exact
   tenant and schema; negative RLS/ACL tests for all reachable data, not just
   the six tables checked by the current native launch guard.
4. Approve a production-path safe bundle and explicit capability allowlist;
   the test-only bundle is forbidden. No email, Drive/business, financial/legal,
   model provider or optional MCP exposure for the initial pilot.
5. Independently verify backup/restore, audits/receipts, sequence/ID state and
   quarantined queue/outbox. Specify retention, RPO/RTO and migration/build
   compatibility. Never start workers on restored clones.
6. Configure Reserved VM run command `npm run start:release`; one public
   `$PORT`, private dynamically allocated loopback child ports, exact HTTPS
   host/origin, separate tokens, bounded restarts/leases and shutdown grace.
   No dev command, startup migration or credentials in tracked files.
7. Only after owner signs all evidence and separately approves Publish:
   start the pilot, verify anonymous/private auth, readiness/worker progress,
   alerts and real resource usage. No business intake, live model, or writable
   connector test is part of this proposal.

## Stop / kill / rollback

- On auth/RLS/identity mismatch, unpriced spend, stale worker, duplicates or
  unexpected outbound activity: stop intake and signal the release supervisor
  with SIGTERM. It stops restarts, signals children and drains within configured
  grace. Native bounded SIGKILL fallback is tested; never target other workspace
  processes or individual workers while permitting the supervisor to restart.
- To stop hosting charges use **Publishing → shut down/unpublish**, as documented.
  Closing Preview or killing a child does not establish stopped VM billing.
  Database storage/other resources must be reviewed separately.
- Code rollback: stop the new supervisor, preserve audit/receipt evidence,
  confirm schema compatibility, select the previous approved immutable build
  (d1142ada is a local native-code baseline, NOT approved production), then
  restart only against an approved target. No force push or rewritten history.
- Data restore fallback: restore to a NEW quarantined database, keep worker/
  outbox stopped, verify RLS/ACL/IDs/audits/receipts and reconcile durable
  execution evidence before any switch. No blind queue replay, destructive
  migration, overwrite of production or manual claim of successful recovery.
- A whole-runtime production rollback and production RPO/RTO remain unproven;
  previous read-only clone rollback is useful evidence, not their replacement.
