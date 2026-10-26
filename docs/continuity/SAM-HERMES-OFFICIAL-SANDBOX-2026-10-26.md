# Official sandbox preparation — SAM × Hermes

Status: PREPARATION ONLY, awaiting financial authorization and live isolation acceptance. Resumed Draft PR #66 from 2939f22; deployed SAM source remains ad64a6a. The accepted arithmetic task is not repeated, and its consumed window is not renewed. GitHub Actions is explicitly excluded because it is unavailable for this account.

## Phase 1: official-backend compatibility review

The official Hermes documentation and the installed backend source were reviewed. Modal, Daytona, Docker, SSH and Vercel backend implementations are present in the inspected source. Presence does not establish an authenticated remote sandbox or live SDK compatibility.

Recommended route: **Modal Direct**, keeping SAM and Hermes on Render and delegating code execution to the provider's official Sandbox API/backend. This does not authorize creating a billable sandbox.

The normal Modal configuration is not sufficient for this task's stricter policy. Local source-extracted compatibility checks with fake dependencies confirmed:
1. The inspected normal Modal builder constructs CPU/memory options but does not forward the requested network block or sandbox lifetime supplied in the synthetic configuration. The official environment class accepts additional creation kwargs, so a narrow integration change is feasible.
2. The inspected shared file-sync function includes a registered synthetic credential file. The fixture used a nonexistent canary path, never an actual credential. Existing registration guards do not make arbitrary registered/configured files safe for this task.

These two checks PASS as compatibility diagnostics; they do NOT establish a secure sandbox. No cloud SDK or generated program was run by them, no real secret was read, and no remote resource was created. The full installed source paths were inspected read-only. Optional SDK availability must be established before live acceptance; no dependency was installed in the running service.

Do not enable the backend unchanged or rely on a generic terminal.backend=modal switch. Required hardening is limited to official SDK/backend integration: explicit deny-all network and provider lifetime/resource limits, no automatic host state/credential/cache/skills upload or sync-back, no snapshots/volumes, controlled synthetic workspace transfer and cleanup. Keep provider and publisher credentials outside generated execution. Reject unsupported SDK/options rather than falling back to local execution, managed billing or permissive networking.

## State and next step

Latest checked deployment records remain terminal; application source is unchanged. Hermes coding tools remain disabled. No new resource, deployment, paid inference or billing change was initiated. The prior accepted records are preserved.

Next: finish the provider comparison and exact conditional cost proposal; prepare the live gate using controlled canaries, independent immutable tests, separate publisher and durable coordinator access. The old SQL arithmetic verifier and prior role window cannot be reused as coding authorization.

References checked:
- https://hermes-agent.nousresearch.com/docs/user-guide/configuration
- https://modal.com/docs/guide/sandbox-networking
- https://modal.com/docs/guide/budgets
- https://modal.com/docs/sdk/py/latest/Sandbox
- https://modal.com/pricing

Do not create resources or enable tools before separate financial authorization and isolation acceptance. Keep PR #65/#66 draft/unmerged and do not modify main or production.
