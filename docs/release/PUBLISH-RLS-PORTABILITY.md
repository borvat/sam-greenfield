# Publishing RLS portability repair — 2026-10-11

## Failure and scope

The failed publish at 04:01 UTC stopped in `pg_restore` while preparing the
development schema: a policy referenced `sam_autonomy_app`, which did not exist
in the restore target. That role already existed in development. This was not
an application compilation or OAuth failure.

Catalog inspection found 48 role-targeted policies in four existing SAM
development schemas: autonomy (18), Drive content (9), Drive metadata (9), and
goal cycle (12). Five were restrictive. The approved development-only repair
committed successfully on `heliumdb`; no production SQL was executed.

## Permission preservation

- Keep the original expression, command and permissive/restrictive kind.
- Replace the dump-time role dependency with runtime `pg_has_role(...,'USAGE')`,
  preserving effective inheritance rather than mere membership.
- Nonmembers receive FALSE from permissive predicates and TRUE from restrictive
  predicates, matching an originally inapplicable policy.
- Use schema-pinned, STABLE, **SECURITY INVOKER** predicate functions. Evaluate
  the original expression only for eligible roles. An inline CASE around a
  relational subquery can still add ACL checks for nonmembers; the fixture
  includes an outsider with child-table-only privileges to catch this.
- PUBLIC function execution provides only a role-gated boolean, not table
  privileges, a generic query interface or an executive MCP capability.
- No table data, table grants, role attributes, RLS/force flags or other policy
  definitions were changed. Catalog fingerprints guarded the transaction.
- No new persistent role was created; 48 caller-privilege predicate functions
  were installed. The source development schema factories now produce the same
  portable definitions for future isolated schemas.

These functions accept the policy row, not arbitrary SQL. The factory accepts
only reviewed code or trusted `pg_get_expr` output, never an MCP/client payload.
Future column/predicate changes must review/regenerate the predicates; invalid
predicate code fails closed rather than granting access.

This repair covers the current direct/invoker query model. Non-invoker views
with non-bypass owners can select RLS policies as the view owner while
CURRENT_USER remains the caller. No such dependencies exist in these schemas;
introducing one requires a new permission review, not blind reuse of this factory.

## Evidence

| Check | Result |
|---|---|
| Real development PostgreSQL synthetic equivalence matrix | PASS, 175 checks |
| SELECT/INSERT/UPDATE/DELETE and denied writes | Same results/SQLSTATEs |
| Direct/inherited/non-inherited/nonmember effective roles | PASS |
| Foreign/sibling/missing/partial tenant contexts, NULL values | Original behavior preserved |
| Restricted relational ACLs and original role absent | PASS |
| Test object cleanup | Transaction ROLLBACK; schema absent, test roles 0 |
| Development repair | COMMIT, 48 policies, 48 invoker functions |
| Remaining non-PUBLIC role-targeted policies in user schemas | 0 |
| SECURITY DEFINER portability functions | 0 |
| Non-invoker view dependencies with non-bypass owners | 0 |
| Table-security and role-attribute fingerprints | Unchanged, checked before COMMIT |
| JavaScript identifier/kind/injection rejection checks | PASS |
| Typecheck | PASS |
| Existing secured MCP protocol regression | PASS, 124 checks; mocked SQL, external/provider calls 0 |
| Existing development workflows | Three running; worker idle, external adapters disabled |

The real PostgreSQL test uses effective non-bypass **SET ROLE**, not a new LOGIN
authentication test. It proves RLS behavior, not a model invocation, executive
goal completion, production TLS or restricted production runtime credentials.

Reproduce the isolated fixture with:

```
node tests/release/rls_portability.cjs --emit-sql > /tmp/sam-rls-portability.sql
```

Execute the entire generated batch against the verified development database
only; its transaction rolls back every fixture. Do not split statements across
connections. No development credential is printed or requested.

## Remaining step

Owner: Push the code commit, then Republish the existing closed Setup deployment
with copying development data still disabled. The current role-reference
failure has been removed from the source schema, but a successful platform
restore/publish is **not yet proven**. Inspect the next publish log for any
different platform failure.

Keep Setup Mode and release approval restrictions unchanged. This repair does
not authorize executive tools, workers/models, a production administrator
connection, or purchases. OAuth admission, restricted runtime LOGIN/TLS/RLS and
release security gates still require their own proof before full SAM activation.
No production release, Neon connection or paid model call was made.
