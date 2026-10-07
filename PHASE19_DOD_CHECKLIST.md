# Phase 19 Definition of Done

Status: TECHNICALLY PASSED ON REAL POSTGRESQL 15.17

## Scope completed
- Secure Executive Command Center HTTP service
- Owner dashboard HTML
- Legal-entity scoped overview
- Legal-entity scoped goals list
- Legal-entity scoped Golden Chain timeline
- Legal-entity scoped latest finance brief
- Owner goal creation in NEW state
- OWNER_GOAL_CREATED append-only audit evidence
- GREEN/YELLOW authority ceilings only
- RED goal creation rejected
- Bearer-token protection for API routes
- Host allow-list enforcement for dashboard and API routes
- /livez remains available for container health checks
- Dedicated production service on port 8082
- Existing Phase 0–18 invariants remain green

## Acceptance evidence
Fresh PostgreSQL 15.17.
Migrations 00001..00010 applied from zero.
All tests Phase 0 through Phase 19 PASS in one shared database.
Phase 19 result: PHASE19_COMMAND_CENTER PASS.
Production compose validation PASS.

## Entity isolation evidence
- Overview counts only configured legal entity.
- Goals list contains only configured legal entity.
- Cross-entity goal timeline returns 404.
- Finance latest ignores a newer finance brief from another legal entity.
- Browser arguments cannot select another legal entity.

## Security evidence
- Missing bearer token returns 401.
- Host evil.example returns 403 host_not_allowed for API.
- Dashboard root also rejects disallowed host.
- RED authority ceiling returns 400.
- Production requires bearer token, allowed hosts and legal entity configuration.

## External limitations
- Docker image build/run remains pending because verifier sandbox has no Docker daemon.
- Command Center has not yet been exposed on a public HTTPS endpoint.
- No live production credentials were used in acceptance.
- Lovable remains verification/supervision only; GitHub is still canonical source.
- GitHub hosted Actions remains externally blocked by account billing lock.
