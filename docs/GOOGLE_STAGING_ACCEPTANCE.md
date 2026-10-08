# Google integration staging acceptance gate

Status: NOT LIVE PROVEN. This document is an implementation and verification contract, not a passing test report.

## Current observed implementation
- `apps/production/src/gmailBundle.ts`: `gmail_send` and sent-message verification only. `packages/gmail/src/client.ts` does not expose inbox list/read capabilities in the production tool surface.
- `apps/production/src/driveBundle.ts`: `drive_search`, `drive_get_metadata`, and `drive_create_folder`. Drive file body download and Google Docs export are not currently production capabilities.
- Gmail and Drive consume the same `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, and `GOOGLE_OAUTH_REFRESH_TOKEN` variables. This is a single Google identity, not a multi-mailbox routing mechanism.

## Implementation contract
1. Introduce explicit Google account identity configuration per authorized mailbox; default deny when a requested sender/reader identity does not match a configured account.
2. Keep Gmail send as YELLOW; implement inbox list/read as GREEN with pagination and bounded payloads, and verify message IDs, account identity and immutable evidence. Never send during a read-only acceptance run.
3. Add Drive content read/export as GREEN with mime-type handling, size limits, and no write scopes unless specifically authorized. Preserve folder creation as YELLOW.
4. Ensure OAuth scopes match each capability and refresh tokens are stored only in Railway secrets, never in GitHub, logs or test fixtures. Avoid a broad shared refresh token across mailboxes.
5. Require legal entity context and per-account audit records. No fallback to a different sender or legal entity.
6. Stage environment variables only after validating runtime Docker build, migration sequencing, service health checks and authentication allowlists.

## Acceptance evidence (all required)
- Authorized staging mailbox: read one known email via SAM, record sanitized message ID and account identity. No send/delete actions.
- Authorized Drive: search and read one known document via SAM, record sanitized file ID and content checksum; no folder creation.
- Invalid mailbox identity and missing OAuth scopes fail closed.
- Missing credentials fail closed; secrets do not appear in logs.
- Database migrations complete successfully, readiness endpoints pass, and no unauthorized public endpoints are exposed.
- A verifier independent of the executing adapter confirms each result. Do not mark LIVE_PROVEN based on a plan, queue entry or mocked response.

Tracked by #2. No production deployment is authorized by this document.
