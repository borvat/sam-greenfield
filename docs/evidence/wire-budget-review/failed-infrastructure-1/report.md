# Independent SAM verification

Status: **FAIL**
Source: `1370842ad3d3f0ecf63ef5227e10386a69690b74` (clean: true)
Started: 2026-10-23T15:29:16.374Z; completed: 2026-10-23T15:29:26.827Z

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

2026-10-23T15:29:16.375Z → 2026-10-23T15:29:16.642Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T15:29:16.379Z → 2026-10-23T15:29:16.383Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T15:29:16.383Z → 2026-10-23T15:29:16.385Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T15:29:16.385Z → 2026-10-23T15:29:16.390Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T15:29:16.390Z → 2026-10-23T15:29:16.404Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T15:29:16.404Z → 2026-10-23T15:29:16.425Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T15:29:16.425Z → 2026-10-23T15:29:16.487Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T15:29:16.490Z → 2026-10-23T15:29:16.564Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T15:29:16.564Z → 2026-10-23T15:29:16.625Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T15:29:16.625Z → 2026-10-23T15:29:16.628Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T15:29:16.628Z → 2026-10-23T15:29:16.640Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T15:29:16.640Z → 2026-10-23T15:29:16.642Z


### snapshot — PASS

2026-10-23T15:29:16.644Z → 2026-10-23T15:29:16.733Z

```sh
git archive --format=tar --output /tmp/sam-verify-cyqFgo/source.tar 1370842ad3d3f0ecf63ef5227e10386a69690b74
```
Exit: 0; signal: none; 2026-10-23T15:29:16.645Z → 2026-10-23T15:29:16.678Z

```sh
tar -xf /tmp/sam-verify-cyqFgo/source.tar -C /tmp/sam-verify-cyqFgo/source
```
Exit: 0; signal: none; 2026-10-23T15:29:16.679Z → 2026-10-23T15:29:16.691Z


### images — PASS

2026-10-23T15:29:16.733Z → 2026-10-23T15:29:16.851Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T15:29:16.735Z → 2026-10-23T15:29:16.750Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T15:29:16.750Z → 2026-10-23T15:29:16.768Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T15:29:16.768Z → 2026-10-23T15:29:16.783Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T15:29:16.783Z → 2026-10-23T15:29:16.797Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T15:29:16.797Z → 2026-10-23T15:29:16.811Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T15:29:16.811Z → 2026-10-23T15:29:16.823Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T15:29:16.824Z → 2026-10-23T15:29:16.836Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T15:29:16.837Z → 2026-10-23T15:29:16.851Z


### isolated-postgres — PASS

2026-10-23T15:29:16.855Z → 2026-10-23T15:29:19.553Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792769356373-20406541 sam-verify-1792769356373-20406541-net
```
Exit: 0; signal: none; 2026-10-23T15:29:16.856Z → 2026-10-23T15:29:16.886Z

```sh
docker run --detach --name sam-verify-1792769356373-20406541-pg --label sam.verification.run=sam-verify-1792769356373-20406541 --network sam-verify-1792769356373-20406541-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T15:29:16.886Z → 2026-10-23T15:29:17.944Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792769356373-20406541-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T15:29:17.944Z → 2026-10-23T15:29:18.028Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792769356373-20406541-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T15:29:18.529Z → 2026-10-23T15:29:18.630Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792769356373-20406541-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T15:29:19.131Z → 2026-10-23T15:29:19.220Z

```sh
docker exec sam-verify-1792769356373-20406541-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T15:29:19.220Z → 2026-10-23T15:29:19.329Z

```sh
docker exec sam-verify-1792769356373-20406541-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T15:29:19.329Z → 2026-10-23T15:29:19.440Z

```sh
docker exec sam-verify-1792769356373-20406541-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T15:29:19.440Z → 2026-10-23T15:29:19.553Z


### node-dependencies — FAIL

2026-10-23T15:29:19.559Z → 2026-10-23T15:29:26.286Z

```sh
docker run --rm --name sam-verify-1792769356373-20406541-job-1 --label sam.verification.run=sam-verify-1792769356373-20406541 --init --mount type=bind,src=/tmp/sam-verify-cyqFgo/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 228; signal: none; 2026-10-23T15:29:19.560Z → 2026-10-23T15:29:26.285Z


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

2026-10-23T15:29:26.287Z → 2026-10-23T15:29:26.826Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769356373-20406541-pg
```
Exit: 0; signal: none; 2026-10-23T15:29:26.289Z → 2026-10-23T15:29:26.306Z

```sh
docker rm --force --volumes sam-verify-1792769356373-20406541-pg
```
Exit: 0; signal: none; 2026-10-23T15:29:26.306Z → 2026-10-23T15:29:26.740Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769356373-20406541-job-1
```
Exit: 1; signal: none; 2026-10-23T15:29:26.740Z → 2026-10-23T15:29:26.764Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792769356373-20406541-net
```
Exit: 0; signal: none; 2026-10-23T15:29:26.764Z → 2026-10-23T15:29:26.779Z

```sh
docker network rm sam-verify-1792769356373-20406541-net
```
Exit: 0; signal: none; 2026-10-23T15:29:26.779Z → 2026-10-23T15:29:26.821Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
