# Dedicated Drive text read: development acceptance

## Scope and provenance

This is a bounded acceptance test of the owner-approved personal test document,
not production readiness, autonomous model planning, or general access to Drive.
The owner supplied an independently known text line. Source file identifiers,
OAuth credentials, account details and raw document text are excluded from this
tracked report. The connection's OAuth grant remains broader than read-only;
application restrictions do not narrow that grant.

The tested source commit is `2aceb5c`. No model received document content.
The kernel's original observation, candidate-plan validation, authority checks,
plan persistence, leasing/fencing, execution, independent verification and goal
completion paths were used. The plan was owner-declared, not model-generated.

## Local verification

On 2026-10-09, all 14 development regression suites passed, including strict
UTF-8 decoding, response size/media type, metadata/content distinction, known
line checks, secret rejection, wrong resource/extra field/capability denial,
independent content drift and spent-request rejection. The original metadata
acceptance and office-goal regression also passed.

The content acceptance fixture passed in a disposable PostgreSQL schema with
zero managed-proxy calls. Fixtures are explicitly labeled LOCAL_UNIT_FIXTURE;
they are not evidence of reading the real document.

## LIVE evidence

2026-10-09 UTC: cycle started 01:15:38.762, completed 01:15:41.902.

Four actual GET requests to the official authenticated managed Google proxy:

| Phase | UTC | Request | HTTP |
|---|---|---|---|
| Executor identity guard | 01:15:39.073 | files.get, only id/name/mimeType/trashed | 200 |
| Executor content | 01:15:39.531 | files.export, text/plain | 200 |
| Independent identity guard | 01:15:40.714 | files.get, same approved resource | 200 |
| Independent content | 01:15:41.091 | new files.export, text/plain | 200 |

The guarded document ID matched the private owner approval, the exact owner
provided title matched, the resource was an untrashed Google document, and the
known line matched in both text responses. Decoded text measured 289 UTF-8 bytes
and four lines. Its fingerprint in both reads was:

`3c18e4f761dbe55ed9c86d3eaf7f73b09000269596ca49ab0ee4f98987f0dd75`

Fingerprint convention: SAM's SHA-256 stable-JSON utility applied to the decoded
text string, not an independently captured wire-byte digest.

Persisted in the isolated schema sam_replit_drive_content:

- Goal: COMPLETED; one plan, one work item, one execution, one VERIFIED result.
- Independent verifier: drive-independent-content-readback, not the executor.
- Original plan/execution hash bindings and fenced handoff: passed.
- Append-only audit rows: five; published fabric events: eight; pending outbox: zero.
- Physical model_calls, side_effect_operations, financial_documents, users,
  memory_records and world_facts: zero.
- Non-superuser, non-RLS-bypass application role; foreign entity reads and writes,
  sensitive tables and control-table updates rejected.
- Worker reentry caused no repeated execution or HTTP request.
- Approval consumed; ordinary external models and adapters remain disabled.

Safe local machine evidence: .local/sam-dev/drive-content-report.json and
.local/sam-dev/drive-content-worker-live.json. Private approval and report files
are ignored by Git. Raw text was not persisted in execution outputs or reports.

## Separate Git acceptance gate

GitHub synchronization is NOT proven by this Drive test or by a local commit.
The official Git provider reports healthy OAuth, but workspace credential
handoff has stalled at the password challenge. A successful native non-force
push and matching remote main SHA are required before claiming synchronization.
No token extraction, token-bearing remote URL, API history replacement, or force
push is authorized. Published deployment and production changes remain forbidden.
