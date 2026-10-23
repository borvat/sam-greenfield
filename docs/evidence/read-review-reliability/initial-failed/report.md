# Independent SAM verification

Status: **FAIL**
Source: `662e38ef3a0f29d70fd449b73beef7a9efcdffaa` (clean: true)
Started: 2026-10-23T05:09:16.177Z; completed: 2026-10-23T05:15:37.982Z

INDEPENDENT_LOCAL_SYNTHETIC_ACCEPTANCE_NOT_HOSTED_OR_PRODUCTION

| Check | Result | Log |
| --- | --- | --- |
| preflight | PASS | [log](logs/01-preflight.log) |
| snapshot | PASS | [log](logs/02-snapshot.log) |
| images | PASS | [log](logs/03-images.log) |
| isolated-postgres | PASS | [log](logs/04-isolated-postgres.log) |
| node-dependencies | PASS | [log](logs/05-node-dependencies.log) |
| python-dependencies | PASS | [log](logs/06-python-dependencies.log) |
| runtime-versions | PASS | [log](logs/07-runtime-versions.log) |
| workflow-tool | PASS | [log](logs/08-workflow-tool.log) |
| workflow-validation | PASS | [log](logs/09-workflow-validation.log) |
| configuration-validation | PASS | [log](logs/10-configuration-validation.log) |
| typecheck | PASS | [log](logs/11-typecheck.log) |
| regression | PASS | [log](logs/12-regression.log) |
| core-reliability | PASS | [log](logs/13-core-reliability.log) |
| provider-auth | PASS | [log](logs/14-provider-auth.log) |
| postgres-tls | PASS | [log](logs/15-postgres-tls.log) |
| contracts | PASS | [log](logs/16-contracts.log) |
| synthetic-pilot | PASS | [log](logs/17-synthetic-pilot.log) |
| managed-schema | PASS | [log](logs/18-managed-schema.log) |
| local-bundle | PASS | [log](logs/19-local-bundle.log) |
| closed-setup | PASS | [log](logs/20-closed-setup.log) |
| database-contract | PASS | [log](logs/21-database-contract.log) |
| prelaunch-gate | PASS | [log](logs/22-prelaunch-gate.log) |
| service-provisioning | PASS | [log](logs/23-service-provisioning.log) |
| operator-provisioning | PASS | [log](logs/24-operator-provisioning.log) |
| provisioning-backup-recovery | PASS | [log](logs/25-provisioning-backup-recovery.log) |
| render-migration-compatibility | PASS | [log](logs/26-render-migration-compatibility.log) |
| render-google-oauth-contracts | PASS | [log](logs/27-render-google-oauth-contracts.log) |
| integration-migrations | PASS | [log](logs/28-integration-migrations.log) |
| integration-oauth-mcp | PASS | [log](logs/29-integration-oauth-mcp.log) |
| integration-orchestration | FAIL | [log](logs/30-integration-orchestration.log) |
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

- integration-orchestration: exit 1 (see logs/30-integration-orchestration.log)

## Excluded checks

- GitHub-hosted execution and effective merge governance: SKIP — Not performed; account restriction and rules remain external gates
- Staging, production, live providers, paid model calls and customer data: SKIP — Outside authorization; no readiness claim

## Runtime versions

```json
{
  "node": "v22.23.4",
  "npm": "10.9.9",
  "openssl": "OpenSSL 3.0.22 25 Aug 2026 (Library: OpenSSL 3.0.22 25 Aug 2026)",
  "python": "Python 3.11.17",
  "postgres": "PostgreSQL 15.19 (Debian 15.19-1.pgdg12+2) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14+deb12u1) 12.2.0, 64-bit",
  "actionlint": "1.7.7\ninstalled by downloading from release page\nbuilt with go1.23.4 compiler for linux/amd64"
}
```

## Container images

- node: `node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2`; ID `sha256:eefceac94552a7e7e9da532feb53139a8630e3934b862662ce1d7cb877772c86`
- productionBase: `node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc`; ID `sha256:c79227476e31e0f5410cfc4578f1f9a59300510491f2f6f0b5eaf956dbef4986`
- postgres: `pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9`; ID `sha256:4b4956e2ab1f0aec9779dfca20366a9963a3f24c34269c3a115dd838387f0734`
- python: `python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8`; ID `sha256:b4403f3b7acf5e0700a5dd4e7ab01456d62b557a208a04f8a42d3470d93b5730`

