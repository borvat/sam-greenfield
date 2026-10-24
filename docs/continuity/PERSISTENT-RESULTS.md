# Provisioned storage candidate — exact-version verification

Application commit: `654a15a517e1339ff0e6f94cd9b3d5d3dd3bd11b`.
The test service deploy reached live at 2026-10-24T16:39:17Z. Runtime API smoke passed at 16:39:37Z.
This report is documentation only; it does not change the deployed application.

## Results

| Check | Result | Evidence boundary |
|---|---|---|
| TypeScript | PASS | Includes deployment entry and binding |
| Isolated suite | 109 PASS, 0 FAIL | Includes four new storage-admission tests |
| Native core reliability | PASS, 4960ms | Disposable build database |
| Native tenant workload | PASS, 548ms | Disposable build database |
| Native shared path | PASS, 62231ms | Scripted decisions; not live reasoning |
| Native evaluation budgets | PASS, 59634ms | Durable-reservation fixtures |
| Native persistent-storage test | PASS, 1207ms | Actual provisioner, restricted PostgreSQL login, authenticated intake and SIGKILL/replacement of the HTTP process |
| Runtime API smoke | PASS, nine checks | Default disposable test profile |
| Live provider/model calls | NOT RUN | Release interlock remains disabled |
| Real hosted container replacement with persistent binding | NOT RUN | Requires approved storage/principal delivery |
| Authenticated browser flow | BLOCKED | No authenticated dashboard session available |
| Ten live acceptance cases | NOT RUN | No signature, trust registration or activation inferred |

The new native test verifies exact restricted-role admission, creates a goal via authenticated HTTP, kills the application process, starts a replacement and independently queries the same goal with no duplicate goal or execution. It also verifies public-table/DDL denial. The database survives those application processes because it is a separate PostgreSQL process in the build fixture. This does not prove persistence through replacement of the hosted container.

The provisioned storage path is implemented and tested at its native boundary. It is not selected in the deployed test service: no approved connection file or new hosted role was created. Its startup checks are read-only and never provision, migrate, renew a login, sign, activate or silently fall back to temporary data.

## Failure retained

The prior candidate `4d8e09f2f6ffdfefecc6f3504f3a8e888942ce01` failed during Docker typecheck before the native suites. Deployment modules were copied after the typecheck layer. The final candidate copies them first; no assertion, profile or timeout was relaxed. The preceding working deployment was retained until the corrected candidate became live.

## Repeatable checks

- `npm run typecheck`
- `DATABASE_URL=postgres://unused:unused@127.0.0.1:1/unused node --import tsx --test tests/isolated/*.ts tests/isolated/*.cjs` (dummy unused connection)
- Five native suites are defined in `deploy/render-test/verification.cjs`; the build report is pinned to the image source commit.
- The persistent test is `tests/core/persistentStorage.ts`, with the replacement process in `tests/core/persistentBindingChild.ts`.

## Next admitted step

Provision one unused synthetic schema and expiring restricted role through the existing operator mechanism, deliver only its intended test-scoped connection, select the provisioned profile and prove actual hosted container replacement. Do not broaden database networking or expose/copy production credentials.

Any subsequent live reasoning requires separately reviewed activation and an actual owner-attested signer, exact trial/commit/corpus/endpoint/prices/deadline payload, original trial limits and valid source bindings. This document is neither approval nor a signed permit. Production Runtime/MCP and historical goals were not changed.
