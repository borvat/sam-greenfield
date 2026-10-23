# Independent SAM verification

Status: **FAIL**
Source: `1370842ad3d3f0ecf63ef5227e10386a69690b74` (clean: true)
Started: 2026-10-23T15:30:37.142Z; completed: 2026-10-23T15:31:50.875Z

INDEPENDENT_LOCAL_SYNTHETIC_ACCEPTANCE_NOT_HOSTED_OR_PRODUCTION

| Check | Result | Log |
| --- | --- | --- |
| preflight | PASS | [log](logs/01-preflight.log) |
| snapshot | PASS | [log](logs/02-snapshot.log) |
| images | PASS | [log](logs/03-images.log) |
| isolated-postgres | PASS | [log](logs/04-isolated-postgres.log) |
| node-dependencies | FAIL | [log](logs/05-node-dependencies.log) |
| python-dependencies | NOT_RUN | not executed |
| runtime-versions | NOT_RUN | not executed |
| workflow-tool | NOT_RUN | not executed |
| workflow-validation | NOT_RUN | not executed |
| configuration-validation | NOT_RUN | not executed |
| typecheck | NOT_RUN | not executed |
| regression | NOT_RUN | not executed |
| core-reliability | NOT_RUN | not executed |
| provider-auth | NOT_RUN | not executed |
| postgres-tls | NOT_RUN | not executed |
| contracts | NOT_RUN | not executed |
| synthetic-pilot | NOT_RUN | not executed |
| managed-schema | NOT_RUN | not executed |
| local-bundle | NOT_RUN | not executed |
| closed-setup | NOT_RUN | not executed |
| database-contract | NOT_RUN | not executed |
| prelaunch-gate | NOT_RUN | not executed |
| service-provisioning | NOT_RUN | not executed |
| operator-provisioning | NOT_RUN | not executed |
| provisioning-backup-recovery | NOT_RUN | not executed |
| render-migration-compatibility | NOT_RUN | not executed |
| render-google-oauth-contracts | NOT_RUN | not executed |
| integration-migrations | NOT_RUN | not executed |
| integration-oauth-mcp | NOT_RUN | not executed |
| integration-orchestration | NOT_RUN | not executed |
| specialist-reasoning | NOT_RUN | not executed |
| specialist-gateway | NOT_RUN | not executed |
| specialist-provenance | NOT_RUN | not executed |
| specialist-learning-fairness | NOT_RUN | not executed |
| specialist-evaluation | NOT_RUN | not executed |
| evaluation-budget | NOT_RUN | not executed |
| evaluation-adapter | NOT_RUN | not executed |
| evaluation-orchestration | NOT_RUN | not executed |
| evaluation-independent-review | NOT_RUN | not executed |
| evaluation-commercial-market | NOT_RUN | not executed |
| evaluation-commercial-profitability | NOT_RUN | not executed |
| evaluation-commercial-suppliers | NOT_RUN | not executed |
| migration-upgrade-rollback | NOT_RUN | not executed |
| specialist-restart-prepare | NOT_RUN | not executed |
| evaluation-restart-prepare | NOT_RUN | not executed |
| postgres-restart | NOT_RUN | not executed |
| migration-after-restart | NOT_RUN | not executed |
| specialist-restart-check | NOT_RUN | not executed |
| evaluation-restart-check | NOT_RUN | not executed |
| phase0-migrations | NOT_RUN | not executed |
| phase0-acceptance | NOT_RUN | not executed |
| phase0-postgres | NOT_RUN | not executed |
| tenant-isolation | NOT_RUN | not executed |
| fail-closed-security | NOT_RUN | not executed |
| clean-image | NOT_RUN | not executed |
| image-contract | NOT_RUN | not executed |
| application-startup-restart | NOT_RUN | not executed |
| source-integrity | NOT_RUN | not executed |
| cleanup | PASS | [log](logs/59-cleanup.log) |

## Unresolved defects / blockers

- node-dependencies: exit 228 (see logs/05-node-dependencies.log)

## Excluded checks

- GitHub-hosted execution and effective merge governance: SKIP — Not performed; account restriction and rules remain external gates
- Staging, production, live providers, paid model calls and customer data: SKIP — Outside authorization; no readiness claim

## Runtime versions

```json
{}
```

## Container images