## Commands and suite outcomes

### preflight — PASS

2026-10-23T05:09:16.178Z → 2026-10-23T05:09:16.440Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T05:09:16.181Z → 2026-10-23T05:09:16.187Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T05:09:16.187Z → 2026-10-23T05:09:16.190Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T05:09:16.190Z → 2026-10-23T05:09:16.200Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T05:09:16.200Z → 2026-10-23T05:09:16.215Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T05:09:16.215Z → 2026-10-23T05:09:16.236Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T05:09:16.236Z → 2026-10-23T05:09:16.307Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T05:09:16.307Z → 2026-10-23T05:09:16.376Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T05:09:16.376Z → 2026-10-23T05:09:16.425Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T05:09:16.425Z → 2026-10-23T05:09:16.428Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T05:09:16.428Z → 2026-10-23T05:09:16.438Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T05:09:16.438Z → 2026-10-23T05:09:16.440Z


### snapshot — PASS

2026-10-23T05:09:16.442Z → 2026-10-23T05:09:16.518Z

```sh
git archive --format=tar --output /tmp/sam-verify-EBEy2s/source.tar 662e38ef3a0f29d70fd449b73beef7a9efcdffaa
```
Exit: 0; signal: none; 2026-10-23T05:09:16.443Z → 2026-10-23T05:09:16.478Z

```sh
tar -xf /tmp/sam-verify-EBEy2s/source.tar -C /tmp/sam-verify-EBEy2s/source
```
Exit: 0; signal: none; 2026-10-23T05:09:16.478Z → 2026-10-23T05:09:16.488Z


### images — PASS

2026-10-23T05:09:16.520Z → 2026-10-23T05:09:16.631Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T05:09:16.520Z → 2026-10-23T05:09:16.535Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T05:09:16.535Z → 2026-10-23T05:09:16.548Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T05:09:16.548Z → 2026-10-23T05:09:16.563Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T05:09:16.563Z → 2026-10-23T05:09:16.578Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T05:09:16.578Z → 2026-10-23T05:09:16.593Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T05:09:16.593Z → 2026-10-23T05:09:16.605Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T05:09:16.605Z → 2026-10-23T05:09:16.618Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T05:09:16.618Z → 2026-10-23T05:09:16.631Z


### isolated-postgres — PASS

2026-10-23T05:09:16.632Z → 2026-10-23T05:09:22.895Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792732156177-8799d080 sam-verify-1792732156177-8799d080-net
```
Exit: 0; signal: none; 2026-10-23T05:09:16.633Z → 2026-10-23T05:09:16.663Z

```sh
docker run --detach --name sam-verify-1792732156177-8799d080-pg --label sam.verification.run=sam-verify-1792732156177-8799d080 --network sam-verify-1792732156177-8799d080-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T05:09:16.663Z → 2026-10-23T05:09:21.194Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792732156177-8799d080-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T05:09:21.194Z → 2026-10-23T05:09:21.282Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792732156177-8799d080-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T05:09:21.783Z → 2026-10-23T05:09:21.927Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792732156177-8799d080-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T05:09:22.428Z → 2026-10-23T05:09:22.516Z

```sh
docker exec sam-verify-1792732156177-8799d080-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T05:09:22.516Z → 2026-10-23T05:09:22.620Z

```sh
docker exec sam-verify-1792732156177-8799d080-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T05:09:22.620Z → 2026-10-23T05:09:22.790Z

```sh
docker exec sam-verify-1792732156177-8799d080-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T05:09:22.790Z → 2026-10-23T05:09:22.895Z


### node-dependencies — PASS

2026-10-23T05:09:22.900Z → 2026-10-23T05:09:39.199Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-1 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T05:09:22.901Z → 2026-10-23T05:09:39.199Z


### python-dependencies — PASS

2026-10-23T05:09:39.200Z → 2026-10-23T05:09:43.068Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-2 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-EBEy2s/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T05:09:39.201Z → 2026-10-23T05:09:43.068Z


### runtime-versions — PASS

2026-10-23T05:09:43.070Z → 2026-10-23T05:10:15.530Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-3 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T05:09:43.071Z → 2026-10-23T05:09:53.913Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-4 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T05:09:53.913Z → 2026-10-23T05:10:05.391Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-5 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T05:10:05.391Z → 2026-10-23T05:10:14.595Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-6 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T05:10:14.595Z → 2026-10-23T05:10:15.436Z

```sh
docker exec sam-verify-1792732156177-8799d080-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T05:10:15.436Z → 2026-10-23T05:10:15.530Z


