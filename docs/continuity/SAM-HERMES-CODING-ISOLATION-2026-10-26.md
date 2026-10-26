# SAM × Hermes — coding phase gate, 2026-10-26

Status: BLOCKED before enabling coding tools. This checkpoint records a decision, not a successful coding run.

## Continuity

Resumed PR #66 at ac94222601c8ffdbee5ac857e5b4da5e28bbf5db. The accepted arithmetic/restart evidence on source ad64a6a remains preserved and was not rerun. The existing test window was not renewed. No application code, deployment, permissions, network policy, production service, main branch or PR merge was changed.

Read-only deployment checks found no pending deployment in the checked latest records. The inspected task ledgers were idle. Native tool-policy readback kept programming tools disabled.

## Decision

Direct, harmless capability probes did not establish a supported child execution boundary for the required filesystem, network and resource isolation on the current application services. No generated program was executed. Installing a CLI, using a temporary directory, running a local subprocess or disabling tools is insufficient evidence of isolation.

The currently deployed SAM composition is intentionally a bounded arithmetic probe. Its SQL arithmetic verifier is not an independent code verifier. Coding needs an explicit capability, isolated executor and independent verifier; preserve the existing probe's guards and ceiling.

Detailed operational security diagnostics are intentionally excluded from this public checkpoint. Recheck capabilities privately if the environment changes; do not repeatedly retry denied operations or weaken controls.

## Alternatives to evaluate

These are proposals, not configured or accepted environments. Official references checked 2026-10-26:

- Standard GitHub-hosted runner in a separate synthetic public test repository: standard public-repository runner compute is documented as free. Restrict generated execution to a disposable non-root, network-disabled container with explicit resource/time limits and no host credentials. Use a separate trusted publisher limited to the test repository. Public source/log disclosure, storage billing, runner availability and actual negative-test results must be checked.
- Modal remote sandbox: documented full outbound blocking is available. Published sandbox compute for an illustrative one physical core plus one GiB for ten minutes is about USD 0.027654 before credits and additional costs. Account eligibility, remaining credits and a hard spending boundary are unverified. No paid resource was started.
- Daytona: published one vCPU plus one GiB compute is about USD 0.0111 for ten minutes before other charges. Strict network control depends on tier; a free account must not be assumed sufficient. No resource or upgrade was started.
- An already owned dedicated external host could avoid a new hosting bill, if available. It still requires an independently verified ephemeral isolation boundary and no production connectivity or credentials.

References:
- https://docs.github.com/en/actions/concepts/billing-and-usage
- https://docs.github.com/en/actions/reference/security/secure-use
- https://modal.com/docs/guide/sandbox-networking
- https://modal.com/pricing
- https://www.daytona.io/docs/en/network-limits/
- https://www.daytona.io/pricing
- https://hermes-agent.nousresearch.com/docs/user-guide/configuration

## Resume criteria

Choose an approved external execution route and establish its exact cost and access boundaries. Before enabling tools, prove denial of unauthorized filesystem, secret, process and network access using synthetic canaries, plus resource limits and cleanup. Keep all publishing credentials outside generated execution. A separate publisher must constrain repository, branch and writable paths and refuse main, merges and unrelated repositories.

Then run the actual small repair, independently test the candidate against immutable tests in a fresh sandbox, reject wrong/incomplete results, publish a test-only Draft PR and prove durable task/receipt persistence without duplicate execution. Retain model identity and audit evidence. Durable coordinator authorization must be designed separately; the old consumed test window is not reusable.

## Delivery

| Requested proof | Result |
|---|---|
| Safe coding isolation | Not proven; gate remains closed |
| Hermes actually edited and tested code | Not performed |
| Test repository coding Draft PR | Not created |
| SAM independent coding verification / negative-result test | Not performed |
| Coding record restart persistence | Not performed |
| Previous arithmetic acceptance | Preserved; not repeated |
| Added resource, deploy or model usage | None initiated in this phase |
| Invoice audit | Not performed; existing hosting continues |
| Pending execution started by this phase | None |

Do not renew the prior window, open local coding tools, create paid resources, repeat the accepted arithmetic run or merge PR #65/#66. Next step is an approved external sandbox route, followed by the isolation gate and coding-capability implementation.
