# SAM × Hermes recovery — 2026-10-26

Status: RECOVERED CHECKPOINT; LIVE ACCEPTANCE BLOCKED. No deployment, restart, model invocation, role renewal, configuration change or production mutation was performed during this recovery.

## Preserved work

- Draft PR #65 remains open and unmerged at 7d41234.
- Existing continuation Draft PR #66 was found at 47ec9df on integration/sam-hermes-live-20261026, nine commits ahead of #65. The interrupted work was preserved.
- The last deployed SAM application source is 47ec9df. Rollout succeeded, but this is not current readiness.
- The corrected Hermes single-file startup reached a successful rollout after the previous failed rollout. A runtime PATCHED record confirms the saved native Runs compatibility fix ran at startup.
- Source 167c7e6 carries confirmed native session locks into Runs admission. Source 4470462 separates SAM startup from transient Hermes availability. Source 47ec9df reads durable usage.runtime metadata when top-level runtime is absent.
- No pending deployment was shown in the inspected deployment lists. Process/session/outstanding-run inventory was inaccessible, so absence of in-flight work is NOT established. No competing task was started.

## Verification performed

The exact saved Python patch self_test was rerun locally: PASS for unchanged unlocked requests, confirmed lock propagation, no mutation of launch kwargs, and rejection of conflicting requested models. No installed Hermes source was modified by this local test.

The TypeScript durable-readback and model-lock regressions were inspected but NOT rerun in this recovery. Prior deployment logs show five native PostgreSQL build suites and runtime API smoke passed on 47ec9df. These are earlier deployment evidence, not new tests and not proof of real inference acceptance.

PR #66 and tests/core/hermesNativeChild.ts explicitly distinguish native PostgreSQL receipt, replay, fence, reclaim, concurrency, cancellation and kernel-to-report tests from their STUB HTTP transport.

The real task returning 42 and failing served-model validation is recorded in #66. Current goal/execution/verification/receipt rows could not be read. A subsequently completed hosted real task with served identity, independent verification and saved result/receipt is NOT PROVEN.

## Current blocker

The test authorization window recorded in PR #66 has expired. Runtime logs show verified restricted persistent storage at startup, a bounded shutdown matching that deadline, then repeated storage-start refusal. The storage-lease and persistent-binding source enforce expiry without renewal or disposable fallback. Direct current role inspection remains pending; expiry is supported by the recorded deadline, runtime timing and source.

Fresh probes returned Hermes health HTTP 200 and SAM readiness HTTP 502. Successful historical deployment must not be described as current SAM availability.

The database connector cannot reach the existing database under its current network policy. The fallback dashboard browser has no authenticated session. No network policy was weakened, no secret was exposed, and no role was renewed.

## Acceptance boundaries

- Existing-goal database readback after deployment is supported by earlier API smoke.
- Persistence of a successfully verified live Hermes result and receipt after SAM restart remains UNPROVEN.
- Current effective authenticated tool-policy/configuration readback and disk-script comparison remain pending.
- Existing source reduces tools/MCP/fallback and concurrency; this is not proof of a coding sandbox.
- The isolation limitations already recorded in #66 remain. Automated programming, terminal and GitHub tools must remain prohibited.
- Earlier gateway restart and configuration-backup permission warnings were observed; cause/resolution and effect on durable native runs were not independently established.

## Continuation

1. Renew the limited test/probe window only after fresh explicit operator authorization. Do not expand grants or networking.
2. First inventory outstanding work, exact disk files, role deadline and original database receipts; reconcile before dispatch.
3. Reuse the already-deployed fix. Confirm effective empty tools, pinned free Nous model, disabled fallback and single concurrency.
4. Run the bounded tool-free task, require native served identity and independent PostgreSQL verification, then prove result/receipt readback across a controlled SAM restart within the valid window.
5. Record real replay/concurrency/cancellation/reclaim evidence separately from stub tests. Keep coding blocked until isolation is proven.

Additional infrastructure commitments and model calls introduced by this recovery: zero. Existing charges continue; historical provider/hosting billing was not audited.

No production change, main push, PR merge, database reset/deletion, scheduled-task change or unrelated connector change occurred.
