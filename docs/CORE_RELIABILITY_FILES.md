# Changed files and reasons

| File | Reason |
|---|---|
| `.github/workflows/phase0-postgres-verification.yml` | Add isolated Node/PostgreSQL reliability and regression CI. |
| `Dockerfile` | Frozen install with ephemeral CA; explicit copy ownership preserves non-root access for restrictive checkout modes. |
| `apps/agents/src/capabilityCatalog.ts` | Share standard capability schemas and enforce verified dependency claims. |
| `apps/agents/src/executiveFlow.ts` | Share standard capability schemas and enforce verified dependency claims. |
| `apps/agents/src/runtime.ts` | Share standard capability schemas and enforce verified dependency claims. |
| `apps/agents/src/standardContracts.ts` | Share standard capability schemas and enforce verified dependency claims. |
| `apps/brain/src/authorityGuard.ts` | Bound/cancel proposals, validate plans, preserve replan context and protect learning. |
| `apps/brain/src/contextAssembler.ts` | Bound/cancel proposals, validate plans, preserve replan context and protect learning. |
| `apps/brain/src/executiveBrain.ts` | Bound/cancel proposals, validate plans, preserve replan context and protect learning. |
| `apps/brain/src/learning.ts` | Bound/cancel proposals, validate plans, preserve replan context and protect learning. |
| `apps/brain/src/memory.ts` | Bound/cancel proposals, validate plans, preserve replan context and protect learning. |
| `apps/brain/src/planner.ts` | Bound/cancel proposals, validate plans, preserve replan context and protect learning. |
| `apps/brain/src/replanContext.ts` | Bound/cancel proposals, validate plans, preserve replan context and protect learning. |
| `apps/brain/src/replanner.ts` | Bound/cancel proposals, validate plans, preserve replan context and protect learning. |
| `apps/chatgpt-tools/src/actionTools.ts` | Add explicit acceptance criteria to the existing MCP action interface. |
| `apps/chatgpt-tools/src/types.ts` | Add explicit acceptance criteria to the existing MCP action interface. |
| `apps/command-center/src/store.ts` | Require explicit production owner acceptance criteria. |
| `apps/kernel/src/dependencies.ts` | Persist/enforce dependencies, evidence, goal criteria, recovery and lease boundaries. |
| `apps/kernel/src/execution.ts` | Persist/enforce dependencies, evidence, goal criteria, recovery and lease boundaries. |
| `apps/kernel/src/goalAcceptance.ts` | Persist/enforce dependencies, evidence, goal criteria, recovery and lease boundaries. |
| `apps/kernel/src/leaseBudget.ts` | Persist/enforce dependencies, evidence, goal criteria, recovery and lease boundaries. |
| `apps/kernel/src/planning.ts` | Persist/enforce dependencies, evidence, goal criteria, recovery and lease boundaries. |
| `apps/kernel/src/queue.ts` | Persist/enforce dependencies, evidence, goal criteria, recovery and lease boundaries. |
| `apps/kernel/src/sideEffects.ts` | Persist/enforce dependencies, evidence, goal criteria, recovery and lease boundaries. |
| `apps/kernel/src/stateMachine.ts` | Persist/enforce dependencies, evidence, goal criteria, recovery and lease boundaries. |
| `apps/kernel/src/verification.ts` | Persist/enforce dependencies, evidence, goal criteria, recovery and lease boundaries. |
| `apps/kernel/src/verificationEvidence.ts` | Persist/enforce dependencies, evidence, goal criteria, recovery and lease boundaries. |
| `apps/kernel/src/workerRuntime.ts` | Persist/enforce dependencies, evidence, goal criteria, recovery and lease boundaries. |
| `apps/production/src/bolBundle.ts` | Isolate runtime stages; compare fresh content; require provisioned metadata and acceptance. |
| `apps/production/src/composition.ts` | Isolate runtime stages; compare fresh content; require provisioned metadata and acceptance. |
| `apps/production/src/contentVerification.ts` | Isolate runtime stages; compare fresh content; require provisioned metadata and acceptance. |
| `apps/production/src/dispatcher.ts` | Isolate runtime stages; compare fresh content; require provisioned metadata and acceptance. |
| `apps/production/src/driveVerifiers.ts` | Isolate runtime stages; compare fresh content; require provisioned metadata and acceptance. |
| `apps/production/src/eboekhoudenBundle.ts` | Isolate runtime stages; compare fresh content; require provisioned metadata and acceptance. |
| `apps/production/src/financeReconciliationBundle.ts` | Isolate runtime stages; compare fresh content; require provisioned metadata and acceptance. |
| `apps/production/src/gmailVerifier.ts` | Isolate runtime stages; compare fresh content; require provisioned metadata and acceptance. |
| `apps/production/src/learning.ts` | Keep current-plan learning and reviewed schema preparation consistent with the new reliability boundary. |
| `apps/production/src/modelRegistry.ts` | Isolate runtime stages; compare fresh content; require provisioned metadata and acceptance. |
| `apps/production/src/planner.ts` | Isolate runtime stages; compare fresh content; require provisioned metadata and acceptance. |
| `apps/production/src/types.ts` | Isolate runtime stages; compare fresh content; require provisioned metadata and acceptance. |
| `apps/production/src/verificationContracts.ts` | Isolate runtime stages; compare fresh content; require provisioned metadata and acceptance. |
| `apps/production/src/verifier.ts` | Isolate runtime stages; compare fresh content; require provisioned metadata and acceptance. |
| `apps/runtime/src/productionCompositionModule.ts` | Apply restricted-role and tenant admission to standard production composition. |
| `apps/tools/src/executorFactory.ts` | Validate parameters, enforce authority/leases and reconcile uncertain effects safely. |
| `apps/tools/src/reconciler.ts` | Validate parameters, enforce authority/leases and reconcile uncertain effects safely. |
| `deploy/production/docker-compose.live.yml` | Separate application and migration database connection requirements. |
| `docs/CORE_RELIABILITY.md` | Record design, tests, changed-file rationale, rollout, rollback and limitations. |
| `docs/CORE_RELIABILITY_EVIDENCE.json` | Record design, tests, changed-file rationale, rollout, rollback and limitations. |
| `docs/CORE_RELIABILITY_FILES.md` | Record design, tests, changed-file rationale, rollout, rollback and limitations. |
| `package.json` | Use frozen dependency installation and reproducible build/test commands. |
| `packages/bol/src/client.ts` | Bound connector requests, withhold upstream error bodies and support content readback. |
| `packages/db/migrations/00012_core_reliability.sql` | Add reliability metadata, tenant policies and tenant-safe business-ID allocation. |
| `packages/db/migrations/00013_operational_tenant_policies.sql` | Add reliability metadata, tenant policies and tenant-safe business-ID allocation. |
| `packages/db/src/approvals.ts` | Bound database operations and provision fixed restricted runtime principals. |
| `packages/db/src/client.ts` | Bound database operations and provision fixed restricted runtime principals. |
| `packages/db/src/runtimeAccess.ts` | Bound database operations and provision fixed restricted runtime principals. |
| `packages/eboekhouden/src/client.ts` | Bound connector requests, withhold upstream error bodies and support content readback. |
| `packages/gmail/src/client.ts` | Bound connector requests, withhold upstream error bodies and support content readback. |
| `packages/google-auth/src/refreshToken.ts` | Bound connector requests, withhold upstream error bodies and support content readback. |
| `packages/google-drive/src/client.ts` | Bound connector requests, withhold upstream error bodies and support content readback. |
| `packages/model-gateway/src/gateway.ts` | Propagate cancellation through the existing gateway/provider transports. |
| `packages/model-gateway/src/types.ts` | Propagate cancellation through the existing gateway/provider transports. |
| `packages/model-providers/src/anthropic.ts` | Propagate cancellation through the existing gateway/provider transports. |
| `packages/model-providers/src/common.ts` | Propagate cancellation through the existing gateway/provider transports. |
| `packages/model-providers/src/google.ts` | Propagate cancellation through the existing gateway/provider transports. |
| `packages/model-providers/src/openai.ts` | Propagate cancellation through the existing gateway/provider transports. |
| `packages/model-providers/src/openaiCompatible.ts` | Propagate cancellation through the existing gateway/provider transports. |
| `packages/tool-gateway/src/validation.ts` | Validate bounded parameter contracts before execution. |
| `scripts/development/managed-schema-source.cjs` | Review the additive migration set for guarded managed schema preparation. |
| `scripts/testing/core-reliability.cjs` | Provide local-only disposable-schema runner with sanitized child environments. |
| `tests/core/crashChild.ts` | Exercise reliability, process-crash recovery, restricted identities and negative cases. |
| `tests/core/reliability.ts` | Exercise reliability, process-crash recovery, restricted identities and negative cases. |
| `tests/core/restrictedChild.ts` | Exercise reliability, process-crash recovery, restricted identities and negative cases. |
| `tests/phase0/phase0_acceptance.py` | Update fixtures/contracts for stricter verification, tenant scope and additive migrations. |
| `tests/phase0_postgres/test_rls_fail_closed_security.py` | Update fixtures/contracts for stricter verification, tenant scope and additive migrations. |
| `tests/phase1/full_vertical_slice.ts` | Update fixtures/contracts for stricter verification, tenant scope and additive migrations. |
| `tests/phase1/replan_recovery.ts` | Update fixtures/contracts for stricter verification, tenant scope and additive migrations. |
| `tests/phase12/gmail_adapter.ts` | Update fixtures/contracts for stricter verification, tenant scope and additive migrations. |
| `tests/phase13/drive_adapters.ts` | Update fixtures/contracts for stricter verification, tenant scope and additive migrations. |
| `tests/phase14/eboekhouden_read.ts` | Update fixtures/contracts for stricter verification, tenant scope and additive migrations. |
| `tests/phase15/bol_read.ts` | Update fixtures/contracts for stricter verification, tenant scope and additive migrations. |
| `tests/phase16/bol_operational_intelligence.ts` | Update fixtures/contracts for stricter verification, tenant scope and additive migrations. |
| `tests/phase17/finance_reconciliation.ts` | Update fixtures/contracts for stricter verification, tenant scope and additive migrations. |
| `tests/phase21/production_deployment.ts` | Update fixtures/contracts for stricter verification, tenant scope and additive migrations. |
| `tests/phase4/reconciliation.ts` | Update fixtures/contracts for stricter verification, tenant scope and additive migrations. |
| `tests/phase4/tool_gateway.ts` | Update fixtures/contracts for stricter verification, tenant scope and additive migrations. |
| `tests/phase5/final_acceptance.ts` | Update fixtures/contracts for stricter verification, tenant scope and additive migrations. |
| `tests/phase5/verified_learning.ts` | Update fixtures/contracts for stricter verification, tenant scope and additive migrations. |
| `tests/release/managed_schema_source.cjs` | Update fixtures/contracts for stricter verification, tenant scope and additive migrations. |
| `docs/CORE_RELIABILITY_PR.md` | Preserve the reviewable draft description because both GitHub API creation routes were Forbidden. |
| `scripts/development/build-image.cjs` | Repeatable clean build through the configured proxy with verified trust and build failure propagation. |
| `docs/CORE_RELIABILITY_ACCEPTANCE.md` | Commands, actual acceptance results, remaining blockers and manual Draft PR instructions. |
| `docs/acceptance/2026-10-21/*` | Captured local acceptance outputs and the executed disposable migration upgrade fixture. |
