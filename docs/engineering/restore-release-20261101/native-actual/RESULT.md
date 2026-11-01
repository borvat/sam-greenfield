# Restoration trial result and remaining release decision

## Actual result

- **RESTORE PASS:** the completed Render export SHA256 `b40ce0f831238bc060f49affdf5e8dcaf31670d2624b00d6d0053a3e43790a79` was restored with native PostgreSQL15.19 to the one authorized isolated destination. Sorted native COPY bytes and row multiplicity match all91tables/11034rows. A fresh connection confirmed identical RLS/policy/owner/ACL metadata after the rollback-only content inspection.
- **Isolated00106 PASS:** exact SQL SHA256 `b8a62b8b5de73dea82210965132523d27adfa3cf3d3ccc84bd9fa86f70826db2` committed on the disposable database. Revision columns and unique/FK/check semantics were asserted; ACL/RLS/owners and DML counters remained unchanged. The production migration ledger was not touched or claimed tested.
- **Native synthetic process/report rollback PASS:** the exact forward report function committed, its process stopped, and both compatible fallback functions returned the same original report ID/hash while preserving revision2. Conflict, foreign-source and tenant-GUC spoofing denials passed. Actual Command Center and MCP mains authenticated and recovered saved reports across two rounds; actual Runtime main started/stopped twice with zero ticks/errors/in-flight work. All21phase receipts and source pins were independently checked on the executor by the published offline checker.
- **Cleanup PASS:** source app stubs returned to NOLOGIN, zero app sessions remained, all registered children closed, and the temporary Render database was deleted. Provider GET returned404, provider inventory omitted its ID, and the dashboard All-resources search returned zero matches. Original SAM database remains available. Private temporary backup/row/credential copies were removed; only metadata evidence remains on the existing Hermes disk.
- **Cost:** Render's deleted-resource row displays **USD0.02 unbilled**. This is the observed usage amount, not a final invoice. Resource lifetime was approximately1h47m, below24h; no extra services or plan upgrades were created.

Deletion/cost evidence is published as redacted text. Automatic approval review rejected external GitHub publication of the dashboard screenshot because it may reveal private workspace/resource metadata. The image is withheld from GitHub and remains a private owner-facing artifact; no alternative public binary upload was attempted.

The initial memory-limited attempt and the missing-original-helper packaging failure remain recorded. Only failed/remainder work was retried: the ten successful native phases and first CC round were pinned and inherited, not replayed. No production data, deployment, environment, plan, main branch or PR97 release changed.

These results are a restored-data and synthetic process/report rehearsal. They are **not** a live commercial goal, external provider execution, actual Render deployment rollback or owner delivery of a completed business goal.

## Narrow production source-SHA exception required

The owner's current forward-release authority specifies exact `8a08e6163516f30f37c65313134170744330c4f4` only. Render's existing rolling deployment overlaps old/new instances. Applying00106 first exposes old writers to42P10; deploying the forward source first exposes it to the old schema. Runtime HTTP maintenance leaves workers running, free CC/MCP do not provide that maintenance mode, and the observed suspended-service UI offers Resume without a demonstrated exact-commit resume control. No production stop or resume was attempted.

The independently reviewed minimal exception is a temporary compatibility bridge on the **same three existing services**, followed by00106 and the already approved forward release:

| Existing service | Temporary compatible bridge | Final release |
|---|---|---|
| Runtime `srv-db37vbvlk1mc739o0b70` | `53d37468807f79ae1ef27fa4de9221b35b684488` | `8a08e6163516f30f37c65313134170744330c4f4` |
| Command Center `srv-db37vbvlk1mc739o0b6g` | `2bdb33821ab913770e5f80860c21cf6501509a95` | same approved8a08e61 |
| MCP `srv-db37vbvlk1mc739o0b7g` | `2bdb33821ab913770e5f80860c21cf6501509a95` | same approved8a08e61 |

Each bridge is a direct child of its captured baseline and changes only two Hermes save/replay SQL lines. The approved source trees/pins and native evidence are retained; no new bridge implementation is needed. Confirm bridge identities and retirement of unpatched instances before applying ONLY00106 through the existing one-shot operator, preserving its transactional ledger receipt. Then publish exact8a08e61 and verify health, admission, saved reports, actual goal closure and owner delivery. A release failure returns to these compatible bridges while retaining the forward schema and immutable history; never restore an older backup over current business history or return to unpatched baselines after00106.

Review the exact published candidates: [Runtime53d3746](https://github.com/borvat/sam-greenfield/commit/53d37468807f79ae1ef27fa4de9221b35b684488), [CC/MCP2bdb338](https://github.com/borvat/sam-greenfield/commit/2bdb33821ab913770e5f80860c21cf6501509a95).

This is a source-identity exception only: no main merge, PR97 deployment, extra service, plan upgrade, GitHub billing change or new cost authority. Until the owner explicitly permits it, production remains unchanged. The restoration resource has already been deleted; successful evidence is preserved and should not be repeated without a changed dependency.
