# Independent completion verification

Local synthetic acceptance passed: **36 tests, 36 passed, zero failures, cancellations, skips or todos**, exit 0. No live acceptance or deployment is implied. The suite ran against HEAD `e08e390732cd26750ce8175c7e734581c137c5a3`, content snapshot `36502b10366d6ebc9709e3e0bd27dfb01ae83032cbe3f219e58305a7ac009be8`. Exact commands, counts, source identities and a final TypeScript file manifest are in `completion-independent-verification.json`.

## Observed checks

- Affected acceptance: executive continuity 9, independent adversarial continuity 8, deterministic recovery 4, reliability 6, independent reliability 8 and Command Center report visibility 1.
- Ordinary `npm run typecheck`: exit 0 after two erased test-fixture type assertions corrected an observed TS2345 failure. No affected runtime test behavior changed, so the suite was not repeated solely for types or documentation.
- Explicit TypeScript check for both release operator scripts: exit 0. Ordinary tsconfig omits these scripts.
- `git diff --check`: exit 0. Contradictory CLI recovery modes reject before connection with the expected exit 1.
- Supplemental release service-status compatibility check: 10 assertions passed, two READ tools, zero network fetches. It covers the restored top-level `worker`/`command-center` fields separately from the 36-test suite.

## Independent adversarial coverage

The verifier-owned fixture uses migration-shaped UUID outbox aggregate IDs. Tests check wrong company and mismatched/missing tenant GUCs; explicit approval and actor/source/date provenance; idempotent writes and changed-input conflict; audit rollback; irrelevant/unapproved memory exclusion; notification activation cutoff, company isolation, repeat polling/acknowledgement and per-actor receipts; stale-notice suppression preserving review observations and foreign records; READ handlers issuing no SQL mutations; immutable historical report ID/hash/decision; authenticated read-only Command Center POST rejection before DB access; deterministic recovery dry-run immutability, shared review locking, exact source/latest-verification bindings, legal transitions, report idempotence and late-fault atomicity.

## Red evidence and corrections

The initial combined run was interrupted (exit 130) because the verifier's pool mock did not implement the callback path used by `pool.query`. That incomplete run is not a pass; only the independent fixture helper was corrected.

A focused UUID fixture then reproduced SQLSTATE `42883` (`text = uuid`): two tests failed before the app join was corrected. A fresh snapshot was not captured for that focused historical run; the initial application candidate identity and ordering are retained in JSON rather than inventing an exact snapshot. After the join-only correction, the stale-notice assertion independently failed (one test, zero skips), proving obsolete approval/progress notices remained UNROUTED. Both defects were subsequently fixed, and the unchanged acceptance assertions passed in the final suite.

## Limits

These are in-process synthetic PostgreSQL and local HTTP checks. They do not establish native restricted-role acceptance, fixed live GUCs, deployed revisions, an authenticated browser session, or connected-tool discovery. No model calls, fresh mailbox/business collection, external messages, resource changes, live database effects or isolated service resumption occurred. The coordinator owns live and connected verification.
