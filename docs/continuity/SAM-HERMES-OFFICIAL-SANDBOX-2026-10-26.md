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


## Phase 2: comparison, offline SDK preparation and approval proposal

Decision: proceed with **Modal Direct only after approval**, with a small official-backend integration hardening. Do not build a custom isolation engine. This choice is conditional on the actual provider account accepting the required budget controls and SDK integration passing the live gate. It is not a claim of drop-in compatibility.

| Official route | Compatibility / security boundary | Cost and decision |
|---|---|---|
| Modal Direct | Official installed backend and official SDK creation API support. SDK 1.6.2 was imported only in a disposable local venv; required async creation/app lookup, termination, network, resource, env/secrets/mount and OIDC controls are present. Normal Hermes builder/sync still needs narrow hardening. | Recommended: documented full network block and workspace-level usage/net-spend caps, without a monthly Team subscription. No cloud authentication or sandbox creation occurred. |
| Daytona | Official implementation is present. Strict per-sandbox deny-all is tier dependent, so cheaper headline compute is not equivalent to an accepted security boundary. | Current published 1 vCPU + 1 GiB compute USD 0.0666/hour; lower tiers retain essential-service access. Do not top up or upgrade to obtain higher-tier networking. |
| Docker on dedicated external host via official Docker/SSH route | Official backends exist; an external host must enforce isolation, deny-all network and cleanup independently. Plain SSH or a service directory is insufficient. | No authorized existing isolated host established. A new host has recurring cost and is not selected. No host was created. |
| Vercel Sandbox | Official backend exists; optional SDK/auth setup and network forwarding/sync behavior need validation. A generic provider firewall does not mean the installed wrapper applies it. | New provider project/account/plan eligibility and current effective charge must be established; no proven existing zero-cost executor. Not selected over the bounded direct Modal route. |
| Nous-managed Modal | Official selection path exists, but sandbox entitlement/add-on cost must be established separately from free inference. | Free model access does not establish free sandbox access. No subscription/add-on was enabled; do not silently fall back from direct to managed billing. |

Only Modal SDK was installed, in a disposable LOCAL audit venv, not on either running Render service. Package pin: modal==1.6.2 from PyPI, Python requirement >=3.10,<3.16. No SDK remote method was called. This confirms offline API shape, not service authentication, installed-Hermes end-to-end interoperability or isolation. The installed optional service SDK was not activated or lazily installed.

Reproducible no-cloud audit: scripts/evaluation/audit-hermes-modal-offline.py. Run --sdk in a disposable pinned venv; optionally --hermes-root against the reviewed official checkout to inspect the two extracted source functions with synthetic dependencies. It prints isolation_accepted=false by design. No account identifiers, credentials or provider configuration values are part of the artifact.

Observed checks:
- Two source-extracted compatibility probes with fake dependencies: completed; detected missing normal network/deadline forwarding and inclusion of a registered synthetic credential.
- Pinned SDK import/signature/async-control inspection: completed, required interfaces present, zero remote calls.
- Real cloud isolation / code repair / independent coding verification / wrong-result rejection / coding task persistence: NOT RUN.
- GitHub API branch writes succeeded despite Actions being excluded. This is a documentation/audit update to existing PR #66, not a new coding-task PR or proof of a least-privilege publisher.
- Existing application deployment remains ad64a6a. No rollout, namespace retry, model request or test-window renewal.

### Prepared acceptance policy

The intended first workload uses no dependency downloads at execution time: a synthetic dependency-free project, a reviewed pinned image, no host state/credentials/volumes or snapshots, no OIDC identity injection, no exposed ports, network blocked at creation, and a non-root guest user. Use provider hard limits of 0.5 physical CPU and 1024 MiB, lifetime <=600 seconds, shorter command deadlines, and concurrency one. Request values alone are not hard limits; the official SDK documents request/limit tuples for CPU and memory. Validate support in the pinned integration before creation; unsupported policy must stop without permissive fallback.

The minimal Hermes integration must explicitly supply the creation policy, disallow all automatic credential/skills/cache sync and host sync-back for this isolated task profile, transfer only approved synthetic workspace files, and terminate on cancellation/finally. Disabling filesystem snapshots must be explicit. Do not patch the general Hermes kernel or change unrelated profiles.

