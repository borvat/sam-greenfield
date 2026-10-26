# Tool evaluation #81 — isolated acceptance gate

Status: experimental only. No production integration is authorized by this document.

## Existing implementation
- Qwen provider adapter already exists in `packages/model-providers/src/env.ts`; reuse it, do not duplicate it.
- Preserve concurrent SAM-Hermes integration branches.

## Acceptance matrix
| Candidate | Test | Pass condition | Stop condition |
|---|---|---|---|
| Zvec-Grep | Synthetic repository with exact identifiers, paraphrases and misleading matches | Higher retrieval recall at acceptable p95 latency and memory vs current search | Unverified license, data egress, regression |
| TestSprite | Synthetic test app with known seeded UI and API faults | Independently reproducible findings, useful failure evidence, acceptable cost | Requires production secrets or unapproved paid plan |
| AMD Token Factory | Official endpoint and account quota inspection, then synthetic prompt | Confirmed free available quota, actual model IDs, response and rate limits | Payment required, unconfirmed quota or production-only dependency |
| Qwen | Existing provider gateway, synthetic coding/long-context tasks | Valid model/endpoint, measurable task accuracy, latency, token and cache cost | Missing credentials, unknown pricing, lower accuracy |

## Mandatory safeguards
1. No secrets in Git, issue comments, logs, prompts or screenshots.
2. Never deploy to production, merge to main, or enable live payments.
3. Never create a billable resource without separate approval.
4. Use synthetic datasets only. Log task IDs, expected outcomes, observed outcomes, p50/p95 latency, tokens, costs, and independent verification.
5. Record each candidate as PASS, FAIL or BLOCKED, with evidence links. Do not equate configuration with successful live operation.
6. Any integration must be separately reviewed in a draft PR.

## Execution sequence
1. Confirm upstream identity, license, API documentation, account quota and model availability.
2. Build isolated fixtures and a baseline measurement.
3. Execute each evaluation with safe credentials only when already authorized.
4. Compare results and recommend adoption or rejection with evidence.
