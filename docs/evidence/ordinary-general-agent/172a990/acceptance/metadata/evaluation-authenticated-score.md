# SAM specialist evaluation

Command: score-authenticated; commit: 172a990d6d84eaa917b6974316180d349c3c73ee

Classification: AUTHENTICATED_FIXTURE_CAPTURE

This offline command invoked no models. Live reasoning: NOT VALIDATED. Independent human review: PENDING.

Offline trace score: PASS

- exact-commit: PASS — Captured runtime must match the reviewed candidate
- time-envelope: PASS — No late completion; at most two minutes per proposed trial
- unique-attempts: PASS — Include every actual attempt, retry and verification readback as a separate event
- inclusive-reservations: PASS — Failed/unknown attempts keep full reservations; readbacks and delegated work count
- shared-budget: PASS — Shared counters include all agents and retries
- agent-budgets: PASS — Every acting identity has its own finite budget
- authorized-read-only-scope: PASS — No writes, unauthorized tools or foreign-company events
- event-times: PASS — No events outside the recorded run
- unique-receipts: PASS — A source must have one current verification receipt
- independent-specialists: PASS — Distinct specialist model attempts; this alone does not establish reasoning quality
- grounded-answer: PASS — Closed-world benchmark quotation only; semantic quality and genuine provider provenance need independent review
- corrective-research: PASS — Conflicting evidence requires a subsequent corrective read
- verified-learning: PASS — Only a supported quotation cycle can be trusted; no inferred policy changes

Trace authenticated against the separately supplied trusted public key; model quality still requires independent review.
