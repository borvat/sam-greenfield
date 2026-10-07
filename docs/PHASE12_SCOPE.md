# Phase 12 — Real Gmail Tool + Independent Verification

## Objective
Add the first real external business tool adapter to SAM: Gmail send, with OAuth refresh-token support, deterministic message identity, side-effect reconciliation, and independent readback verification.

## Invariants
- gmail_send is YELLOW and side-effecting.
- Gmail OAuth credentials come only from environment variables.
- The adapter sends RFC 2822 mail through users.messages.send.
- Every outbound message includes a deterministic Message-ID derived from SAM's idempotency key.
- Reconciliation can confirm a send by provider message id or Message-ID search.
- Independent verification uses Gmail readback, not the execution return payload.
- External company email must not expose AI-assistant wording.
- No send occurs without the existing SAM approval path.
- No synthetic adapter is promoted into production.

## Production environment
Required:
- GOOGLE_OAUTH_CLIENT_ID
- GOOGLE_OAUTH_CLIENT_SECRET
- GOOGLE_OAUTH_REFRESH_TOKEN

Optional:
- GMAIL_USER_ID (default: me)
- GMAIL_FROM_EMAIL
- GOOGLE_OAUTH_TOKEN_URL
- GMAIL_API_BASE_URL
