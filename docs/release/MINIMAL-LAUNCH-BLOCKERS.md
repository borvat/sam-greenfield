# Minimal usable synthetic launch — 2026-10-10

## Decision

**BLOCKED by real database authentication/provisioning and release security
sign-off, not by a missing agent. Do not Publish a Setup Mode placeholder.**

The existing production command is `npm run start:release`; keep it. The proven
DeepSeek/kernel goal loop is unchanged. The launcher cannot legitimately use
the private development `heliumdb` URL, an owner credential, or a `SET ROLE`
disguise for a runtime LOGIN.

Production inspection: DeepSeek key present (value not read);
`SAM_RELEASE_DATABASE_URL` and `SAM_COMMAND_CENTER_BEARER_TOKEN` not registered
as production secrets; required non-secret production settings not returned.
No published deployment exists. Presence does not prove a valid credential.

## Small code defects fixed

- A restricted external runtime URI no longer requires an unused managed
  `DATABASE_URL` or a second paid database. Missing/empty connections still fail;
  TLS, role identity, RLS admission and credential stripping are unchanged.
- The supervised command-center now receives the validated synthetic mode
  marker, but not a provider key or model authorization.
- Its form selects `release_synthetic` / GREEN and explains the required
  independently checked acceptance contract. Examples are placeholders only.
- Synthetic overview/timeline/finance reads do not require approval,
  side-effect or financial access. Disabled metrics are not shown as zero.
- Ordinary SAM and development autonomy behavior are preserved.

Typecheck, a focused local UI/query-shape regression and existing release
contracts passed. The UI regression uses a fake local DB client: it is NOT new
goal-execution, live model or production database evidence.

## Shortest remaining owner actions

1. Approve bounded database initialization on the already-created Neon Free
   pilot, or explicitly choose a new paid Replit production database. Existing
   reported SQL-created NOLOGIN/PASSWORD NULL roles are not runtime credentials.
   Neon Console can generate passwords for new managed roles, but grants
   `neon_superuser` initially. Before storing any worker connection, those
   memberships and dangerous attributes must be removed and verified.
   A separate migration login may reach only `sam_pilot_migrator`; never grant
   that membership to the runtime login. This temporary provider privilege
   window requires explicit approval; it has NOT been opened here.
2. After that approval, use the existing migration runner with the separate
   restricted migration identity and `sam_pilot,pg_catalog` search path. Initialize
   only synthetic organization/entity data, precise grants and fixed-principal
   restrictive RLS. Prove admission with the real runtime LOGIN before launch.
   No password goes in SQL Editor, chat, command text or logs. Provider-native
   password handling does not guarantee absence of internal provider logging.
3. Put ONLY the runtime direct, verified-TLS URI in production secret
   `SAM_RELEASE_DATABASE_URL`; register a production command-center bearer token.
   Set the existing production profile with the synthetic bundle, only
   `local.calculate,local.statistics`, explicit host/origin/tenant, fresh
   expiry/price review and a newly approved request/cost budget. Do not infer
   fresh spending authority from the consumed one-shot approval.
4. Push the local UI fix, review the actual Reserved VM quote/current credit
   balance in Publishing/Billing, then approve Publish separately. No auto-reload,
   paid database creation or model calls have been enabled here.

## Costs: estimates, not enforced limits

Official August 2026 rates: shared 0.5 vCPU / 2 GiB VM **$0.0208/hour**,
approximately **$0.50/24h**. The older $0.028/hour is superseded.

- Existing Neon Free: $0 DB fees only within remaining Free quotas; published
  limits are 100 CU-hours/month/project and 1 GB storage. Remaining project
  quota was NOT queried. At a fixed 0.25 CU, 24 active hours consume 6 CU-hours.
- Replit production DB alternative: **$0.16/active hour**; the 1-second worker
  tick likely prevents its 5-minute suspension, so budget **$3.84/24h**.
  Storage is **$0.35/GiB/month**, based on monthly high-water storage INCLUDING
  history, not a promised daily prorated cost. Budget $0.35 for a 1-GiB peak.
- Outbound transfer: **$0.05/GiB**. Initialization/start/stop tail and extra
  runtime can add usage. Agent development fees and account balance are unknown.
- A proposed $0.01 estimated model budget requires fresh approval; provider
  actual billing is not a guaranteed dollar hard cap.

Thus baseline infrastructure plus that proposed model allowance is about
**$0.51 with existing Neon Free**, or **$4.70 with 24h Replit DB and a 1-GiB
monthly storage peak**, BEFORE transfer/tails/other usage. These are conditional
estimates, not quotes or guarantees that total account usage stays below $10.
Stop/unpublish the VM at 24h; verify DB inactivity separately. Stored data/history
may continue billing. Neon Free's short restore history is not a 24h backup:
retain a synthetic-only backup and the existing documented restore/rollback path.

Historical raw **40 Critical SAST** findings are not freshly rescanned or
closed by this UI correction; do not treat a historical count as 40 proven
exploits, or declare public release security signed off.

Sources checked: docs.replit.com/billing/aug-cloud-billing-updates,
docs.replit.com/billing/about-usage-based-billing,
neon.com/pricing, neon.com/docs/manage/roles.
