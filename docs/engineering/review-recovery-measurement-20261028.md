# Saved-evidence review input reproduction — 2026-10-28

Coordinator: root. Independent review and verification use separate agents. Work begins at PR86 `f3539d7b1f154758449f32ba7f9c93fb43579077`. Live Runtime observed `62ccbdbb94e080f22425f64396c894270ee551aa`; CC/MCP `1e4e21a773c88e2366915edd3bb2e307fddaa157`.

## Exact original reproduction

Run inside the existing authenticated Runtime Shell under the existing application principal. No external database connection or ACL change. Read-only transaction asserts fixed tenant binding, captures the one requested goal, its saved execution/latest verification and original plan assumptions. Bundle construction loads configured tool definitions; it does not call source tools or model adapters. Do not import productionCompositionModule (it synchronizes registries).

A private copy of original readGoalReview runs against an in-memory query adapter. The clone represents the instant before the original review: VERIFYING, no report/budget yet. The live goal remains WAITING_EXTERNAL and its historical audits/reports remain untouched. SQL writes and advisory calls in this clone are simulated; no clone mutation reaches PostgreSQL. Instrument only the exact `assertReviewInputBudget(input)` call boundary. Serialize through the original `taskPrompt` function. Capture full input privately with mode0600; disclose only counts here. No provider adapter invocation is permitted. Early harness failures were fake-query/measurement-adapter errors, not additional SAM attempts.

Observed final request **50,637 UTF-8 bytes**, exceeding48,000 by2,637. It contains49,869 UTF-16 code units and49,869 Unicode code points for this particular input; these are not interchangeable in general. Token count was not measured and is not inferred from bytes.

| Component (serialized value only) | UTF-8 bytes | UTF-16 code units |
|---|---:|---:|
| Objective/task instruction |1787|1041|
| Verified observations with source envelope, provenance and citable-line indexes |1539|1539|
| All61 permitted GREEN read descriptors |43583|43561|
| Review contract/schema/rules |3376|3376|
| Failed-read history |2|2|
| Previous decisions |2|2|
| Evidence limitations |2|2|
| Round |1|1|
| Max rounds |1|1|
| JSON field names, separators and taskPrompt wrapper |344|344|
| **Final request** |**50637**|**49869**|

Undefined validationFeedback is absent from JSON and contributes zero bytes. Component values plus wrapper/keys sum exactly to final bytes. The source was small and there was no long history in this incident. Thus full catalog inflation, not source content or account credit, caused the reproduced input rejection.

No real database writes, bol reads or model calls were made. Native ledger counters immediately before/after bundle construction were model_calls30, stored cost0.75 and READ_REVIEW_BUDGET rows11, unchanged. These are observed aggregate ledger values, not a claim that the original financial cost field is comprehensive.

## Pure projection experiment

On that same private captured input, removing descriptor descriptions and documentation annotations at JSON Schema positions reduced catalog43,583→21,538bytes and total50,637→28,592bytes, retaining all61 IDs and validation constraints. This is a controlled projection experiment, **not the final patched request count**. The implementation retains descriptor descriptions to preserve semantic tool selection and removes only schema documentation; final full-patch measurement must be separately observed. Property names, enum/const values, required/default/type/range/pattern/format/composition constraints and authority/company metadata are retained. Full trusted definitions remain server-side and validate continuation parameters.

## Corrected recovery request reconstruction

Using the real saved input and same taskPrompt, retain all61 full descriptor descriptions, remove only schema documentation annotations, add the exact new contextCoverage fields with the real saved-report history hash and historical validationFeedback. The reconstructed recovery request is **39,621 UTF-8 bytes**, down11,016 from50,637; corrected catalog is31,943bytes. All61 IDs remain, source observations unchanged. This reproduces the corrected payload shape without model/source calls; actual deployed dispatch byte count remains a separate pending check. No historical preflight was added to SAM.

## Root cause beyond size

The old runtime wrote an attempt reservation before exact input fit check. Its terminal blocked report recorded attempts1/callsUsed0/retryablefalse. Owner continuation rejected any same-plan terminal report, while UNIQUE(goal_id,plan_id) prevented appending a final immutable report. Waiting notification described follow-up but requiredActionNONE. These are distinct lifecycle/notification defects that must be repaired together with input construction.

## Remaining release evidence

Actual corrected input count, complete final test/review evidence, migration/deploy revision, original-goal recovery and fresh single-goal acceptance are pending. This document alone does not establish delivery.

## Deterministic closure decision

No deterministic business-completion path is introduced. The existing contract accepts unrestricted natural-language objectives, including identity checks, conditional limits, comparison and judgments. It has no trusted enumerated field-extraction request contract from which a general eligibility test could prove every requested deliverable. Adding a bol/oven-specific heuristic would hide scope errors. Removing avoidable context inflation makes the existing model-review plus critique path fit while preserving independent source verification. A future explicitly structured extraction contract would need separate eligibility and coverage design.