### workflow-tool — PASS

2026-10-23T05:10:15.531Z → 2026-10-23T05:10:16.126Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-EBEy2s/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T05:10:15.532Z → 2026-10-23T05:10:16.069Z

```sh
tar -xzf /tmp/sam-verify-EBEy2s/actionlint.tar.gz -C /tmp/sam-verify-EBEy2s actionlint
```
Exit: 0; signal: none; 2026-10-23T05:10:16.072Z → 2026-10-23T05:10:16.123Z

```sh
/tmp/sam-verify-EBEy2s/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T05:10:16.123Z → 2026-10-23T05:10:16.126Z


### workflow-validation — PASS

2026-10-23T05:10:16.128Z → 2026-10-23T05:10:16.133Z

```sh
/tmp/sam-verify-EBEy2s/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T05:10:16.129Z → 2026-10-23T05:10:16.133Z


### configuration-validation — PASS

2026-10-23T05:10:16.134Z → 2026-10-23T05:10:49.106Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T05:10:16.135Z → 2026-10-23T05:10:16.368Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T05:10:16.368Z → 2026-10-23T05:10:16.437Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T05:10:16.437Z → 2026-10-23T05:10:16.511Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T05:10:16.511Z → 2026-10-23T05:10:16.582Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T05:10:16.582Z → 2026-10-23T05:10:16.652Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-7 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T05:10:16.653Z → 2026-10-23T05:10:28.168Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-8 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T05:10:28.168Z → 2026-10-23T05:10:37.919Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-9 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T05:10:37.919Z → 2026-10-23T05:10:49.106Z


### typecheck — PASS

2026-10-23T05:10:49.108Z → 2026-10-23T05:11:05.720Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-10 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T05:10:49.112Z → 2026-10-23T05:11:05.720Z


### regression — PASS

2026-10-23T05:11:05.722Z → 2026-10-23T05:11:43.406Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-11 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=662e38ef3a0f29d70fd449b73beef7a9efcdffaa node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T05:11:05.723Z → 2026-10-23T05:11:43.405Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T05:11:15.533Z → 2026-10-23T05:11:16.078Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T05:11:16.100Z → 2026-10-23T05:11:16.604Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T05:11:16.625Z → 2026-10-23T05:11:17.076Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T05:11:17.093Z → 2026-10-23T05:11:17.555Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T05:11:17.575Z → 2026-10-23T05:11:18.061Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T05:11:18.079Z → 2026-10-23T05:11:18.416Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T05:11:18.434Z → 2026-10-23T05:11:18.931Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T05:11:18.948Z → 2026-10-23T05:11:19.429Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T05:11:19.444Z → 2026-10-23T05:11:19.937Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T05:11:19.953Z → 2026-10-23T05:11:20.350Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T05:11:20.369Z → 2026-10-23T05:11:20.798Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T05:11:20.818Z → 2026-10-23T05:11:21.170Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T05:11:21.187Z → 2026-10-23T05:11:21.685Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T05:11:21.704Z → 2026-10-23T05:11:22.122Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T05:11:22.140Z → 2026-10-23T05:11:22.505Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T05:11:22.523Z → 2026-10-23T05:11:22.974Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T05:11:22.991Z → 2026-10-23T05:11:23.467Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T05:11:23.484Z → 2026-10-23T05:11:23.931Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T05:11:23.951Z → 2026-10-23T05:11:24.388Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T05:11:24.406Z → 2026-10-23T05:11:24.782Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T05:11:24.802Z → 2026-10-23T05:11:25.167Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T05:11:25.185Z → 2026-10-23T05:11:25.485Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T05:11:25.505Z → 2026-10-23T05:11:25.971Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T05:11:25.988Z → 2026-10-23T05:11:27.354Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T05:11:27.371Z → 2026-10-23T05:11:27.936Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T05:11:27.954Z → 2026-10-23T05:11:28.331Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T05:11:28.351Z → 2026-10-23T05:11:28.908Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T05:11:28.925Z → 2026-10-23T05:11:29.754Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T05:11:29.771Z → 2026-10-23T05:11:30.225Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T05:11:30.243Z → 2026-10-23T05:11:30.700Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T05:11:30.724Z → 2026-10-23T05:11:31.465Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T05:11:31.483Z → 2026-10-23T05:11:31.924Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T05:11:31.942Z → 2026-10-23T05:11:32.363Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T05:11:32.379Z → 2026-10-23T05:11:32.838Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T05:11:32.856Z → 2026-10-23T05:11:33.307Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T05:11:33.324Z → 2026-10-23T05:11:33.932Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T05:11:33.949Z → 2026-10-23T05:11:34.403Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T05:11:34.420Z → 2026-10-23T05:11:34.898Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T05:11:34.915Z → 2026-10-23T05:11:35.366Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T05:11:35.392Z → 2026-10-23T05:11:35.863Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T05:11:35.882Z → 2026-10-23T05:11:36.932Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T05:11:36.950Z → 2026-10-23T05:11:37.280Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T05:11:37.298Z → 2026-10-23T05:11:38.584Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T05:11:38.601Z → 2026-10-23T05:11:39.044Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T05:11:39.061Z → 2026-10-23T05:11:39.591Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T05:11:39.608Z → 2026-10-23T05:11:40.051Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T05:11:40.068Z → 2026-10-23T05:11:40.859Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T05:11:40.876Z → 2026-10-23T05:11:41.615Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T05:11:41.654Z → 2026-10-23T05:11:42.526Z

