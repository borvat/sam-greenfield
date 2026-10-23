# PR54 citation mapping: final acceptance

Exact application head: `4ef0b1d682a032f47c46d5f8bef9a547824379e0`.
Base: deployed `d08b1041c982c88bc43353a6ea4658c77d7a38df`.
PR: https://github.com/borvat/sam-greenfield/pull/54

**59/59 stages PASS** on this clean exact head. [Report](full/report.md),
[machine report](full/report.json), [logs](full/logs), [hashes](full/SHA256SUMS).
All hashes verified. Pinned Node 22.23.4 / PostgreSQL 15.19. Source integrity,
restricted-role orchestration, isolation/security, image/startup/restart and
cleanup passed. No application stage skipped. Hosted GitHub is billing-blocked;
live/provider/production checks remain outside authorization.

The earlier 49ec0eb pass is superseded for release. Its projector changed nested
indentation: projected quotations passed review validation but were not literal
raw-source quotations, so knowledge capture could roll back a completed report.
The correction maps projected lines to literal trimmed substrings of verified raw
source text. Only citableLines can supply quotes. Generated wrapper/provenance
text cannot be cited. Existing report, knowledge and database provenance guards
remain enabled; no original content is fabricated.

Regression: an 18,319-character products result previously fit under 22k, but is
projected under the new shared allowance. The restricted-role integration now
cites a nested SKU detail instead of only a header, asserts its exact persisted
knowledge statement, then verifies cold-process recall, revocation and tenant
fences. Separate wrapper-citation rejection tests pass. Local core reliability
10/10 and isolated review 3/3 passed. Final four-source synthetic prompt sizes:
21,872 bytes review / 19,413 bytes critique, within the 48,000-byte limit.

Commands:

```sh
npm run typecheck
SAM_CORE_TEST_DATABASE_URL=postgres://postgres:generic-test-fixture@127.0.0.1:55439/sam_core_test npm run test:core-reliability
SAM_CORE_TEST_DATABASE_URL=postgres://postgres:generic-test-fixture@127.0.0.1:55439/sam_core_test node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node --import tsx --test tests/isolated/sam_google_review.ts
node /tmp/sam-planning-harness/verify-full.cjs --output /tmp/sam-citation-full > /tmp/sam-citation-full.log 2>&1
```

Credentials shown are disposable synthetic fixtures. The external harness differs
only by checkout/pins paths and the attached TCP SELECT 1 readiness patch, with
unchanged retry/time limits. No application test is skipped or weakened. This
separate evidence branch is documentation only; PR54 remains at the tested head.

The generic-agent implementation is isolated in PR55 and not included here.
No production reads/model calls, goal mutation, merge or deployment occurred.
Missing monetary evidence, provider latency and autonomous model quality remain
unproven; synthetic acceptance does not establish live commercial success.
