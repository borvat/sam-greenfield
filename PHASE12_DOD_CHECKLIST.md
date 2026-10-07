# Phase 12 Definition of Done

Status: TECHNICALLY PASSED ON REAL POSTGRESQL

## Scope completed
- Real Google OAuth refresh-token provider
- Real Gmail REST client
- Real gmail_send ToolAdapter
- gmail_send authority class YELLOW
- gmail_send marked sideEffect=true
- Deterministic RFC 2822 Message-ID from SAM idempotency key
- X-SAM-Operation-Key header
- Gmail send through users.messages.send
- Reconciliation by Gmail provider message id
- Reconciliation fallback by RFC822 Message-ID search
- Independent Gmail readback verifier
- Canonical production bundle adds Gmail only when credentials are configured
- External AI-assistant wording guard
- sam and sam-mcp now use the same canonical production bundle path
- Existing Phase 0–11 invariants remain green

## Real PostgreSQL evidence
Verified on PostgreSQL 15.17 against one brand-new shared database with migrations 00001..00009 applied from zero.

Phase 0:
- 6/6 suites PASS

Phase 1:
- 5/5 suites PASS

Phase 2:
- 6/6 suites PASS

Phase 3:
- 4/4 suites PASS

Phase 4:
- 2/2 suites PASS

Phase 5:
- 2/2 suites PASS

Phase 6:
- 3/3 suites PASS

Phase 7:
- 2/2 suites PASS

Phase 8:
- 1/1 suite PASS

Phase 9:
- 1/1 suite PASS

Phase 10:
- 1/1 suite PASS

Phase 11:
- 1/1 suite PASS

Phase 12:
- gmail_adapter.ts PASS

## Gmail acceptance properties
- OAuth refresh exchange PASS
- Authorization Bearer use PASS
- users.messages.send request PASS
- deterministic Message-ID PASS
- exact X-SAM-Operation-Key header PASS
- reconcile by provider message id PASS
- reconcile by RFC822 Message-ID search PASS
- independent verifier readback PASS
- verifier fallback via RFC822 Message-ID search PASS
- ChatGPT / AI-assistant wording rejection PASS
- gmail_send = YELLOW PASS
- sideEffect=true PASS
- verifier registration PASS
- no Gmail environment means no Gmail capability PASS

## Architecture invariants
- Gmail send remains behind SAM authority and approval gates.
- The adapter does not bypass ToolGateway.
- Independent verification reads Gmail state instead of trusting the execution result.
- OAuth secrets remain deployment configuration only.
- External email does not identify SAM as an AI assistant.
- Missing Gmail credentials never create a synthetic adapter.

## External limitations
- No real Gmail account was contacted during acceptance.
- A real OAuth refresh token and Gmail account scope still need deployment-time validation.
- Docker is unavailable in the verifier sandbox, so real image build/run remains pending.
- GitHub Actions remains externally blocked by the account billing lock.
