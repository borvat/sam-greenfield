# SAM production schema admission — evidence-driven plan (NO EXECUTION)

## Observed on 2026-10-11
- Replit Development UI: schema `sam` lists SAM tables.
- Replit Production SQL console: `current_database()=neondb`, connected role `neondb_owner`; direct `pg_catalog.pg_namespace` query for `sam` returned FALSE.
- Managed `explainSchemaDiff()` reported `hasDiff=false` according to prior repository evidence.
- Publishing offers **Copy your development database to production database**, explicitly destructive for existing production data. **Do not enable this option**.

These observations establish a mismatch, *not* the cause of the managed schema-diff failure.

## Architectural finding
The original SQL migrations contain unqualified table/function names (e.g. `CREATE TABLE organizations`). Their target depends on the authenticated session's `search_path`. Development source creation explicitly sets `SET LOCAL search_path=sam,pg_catalog`. Therefore the migrations must NOT be applied ad hoc against production without an independently reviewed migration role, database identity, explicit schema scope, idempotent ledger, and backup/rollback plan.

Replit's published-app `Live` status only shows a live deployment; it is not proof that the SAM runtime or MCP executive has passed database admission.

## Evidence needed to select a production approach (all read-only)
1. Verify target production DB identity, schema existence and expected table inventory with the separate read-only parity diagnostic; redact secrets. Compare with development identity and inventory.
2. Determine whether Replit's managed schema diff includes *non-public* schemas created through Development SQL console. Request documented support confirmation for the *same app* and currently deployed database: what source objects are inspected and what exactly `hasDiff=false` covers.
3. Verify that the selected production provisioning method can provision custom schema `sam` and restricted LOGIN with separate migration identity, enforce RLS per tenant/entity, and preserve any existing production data.
4. Record deployment source commit SHA and Replit schema-diff evidence before any migration or republish.

## Go / no-go gate
No production DDL, COPY, restore, or publishing until:
- The owner approves an exact data-safe route after the read-only evidence.
- Target is unambiguously the existing intended production database; a restorable backup is verified.
- Restricted runtime role is proven to lack ownership, privileged memberships, BYPASSRLS and DDL capabilities, with separate migration identity.
- Original migrations and existing `sam` compatibility are reviewed against the target; schema ledger and drift guard are validated.
- Tenant/entity RLS negative tests, queue quarantine, command-center and MCP OAuth are verified independently.
- Costs are checked before any billable resource or deployment.

## Prohibited shortcuts
- Do not select the destructive whole-database copy checkbox.
- Do not move SAM tables to `public` merely to satisfy schema diff.
- Do not add migrations to build/startup.
- Do not run workers with `neondb_owner` or development credentials.
- Do not create a second SAM/MCP app or enable unverified executive execution.

This document is a decision aid, **not** an executed repair or evidence that Replit supports non-public schema publishing.

## Replit official migration mechanism research (2026-10-11)
- Replit engineering describes deploy-time schema introspection of both databases, diff generation and validation using a temporary Neon branch, rather than direct copying of development rows: https://frontier.replit.com/production-databases-automated-migrations/
- Replit's announcement says Dev and Production data are isolated, and detected schema changes are proposed during deployment: https://replit.com/blog/introducing-a-safer-way-to-vibe-code-with-replit-databases
- Neither source explicitly promises coverage of custom PostgreSQL namespace `sam`. Since direct catalog query proved the namespace absent while managed schema diff returned `hasDiff=false`, do **not** infer non-public-schema support.
- Next action: obtain a platform-specific answer or validate *read-only* underlying introspection scope before deciding between Replit migration and independently reviewed one-time scoped production migration. Do not append `db:push` blindly to a build command or re-publish to experiment.
