---
name: RLS proof boundaries
description: Why administrative database tests do not prove tenant enforcement in SAM's runtime.
---
Use a genuinely non-superuser, non-bypass, non-table-owner application role when claiming an RLS proof. Applying migrations or passing administrative-connection tests is insufficient.

**Why:** The imported operational tables could have RLS enabled without an applicable policy; administrative tests passed because they bypassed enforcement. The first non-bypass native planning attempt correctly stopped at the missing operational policy.

**How to apply:** Inspect effective role privileges as well as policies. Keep policy additions tenant/goal-bound and limited to the explicitly approved development scope. Never disable RLS or silently install broad production policies merely to make a test pass. Preserve the original distinction between organization-scoped legal-entity metadata and legal-entity-scoped goals.

A restrictive fixed-principal boundary is needed when quarantine must narrow
existing permissive policies; adding another permissive scoped policy is not an
AND restriction.

**Why:** A restored synthetic database admitted a foreign tenant context under
its pre-existing permissive policy despite an apparently scoped new quarantine
policy. A real non-bypass LOGIN negative test exposed the OR combination.

**How to apply:** Review policy combination semantics, test missing/foreign
contexts using the restored application role, and separately deny queue/outbox
access. Do not infer quarantine from a policy's presence or administrative tests.

Treat identifier allocation as part of tenant enforcement, and exercise
ordinary authenticated intake under the same restricted principal as execution.

**Why:** Planner-only mocks missed an intake request for a global identifier
sequence; the real restricted LOGIN correctly refused it before any model call.

**How to apply:** Include intake in real-database acceptance. Scope allocations
to the already validated entity rather than granting access to global sequences
to make a pilot pass.
