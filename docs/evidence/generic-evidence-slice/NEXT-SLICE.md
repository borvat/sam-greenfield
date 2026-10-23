# Proposed next slice: reviewed derived evidence in the existing agent loop

Proposal only; not implemented or authorized for production activation by PR55.
Use the existing SAM repository, services and database. No new host, credentials,
external integration, persistent privilege, business-specific solver or budget
increase. Keep the existing dynamic additional-read review path.

## Routine code work, before activation

1. **Versioned contracts.** Add reviewed output/extraction contracts only for
   fields actually guaranteed by an existing adapter or documented verified fixture.
   Carry contract version/hash, record path, units, VAT meaning, time and pagination
   semantics. Missing or unsupported contracts stay UNKNOWN and yield actionable
   gaps. The model selects a contract identifier, never supplies semantic metadata.
2. **Agent bridge.** Expose the finite transformation plan through a disabled
   capability definition, with input schema and existing goal/tenant authorization.
   Resolve inputs through the latest-VERIFIED loader, binding goal, tenant, source
   execution/verification hashes and contract versions. Preserve caller scope,
   read-only restrictions and existing planning/review budgets. No caller-supplied
   SQL, code, network endpoint or cross-goal record IDs are accepted.
3. **Durable derived artifacts.** Choose the smallest existing persistence surface
   after schema review; add a narrow additive migration only if necessary. Persist
   the canonical plan, bindings, result, semantic gaps and replay hashes atomically,
   with an idempotency key over goal + inputs + contract versions + plan. Replays
   reuse the same artifact; revoked/changed evidence invalidates reuse. Apply the
   existing tenant isolation model without new persistent privileges.
4. **Objective-review bridge.** Present bounded derived records and original-row
   citations to review/critique. Validate derived claims by deterministic replay,
   and raw claims by verified raw citations. Preserve citation mapping through
   knowledge capture. Replace no monetary guard until an equivalent derived-proof
   validator is present. Unknown currency/VAT, partial coverage, filtered or joined
   scope, and missing values must remain explicit. Existing authorized follow-up
   reads can fill gaps; execution is not repeated merely to recalculate.

## Measurable acceptance before a release proposal

- Same three natural-language goal families, varied IDs, partial pages and
  unavailable sources, through planner -> verified reads -> bounded transform ->
  persisted artifact -> review -> report. No production business-keyword routing.
- Exact decimal replay and original-row citations survive persistence/restart;
  duplicate scheduling produces one artifact and no duplicate source execution.
- Reject wrong goal/entity, unknown/stale contract, tampered/revoked inputs,
  unsupported operation, exceeded limits and forged derived claims.
- Unknown VAT ratio lineage and inner-join scope remain incomplete through final
  report and knowledge capture; no full-objective completion from structural
  readiness alone. Required source reads remain subject to existing authorization.
- Full isolated acceptance on the final combined commit, with no skipped tests.
  Scripted model fixtures prove integration/safety only, not autonomous quality.

## Explicit authorization boundaries

Routine implementation, isolated fixtures, tests and a reviewable Draft PR can be
prepared within the existing architecture. Production capability registration or
feature activation, production migrations/deployment, and live model evaluation
are separate release actions requiring the parent's explicit reviewed authorization.
An autonomous-quality evaluation additionally needs approved model access, fixed
budgets, held-out goals and success criteria, and an explicit data scope. Production
reads must still pass goal contracts; this proposal grants none. No old-goal replay
or budget reset is proposed.
