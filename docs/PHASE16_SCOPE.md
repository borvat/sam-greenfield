# Phase 16 — Gmail Inbox Read/Search for Operational Monitoring

## Objective
Give SAM real, read-only access to Gmail conversation state so it can monitor supplier replies, logistics updates, and operational inbox activity without relying on external summaries.

## Capabilities
- gmail_search_threads — GREEN, read-only
- gmail_get_thread — GREEN, read-only
- gmail_get_message — GREEN, read-only

## Invariants
- Gmail reads are GREEN and have no side effects.
- Search input is bounded; maxResults is clamped to Gmail's supported maximum.
- The production capability does not expose arbitrary HTTP paths.
- Thread retrieval uses Gmail's official threads.get endpoint.
- Message retrieval uses Gmail's official messages.get endpoint.
- Independent verification performs a fresh Gmail readback.
- Gmail send remains YELLOW and approval-gated.
- Missing Google OAuth credentials means no Gmail read or send capability.
- Existing Phase 0–15 invariants remain green.

## Operational use
These capabilities are intended to support:
- supplier reply monitoring
- logistics/carrier follow-up
- quotation and procurement inbox review
- topic-based mailbox routing
- evidence-backed follow-up decisions
