# Ordinary general-agent acceptance

Source: `172a990d6d84eaa917b6974316180d349c3c73ee`.
Tree: `5fac2d369ad1b8ebd66a3eea10fb538017273f1b`.
Base: `32cab556ea842866e01f33e64794dd2ed968e8b7`.

The report and source manifest authenticate the clean frozen source. Later evidence commits contain documentation only. These are isolated tests with scripted model decisions and synthetic connector records, not proof of live model autonomy or business-data completeness. No production access, hosted deployment, production grants, production credentials, or paid calls were used. Disposable local fixture roles and credentials are confined to the test database.

## Final result

**60/60 stages PASS**, including 49/49 regression suites and 22/22 core suites.
Started 2026-10-23T23:46:01.829Z; completed 2026-10-24T00:04:39.297Z.
Runtime: Node 22.23.4, PostgreSQL 15.19.
[Full report](acceptance/report.md), [structured report](acceptance/report.json),
[source hashes](acceptance/metadata/source-files.json), [artifact hashes](acceptance/SHA256SUMS).

## Ordinary-path evidence

The test uses authenticated MCP submission, the ordinary production composition module and runtime service, the executing submitted roots, restricted integration/specialist role profiles, the existing provider adapter with a no-network transport, two reasoning specialists, generic derivation, independent verification, and persisted objective reports. It creates no evaluation trial or synthetic coordinator. The three fictional objectives cover period comparison, promises versus deliveries, and duplicate-document inventory without deletion.

The nominal trace has three completed root reports and 13 executions; its root ledgers record 26 model attempts, 26 decision iterations, 11 delegations, eight tool operations and 13 independent readbacks. The SIGKILL/two-worker recovery trace has three completed roots and 13 unique execution queue IDs; the interrupted model reservation remains uncertain and charged. Zero tool allowance, missing registration, cancellation between response and plan commit, unknown units, and receipt revocation have separate persisted traces. Unknown semantics remain incomplete; no report invents money or VAT.

All traces are under `acceptance/metadata/ordinary-*.json`. The allowance test additionally covers concurrent last-slot reservation, immutable policy/deadline, settlement replay refusal, tenant/authentication checks and refusal to hand unfinished admitted work back to the unbounded legacy worker.

## Harness and limits

`readiness.patch` contains the external harness adjustment: use the existing pinned disposable PostgreSQL image and require a successful TCP `SELECT 1` rather than Unix-socket `pg_isready` during temporary initialization. No application assertion is removed or weakened. The repository harness gives the multi-process ordinary suites 240 seconds; production model/tool/goal deadlines are unchanged by that test timeout. Commands, actual durations, exit statuses, versions, and cleanup are recorded in `acceptance/report.json`.

Development found oversized complete review envelopes and a missing terminal report after nested specialist failure. The frozen source addresses these with lossless schema compaction, bounded interpretation projection while retaining source hashes, and per-obligation incomplete reporting. Prior working-tree checks are not substituted for this exact-head run.

## Remaining deployment boundary

See `docs/ordinary-general-agent.md` at the source commit for the single existing-service setup proposal. It needs approved specialist migrations 00106/00107, narrowly scoped profile rights for the existing runtime identity, exact verification registrations, matching positive provider price metadata, and opt-in configuration. Runtime code does not provision those rights. No new signer, account, host, evaluation profile or coordinator exception is needed. Pause/reconcile admitted work before rollback; do not clear allowances.

Hosted setup and live acceptance remain unperformed and require their own reviewed authorization and explicit spend/goal limits. Opaque Google MCP results remain opaque; unknown currency, VAT, collection coverage and supplier-promise semantics remain blockers for affected real objectives. Separate knowledge capture remains limited to permitted raw source facts; derived provenance remains in the existing report/execution ledger. GitHub Actions was not run because of the reported billing restriction.
