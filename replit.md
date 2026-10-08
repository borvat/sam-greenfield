# SAM Greenfield on Replit

This is the imported SAM implementation, not a replacement app. Preserve its kernel,
authority gates, independent verification, migrations and production entry points.

## Isolated development experiment

- `npm run dev:setup` initializes only `sam_replit_dev` in the inspected, initially
  empty Replit **development** PostgreSQL database (`heliumdb`).
- Setup and launch compare the database and PostgreSQL cluster identity against a
  local identity pin obtained independently via Replit's development database API.
  They refuse a different database, a nonempty new target, and a deployment without
  the editor development domain. They do not contact or migrate production.
  The identity pin at `.local/sam-dev/target.json` is metadata, not a credential;
  re-inspect the development target before recreating it in a new workspace.
- All development commands force an isolated PostgreSQL search path; they never use
  the original localhost database fallback. Local configuration contains no secrets.
- `npm run dev:command-center`: existing Command Center on port 5000.
- `npm run dev:runtime`: existing runtime on port 8080, using the maintenance-only
  development composition (kernel recovery/outbox/events and operational supervisor).
- `npm run dev:mcp`: existing MCP HTTP endpoint at port 3001 `/mcp`, restricted to
  `sam_development_service_status` and `sam_development_test_results` in safe mode.
- Replit workflows run these three services separately.
- `npm run test:development`: original regression suites plus development boundaries
  in disposable isolated test schemas. No roles, grants or connection tokens are created.
- `node --experimental-websocket --no-warnings scripts/development/browser-check.cjs`:
  loopback-only authenticated Chromium check; password stays in process memory and
  the disposable session. Local screenshots redact goal identifiers and record text.

## Development data boundaries

Safe mode binds planning to `SAM_DEV_LEGAL_ENTITY_ID`. Its optional local
`.local/sam-dev/planning-policy.json` is a data allowlist, not a credential:
`legalEntityId`, `approvedGoals` (explicit `id`/`objective` pairs) and `approvedFacts`
(explicit `id`/`domain`/`attribute`/scalar `value` records). Only synthetic
`development_probe` facts and goals can pass. Missing policy means deny by default.
Never copy production records into this policy. Changes to an approved value require
new explicit approval; record IDs alone do not authorize new contents.

Context assembly never loads memory in safe mode. Entity mismatches are rejected
before kernel goal transitions, including replanning. Model input projections omit
internal identifiers and row metadata; configured secrets and credential-shaped
strings are rejected. Both planner and gateway block ALL model calls while local
safe mode is active. These additional boundaries are opt-in; original production
authority, verification and read surfaces remain unchanged outside safe mode.

The development MCP tools accept no arguments and disclose no goal, user, memory,
legal or financial records. Test results expose fixed enums and bounded counts only.
Their current report does not mean an executive goal completed: the synthetic kernel
probe stops at PLANNING because a separately approved model would be required.

## Safety and limits

The development launcher does not inherit model-provider keys, Google OAuth,
bol/e-Boekhouden keys, financial-loop settings or production bundle paths.
It never registers external adapters or an action dispatcher. Planning, capability
execution, external side-effect reconciliation and the financial loop are disabled.
Goals created in the dashboard are real development records, but remain unplanned
until a separately approved provider/composition is configured. Do not claim
end-to-end executive goal completion or independent verification from this experiment.
The development entity is a test record, not a real legal entity.
Original production entry points are unchanged; do not run them for this experiment.

Bearer authentication and host allowlists are retained. Supply
`SAM_COMMAND_CENTER_BEARER_TOKEN` and `SAM_MCP_BEARER_TOKEN` via Replit Secrets if
separate credentials are desired. During this experiment only, each falls back to
the existing `SESSION_SECRET`, in memory; no credential is generated into a file
or printed. The owner can obtain their credential through Secrets, never chat.
Enter the Command Center bearer in its inline login field. It stays in
`sessionStorage`, not the URL or persistent local storage.
Never put credentials in URLs, commands, logs, screenshots or committed files.

The workspace workflows are not an always-on production service. Closing the
preview does not itself stop their processes, but workspace inactivity, stopping
the workflow or environment suspension can. Guaranteed continuous operation needs
a separately authorized always-on deployment; none is configured or published here.

## Approved single-goal cycle, separate from the maintenance services

The one-shot goal-cycle runner reuses the original catalog/brain, model registry and
gateway, atomic plan persistence, specialist worker leases/fencing, tool execution,
independent verifier, and goal state machine. It is not a replacement SAM.
Its only capability records three fictional task/rank artifacts in PostgreSQL.
The verifier independently queries these records and compares their expected ranks;
it does not trust the executor's result/evidence. The execution worker is a separate
process without model/OAuth credentials and stops after this goal.

Use `npm run test:development:goal-cycle` for the local acceptance test. Its model
response is explicitly a unit fixture, never evidence of a live provider call.
The approved live runner requires `--approved-live-once`, claims a durable exclusive
marker before its sole model request, and refuses to overwrite an existing evidence
schema or role. It retains evidence in `sam_replit_goal_cycle` and safe JSON reports
under `.local/sam-dev/`; the ordinary command center/MCP/worker still use their
existing development schema and remain maintenance/read-only.

The cycle uses a NOLOGIN, NOSUPERUSER, NOBYPASSRLS database role. Missing original
operational-table policies are supplied only in this new schema, tied to one immutable
goal/tenant scope. No global production policies are installed, RLS is never disabled,
and financial/memory/user/side-effect access remains denied. Do not treat tests using
the administrative database connection as proof that RLS was enforced.

The in-process model permit accepts only the exact fictional cycle fixture, strips
local entity/goal IDs from model input, consumes once, disables fallback, and never
opens ordinary development planning. Provider output must pass the original validator,
the stricter fictional-task contract and response safety checks before authority,
plan persistence and delegation. The general regression summary is distinct from
this separately approved goal-cycle evidence; it does not automatically expose
the retained cycle schema through the dashboard or MCP.
