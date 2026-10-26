# Parallel development ownership

Audit date: 2026-10-26. Snapshot is evidence, not a lock. Re-fetch before publication.
Base: main b55da2761e8fd1de3833be55f03d4fdd268cd0a3. This work is additive and unregistered.
34 open PRs audited by exact base...head diffs; full changed paths are in parallel-development-audit.json.
All their changed paths are reserved, including model provider and gateway files. No AGENTS.md was found in the checked-out repository.

| Component / paths | Owner | Permission |
|---|---|---|
| packages/hermes/**, deploy/hermes-coding/**, scripts/hermes/** | SAM–Hermes engineer, PRs 65–67 | No changes |
| Hermes production/runtime compositions, tests/isolated/hermes* | SAM–Hermes engineer | No changes |
| packages/model-gateway/**, packages/model-providers/** | Shared; multiple open PRs | Read/import only, integration requires coordination |
| apps/**, packages/db/**, deploy/**, root env, package/lock, workflows | Existing engineers | No changes |
| docs/experiments/TOOL-EVALUATION-81.md | PR 82 owner | Read only |
| packages/ai-infrastructure/** | This task | Additive standalone extensions only |
| tests/ai-infrastructure/**, evaluations/ai-infrastructure/** | This task | Synthetic isolated tests |
| docs/architecture documents added by this task | This task | Contract proposals only |

No runtime links were added. Imports use existing ModelProviderAdapter and OpenAICompatibleChatAdapter contracts, with a transport decorator; no second routing gateway/server is registered.
No shared schema, migration, startup, environment or dependency changes.

## Runtime audit
Sam's workspace tea-db35rbflot8c739g8rhg was read through Render list_services.
- sam-isolated-test: srv-dbe27ics728c738tuoc0; branch review/hermes-auth-baseline-20261026; paid 0.5c-512mb; auto deploy off; in use and reserved.
- hermes-isolated-test: srv-dbf5q8u7bikc73c9pffg; pinned image; /opt/data disk 1GB; paid 0.5c-512mb; reserved.
- Other marketplace, WMS and accounting services also excluded.
No environment values, databases, shell sessions, secrets or disks were accessed or changed.

## Existing secrets finding
main and the current Hermes head use server environment variables and adapter-held keys. The infrastructure/environment-group branch contains docs/RENDER_SECRETS.md, describing per-service Render secrets, not a central runtime authorization service. The Hermes publisher vault group described in PR 67 belongs to its engineer and is reserved. No working cross-project runtime Vault was proven by the source/service inventory. Render encrypted settings remain suitable bootstrap storage, but linking one broad group to every project would violate least privilege.
Selected implementation: Vault KV-v2 client and policy boundary; mature Vault supplies storage encryption, versioning, CAS and deletion. This task does not replace existing secrets or migrate them. Financial, identity, GitHub, Render and DB domains are deliberately inaccessible to this AI-only client.

## PR snapshot
| PR | Branch | Head | Changed paths |
|---|---|---|---|
| #82 | `experiment/tool-evaluation-81-20261026` | `cc8d3538179d67cbe4acff20bdc2bfb7c260cf80` | 1 |
| #67 | `review/hermes-real-project-gate-20261026` | `b40aa83a4e7ef8d590ba30a70237954bef17056d` | 25 |
| #66 | `integration/sam-hermes-live-20261026` | `91da88a224eabb2e0a9701dd1ed462c7a0e69f2d` | 34 |
| #65 | `integration/sam-hermes-20261026` | `7d41234efa7ded30612cfc2e911df82cdf5e39e0` | 4 |
| #64 | `review/sam-paid-storage-preparation-20261025` | `5e761ab9988aa6c4e45c8f1847747dc64715ae03` | 6 |
| #63 | `work/sam-storage-restart-safety-20261025` | `53c5519baa5f23bed39e66c4c2f84ae4b04af33c` | 16 |
| #62 | `work/sam-resume-20261025` | `be0b118237fc72caf0cb6ebab0c996534a244260` | 1 |
| #61 | `work/sam-persistent-evaluation-preparation-20261024` | `eaeb247a39420c8ae895ea4a46b093705ad3a8b0` | 12 |
| #60 | `work/sam-executive-closure-20261024` | `7a2f7af7726aeb0e4cb23b69036d7017f40d5005` | 13 |
| #59 | `feat/pending-test-signer-20261024` | `701aab15a263bba8394110a9edf6f127582c75f8` | 3 |
| #58 | `feat/hosted-readonly-verification-20261024` | `94170d5a23bc158be3c74e2a3179cad4f5ee7142` | 16 |
| #57 | `feat/isolated-evaluation-provisioning-20261024` | `386475c4d9c18daa5098ca4ed40462dced148ffb` | 18 |
| #56 | `fix/render-evaluation-preflight-20261024` | `db2187e469be29a455284555a3256376ee4a5a48` | 3 |
| #55 | `feat/verified-evidence-transforms` | `f9c74cc7d76c5b0888259a09343ca064ddc4a68f` | 39 |
| #49 | `codex/public-reference-lookups` | `eee1aafebf36551f3ba5a8550a8980f6baf937c9` | 5 |
| #48 | `codex/sam-phase8-verifier-fixes` | `99672635c51b000a16c5c3d6c69c95768cc319f5` | 9 |
| #47 | `codex/sam-phase5-specialist-intelligence` | `f182c5c696e7e70885638da0b215f29f0575de3e` | 29 |
| #46 | `codex/sam-core-reliability` | `14b24a9ff51cb98de400e197bf2bfad40de96812` | 196 |
| #45 | `feat/cloud-mcp-autonomy-acceptance-20261021` | `5e27018c79f8524951affa046dcb3ba8c37c6ce6` | 12 |
| #44 | `feat/oss-owner-inbox-integration-20261021` | `72bbf6c63834b381e887945e06d4eb9223a56519` | 12 |
| #43 | `feat/oss-search-monitor-actions-20261021` | `7420ac78e9a33d1343e80f7ca79efd454a119bab` | 37 |
| #42 | `feat/oss-mcp-provider-pack-20261021` | `3cdb5e8f33b8615d39987376ad91684f8aa11d99` | 13 |
| #41 | `feat/scoped-mcp-expansion-20261021` | `9f98503fdfe5c332b05556e11f5e29a06e8ecdf6` | 21 |
| #40 | `feat/autonomous-research-learning-20261021` | `a3c5977a68d7789d1d273eb91964f8340c7fc6d8` | 13 |
| #39 | `feat/commercial-learning-innovation-20261021` | `8e79f2515544994017230b390cd63bb8ffa4af91` | 14 |
| #38 | `feat/owner-notification-center-20261021` | `a95d08462df00d4b369593799fffb348b4b27bda` | 8 |
| #37 | `feat/scoped-knowledge-cycle-20261021` | `cacc3a0d908223d3ed5d0e394592c5b3714509d7` | 14 |
| #26 | `spike/google-workspace-official-mcp-readonly-20261021` | `f173d958cc12343ebc381549a8b2e417ecc876b4` | 3 |
| #25 | `fix/drive-read-transient-retries-20261021` | `21b32e50aafa8ce4c1bceff8835391949a43952e` | 2 |
| #15 | `fix/bol-pagination-analysis-authority` | `b51d30e736524e1f1bedadc64e7579cec434eec8` | 10 |
| #5 | `deploy/sam-free-trial-ready` | `8ebbe5ab5caf53a870cd252441e6199a08b3b5af` | 424 |
| #4 | `fix/managed-schema-backup-admission` | `7d8707c88d944af29ce49ce3e1bc62d9d90daa10` | 7 |
| #3 | `fix/managed-schema-parity-diagnostics` | `82ae97f56d6ad8fcef3037bc37be434c2dab96ed` | 7 |
| #1 | `feature/supplier-research-adapter` | `22809b2b616bb265971362541de18a2305fe9e42` | 3 |

## Publication recheck
The concurrent Hermes head advanced during this work. Latest observed head: `59f00c320048f92f0f220641cd748370a3e7cf86`. The full main...head path union was rechecked; none of the new paths intersect the reserved paths. Main remains at b55da2761e8fd1de3833be55f03d4fdd268cd0a3. Runtime list was re-read: both known services remained not_suspended; SAM updatedAt changed under its owner. This task made no runtime writes.
