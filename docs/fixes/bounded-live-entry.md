# Disabled bounded live entry and source discovery

This development follows immutable PR55 checkpoint
f9c74cc7d76c5b0888259a09343ca064ddc4a68f and its published evidence
8a083bc89db8ef560d37fe37f941cf12d54db004. The checkpoint branch is unchanged.

## Implemented code

boundedEvaluationCompositionModule is an optional entry for the existing runtime
service. It rejects this release before environment/file/DB imports because
LIVE_EVALUATION_ENABLED remains false. No Render setting selects the new entry.
After a future separately reviewed activation, it requires matching deployed commit,
a provisioned trial and existing signed owner approval before preparing composition.
The permit-aware factory no longer has a redundant fixture-only rejection: it accepts
only authentic, mode-matched permits, whose live issuance remains release-disabled.

prepareBoundedEvaluationComposition reads the existing provider registry and
verification contracts; it never inserts or updates them. The same bootstrap is
exercised by the integrated fixture trial, ordinary planning and review tests. It
requires registered adapters, fixed source/contract hashes and live trial admission.
The source bundle is built exclusively from the checked-in frozen corpus, without
expected answers or supplied goal plans. Ordinary live business sources are refused.

The live adapter binding reuses the existing compatible provider's model, endpoint,
configured prices and lazy API-key lookup. It currently supports the existing
DeepSeek/Qwen compatible transports only, not a model swap or generic new endpoint.
Exactly one signed existing provider/model is admitted in this entry. Registry,
signed prices and nonsecret environment metadata must agree. Credential lookup
occurs only inside the existing bounded live adapter after permit/interlock checks.
No credential is inspected or created during preparation/tests. Positive live
transport is not exercised; fixture transport and negative live admission are tested.

## Existing-service configuration after separate authorization

Use the existing runtime service/repository/database and its runtime start command.
A reviewed release would enable the existing compile-time interlock, then select:

- SAM_COMPOSITION_MODULE=apps/runtime/src/boundedEvaluationCompositionModule.ts
- SAM_EVALUATION_TRIAL_ID: the already provisioned signed trial UUID
- SAM_EVALUATION_COMMIT: exact reviewed application SHA, equal to RENDER_GIT_COMMIT
- SAM_EVALUATION_APPROVAL_PATH: bounded JSON file with payload and signature
- SAM_EVALUATION_OWNER_PUBLIC_KEY_PATH: independently trusted owner public-key file
- Existing SAM_WORKER_ID and existing DB/provider settings; no model/endpoint change

The approval and public-key files are authorization material, not newly minted
credentials. The child neither creates a production signing key nor supplies owner
approval. The signed payload shape and fixed profile requirements are documented in
evaluation-release-boundary.md. Existing deadline, token and dollar ceilings remain.

A model-enabled run against frozen synthetic records is the bounded next evaluation,
not authorization to read customer Google/Bol data. The default frozen source bundle
supports read evidence/review; additional reviewed extraction contracts can be passed
through the tested internal bootstrap and remain subject to its capability hash.
No financial objective completion or general-agent autonomy is claimed from fixtures.

## Genuine access boundary

The ordinary checked-in runtime/integration profiles do not grant evaluation access.
The existing evaluator additionally demands specialist receipts/fences and evaluation
receipts/fences, and refuses to enroll a company with operational goals or knowledge.
Therefore the active operational tenant cannot simply be relabeled synthetic.
An already-provisioned scoped synthetic principal could be reused if one exists;
its existence and current deployed grants are not established by this offline work.
If absent, a scoped principal/profile must be separately approved. Do not broaden
or rebind the serving production role silently. No new hosting/database service is
needed; whether another DB credential is necessary depends on existing principals.
No such inspection, provisioning or permission change was performed here.

## Source-schema discovery

The normal catalog now exposes a partial structural schema for bol_get_order,
including optional unitPrice, totalPrice, commission, discounts.amount and legacy
offerPrice from the checked-in OrderItem type and structured wrapper. All monetary
units/precision/VAT remain UNKNOWN. No precedence normalization, calculation,
extraction contract or completion permission follows from these hints. Model-visible
metadata lets an agent discover a potentially useful existing read without inventing
its semantics. Existing quantity extraction still excludes these financial fields.

