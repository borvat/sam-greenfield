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
- `npm run dev:mcp`: existing MCP HTTP endpoint at port 3001 `/mcp`, read-only tools.
- Replit workflows run these three services separately.
- `npm run test:development`: regression tests in a disposable, isolated test schema.

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
