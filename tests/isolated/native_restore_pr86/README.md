# Native drill preparation — NOT EXECUTED

Scratch/operator-reviewed code only. Production and PR97 are unchanged. This preparation agent made no DB connection, application boot, package installation or network download. Offline checks: JavaScript/Python syntax plus one Node process-registry fixture test, with no SAM application or PostgreSQL.

Pinned disposable target: `dpg-dbjpqkutlv9c73dup8lg-a`, actual DB `sam_restore_pr86_20261101_2013`. Created 2026-11-01 20:13 UTC; enforced deadline ceiling 2026-11-02 20:13 UTC. Root separately monitors the approved cost cap and cleanup. All example approval flags are false and example credentials/review digests are placeholders.

## Exact source and authored-only delivery

`source-pins.json` lists exact SHA256 for every materialized tracked app/package/vendor/lock/config file. The original complete TS module is imported by `tsx`, with original imports, schemas, canonical hash checks and SQL. No body extraction, SQL replacement, import stubs or PGlite are used.

| Variant | Original commit | Published equivalent commit | Reviewed tree |
|---|---|---|---|
| Forward | `8a08e6163516f30f37c65313134170744330c4f4` | same | `974bf2fa7eab05303fa47fbd354dc535838e25af` |
| Runtime fallback | `2d4d32e286ff71307417f7375985b85214c7a2e6` | `53d37468807f79ae1ef27fa4de9221b35b684488` | `9cb7c3708b816c62c25fceb626d688e0317cb095` |
| CC/MCP fallback | `0f056d36f98413b7590a405294693c0b5fc18885` | `2bdb33821ab913770e5f80860c21cf6501509a95` | `9c6e9b9dabbb68ae83db0fd054b6a6c143f3edfa` |

Root may publish only authored files listed in `deliverable-files.json`, including source-pins metadata. The `sources/` copies and full-source bundle need not be published/transferred. `materialize-host-sources.py /tmp/sam-pr86-restore-2013/source-archives` reuses root's three already downloaded, exact SHA-pinned archives without network transfer. Its no-argument fallback downloads those exact official GitHub archives and extracts only expected regular source files whose hashes match; archives are size-bounded and discarded afterward. Private-repository auth failures stay BLOCKED; the helper does not request, discover or print credentials. Coordinator-supplied equivalent authenticated transport is a separate step. `prepare.py` is the original local Git-object packaging provenance helper, not a host installer.

## Already prepared Node/dependencies: capture, do not reinstall

The existing Hermes executor's Node26 is refused for the harness. The exact execution binary must be official Node `v24.22.1`, Linux x64. Root is already preparing that official archive/SHASUMS and exact-forward-lock production installation. Do not repeat installation.

`capture-host-artifacts.py` captures that completed installation without downloading, installing or executing anything:

```sh
python3 capture-host-artifacts.py /absolute/reviewed-existing-node-artifacts.json /tmp/sam-pr86-restore-2013/dependencies-exact-lock /tmp/sam-pr86-restore-2013/dependencies-install-provenance.json /absolute/fresh-artifact-capture-directory
```

The first input follows `existing-node-artifacts.example.json` with digests from root's already verified official Node provenance. Capture rechecks official archive/checksum/binary digests, exact package/lock hashes, archives current node_modules, hashes every regular file and symlink, rejects external/workspace symlink escapes and special/unsafe files, and pins the actual install-provenance JSON. It bounds its tracked binary/archive/dependency artifact set below 200 MiB. Existing host tools, unrelated headers/cache and future source copies are outside that count and remain root-monitored.

The generated runtime artifact reference remains `PENDING...` and cannot arm execution. Reviewer must inspect actual install provenance for `npm ci --omit=dev --ignore-scripts --workspaces=false --no-audit --no-fund`, Node24, exit0, registry.npmjs.org and the pinned lock/SRI route. Expected lock SHA256 is `59a8b7944ef6da4e93b602dbacd231e62ceffdb5b46124538308dd670c9f1156`; package SHA256 is `23102649e682a9a0a5abdcf960129922b554319c56cbd7b916cc52baa02d8eba`. Installed package contents are no longer trusted merely from version metadata: main re-verifies the reviewed dependency archive, pinned full-tree manifest and every installed byte/link before starting children. The existing production `@modelcontextprotocol/sdk` client is used; dev-only `@modelcontextprotocol/client` is unnecessary.