### core-reliability — PASS

2026-10-23T05:11:43.408Z → 2026-10-23T05:12:06.714Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-12 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=662e38ef3a0f29d70fd449b73beef7a9efcdffaa node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T05:11:43.409Z → 2026-10-23T05:12:06.714Z

- tests/core/reliability.ts: PASS; 2026-10-23T05:11:52.055Z → 2026-10-23T05:11:57.358Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T05:11:57.383Z → 2026-10-23T05:11:57.971Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T05:11:57.991Z → 2026-10-23T05:11:58.465Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T05:11:58.484Z → 2026-10-23T05:11:59.035Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T05:11:59.053Z → 2026-10-23T05:12:00.714Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T05:12:00.736Z → 2026-10-23T05:12:01.176Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T05:12:01.199Z → 2026-10-23T05:12:02.799Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T05:12:02.819Z → 2026-10-23T05:12:03.407Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T05:12:03.424Z → 2026-10-23T05:12:04.830Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T05:12:04.849Z → 2026-10-23T05:12:05.897Z

### provider-auth — PASS

2026-10-23T05:12:06.716Z → 2026-10-23T05:12:17.208Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-13 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=662e38ef3a0f29d70fd449b73beef7a9efcdffaa node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T05:12:06.717Z → 2026-10-23T05:12:17.208Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T05:12:15.985Z → 2026-10-23T05:12:16.408Z

### postgres-tls — PASS

2026-10-23T05:12:17.209Z → 2026-10-23T05:12:27.972Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-14 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=662e38ef3a0f29d70fd449b73beef7a9efcdffaa node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T05:12:17.210Z → 2026-10-23T05:12:27.972Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T05:12:26.496Z → 2026-10-23T05:12:27.255Z

### contracts — PASS

2026-10-23T05:12:27.975Z → 2026-10-23T05:12:39.486Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-15 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=662e38ef3a0f29d70fd449b73beef7a9efcdffaa node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T05:12:27.976Z → 2026-10-23T05:12:39.486Z

- tests/release/contracts.ts: PASS; 2026-10-23T05:12:37.974Z → 2026-10-23T05:12:38.673Z

### synthetic-pilot — PASS

2026-10-23T05:12:39.488Z → 2026-10-23T05:12:50.024Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-16 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=662e38ef3a0f29d70fd449b73beef7a9efcdffaa node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T05:12:39.489Z → 2026-10-23T05:12:50.024Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T05:12:48.505Z → 2026-10-23T05:12:49.230Z

### managed-schema — PASS

2026-10-23T05:12:50.027Z → 2026-10-23T05:13:01.200Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-17 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=662e38ef3a0f29d70fd449b73beef7a9efcdffaa node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T05:12:50.028Z → 2026-10-23T05:13:01.200Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T05:13:00.179Z → 2026-10-23T05:13:00.410Z

### local-bundle — PASS

2026-10-23T05:13:01.203Z → 2026-10-23T05:13:10.983Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-18 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=662e38ef3a0f29d70fd449b73beef7a9efcdffaa node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T05:13:01.204Z → 2026-10-23T05:13:10.983Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T05:13:09.865Z → 2026-10-23T05:13:10.238Z

