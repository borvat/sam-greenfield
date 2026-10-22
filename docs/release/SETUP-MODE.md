# SAM Setup Mode — local acceptance, NOT Publish permission

## Purpose and boundary

Managed production database provisioning happens during Publish. The ordinary
SAM entry point refuses to open a port before its approved runtime contract is
complete. Setup Mode separates provisioning liveness from executive readiness;
it does not claim the database is provisioned or allow production activation.

It is an opt-in branch of the existing `npm run start:release`, not a new
application, goal workflow or alternative executive agent.

Production setup contract (documentation only; no environment was changed):

- `NODE_ENV=production`
- `SAM_RELEASE_SETUP_MODE=1`
- `SAM_RELEASE_APPROVED=0` — mandatory; combining setup with `1` is refused.
- `SAM_RELEASE_SETUP_LOCAL=0` or absent
- No development/sandbox flags or development domain.
- One validated `PORT`, default 5000.

Local tests use `NODE_ENV=test`, `SAM_RELEASE_SETUP_LOCAL=1`, and a loopback
listener only. That combination is refused with production NODE_ENV.
The template keeps Setup Mode OFF; existing development workflows are unchanged.

## Surface

| Method/path | Result |
|---|---|
| GET/HEAD `/` | 200, static Arabic disabled-state page; no scripts/forms/external assets |
| GET/HEAD `/livez` | 200, liveness only; ready/activation/billing-cap booleans remain false |
| GET/HEAD `/readyz` | 503 — never executive-ready |
| Other paths, including APIs, MCP, memory and query strings | 404, fixed output |
| Non-GET/HEAD methods | 405, no state mutation |

No supervisor, worker, business dashboard, MCP, DB/client, kernel, model or
integration module is loaded. No child is spawned; no credentials, request body,
headers, query parameters or environment values are echoed.
Headers are no-store, restrictive CSP and no-referrer; header/socket/timeouts
are bounded. SIGTERM/SIGINT close the listener and active connections.

## Evidence

- **31 regression suites PASS**, including original SAM authority, RLS,
  learning/autonomy fixtures, native service startup/recovery, restore and
  semantic acceptance. This does not rerun live model/business acceptance.
- Typecheck PASS.
- Native Setup process PASS with test instrumentation that denies forbidden
  module loading, outbound sockets/fetch and child-process creation.
- 16 rejected configuration combinations; denied business paths and write
  methods; zero DB-tripwire connections and zero child PIDs.
- Synthetic sensitive sentinels absent from response bodies and process output.
- Native SIGTERM exit 0; endpoint unreachable after stop.
- Actual static-page screenshot inspected on a temporary loopback process.
  That process was stopped; no workflow or deployment was created.
- Dependency audit: 0 findings. Privacy scan: 0 findings.
  Replit SAST: **40 Critical / 0 Medium**, unchanged count, no suppression.
  See current scanner snapshot and the prior source-to-query review ledger.

Receipt: `setup-evidence.json`; local raw regression log:
`.local/sam-dev/setup-regression.log` (ignored generated evidence).
Classification: **LOCAL_REAL_SETUP_PROCESS_NOT_PUBLISHED_ACCEPTANCE**.

## Future provisioning sequence — still blocked

1. Resolve the complete spending gate; obtain separate explicit permission for
   billable provisioning/Publish. Total $5 remains a hard owner limit, not consent.
2. Review platform schema-only diff. Do not copy development records, sessions,
   fixture namespaces or test contracts. No build/startup migration hook.
3. Only after permission, publish the Setup branch with executive approval OFF.
   A successful Setup HTTP response is not a successful SAM goal.
4. Independently prove the new database identity, restricted app LOGIN, minimum
   grants, tenant RLS negatives, backup/restore, queue/outbox quarantine and
   protected monitoring. Administrative production changes remain owner's work.
   Place actual app connection/auth in production Secrets, never chat or Git.
5. Freeze the approved source and get separate executive activation permission.
   Turn Setup OFF; the unchanged ordinary SAM runtime contract must pass.
   Do not start workers while proving a quarantined restore.

Setup does not stop platform billing, guarantee storage discounts or enforce $5.
Stopping its process is not Unpublish. Publishing/VM/database/backup/storage
creation, billing enforcement and 24-hour hosting remain **NOT TESTED/BLOCKED**.
