# Unified candidate: offline progress, not general-agent completion

The parent audit contract remains `audit/general-agent-completion` at
5f0e5f4562f2e470c2bf830d09c0457ac07cb06b,
`docs/audits/general-agent-path/CONTRACT-DESIGN.md`. No production activation,
provider calls, grants, credentials, schema changes, merge or deployment occurred.

## Implemented in this follow-up

- First-plan goal obligations validate bounded deliverables, requested scope,
  explicit unknown semantics and original objective hash. Existing hashed plan
  assumptions persist them. Continuations carry exactly the same contract; attempts
  to change it or introduce it after an unbound first plan fail. Review must account
  for every ID, and critique receives the contract alongside the original objective.
  This does not prove that a model's initial interpretation is complete. No default
  production composition requires or generates this optional contract yet.
- Reviewed extraction contracts can build page receipts from hash-checked, latest
  verified, same-goal/tenant executions. Missing next-cursor fields fail, explicit
  terminal empty results differ from missing sources, and query/filter identity,
  cursor connectivity, duplicate identities and execution hashes remain explicit.
  Collection assessment does NOT silently upgrade dataset or objective coverage.
  Existing real-source mappings are not assigned invented pagination guarantees.
- Reproduced completed-child deadline failure in real isolated PostgreSQL before
  correction. Startup skips terminal children; expired active children and durable
  budget exhaustion become FAILED with a scoped event and no budget reset. A denied
  readback no longer leaves VERIFYING indefinitely. Other enrolled children continue.
- Capture rejects an execution set changed after initial locks. A separate-connection
  late insert regression verifies rollback/unsealed trial. This is an executed set
  change test, not a claimed reproduction of every possible revocation interleaving.
- Capture checks both persisted-operation-to-reservation and successful-reservation-
  to-persistence directions. Missing successful callback persistence refuses sealing;
  incomplete trace export remains the honest diagnostic route, without refunded work.
  An actual SIGKILL barrier after successful source callback and before execution
  INSERT proves the charge remains and complete capture is refused. The crash
  scenario runs before provider-failure injection scenarios in the shared fixture.
- Family signed trace/public key are now written into acceptance artifacts, alongside
  existing crash traces. Zero-tool/iteration/readback cases must reach FAILED and seal
  as failures, not nominal success. No fabricated completed coordinator.

## Validation status at this commit

TypeScript and targeted obligation/collection/review tests pass. PostgreSQL lifecycle
and verified-loader collection tests pass. A prior expanded test run failed because
its expected missing-link error preceded the new reverse-accounting check; the exact
assertion was updated and the rerun passed. The first crash barrier failed to match multiline SQL; a later misplaced crash
scenario overlapped fixture cleanup and deadlocked after its barrier was not reached.
Cleanup now kills the child before teardown on barrier failure; the isolated crash
scenario runs before provider-failure scenarios. Failed logs will accompany final
evidence.
Full acceptance for this follow-up has NOT run yet. The completed 080d9cd run passed 59/59 and covers
only the authentic hashed-fixture correction, not these changes. The failed 9dea66
27 PASS / 1 FAIL / 31 NOT_RUN evidence is preserved separately.

## Remaining joint delivery gates (must not be hidden by a green suite)

1. Bind a single disabled composition manifest to model-visible obligation schema,
   discovery/read, generic derive and bounded specialist delegation. The current
   positive service fixture still reads a frozen source; it is not a general-agent
   acceptance path. The new obligation contract is optional until that wiring exists.
2. Connect requested-scope fulfillment to defensible collection receipts, including
   bounded multi-page union and acyclic derived chaining. Do not simply remove the
   conservative completeCoverage guard. Currency/VAT/promise fields remain unknown
   where actual reviewed source contracts do not establish them.
3. Typed safe-read/transform recovery, conserved delegated budgets, and one shared
   restart/cancel/revocation harness across the combined graph. Unknown write outcome
   and authorization denial must never enter safe-read retries.
4. Nominal sufficient-evidence unfamiliar goals must succeed on that shared path;
   blocked variants prove honesty only. Frozen scripted choices do not demonstrate
   model autonomy. Any live reasoning evaluation remains separately unauthorized.

Existing infrastructure remains sufficient for code work. Existing production-role
access to evaluation profiles is still unverified, not assumed or broadened. Paid
calls and activation remain out of scope. No new host, database, project or credential
is requested by this progress document.
