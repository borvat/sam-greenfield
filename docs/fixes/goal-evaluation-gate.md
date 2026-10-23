# Disabled goal evaluation composition

`withGoalEvaluation` reuses `openEvaluationTrial().gateway`, its existing row-locked
trial counters, per-agent counters, hash-chained events, permit/adapter admission,
and immutable deadlines. It creates no second accounting ledger or database schema.
No production entrypoint calls it. LIVE_EVALUATION_ENABLED remains false.

The immutable trial spec enrolls exactly three goal UUIDs as `goal.<uuid>` agent
keys. Each has at most eight model attempts; the trial has at most 24. The bootstrap
slot has zero model allowance. Scope checks require the goals to descend from the
trial root in the same enrolled synthetic company. Reopening reconstructs the same
slots from the immutable spec, not caller-selected replacement goal IDs. The factory
binds the expected commit and tool/extraction-contract hash before composition.
Planning and objective review use the same goal-scoped gateway. Planner test overrides
cannot supersede that composition; review callback overrides and nested model budget
callbacks are rejected. Model-selected operations and ordinary contracts are unchanged.

Every provider fallback is reserved before invocation. Success, error, timeout and
uncertain process death retain their full reservation; no refund is inferred from
missing usage. Existing transactional counters serialize concurrent admission, and
existing events retain RESERVED/INVOKING/FINISHED states. A real SIGKILL/fresh-process
test verifies that an uncertain attempt cannot be replayed by reopening. Raw model
input/event capture remains confined to the existing synthetic evaluation profile.

## Configuration and release boundary

Token, cost and time bounds come from the existing validated TrialSpec, not a new
environment variable. Existing ceilings are stricter than the earlier decision
proposal: global cost <= US$1, input <=24,000 tokens/call, output <=8,000 tokens/call,
call duration <=20 seconds and trial elapsed <=300 seconds. They are NOT increased.
A possible fixture configuration is 3 goals, 8 attempts each/24 total, 24,000 input
and 4,096 output per attempt, 674,304 reserved tokens total and US$1 total. This is
only a test configuration, not authorization to spend. Actual provider prices and
framing must pass the existing reviewed permit/adapter checks before any live use.

The factory now accepts only authentic mode-matched evaluation permits. Live permits remain impossible while the release interlock is false. The existing trial spec also pins
an enrolled synthetic case/corpus; this work does not loosen that registry into an
arbitrary production-data evaluation. Test goal labels do not supply tool plans.
No synthetic outcome is evidence of model autonomy.

An operator would need a separately reviewed release enabling a bounded live path,
signed owner scope/price/endpoint approval, exact commit/contracts, and the existing
trial/profile provisioning on an approved synthetic tenant. The existing evaluation
profile is distinct from ordinary integration-role access. If it is absent, do not
assume the production role can use this ledger or silently provision grants. Such
persistent access is a separate authorization boundary, not a change made here.
Capability/verification-contract registration and availability bindings likewise
remain unperformed. Keep existing infrastructure, provider/model and credentials.

Before that boundary, offline checks require exact-head full acceptance, same-slot
budget exhaustion, cross-goal isolation, token/dollar denial before transport,
fallback charging, unchanged prior concurrency tests, process-death recovery, and
both planning/review hook tests. The current factory is executable in these isolated
fixtures, not an activated production feature.

## Default Google MCP contracts inspected

samGoogleMcpBridge.McpTool declares inputSchema, not an output record schema.
samGoogleBundle preserves checked.result from googleReadEvidence. Search/content
responses carry MCP text; test fixtures demonstrate opaque structuredContent.result
strings and cursor normalization, not a stable file/message record array. No parser
for IDs, dates, promises, prices, delivery or complete pagination is invented.

One exact locally produced structure is supported: googleReadEvidence attaches
samArtifacts on get_drive_file_download_url/get_gmail_message_content. The bounded
artifact reader computes SHA-256 over the full downloaded bytes, byte count and MIME
type. Two versioned contracts expose ONLY these fields. Content text can be truncated
and is not mapped. Hash equality is byte equality of exported attachments, not proof
of original-document identity, semantic duplication, collection coverage or business
facts. Missing artifacts reject extraction. Existing source/tenant/verification
checks still apply. This is a partial generic duplicate-byte primitive, not a
hard-coded duplicate-document workflow or completion claim.