### closed-setup — PASS

2026-10-23T05:13:10.987Z → 2026-10-23T05:13:22.587Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-19 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=662e38ef3a0f29d70fd449b73beef7a9efcdffaa node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T05:13:10.989Z → 2026-10-23T05:13:22.587Z

- tests/release/setup.ts: PASS; 2026-10-23T05:13:21.253Z → 2026-10-23T05:13:21.826Z

### database-contract — PASS

2026-10-23T05:13:22.591Z → 2026-10-23T05:13:32.730Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-20 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=662e38ef3a0f29d70fd449b73beef7a9efcdffaa node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T05:13:22.593Z → 2026-10-23T05:13:32.729Z

- tests/release/database_check.ts: PASS; 2026-10-23T05:13:31.607Z → 2026-10-23T05:13:31.959Z

### prelaunch-gate — PASS

2026-10-23T05:13:32.731Z → 2026-10-23T05:13:43.275Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-21 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=662e38ef3a0f29d70fd449b73beef7a9efcdffaa node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T05:13:32.733Z → 2026-10-23T05:13:43.275Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T05:13:42.136Z → 2026-10-23T05:13:42.469Z

### service-provisioning — PASS

2026-10-23T05:13:43.278Z → 2026-10-23T05:13:56.203Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-22 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=662e38ef3a0f29d70fd449b73beef7a9efcdffaa node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T05:13:43.281Z → 2026-10-23T05:13:56.203Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T05:13:52.096Z → 2026-10-23T05:13:55.397Z

### operator-provisioning — PASS

2026-10-23T05:13:56.205Z → 2026-10-23T05:14:10.158Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-23 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=662e38ef3a0f29d70fd449b73beef7a9efcdffaa node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T05:13:56.208Z → 2026-10-23T05:14:10.158Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T05:14:05.764Z → 2026-10-23T05:14:09.370Z

### provisioning-backup-recovery — PASS

2026-10-23T05:14:10.160Z → 2026-10-23T05:14:13.720Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792732156177-8799d080-pg sam-verify-1792732156177-8799d080
```
Exit: 0; signal: none; 2026-10-23T05:14:10.163Z → 2026-10-23T05:14:13.719Z


### render-migration-compatibility — PASS

2026-10-23T05:14:13.722Z → 2026-10-23T05:14:25.959Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-24 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=662e38ef3a0f29d70fd449b73beef7a9efcdffaa node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T05:14:13.724Z → 2026-10-23T05:14:25.958Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T05:14:23.898Z → 2026-10-23T05:14:25.193Z

### render-google-oauth-contracts — PASS

2026-10-23T05:14:25.962Z → 2026-10-23T05:14:42.631Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-25 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-23T05:14:25.964Z → 2026-10-23T05:14:42.631Z


### integration-migrations — PASS

2026-10-23T05:14:42.647Z → 2026-10-23T05:14:53.545Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-26 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=662e38ef3a0f29d70fd449b73beef7a9efcdffaa node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-23T05:14:42.649Z → 2026-10-23T05:14:53.545Z

- tests/integration/migrations.ts: PASS; 2026-10-23T05:14:51.706Z → 2026-10-23T05:14:52.726Z

### integration-oauth-mcp — PASS

2026-10-23T05:14:53.548Z → 2026-10-23T05:15:03.977Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-27 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=662e38ef3a0f29d70fd449b73beef7a9efcdffaa node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-23T05:14:53.550Z → 2026-10-23T05:15:03.977Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-23T05:15:02.613Z → 2026-10-23T05:15:03.150Z

### integration-orchestration — FAIL

2026-10-23T05:15:03.979Z → 2026-10-23T05:15:36.711Z

```sh
docker run --rm --name sam-verify-1792732156177-8799d080-job-28 --label sam.verification.run=sam-verify-1792732156177-8799d080 --init --network container:sam-verify-1792732156177-8799d080-pg --mount type=bind,src=/tmp/sam-verify-EBEy2s/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=662e38ef3a0f29d70fd449b73beef7a9efcdffaa node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 1; signal: none; 2026-10-23T05:15:03.982Z → 2026-10-23T05:15:36.711Z


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

