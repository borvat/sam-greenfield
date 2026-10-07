# Phase 14 Definition of Done

Status: TECHNICALLY PASSED ON REAL POSTGRESQL

## Scope completed
- Real e-Boekhouden REST v1 session client
- API-token to session-token exchange
- One-time 401 refresh + retry
- Bounded pagination
- Four GREEN read-only capabilities:
  - eboekhouden_list_mutations
  - eboekhouden_outstanding_invoices
  - eboekhouden_list_ledgers
  - eboekhouden_list_relations
- Four independent readback verifiers
- Four verification contracts
- Canonical production bundle registration
- Production compose passes all current adapter environment into both sam and sam-mcp
- No e-Boekhouden accounting write capability in production bundle
- Existing Phase 0–13 invariants remain green

## Real PostgreSQL evidence
Verified on PostgreSQL 15.17 against one brand-new shared database with migrations 00001..00009 applied from zero.

All Phase 0 through Phase 14 test suites PASS.

Phase 14 acceptance:
- session exchange PASS
- session Authorization PASS
- 401 refresh/retry PASS
- pagination bounds PASS
- mutations PASS
- outstanding invoices PASS
- ledgers PASS
- relations PASS
- GREEN/read-only metadata PASS
- 4 verification contracts PASS
- independent readback verification PASS
- no-token/no-capability PASS
- no accounting write capability PASS

## Production compose evidence
docker-compose config PASS with placeholders.
Both sam and sam-mcp resolve the same canonical production bundle and receive:
- model-provider environment
- Google OAuth/Gmail/Drive environment
- e-Boekhouden environment

Secrets remain empty unless explicitly supplied.

## External limitations
- No real e-Boekhouden account was contacted during acceptance.
- Docker image build/run remains pending because Docker is unavailable in the verifier sandbox.
- GitHub Actions remains blocked by the external account billing lock.