Google MCP outputs remain explicit UNKNOWN except for separately reviewed local
artifact metadata. No text-to-document parser or task-specific workflow was invented.

## Reviewed wire limits (2026-10-23)

The prior da0285f acceptance is superseded for readiness by review findings:
provider output-limit fields and goal-composition tool/decision accounting required
correction. No live requests occurred. Exact endpoint/model profiles now fail closed
before credentials. DeepSeek Flash/V4 Pro use max_tokens; selected exact Qwen
3.7/3.8 Max/Plus/Flash names use max_completion_tokens. Unknown aliases, snapshots,
providers and endpoints require review, never automatic model substitution.
The Qwen request cap is the reserved output allowance minus 10; allowances <=10
are rejected. Its documented tolerance therefore fits inside the existing reservation
and price ceiling, including reasoning. No signed budget increases. Provider behavior
is not proven by no-network body tests. Sources:

- [DeepSeek Chat Completions](https://api-docs.deepseek.com/api/create-chat-completion/)
- [Qwen request parameters and tolerance](https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-openai-chat-completions)
- [Qwen JSON output support](https://www.alibabacloud.com/help/en/model-studio/qwen-structured-output)

Goal planning/review decisions now consume an iteration before gateway admission.
Each source dispatch and independent readback consumes a separate durable tool
reservation, invocation and result. Crashes retain consumption. Fixture test limits
include both reads and readbacks; these values authorize no live spending.

## Same-service pause and restore (operator-only)

Selecting SAM_COMPOSITION_MODULE replaces ordinary composition on the existing
runtime service. It is not a parallel evaluation worker. Before an authorized run,
record the current release/configuration, pause ordinary scheduling and allow active
work to drain using the existing shutdown/lease recovery procedure. Verify no ordinary
worker still claims work. Only then select the reviewed evaluation module and scoped
synthetic principal with its signed trial; do not silently reuse the serving tenant.
Ordinary goal processing remains paused during evaluation. Stop the evaluation after
its bounded run or any failure, preserve its ledger, and restore the original reviewed
release and original SAM_COMPOSITION_MODULE/configuration before resuming ordinary
processing. Reconcile existing leases through supported recovery, without budget
resets or replaying old blocked goals. No pause, switch, restart or restore was executed
by this coding task. Scoped principal availability remains unverified; blocked access
must not be bypassed to establish it.

## Shared composition selection (disabled follow-up)

For the signed `shared-records-v1` corpus, the same optional entry now selects
`frozenSharedGoalEvaluationBundle` and the shared ordinary-planner/specialist/read/
derive/review builder. Other existing cases retain their original bounded builder.
Selection comes from the immutable trial case, not business keywords or a goal plan.
The factory moved out of tests; test fixtures import that same factory. Reviewed
provider binding preserves the trusted bundle identity and checks the exact frozen
three-capability manifest and existing independent verification contracts before
composition. No database registration is performed by bootstrap.

The shared case requires existing verification rows for `records.search`
(`readback:boolean`), `derive_verified_evidence` (`replayed:boolean`) and
`reason.records` (`grounded:boolean`), all independent `db_query` contracts. It also
requires the explicit shared coordinator compatibility profile and existing scoped
integration/specialist/evaluation access. These are preconditions, not automatically
applied permissions or production changes. Live specialist mode would additionally
require `SAM_SPECIALIST_INTELLIGENCE=evaluation`; fixture tests use `synthetic`.
`LIVE_EVALUATION_ENABLED` remains false. Ordinary production composition and Render
configuration remain unchanged, and the same-service pause/restore requirements
above still apply.

The positive isolated shared test uses `prepareBoundedEvaluationComposition` and
`startRuntimeService`, including readiness/recovery, tick scheduling and stop/drain.
SIGKILL/restart and signed capture are retained. This is model-stub validation of the
service path over invented records, not proof of live reasoning or business schemas.