2026-10-23T05:15:36.714Z → 2026-10-23T05:15:37.978Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-pg
```
Exit: 0; signal: none; 2026-10-23T05:15:36.717Z → 2026-10-23T05:15:36.735Z

```sh
docker rm --force --volumes sam-verify-1792732156177-8799d080-pg
```
Exit: 0; signal: none; 2026-10-23T05:15:36.735Z → 2026-10-23T05:15:37.194Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-1
```
Exit: 1; signal: none; 2026-10-23T05:15:37.194Z → 2026-10-23T05:15:37.219Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-2
```
Exit: 1; signal: none; 2026-10-23T05:15:37.219Z → 2026-10-23T05:15:37.243Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-3
```
Exit: 1; signal: none; 2026-10-23T05:15:37.243Z → 2026-10-23T05:15:37.268Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-4
```
Exit: 1; signal: none; 2026-10-23T05:15:37.268Z → 2026-10-23T05:15:37.293Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-5
```
Exit: 1; signal: none; 2026-10-23T05:15:37.294Z → 2026-10-23T05:15:37.323Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-6
```
Exit: 1; signal: none; 2026-10-23T05:15:37.323Z → 2026-10-23T05:15:37.351Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-7
```
Exit: 1; signal: none; 2026-10-23T05:15:37.351Z → 2026-10-23T05:15:37.374Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-8
```
Exit: 1; signal: none; 2026-10-23T05:15:37.374Z → 2026-10-23T05:15:37.403Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-9
```
Exit: 1; signal: none; 2026-10-23T05:15:37.403Z → 2026-10-23T05:15:37.428Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-10
```
Exit: 1; signal: none; 2026-10-23T05:15:37.428Z → 2026-10-23T05:15:37.452Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-11
```
Exit: 1; signal: none; 2026-10-23T05:15:37.452Z → 2026-10-23T05:15:37.475Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-12
```
Exit: 1; signal: none; 2026-10-23T05:15:37.475Z → 2026-10-23T05:15:37.506Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-13
```
Exit: 1; signal: none; 2026-10-23T05:15:37.506Z → 2026-10-23T05:15:37.532Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-14
```
Exit: 1; signal: none; 2026-10-23T05:15:37.532Z → 2026-10-23T05:15:37.556Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-15
```
Exit: 1; signal: none; 2026-10-23T05:15:37.556Z → 2026-10-23T05:15:37.578Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-16
```
Exit: 1; signal: none; 2026-10-23T05:15:37.578Z → 2026-10-23T05:15:37.601Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-17
```
Exit: 1; signal: none; 2026-10-23T05:15:37.601Z → 2026-10-23T05:15:37.623Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-18
```
Exit: 1; signal: none; 2026-10-23T05:15:37.623Z → 2026-10-23T05:15:37.647Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-19
```
Exit: 1; signal: none; 2026-10-23T05:15:37.647Z → 2026-10-23T05:15:37.671Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-20
```
Exit: 1; signal: none; 2026-10-23T05:15:37.671Z → 2026-10-23T05:15:37.693Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-21
```
Exit: 1; signal: none; 2026-10-23T05:15:37.695Z → 2026-10-23T05:15:37.724Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-22
```
Exit: 1; signal: none; 2026-10-23T05:15:37.724Z → 2026-10-23T05:15:37.748Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-23
```
Exit: 1; signal: none; 2026-10-23T05:15:37.748Z → 2026-10-23T05:15:37.771Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-24
```
Exit: 1; signal: none; 2026-10-23T05:15:37.771Z → 2026-10-23T05:15:37.803Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-25
```
Exit: 1; signal: none; 2026-10-23T05:15:37.803Z → 2026-10-23T05:15:37.828Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-26
```
Exit: 1; signal: none; 2026-10-23T05:15:37.828Z → 2026-10-23T05:15:37.848Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-27
```
Exit: 1; signal: none; 2026-10-23T05:15:37.848Z → 2026-10-23T05:15:37.871Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-job-28
```
Exit: 1; signal: none; 2026-10-23T05:15:37.871Z → 2026-10-23T05:15:37.894Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792732156177-8799d080-net
```
Exit: 0; signal: none; 2026-10-23T05:15:37.894Z → 2026-10-23T05:15:37.909Z

```sh
docker network rm sam-verify-1792732156177-8799d080-net
```
Exit: 0; signal: none; 2026-10-23T05:15:37.909Z → 2026-10-23T05:15:37.952Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
