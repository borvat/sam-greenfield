---
name: Database candidate consent
description: Owner preference for Neon and the boundary between compatibility work and external provisioning
---

Neon is the owner's preferred PostgreSQL candidate only if fully compatible with
SAM Greenfield. Local compatibility preparation does not authorize provisioning
an external account/database, purchases or Publish. Preserve provider neutrality.

**Why:** The owner approved this candidate and local preparation on 2026-10-10,
explicitly excluding Neon account/database provisioning and paid resources.

**How to apply:** Before external database setup, obtain a separate scoped owner
decision; do not infer approval from successful local tests or a preferred vendor.

The owner has since reported manually creating the isolated Neon pilot and
approved implementing/testing a standalone credential helper locally only.
That approval does not permit reading/requesting real secrets, connecting to
Neon, enabling remote LOGIN, or running remote migrations.

**Why:** The owner explicitly separated local helper preparation from external
credential provisioning and authentication.

**How to apply:** Obtain a new scoped decision before applying the helper,
including the approved endpoint and provider-side credential-audit risk.
