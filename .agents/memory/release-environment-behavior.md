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
