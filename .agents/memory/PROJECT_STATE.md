# SAM engineering project state

Goal: executive goal intake → bounded plan/execution → independent verification → persisted result or actionable blocker. Operational Phase5 memory remains the existing PostgreSQL implementation. Engineering memory adds no business authority.

Modules: runtime, MCP dispatcher, Tool Gateway, verifier, provider budget/reservations, PostgreSQL migration and scoped-memory source. Refer to existing docs and pinned recovery evidence rather than historic conversation claims.

<!-- project-memory-state-v1 -->
```json
{
  "event": {
    "blockers": [
      "Existing test login expired; app role cannot renew; existing operator credential must be entered through hidden Render terminal, not chat."
    ],
    "deployment": {
      "status": "unverified"
    },
    "evidence": [
      "docs/engineering/isolated-ui-acceptance-20261028.md",
      "docs/engineering/chatgpt-discovery-acceptance-20261028.json",
      "docs/engineering/isolated-ui-independent-verification-final-20261028.json",
      "docs/engineering/isolated-ui-secret-scan-20261028.json"
    ],
    "id": "sam-isolated-ui-prepared-discovery-20261028",
    "next_steps": [
      "Start pinned hidden-TTY operator preparation and request one secure authentication handoff; never expose credentials.",
      "After confirmed auth, parent renews existing login30min, resumes same test service, performs exact synthetic browser tests and suspends by absolute30min deadline."
    ],
    "recorded_at": "2026-10-28T04:14:04Z",
    "schema_version": 1,
    "source": {
      "content_sha256": "9069846043e488fe0382f814238f93b2a2886853dcf96ed17a1d15b642515175",
      "head": "d5f79c9ee1c096d31d59aa9d7beb0141eb8f7d0e"
    },
    "status": "partial",
    "summary": "Actual ChatGPT new-tool discovery/invocation closed. Independently reviewed bounded isolated UI candidate published to PR86 at d5f79c9; not deployed. Existing test service suspended, expired test role unchanged; pinned reviewed renewal helper staged without auth/renewal. Actual isolated browser writes remain pending secure existing-operator authentication.",
    "tests": [
      {
        "evidence": [
          "docs/engineering/isolated-ui-independent-verification-20261028.json"
        ],
        "name": "Independent initial startup4/default-read-only2/typechecks; final delta verification recorded separately by exact file hashes",
        "scope": "historical",
        "source": {
          "content_sha256": "bd40018bb2dc02bbda4d725981d68ddbb2032a19bdcfddeda7545e9390e96a33",
          "head": "e90fc932f3456dd4c14ceaac662d155ba2393b3b"
        },
        "status": "pass"
      }
    ]
  },
  "event_digest": "6dd19c257901c5da98ac0a20bec4075b856534423a3a3911e075c5b0c97a53e5",
  "schema_version": 1
}
```
<!-- /project-memory-state -->
