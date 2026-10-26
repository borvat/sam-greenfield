# SAM × Hermes acceptance — active bounded window

The ONE authorized 60-minute database window has now been opened. DO NOT RENEW IT AGAIN. The exact fixed activatedAt/expiresAt values are in the isolated service's two non-secret SAM_HERMES_PROBE_*_AT variables. The role password and restricted flags/configuration were unchanged; table privileges were compared before/after and remained unchanged. No pending queue work or role sessions were present before renewal. The clock is running; inspect live state and the fixed expiry on resumption.

Reviewed application source: ad64a6a. It separates non-secret window timing from the existing untouched credential-bearing file, requires a paired live window of at most one hour, refuses a deadline beyond the restricted role, and cannot renew at restart. TypeScript and all 139 isolated tests passed with zero failures/skips. Published tree matches the tested tree. The prior direct git push lacked authentication; the same tested tree was published atomically through the connected GitHub API on the existing PR #66 branch.

Fresh Hermes preflight passed: approved free Nous model, no fallback/MCP, empty configured tools, native authenticated tools disabled, concurrency one, no active native runs/turn leases. Existing original successful live-task evidence remains distinct from the new requested test.

The Render environment-update connector unexpectedly triggered a build of the service's old configured branch after updating only the two timestamp variables. That build was cancelled and never adopted as the intended application. Next deployment must explicitly select ad64a6a; do not trigger latest-branch deployment. No secret file editor was opened and no credential-bearing file was changed.

Next: finish the explicit ad64a6a rollout, confirm actual deployed source and readiness, then submit ONE new bounded arithmetic goal through SAM. Require native served identity/model lock and independent PostgreSQL verification; persist identifiers/content; confirm idle; restart only SAM; compare before/after records and readiness. Capture stage evidence here. No new goal after uncertain admission without reconciliation. Do not reset earlier failures or reapply the existing Hermes model-lock fix.

No production/main/merge, network/grant expansion, coding tools, other connector or schedule change is authorized. Coding isolation remains unproven. No new paid resource, service upgrade or paid model call occurred. Live test and restart acceptance remain pending; the single window is already consumed even if later steps fail.