After independent approval, set the generated descriptor's real review reference and privately point `SAM_NATIVE_RUNTIME_ARTIFACTS_FILE` at it. Then use the exact Node24 binary:

```sh
/absolute/reviewed-node24/bin/node link-dependencies.cjs
```

This performs no install. It rechecks Node artifact integrity, the complete dependency tree, pinned production-package versions, and links only that reviewed tree to each source directory. `--omit=dev` is explicitly supported. No symlink-escape exception is introduced.

## Target context, TLS and restricted LOGIN

The restore/ACL operator separately restores the source data and exact ACL/RLS, then applies reviewed `00106` on the disposable target. The drill itself performs no migration/DDL/GRANT/reset. Missing revision schema/contracts/permissions remain BLOCKED.

Tenant GUC defaults are not assumed to exist in global role settings. `common.tenantOptions` constructs only `search_path=public,pg_catalog` and the two strictly validated tenant UUID settings; child `PGOPTIONS` is generated from config, never inherited. Native phase Client options use the same fixed strings explicitly. No `role=` option or arbitrary URI options are accepted. The actual unmodified source still checks fixed restrictive policy predicates and spoof denial.

TLS defaults to `verify-full`. The separately reviewed alternative `tlsMode: internal-encrypted-unverified` is accepted only for the exact bare private Render host, exact target database, `privateNetworkTargetConfirmed:true` and a non-placeholder TLS review reference. For pinned pg-connection-string2.14.1, it normalizes only this reviewed private-target URI to `sslmode=require&uselibpqcompat=true`; direct phase/operator Clients additionally use `ssl:{rejectUnauthorized:false}` only in this explicit internal mode. It requires actual `pg_stat_ssl.ssl=true` on every native phase. Receipts explicitly state `certificateVerification:false`; no public CIDR allowlist is broadened and no public unverified-TLS mode exists. This follows the distinct internal encrypted/self-signed route documented at https://render.com/docs/postgresql-creating-connecting. It is not certificate-verified transport, and reviewers must approve that limitation before execution. Global TLS bypass flags remain refused.

Exact source admission requires `current_user=session_user`; owner `SET ROLE` cannot substitute for actual service LOGIN acceptance. If the restored `sam_runtime_app` is NOLOGIN, `bootstrap-app-login.cjs` is a separate narrowly scoped operator wrapper. It requires explicit `allowAppStubLoginBootstrap`, confirmation that the restored stub contains no original credentials, a separate review reference and `SAM_NATIVE_BOOTSTRAP_APPROVAL=ENABLE_RESTORED_TARGET_APP_LOGIN_ONCE`. It pins the same disposable host/database AND exact configured operator username against both URL and current/session identity, asserts encrypted PG15, non-login/non-privileged/non-owner/member-free app role, no persistent DDL privileges and zero preexisting app sessions. It only changes that exact restored stub to LOGIN with a fresh random password generated in memory. No role, membership, policy or ACL is created; no original password is read/copied. It launches the harness with an app-only environment: operator URL is not inherited. In finally it waits for bounded child cleanup, restores NOLOGIN/password NULL, records residual app sessions and fails on unconfirmed cleanup. It prints/writes no password or app URL. Cleanup is not a production-role change.

Privately provide `SAM_NATIVE_OPERATOR_DATABASE_URL` to that wrapper, never in chat/arguments. It must target the disposable DB and exact reviewed TLS mode. A private bootstrap run is:

```sh
/absolute/reviewed-node24/bin/node bootstrap-app-login.cjs /absolute/reviewed-config.json /absolute/fresh-bootstrap-output
```

