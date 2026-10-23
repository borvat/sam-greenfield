# Concrete runtime wiring and operator boundary

## Implemented, inactive code

The existing productionCompositionModule now calls evidenceReleaseContracts and
syncVerificationContracts before model registry setup. Ordinary bundles return no
additional contract. A bundle containing derive_verified_evidence must have reviewed
source contracts, the exact operation schema, GREEN/read-only definitions and a
replay verifier. In production, syncVerificationContracts only checks an already
provisioned verification row; it never creates one or grants access. No capability
is added to the default bundle and no environment setting is changed.

createGoalEvaluationComposition is the executable isolated runtime factory. It uses
the ordinary production composition, rotates exactly three enrolled child goal IDs,
and scopes planning, worker selection, verification and review to those children.
The NEW trial root is a coordinator, never an ordinary planning target. Tests run
actual trial admission, ordinary planning, frozen source execution, verification and
report completion together, with the root's planning_attempts remaining zero.
Only identity-registered frozenEvaluationSources readers/verifiers and locally
registered deterministic derived adapters are admitted. A corpus hash alone cannot
turn an ordinary Google/Bol adapter into a frozen source. No network transports are
activated by this factory.

An opt-in AsyncLocalStorage commit admission applies to the existing transaction
helper during these ticks. The reviewer's explicit transactions call the same
admission immediately before COMMIT. It checks scoped trial liveness and holds the
trial row lock through commit, serializing cancellation. Frozen source adapters are
admitted immediately before execution under the same trial lock. This scope does
not alter ordinary transactions outside the isolated factory. No SQL policy, grant,
trigger or migration is changed. Cancellation/agent expiry after model acceptance
and SQL insertion is tested to roll back child plans/reports; dispatch denial is
tested before the source callback. These are guarded barrier tests, not a claim of
an independently executed unsafe old-head concurrency reproduction.

## Artifact provenance correction

samArtifacts is reserved for runtime-computed downloads. googleReadEvidence removes
upstream values before normalization and only fills it from actual artifact reads.
Extraction also compares every hash/byte-count/MIME tuple to the execution's
artifacts evidence. Thus older result-only injected artifacts cannot borrow a
VERIFIED label. Both mapped Google capabilities have negative regressions. The
original reviewer reproduction was an in-memory upstream-injection case; no live
provider test was required or performed.

## Required operator actions, not performed

1. Independently review the final code and exact-head acceptance. No merge/deploy
   is authorized in this child. Do not select the isolated factory for ordinary
   production goals or reinterpret real customer data as synthetic fixtures.
2. For derived capability activation, explicitly select reviewed contracts for
   already-authorized sources, compose withVerifiedEvidence, provision its
   verification_contracts row using the existing operator mechanism and review any
   necessary capability availability/scope binding. Runtime startup now verifies it.
3. A live evaluation remains genuinely blocked by LIVE_EVALUATION_ENABLED=false,
   the permit requirement and registered-evaluation-adapter
   checks. Ordinary provider adapters cannot be substituted. Enabling a live path
   requires an explicit reviewed release and separately signed owner approval;
   this patch does not flip those guards or mint signing credentials.
4. The checked-in ordinary runtime and integration profiles grant NO evaluation
   table access. This is a source conclusion, not a read of deployed grants.
   assertEvaluationAccess also requires specialist profile receipts and fixed RLS
   fences. Actual deployed access remains unverified; no secret/production query.
5. If authorized for an unused synthetic company in the existing database, an
   operator must apply the existing specialist/evaluation profiles if absent,
   enroll that company (existing operational data makes enrollment fail), create
   the trial/root/three children and provision narrowly tenant-bound role access.
   These are persistent permission changes and need separate approval. No new
   host, database service, workspace or credential is inherently required.

The existing evaluation provisioner requires SELECT on sam_evaluation_migrations,
evaluation_companies, evaluation_trials and evaluation_events; INSERT only on
evaluation_events; UPDATE only used, agent_used, agent_deadlines and cancelled on
evaluation_trials, plus fixed tenant RLS fences. It grants no runtime trial creation,
spec/deadline rewriting, deletion or enrollment. Existing specialist admission also
requires SELECT on its migration receipts; SELECT/INSERT on specialist_budgets,
specialist_sessions, specialist_delegations and specialist_learning; limited UPDATE
on budget used/cancelled and session state/used/updated_at, plus fixed tenant fences.
Those are the current admission requirements, not a proposal to silently add them.
Reducing that dependency would be a separately reviewed security design change.

## Exact signed scope

The existing authorizeLiveEvaluation/openEvaluationTrial path requires an Ed25519
signature over stable canonical JSON, verified against a separately trusted owner
public key. Expected payload fields are kind=SAM_LIVE_EVALUATION_APPROVAL, trialId,
rootGoalId, companyId, specHash, commit, corpusHash, endpoint, prices and expiresAt.
The spec hash binds the three enrolled IDs, per-goal/shared call/token/cost/time
limits and capability hash. Prices bind provider/model and input/output rates;
endpoint is HTTPS with no embedded credentials/query/fragment. Expiry matches the
trial deadline. Matching signature alone cannot bypass the release-disabled flag.
No production signing key, owner approval signature, live permit or billable invocation was created here. Existing tests use fixture signing material and permits only.

Synthetic fixture completion is evidence of runtime composition and safety only.
Opaque Google search schemas, monetary/VAT meanings, population coverage and live
model autonomy remain unresolved. Attachment byte identity is not document meaning.

The follow-up branch adds an inactive boundedEvaluationCompositionModule, read-only
bootstrap and binding to the existing compatible provider/model configuration.
See bounded-live-entry.md for exact configuration and remaining operator boundaries.
