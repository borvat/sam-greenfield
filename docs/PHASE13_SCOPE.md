# Phase 13 — Real Google Drive Adapters + Verification Contracts

## Objective
Add real Google Drive production capabilities to SAM using the existing Google OAuth refresh-token path and preserve SAM's authority, verification, side-effect, and reconciliation boundaries.

## Initial production capabilities
- drive_get_metadata — GREEN, read-only
- drive_search — GREEN, read-only
- drive_create_folder — YELLOW, side-effecting

## Invariants
- Google OAuth credentials remain environment-only.
- Read capabilities never create side-effect ledger entries.
- drive_create_folder is YELLOW and requires approval.
- No arbitrary Drive query language is exposed to the model; search accepts a bounded plain-text query and optional folder scope.
- Folder creation uses Drive files.create with the folder MIME type.
- Verification re-reads Google Drive state and never trusts the execution return payload.
- Verification contracts are present before execution can complete.
- Reconciliation confirms side effects by provider file id and, if needed, by a deterministic Drive appProperties operation marker derived from SAM's idempotency key.
- No synthetic/test adapter is promoted to production.

## Environment
Uses the same Google OAuth credentials as Gmail:
- GOOGLE_OAUTH_CLIENT_ID
- GOOGLE_OAUTH_CLIENT_SECRET
- GOOGLE_OAUTH_REFRESH_TOKEN

Optional:
- GOOGLE_OAUTH_TOKEN_URL
- GOOGLE_DRIVE_API_BASE_URL