- node: `node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2`; ID `sha256:eefceac94552a7e7e9da532feb53139a8630e3934b862662ce1d7cb877772c86`
- productionBase: `node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc`; ID `sha256:c79227476e31e0f5410cfc4578f1f9a59300510491f2f6f0b5eaf956dbef4986`
- postgres: `pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9`; ID `sha256:4b4956e2ab1f0aec9779dfca20366a9963a3f24c34269c3a115dd838387f0734`
- python: `python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8`; ID `sha256:b4403f3b7acf5e0700a5dd4e7ab01456d62b557a208a04f8a42d3470d93b5730`

## Commands and suite outcomes

### preflight — PASS

2026-10-23T15:30:37.144Z → 2026-10-23T15:30:37.582Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T15:30:37.151Z → 2026-10-23T15:30:37.157Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T15:30:37.157Z → 2026-10-23T15:30:37.161Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T15:30:37.161Z → 2026-10-23T15:30:37.167Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T15:30:37.167Z → 2026-10-23T15:30:37.195Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T15:30:37.195Z → 2026-10-23T15:30:37.226Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T15:30:37.227Z → 2026-10-23T15:30:37.347Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T15:30:37.347Z → 2026-10-23T15:30:37.495Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T15:30:37.495Z → 2026-10-23T15:30:37.567Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T15:30:37.567Z → 2026-10-23T15:30:37.569Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T15:30:37.569Z → 2026-10-23T15:30:37.580Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T15:30:37.580Z → 2026-10-23T15:30:37.582Z


### snapshot — PASS

2026-10-23T15:30:37.583Z → 2026-10-23T15:30:37.673Z

```sh
git archive --format=tar --output /tmp/sam-verify-prIcfH/source.tar 1370842ad3d3f0ecf63ef5227e10386a69690b74
```
Exit: 0; signal: none; 2026-10-23T15:30:37.584Z → 2026-10-23T15:30:37.620Z

```sh
tar -xf /tmp/sam-verify-prIcfH/source.tar -C /tmp/sam-verify-prIcfH/source
```
Exit: 0; signal: none; 2026-10-23T15:30:37.620Z → 2026-10-23T15:30:37.642Z


### images — PASS

2026-10-23T15:30:37.674Z → 2026-10-23T15:31:17.245Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 1; signal: none; 2026-10-23T15:30:37.675Z → 2026-10-23T15:30:37.691Z

```sh
docker pull --platform linux/amd64 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T15:30:37.691Z → 2026-10-23T15:31:17.026Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T15:31:17.026Z → 2026-10-23T15:31:17.080Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T15:31:17.081Z → 2026-10-23T15:31:17.127Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T15:31:17.127Z → 2026-10-23T15:31:17.164Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T15:31:17.165Z → 2026-10-23T15:31:17.182Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T15:31:17.182Z → 2026-10-23T15:31:17.201Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T15:31:17.201Z → 2026-10-23T15:31:17.228Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T15:31:17.228Z → 2026-10-23T15:31:17.245Z


### isolated-postgres — PASS

2026-10-23T15:31:17.247Z → 2026-10-23T15:31:28.513Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792769437141-6d9ad8a4 sam-verify-1792769437141-6d9ad8a4-net
```
Exit: 0; signal: none; 2026-10-23T15:31:17.247Z → 2026-10-23T15:31:17.293Z

```sh
docker run --detach --name sam-verify-1792769437141-6d9ad8a4-pg --label sam.verification.run=sam-verify-1792769437141-6d9ad8a4 --network sam-verify-1792769437141-6d9ad8a4-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T15:31:17.293Z → 2026-10-23T15:31:24.590Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792769437141-6d9ad8a4-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T15:31:24.590Z → 2026-10-23T15:31:24.755Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792769437141-6d9ad8a4-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T15:31:25.256Z → 2026-10-23T15:31:25.387Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792769437141-6d9ad8a4-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T15:31:25.887Z → 2026-10-23T15:31:25.992Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792769437141-6d9ad8a4-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T15:31:26.493Z → 2026-10-23T15:31:26.617Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792769437141-6d9ad8a4-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T15:31:27.118Z → 2026-10-23T15:31:27.362Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792769437141-6d9ad8a4-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T15:31:27.862Z → 2026-10-23T15:31:27.960Z

```sh
docker exec sam-verify-1792769437141-6d9ad8a4-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T15:31:27.960Z → 2026-10-23T15:31:28.124Z

```sh
docker exec sam-verify-1792769437141-6d9ad8a4-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T15:31:28.124Z → 2026-10-23T15:31:28.389Z

```sh
docker exec sam-verify-1792769437141-6d9ad8a4-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T15:31:28.389Z → 2026-10-23T15:31:28.513Z


### node-dependencies — FAIL

2026-10-23T15:31:28.518Z → 2026-10-23T15:31:50.369Z