Alternatively a separately prepared fresh target app LOGIN can directly use private `SAM_NATIVE_APP_DATABASE_URL` plus `SAM_NATIVE_DRILL_APPROVAL=RUN_ISOLATED_NATIVE_SYNTHETIC_DRILL` with `run-native.cjs`. `--validate-only` connects nowhere and starts no application, but does require reviewed configuration and runtime artifacts. Never use a production or owner URL as the app URI.

## Proof sequence and honest fingerprint coverage

- Actual PG15 restricted LOGIN and complete pinned source admission; no memberships/DDL/ownership bypass.
- Catalog discovery classifies all local ordinary/partitioned tables in every non-system schema. Every SELECT-visible relation is fingerprinted; inaccessible schema/table entries are explicitly listed. Mandatory public goal/plan/queue/execution/verification/report, model calls/reservations, audit/read-review-budget, memory/world-fact, event/outbox/inbox and business-counter sources must be readable. Additional present public budget/reservation/memory/knowledge/learning sources must also be readable or the phase blocks. Original fingerprints exclude only separately journaled synthetic IDs in the six affected public tables. Second-schema tables are not omitted: either visible rows are hashed or access denial is recorded. No owner-wide or foreign-tenant preservation claim is made.
- Pre-write journal records all synthetic UUIDs before mutation. Two explicitly labelled synthetic goals plus saved-evidence fixtures are appended, using existing contracts. No real intake, provider execution or operational goal closure is claimed.
- Actual forward `saveAcceptedFollowupReport` commits in a separate process and enters a durable commit barrier. Parent sends SIGTERM and awaits exit. A synthetic revision2 is appended. Fresh actual fallback processes replay revision1's same ID/hash while the two-revision fingerprint stays unchanged. This is restart-after-commit, not crash-during-transaction recovery.
- Actual changed accepted payload reaches report conflict; foreign binding fails; a foreign session GUC cannot read/update the synthetic goal. Negative mutations roll back. Original restored goals are never modified for rejection tests.
- Actual fallback CC/MCP mains boot on loopback with random in-memory tokens and no provider/dispatcher/OAuth config. Anonymous denial and authenticated saved report/timeline readback are repeated after actual stop/restart. Harness invokes only read methods; this is not a global read-only-surface claim.
- Runtime stays BLOCKED on active original/recovery work. Its readiness startup itself runs recovery before ticks. Gate is rechecked immediately before each optional startup; no records are changed to clear it. Only explicit approval plus empty gate allows actual local-release-bundle startup, 24-hour interval and authenticated statusz zero-tick proof. This does not establish operational work/recovery-under-load acceptance.

Every phase and service child is registered immediately in `ProcessRegistry`. Phase timeout, startup failure, normal exit and outer finally all await bounded SIGTERM then SIGKILL/close confirmation. Parent SIGTERM/SIGINT also stops the registry and prevents further spawns. Bootstrap grants its harness enough cleanup time before escalation. Receipts enumerate every registered PID/exit/signal; unconfirmed cleanup fails rather than being swallowed.

Evidence says `roleVisibleOriginalFingerprintsUnchanged`, never blanket `restoredOriginalsUnchanged`. Owner-wide restore/ACL/row-counter proof is the separate operator's evidence. Raw process logs, restored contents, URLs/passwords/tokens are not persisted; JSON outputs are private (0600 in 0700 directories). Synthetic rows remain for independent verification; root owns cleanup before deadline.

## Current verification and remaining limits

Syntax checks pass for authored JS/Python. `process_registry_offline.test.cjs` passes one test covering registry membership, timeout, awaited SIGTERM, SIGKILL escalation and confirmed closure. Those two child fixtures are simple Node loops, not application processes; no DB or old PGlite test was run. Source snapshots and native proof remain PREPARED ONLY. TLS mode, runtime artifact provenance, bootstrap permissions, actual host dependencies, native admission, data visibility, process compatibility, backup/rollback and real business acceptance still require independent review/execution. Production and PR97 remain untouched.

Final preparation freeze: JavaScript syntax checks cover seven authored modules; Python helpers were AST-checked only. One offline process-lifecycle test passes. No native DB or SAM application execution was performed by this agent. Actual root-side source/Node/dependency download and installation receipts are separate; capture does not repeat them.
