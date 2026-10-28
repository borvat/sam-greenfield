# SAM engineering project state

Goal: executive goal intake → bounded plan/execution → independent verification → persisted result or actionable blocker. Operational Phase5 memory remains the existing PostgreSQL implementation. Engineering memory adds no business authority.

Modules: runtime, MCP dispatcher, Tool Gateway, verifier, provider budget/reservations, PostgreSQL migration and scoped-memory source. Refer to existing docs and pinned recovery evidence rather than historic conversation claims.

<!-- project-memory-state-v1 -->
```json
{
  "event": {
    "blockers": [
      "Actual isolated UI authentication rejected; correct secret input must come through secure owner authentication, never chat or model inspection."
    ],
    "deployment": {
      "evidence": [
        "docs/engineering/isolated-ui-live-attempt-20261028.json"
      ],
      "identity": "sam-isolated-test57f8ff82 / dep-dbgo8d7b9u1s738rstfg LIVE05:13:23Z; SUSPENDED05:17:43Z",
      "status": "observed"
    },
    "evidence": [
      "docs/engineering/isolated-ui-live-attempt-20261028.json"
    ],
    "id": "sam-isolated-ui-live-auth-blocked-20261028",
    "next_steps": [
      "Prepare existing SAM_TEST_BEARER_TOKEN of sam-isolated-test through secure browser auth; do not substitute database password or production token.",
      "Recheck current existing-role expiry and remaining authorized window before another bounded activation; do not extend/restart automatically. Complete actual synthetic browser save/recall/exclusion/replay and exact test notification acknowledgement only after successful auth."
    ],
    "recorded_at": "2026-10-28T05:20:24Z",
    "schema_version": 1,
    "source": {
      "content_sha256": "aaabed9d8bc8fcaa1c2a81a1ade298dd91c621a0e4ce5db0c95facb1ceed502c",
      "head": "57f8ff82c03b95b361d613409422c9746750c6bf"
    },
    "status": "blocked",
    "summary": "Existing isolated service deployed reviewed source57f8ff82 and actual browser readiness passed. Secure browser authentication submitted but correlated bearer_rejected; mismatch cause unknown. No fixture/ack/business writes/models. Root re-suspended within5min23s including build; independently confirmed same plan. Production untouched.",
    "tests": [
      {
        "evidence": [
          "docs/engineering/isolated-ui-live-attempt-20261028.json"
        ],
        "name": "Actual browser GET /readyz: revision57f8ff82 readytrue services200 optintrue models0",
        "scope": "historical",
        "source": {
          "content_sha256": "9069846043e488fe0382f814238f93b2a2886853dcf96ed17a1d15b642515175",
          "head": "57f8ff82c03b95b361d613409422c9746750c6bf"
        },
        "status": "pass"
      },
      {
        "evidence": [
          "docs/engineering/isolated-ui-live-attempt-20261028.json"
        ],
        "name": "Actual isolated browser memory and notification mutation acceptance",
        "scope": "historical",
        "source": {
          "content_sha256": "9069846043e488fe0382f814238f93b2a2886853dcf96ed17a1d15b642515175",
          "head": "57f8ff82c03b95b361d613409422c9746750c6bf"
        },
        "status": "blocked"
      }
    ]
  },
  "event_digest": "0478608389d415bf5aa45a1d3dafc54d335d962c1ee11806b31a6f15fcda2c4a",
  "schema_version": 1
}
```
<!-- /project-memory-state -->
