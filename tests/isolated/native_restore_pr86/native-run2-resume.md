# One-time native-run-2 remainder only

No application source change. Offline exact-source construction identified the MCP failure as an omitted original dependency: `apps/mcp/src/oauthResource.ts` unconditionally requires `scripts/release/mcp-oauth.cjs`. The Runtime composition import closure also requires `scripts/release/synthetic-pilot.cjs`. Both original CJS helpers require only Node builtins, not additional helper files. They are now added byte-for-byte from each original pinned commit to `source-pins.json`; all earlier application/dependency artifact pins and commit/tree identities remain unchanged. The full43-tool surface construction succeeded offline; after materializing the original helper, the exact pinned MCP HTTP constructor also succeeded with zero DB query attempts and outbound fetch blocked. These are dependency diagnostics, not native/main acceptance.

Do NOT enable `SAM_MCP_RELEASE_READ_ONLY`: that actual source mode exposes only sanitized service/test status and removes `sam_get_report`. The normal providerless main and saved-report check remain required.

On the actual host, add only the missing original files from the already downloaded SHA-pinned archives:

```sh
python3 materialize-host-sources.py /tmp/sam-pr86-restore-2013/source-archives --complete-missing-runtime-helpers
```

That explicit supplement mode verifies every existing application file unchanged, extracts only the two expected helper files with exact hashes, refuses mismatched existing helpers and performs no download, install, overwrite of source, DB query or native test replay.

The only resume supported is the frozen actual run2:

- Existing state `/tmp/sam-pr86-restore-2013/native-run-2/drill/synthetic-fixture-state.json`, SHA256 `8ed31f87940fd194b75698df04c429a3444cdff9575c0c5dca2c723854468fe0`.
- Sibling original `native-drill-receipt.json`, SHA256 `6cde74dda5eac90930d01d59b352ecac863fb11502729dab0a736af684249efc`.
- Same runId, same target, same runtime artifact hashes, exactly ten expected successful native phase receipts, all three saved revision1 IDs/hashes, linked revision2, two sets of three negative checks, and CC round1 saved-read plus graceful-stop evidence are validated before copying the state to a fresh output directory.

After review, root's existing private bootstrap/config/Node24 procedure is unchanged except the explicit final arguments:

```sh
/absolute/reviewed-node24/bin/node bootstrap-app-login.cjs /absolute/reviewed-config.json /absolute/fresh-native-run-3 --resume-native-run2 /tmp/sam-pr86-restore-2013/native-run-2/drill/native-drill-receipt.json
```

The first resumed DB phase is a read-only fingerprint against the preserved originals/revisions. It does not reseed, run saveAcceptedFollowupReport again, repeat negative cases or repeat CC round1. It runs MCP round1 only, then CC/MCP round2 serially, with stop/fingerprint boundaries. It then reads Runtime gate; if separately allowed and empty, only Runtime starts twice (not CC/MCP again under the Runtime variant). Known active original work leaves Runtime BLOCKED without clearing or modifying records. Prior successes remain referenced as inherited pinned evidence, not recounted as new executions.

Service primary errors are recorded and rethrown even if cleanup also fails; cleanup errors remain separate evidence. A child that exits before health now gets a static service-specific classification. No raw stderr, private rows, URLs, passwords or tokens are recorded. Transient target-only app LOGIN and final NOLOGIN/password scrub remain mandatory.

This preparation performed only syntax checks and offline dependency construction diagnostics. No native DB calls, reinstall, migration, reseeding or previously successful native phases were executed here. Production and PR97 remain unchanged.
