---
name: Release environment tooling
description: Production configuration, platform metadata and publishing schema-restore quirks.
---

Production nonsecret environment edits through Replit's environment API can
persist in the tracked `.replit` production section. Review them as code; do not
put real credentials in that section or mistake public environment readback for
inspection of the owner's unsaved Publishing wizard draft.

**Why:** The API initially showed no production settings while the owner reported
settings in the wizard; subsequent nonsecret API edits were confirmed in both
readback and `.replit`. The wizard draft itself was not inspected.

**How to apply:** Confirm the public activation gates in the final Publishing
configuration before release. Never request secret values to reconcile the two.

Temporary acceptance servers can trigger automatic `.replit` port mappings.

**Why:** A local visual Setup fixture added a port mapping without an explicit
configuration edit.

**How to apply:** Stop the temporary fixture and remove only its newly introduced
mapping; preserve all existing service mappings.

Production environment values also affect the publishing build, not only startup.
An earlier platform package installation does not guarantee development packages
survive a subsequent custom `npm ci`.

**Why:** Publishing completed its initial package installation but the build's
clean install omitted TypeScript under production mode and failed before startup.

**How to apply:** Install required build-time development dependencies explicitly
in the build command. Keep runtime production mode and security gates unchanged.

Development-domain metadata can be present in a published Reserved VM. Its
presence alone is not proof that a process is running in development.

**Why:** Actual published logs rejected that injected metadata and entered a
crash loop, despite publication succeeding; a documentation summary had suggested
the variable would be absent in production.

**How to apply:** Use Replit's documented deployment indicator for runtime
classification, not absence of the development URL. Never stamp the indicator
into user configuration; offline configuration lint is not deployment proof.
This does not authorize loosening executive database or identity admission.

Use native Node HTTP requests for synthetic pinned-Host transport tests.

**Why:** Workspace fetch-based requests with a synthetic Host override failed
the endpoint guard; native HTTP requests delivered the intended Host and
exercised the protocol successfully.

**How to apply:** Do not interpret a fetch-specific Host override failure as
evidence that MCP protocol initialization itself is broken.

Role-targeted RLS policies can fail Replit's publishing schema preparation even
when the referenced application role exists in development.

**Why:** A publishing attempt failed during pg_restore because its restore target
lacked a custom application role referenced by development RLS policies. This
occurred before application compilation; the previous deployment remained active.

**How to apply:** Distinguish this schema-restore failure from runtime DB login
or OAuth failures. Check source policy dependencies read-only. Do not replace
role-targeted policies with unconditional PUBLIC policies: restrictive and
permissive policies require different permission-equivalent treatment. Existing
development policy changes need explicit scope approval; never bypass the managed
production migration flow with startup DDL or administrative worker credentials.

Generate long transactional SQL fixtures to a temporary file and read that file
fully before passing a compact batch to the database tool.

**Why:** A stdout-mediated SQL rehearsal lost its middle despite a later
non-truncated outer result, producing a misleading SQL syntax error. The full
batch then exceeded the subprocess argument limit. A compact server-side test
loop preserved the same coverage without either failure.

**How to apply:** Check file byte length and read budgets, avoid routing large
SQL through shell-output previews, and keep one transactional batch below the
process argument limit. Never split a transaction across tool calls.
