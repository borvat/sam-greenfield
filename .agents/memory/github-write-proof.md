---
name: GitHub write proof
description: Separate integration metadata, workspace Git authentication, and actual remote synchronization.
---

Do not equate healthy GitHub OAuth, a repository scope, or an integration description promising automatic Git authentication with working workspace push access.

**Why:** The integration list reported an unbound connection, while the official binding action reported it already added and its OAuth healthy. Workspace dry-run write probes nevertheless timed out or failed. Opaque delegation diagnostics later localized a stall to the platform credential helper's password handoff; the API sandbox also lacked a usable credential context despite healthy integration metadata. None of this established insufficient repository permissions, revoked OAuth, the authenticated GitHub actor, or successful synchronization.

**How to apply:** Verify the exact approved repository/ref, remote base, local history, regression and secret review. Use native non-force Git operations and verify the remote SHA after a successful push. If the credential handoff fails, stop; report observed failures separately from unknown causes. Do not extract OAuth tokens manually, rewrite remotes with credentials, or substitute API ref/history replacement. The owner's Git pane is a legitimate next diagnostic path.

Credential diagnostics must leave the original helper's output opaque and send it directly to Git. Record only challenge type, exit status and timing; do not capture credential output or enable unredacted HTTP traces.
