---
name: Release environment tooling
description: Production configuration readback and temporary preview port side effects.
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