```sh
docker run --rm --name sam-verify-1792769437141-6d9ad8a4-job-1 --label sam.verification.run=sam-verify-1792769437141-6d9ad8a4 --init --mount type=bind,src=/tmp/sam-verify-prIcfH/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 228; signal: none; 2026-10-23T15:31:28.520Z → 2026-10-23T15:31:50.369Z


### python-dependencies — NOT_RUN

not started → not completed


### runtime-versions — NOT_RUN

not started → not completed


### workflow-tool — NOT_RUN

not started → not completed


### workflow-validation — NOT_RUN

not started → not completed


### configuration-validation — NOT_RUN

not started → not completed


### typecheck — NOT_RUN

not started → not completed


### regression — NOT_RUN

not started → not completed


### core-reliability — NOT_RUN

not started → not completed


### provider-auth — NOT_RUN

not started → not completed


### postgres-tls — NOT_RUN

not started → not completed


### contracts — NOT_RUN

not started → not completed


### synthetic-pilot — NOT_RUN

not started → not completed


### managed-schema — NOT_RUN

not started → not completed


### local-bundle — NOT_RUN

not started → not completed


### closed-setup — NOT_RUN

not started → not completed


### database-contract — NOT_RUN

not started → not completed


### prelaunch-gate — NOT_RUN

not started → not completed


### service-provisioning — NOT_RUN

not started → not completed


### operator-provisioning — NOT_RUN

not started → not completed


### provisioning-backup-recovery — NOT_RUN

not started → not completed


### render-migration-compatibility — NOT_RUN

not started → not completed


### render-google-oauth-contracts — NOT_RUN

not started → not completed


### integration-migrations — NOT_RUN

not started → not completed


### integration-oauth-mcp — NOT_RUN

not started → not completed


### integration-orchestration — NOT_RUN

not started → not completed


### specialist-reasoning — NOT_RUN

not started → not completed


### specialist-gateway — NOT_RUN

not started → not completed


### specialist-provenance — NOT_RUN

not started → not completed


### specialist-learning-fairness — NOT_RUN

not started → not completed


### specialist-evaluation — NOT_RUN

not started → not completed


### evaluation-budget — NOT_RUN

not started → not completed


### evaluation-adapter — NOT_RUN

not started → not completed


### evaluation-orchestration — NOT_RUN

not started → not completed


### evaluation-independent-review — NOT_RUN

not started → not completed


### evaluation-commercial-market — NOT_RUN

not started → not completed


### evaluation-commercial-profitability — NOT_RUN

not started → not completed


### evaluation-commercial-suppliers — NOT_RUN

not started → not completed


### migration-upgrade-rollback — NOT_RUN

not started → not completed


### specialist-restart-prepare — NOT_RUN

not started → not completed


### evaluation-restart-prepare — NOT_RUN

not started → not completed


### postgres-restart — NOT_RUN

not started → not completed


### migration-after-restart — NOT_RUN

not started → not completed


### specialist-restart-check — NOT_RUN

not started → not completed


### evaluation-restart-check — NOT_RUN

not started → not completed


### phase0-migrations — NOT_RUN

not started → not completed


### phase0-acceptance — NOT_RUN

not started → not completed


### phase0-postgres — NOT_RUN

not started → not completed


### tenant-isolation — NOT_RUN

not started → not completed


### fail-closed-security — NOT_RUN

not started → not completed


### clean-image — NOT_RUN

not started → not completed


### image-contract — NOT_RUN

not started → not completed


### application-startup-restart — NOT_RUN

not started → not completed


### source-integrity — NOT_RUN

not started → not completed


### cleanup — PASS

2026-10-23T15:31:50.371Z → 2026-10-23T15:31:50.873Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769437141-6d9ad8a4-pg
```
Exit: 0; signal: none; 2026-10-23T15:31:50.372Z → 2026-10-23T15:31:50.391Z

```sh
docker rm --force --volumes sam-verify-1792769437141-6d9ad8a4-pg
```
Exit: 0; signal: none; 2026-10-23T15:31:50.391Z → 2026-10-23T15:31:50.784Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769437141-6d9ad8a4-job-1
```
Exit: 1; signal: none; 2026-10-23T15:31:50.784Z → 2026-10-23T15:31:50.809Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792769437141-6d9ad8a4-net
```
Exit: 0; signal: none; 2026-10-23T15:31:50.810Z → 2026-10-23T15:31:50.825Z

```sh
docker network rm sam-verify-1792769437141-6d9ad8a4-net
```
Exit: 0; signal: none; 2026-10-23T15:31:50.825Z → 2026-10-23T15:31:50.869Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