The live gate must independently check: no access to synthetic host canaries, service secrets/processes/mounts or provider credentials; public/private/link-local/DNS egress denied using controlled destinations; bounded CPU/memory/time/process/output use; refusal of unapproved file transfers and repository targets; cancellation and cleanup even after coordinator disconnect. No real production endpoint or secret should be used as an attack target.

Only after the gate passes may Hermes receive the necessary remote terminal/file tools for the synthetic task. Provider/Render/GitHub permissions stay outside the guest. The trusted publisher pins one test repository, disallows main and workflow/config scope changes, creates only a separate branch/Draft PR and never runs candidate code with its credentials. Do not treat the general ChatGPT GitHub connector's authority as the guest's permission.

SAM's independent verifier must run immutable tests in a NEW sandbox with the same policy, use source/base/candidate/test hashes and reject wrong or incomplete patches. A passing agent-provided test log is insufficient. Durable task/lease/receipt/idempotency records need an explicitly designed coordinator lifecycle. The consumed arithmetic-role window is not reusable and will not be reopened. Persist sandbox identifiers, model identity, hashes, test/refusal/cleanup evidence and publisher receipt before any restart test. Never replay an existing accepted execution to recover a missing report.

### Price and maximum-spend proposal (not approved)

Published Modal Sandbox list rates checked 2026-10-26:
- physical CPU: USD 0.00003942 per core-second
- memory: USD 0.00000667 per GiB-second

For 0.5 physical CPU + 1 GiB, the computed rate is USD 0.00002638/second, or USD 0.094968/hour.
- One guest lasting 600 seconds: USD 0.015828 compute.
- One repair guest + one independent verification guest, each 600 seconds: USD 0.031656 compute.
- Thirty such two-guest tasks: USD 0.949680 compute/month, an illustrative workload estimate, NOT authorization for thirty tasks.

These are exact arithmetic estimates using the stated allocations and list rates, not an exact invoice. Gate tests, retries, image preparation, region multipliers, retained storage/transfer and taxes can change the total. Provider included credits are not a no-charge guarantee; no balance or eligibility is assumed.

Proposed ONE approval: authorize one isolated acceptance campaign on Modal Starter, with at most USD 5 total new charges in the current billing cycle and no paid subscription, paid model, automatic top-up, paid upgrade or recurring execution. This is not USD 5 of new approval every month. Any tax or unavoidable non-capped charge must fit that total or creation must remain blocked.

Before the first billable operation, verify that the actual account allows an explicit workspace usage budget and a net spend limit no greater than the approved total; disable/default-deny new admissions and stop at campaign completion. Modal documents the workspace usage budget as the overall cap and the net spend limit as stopping work that would add out-of-pocket charges; remaining credit-funded work can continue until the usage cap, so set BOTH and terminate test workloads. Environment-only budgets are compute-only and require higher plans; no upgrade is proposed. A dashboard alert alone is not sufficient.

If the required small caps cannot be configured/verified, if a minimum payment/top-up exceeds the approved total, or if effective enforcement cannot be established, STOP before sandbox creation. Do not assume a free balance permits a billable run. Reaching the cap must cause admission refusal and workload stop rather than renewal or an upgrade. Actual account behavior remains untested until approved setup; do not promise a bill ceiling that has not been enforced.

### Final checkpoint / handoff

Preparation and offline compatibility review completed; the operational coding goal is NOT complete. Current new cloud/resource/model consumption initiated by this phase: zero. Existing Render hosting continues; actual invoices were not audited. No cloud task or deployment is pending from this work.

Next action: obtain the single bounded financial approval above, then verify account access/budget enforcement BEFORE creating any resource; implement/review the narrow official integration, pass live isolation, and only then run the coding acceptance. Account terms/credential creation, if required, must use the authorized secure provider flow. Do not request secrets in chat.

Additional official references:
- https://modal.com/docs/guide/sandbox-resources
- https://modal.com/docs/guide/budgets
- https://pypi.org/project/modal/1.6.2/
- https://www.daytona.io/docs/en/network-limits/
- https://www.daytona.io/pricing
- https://vercel.com/docs/sandbox/pricing
- https://hermes-agent.nousresearch.com/docs/user-guide/features/tool-gateway
