---
name: RLS proof boundaries
description: Why administrative database tests do not prove tenant enforcement in SAM's runtime.
---
Use a genuinely non-superuser, non-bypass, non-table-owner application role when claiming an RLS proof. Applying migrations or passing administrative-connection tests is insufficient.

**Why:** The imported operational tables could have RLS enabled without an applicable policy; administrative tests passed because they bypassed enforcement. The first non-bypass native planning attempt correctly stopped at the missing operational policy.

**How to apply:** Inspect effective role privileges as well as policies. Keep policy additions tenant/goal-bound and limited to the explicitly approved development scope. Never disable RLS or silently install broad production policies merely to make a test pass. Preserve the original distinction between organization-scoped legal-entity metadata and legal-entity-scoped goals.
