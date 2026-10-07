# SAM Greenfield - Phase 0 Foundation

Clean greenfield implementation per approved hardened architecture. Phase 0 scope only.

## Status
- Phase 0: Architecturally sound + Security fixed (fail-closed RLS) + Mechanically tested
- NOT LIVE_PROVEN yet - requires real GitHub Actions run with postgres:15-alpine
- Migrations: 9 canonical (00001 through 00009) - fail-closed RLS
- Phase 1: NOT STARTED - awaiting approval after real CI run

## Security Fix
- Old fail-open: USING (current_org_id() IS NULL OR org_id = current_org_id()) -> ALLOWS ALL when NULL -> BREACH
- New fail-closed: USING (current_org_id() IS NOT NULL AND org_id = current_org_id()) -> DENIES ALL when NULL -> SECURE
- Same for legal_entity_id
- Service/admin bypass must be explicit via service_role/is_admin, never via NULL

## Quick Start - Clone → Configure → Boot → Migrate → Test from Zero

### 1. Clone
```bash
git clone https://github.com/YOUR_ORG/sam-greenfield.git
cd sam-greenfield
```

### 2. Configure
```bash
cp .env.example .env
```

### 3. Boot clean
```bash
docker-compose down -v
docker-compose up -d db
until pg_isready -h localhost -p 5432 -U postgres; do sleep 1; done
```

### 4. Migrate deterministically (9 migrations)
```bash
for f in packages/db/migrations/*.sql; do echo "Applying $f"; psql postgres://postgres:postgres@localhost:5432/sam_greenfield -f "$f"; done
# Expected: 9 migrations 00001..00009, 22 tables, RLS fail-closed policies
```

### 5. Run tests
```bash
python3 tests/phase0/phase0_acceptance.py
pip install psycopg2-binary
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/sam_greenfield
python3 tests/phase0_postgres/real_postgres_test.py
python3 tests/phase0_postgres/test_rls_tenant_isolation.py
python3 tests/phase0_postgres/test_rls_fail_closed_security.py
# Expected: No context -> 0 rows, INSERT/UPDATE/DELETE blocked, A cannot read B, B cannot read A, A can read own
```

### 6. CI
GitHub Actions .github/workflows/phase0-postgres-verification.yml runs with postgres:15-alpine
Proves clean boot + migrations + fail-closed RLS

## Migrations (9 canonical)
- 00001_initial_org_legal_entities.sql - orgs, legal_entities, users, business_id_sequences + next_business_id() transactional SELECT FOR UPDATE never MAX()+1
- 00002_audit_framework.sql - audit_log append-only trigger
- 00003_event_fabric.sql - event_seq BIGINT UNIQUE monotonic, dedup_key UNIQUE, inbox per-consumer UNIQUE
- 00004_outbox_and_side_effect.sql - outbox, side_effect_operations operation_key UNIQUE semantic, work_queue fencing_token
- 00005_world_facts_memory.sql - world_facts append-only + deterministic projection view
- 00006_policy_approvals_verification.sql - policy_envelopes, approvals bound scope, verification_contracts
- 00007_goals_plans_financial.sql - goals business_id UNIQUE, financial_documents immutability trigger
- 00008_rls_tenant_isolation_policies.sql - FAIL-CLOSED RLS policies IS NOT NULL AND =
- 00009_fix_rls_fail_closed.sql - Security fix confirmation, clean final state, each policy created once

## 22 vs 21 Tables
- Total 22 tables, all 22 rowsecurity=true after 00009
- business_id_sequences is infrastructure sequence table, RLS enabled but no tenant policy by design (global ID generator)

## No LIVE_PROVEN Claim Yet
- Status is MECHANICALLY_TESTED + SECURITY FIXED
- LIVE_PROVEN requires actual GitHub Actions run URL/log
- Content hash != Git commit SHA - real SHA via git rev-parse HEAD after git init

## Next
Do NOT start Phase 1 until Phase 1 approval after real CI run passes.
