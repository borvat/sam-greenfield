# Independent SAM verification

Status: **FAIL**
Source: `030ac40d4e3191e65a8d1e79d7411e5067da9ed0` (clean: true)
Started: 2026-10-23T06:25:22.452Z; completed: 2026-10-23T06:28:03.541Z

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
| core-reliability | FAIL | [log](logs/13-core-reliability.log) |
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

- core-reliability: exit 143 (see logs/13-core-reliability.log)
- INTERRUPTED: partial results are not acceptance

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

2026-10-23T06:25:22.453Z → 2026-10-23T06:25:22.701Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T06:25:22.457Z → 2026-10-23T06:25:22.462Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T06:25:22.462Z → 2026-10-23T06:25:22.464Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T06:25:22.465Z → 2026-10-23T06:25:22.470Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T06:25:22.470Z → 2026-10-23T06:25:22.481Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T06:25:22.481Z → 2026-10-23T06:25:22.500Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T06:25:22.500Z → 2026-10-23T06:25:22.559Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T06:25:22.559Z → 2026-10-23T06:25:22.628Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T06:25:22.628Z → 2026-10-23T06:25:22.684Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T06:25:22.684Z → 2026-10-23T06:25:22.687Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T06:25:22.687Z → 2026-10-23T06:25:22.699Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T06:25:22.699Z → 2026-10-23T06:25:22.701Z


### snapshot — PASS

2026-10-23T06:25:22.702Z → 2026-10-23T06:25:22.777Z

```sh
git archive --format=tar --output /tmp/sam-verify-BuhWN0/source.tar 030ac40d4e3191e65a8d1e79d7411e5067da9ed0
```
Exit: 0; signal: none; 2026-10-23T06:25:22.703Z → 2026-10-23T06:25:22.735Z

```sh
tar -xf /tmp/sam-verify-BuhWN0/source.tar -C /tmp/sam-verify-BuhWN0/source
```
Exit: 0; signal: none; 2026-10-23T06:25:22.735Z → 2026-10-23T06:25:22.743Z


### images — PASS

2026-10-23T06:25:22.782Z → 2026-10-23T06:25:22.903Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T06:25:22.783Z → 2026-10-23T06:25:22.802Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T06:25:22.802Z → 2026-10-23T06:25:22.817Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T06:25:22.817Z → 2026-10-23T06:25:22.830Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T06:25:22.831Z → 2026-10-23T06:25:22.845Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T06:25:22.845Z → 2026-10-23T06:25:22.860Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T06:25:22.860Z → 2026-10-23T06:25:22.874Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T06:25:22.874Z → 2026-10-23T06:25:22.891Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T06:25:22.891Z → 2026-10-23T06:25:22.902Z


### isolated-postgres — PASS

2026-10-23T06:25:22.903Z → 2026-10-23T06:25:27.352Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792736722451-d9f51bed sam-verify-1792736722451-d9f51bed-net
```
Exit: 0; signal: none; 2026-10-23T06:25:22.904Z → 2026-10-23T06:25:22.934Z

```sh
docker run --detach --name sam-verify-1792736722451-d9f51bed-pg --label sam.verification.run=sam-verify-1792736722451-d9f51bed --network sam-verify-1792736722451-d9f51bed-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T06:25:22.934Z → 2026-10-23T06:25:25.644Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792736722451-d9f51bed-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T06:25:25.644Z → 2026-10-23T06:25:25.753Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792736722451-d9f51bed-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T06:25:26.253Z → 2026-10-23T06:25:26.359Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792736722451-d9f51bed-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T06:25:26.860Z → 2026-10-23T06:25:26.960Z

```sh
docker exec sam-verify-1792736722451-d9f51bed-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T06:25:26.960Z → 2026-10-23T06:25:27.070Z

```sh
docker exec sam-verify-1792736722451-d9f51bed-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T06:25:27.070Z → 2026-10-23T06:25:27.196Z

```sh
docker exec sam-verify-1792736722451-d9f51bed-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T06:25:27.196Z → 2026-10-23T06:25:27.352Z


### node-dependencies — PASS

2026-10-23T06:25:27.357Z → 2026-10-23T06:25:36.386Z

```sh
docker run --rm --name sam-verify-1792736722451-d9f51bed-job-1 --label sam.verification.run=sam-verify-1792736722451-d9f51bed --init --mount type=bind,src=/tmp/sam-verify-BuhWN0/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T06:25:27.358Z → 2026-10-23T06:25:36.386Z


### python-dependencies — PASS

2026-10-23T06:25:36.387Z → 2026-10-23T06:25:40.247Z

```sh
docker run --rm --name sam-verify-1792736722451-d9f51bed-job-2 --label sam.verification.run=sam-verify-1792736722451-d9f51bed --init --mount type=bind,src=/tmp/sam-verify-BuhWN0/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-BuhWN0/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T06:25:36.388Z → 2026-10-23T06:25:40.247Z


### runtime-versions — PASS

2026-10-23T06:25:40.249Z → 2026-10-23T06:26:10.799Z

```sh
docker run --rm --name sam-verify-1792736722451-d9f51bed-job-3 --label sam.verification.run=sam-verify-1792736722451-d9f51bed --init --network container:sam-verify-1792736722451-d9f51bed-pg --mount type=bind,src=/tmp/sam-verify-BuhWN0/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T06:25:40.250Z → 2026-10-23T06:25:49.165Z

```sh
docker run --rm --name sam-verify-1792736722451-d9f51bed-job-4 --label sam.verification.run=sam-verify-1792736722451-d9f51bed --init --network container:sam-verify-1792736722451-d9f51bed-pg --mount type=bind,src=/tmp/sam-verify-BuhWN0/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T06:25:49.165Z → 2026-10-23T06:25:56.145Z

```sh
docker run --rm --name sam-verify-1792736722451-d9f51bed-job-5 --label sam.verification.run=sam-verify-1792736722451-d9f51bed --init --network container:sam-verify-1792736722451-d9f51bed-pg --mount type=bind,src=/tmp/sam-verify-BuhWN0/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T06:25:56.145Z → 2026-10-23T06:26:08.818Z

```sh
docker run --rm --name sam-verify-1792736722451-d9f51bed-job-6 --label sam.verification.run=sam-verify-1792736722451-d9f51bed --init --network container:sam-verify-1792736722451-d9f51bed-pg --mount type=bind,src=/tmp/sam-verify-BuhWN0/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T06:26:08.818Z → 2026-10-23T06:26:10.704Z

```sh
docker exec sam-verify-1792736722451-d9f51bed-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T06:26:10.704Z → 2026-10-23T06:26:10.799Z


### workflow-tool — PASS

2026-10-23T06:26:10.800Z → 2026-10-23T06:26:11.448Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-BuhWN0/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T06:26:10.801Z → 2026-10-23T06:26:11.401Z

```sh
tar -xzf /tmp/sam-verify-BuhWN0/actionlint.tar.gz -C /tmp/sam-verify-BuhWN0 actionlint
```
Exit: 0; signal: none; 2026-10-23T06:26:11.404Z → 2026-10-23T06:26:11.444Z

```sh
/tmp/sam-verify-BuhWN0/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T06:26:11.444Z → 2026-10-23T06:26:11.448Z


### workflow-validation — PASS

2026-10-23T06:26:11.450Z → 2026-10-23T06:26:11.456Z

```sh
/tmp/sam-verify-BuhWN0/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T06:26:11.452Z → 2026-10-23T06:26:11.456Z


### configuration-validation — PASS

2026-10-23T06:26:11.458Z → 2026-10-23T06:26:47.727Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T06:26:11.459Z → 2026-10-23T06:26:11.718Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:26:11.718Z → 2026-10-23T06:26:11.789Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:26:11.789Z → 2026-10-23T06:26:11.876Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:26:11.876Z → 2026-10-23T06:26:11.965Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:26:11.965Z → 2026-10-23T06:26:12.049Z

```sh
docker run --rm --name sam-verify-1792736722451-d9f51bed-job-7 --label sam.verification.run=sam-verify-1792736722451-d9f51bed --init --network container:sam-verify-1792736722451-d9f51bed-pg --mount type=bind,src=/tmp/sam-verify-BuhWN0/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T06:26:12.049Z → 2026-10-23T06:26:24.655Z

```sh
docker run --rm --name sam-verify-1792736722451-d9f51bed-job-8 --label sam.verification.run=sam-verify-1792736722451-d9f51bed --init --network container:sam-verify-1792736722451-d9f51bed-pg --mount type=bind,src=/tmp/sam-verify-BuhWN0/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T06:26:24.655Z → 2026-10-23T06:26:36.556Z

```sh
docker run --rm --name sam-verify-1792736722451-d9f51bed-job-9 --label sam.verification.run=sam-verify-1792736722451-d9f51bed --init --network container:sam-verify-1792736722451-d9f51bed-pg --mount type=bind,src=/tmp/sam-verify-BuhWN0/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T06:26:36.556Z → 2026-10-23T06:26:47.727Z


### typecheck — PASS

2026-10-23T06:26:47.729Z → 2026-10-23T06:27:05.804Z

```sh
docker run --rm --name sam-verify-1792736722451-d9f51bed-job-10 --label sam.verification.run=sam-verify-1792736722451-d9f51bed --init --network container:sam-verify-1792736722451-d9f51bed-pg --mount type=bind,src=/tmp/sam-verify-BuhWN0/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T06:26:47.730Z → 2026-10-23T06:27:05.804Z


### regression — PASS

2026-10-23T06:27:05.808Z → 2026-10-23T06:27:51.008Z

```sh
docker run --rm --name sam-verify-1792736722451-d9f51bed-job-11 --label sam.verification.run=sam-verify-1792736722451-d9f51bed --init --network container:sam-verify-1792736722451-d9f51bed-pg --mount type=bind,src=/tmp/sam-verify-BuhWN0/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=030ac40d4e3191e65a8d1e79d7411e5067da9ed0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T06:27:05.809Z → 2026-10-23T06:27:51.007Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T06:27:17.999Z → 2026-10-23T06:27:18.644Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T06:27:18.663Z → 2026-10-23T06:27:19.199Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T06:27:19.218Z → 2026-10-23T06:27:19.701Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T06:27:19.721Z → 2026-10-23T06:27:20.227Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T06:27:20.244Z → 2026-10-23T06:27:20.767Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T06:27:20.792Z → 2026-10-23T06:27:21.209Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T06:27:21.228Z → 2026-10-23T06:27:21.816Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T06:27:21.834Z → 2026-10-23T06:27:22.354Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T06:27:22.376Z → 2026-10-23T06:27:22.885Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T06:27:22.904Z → 2026-10-23T06:27:23.383Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T06:27:23.402Z → 2026-10-23T06:27:23.876Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T06:27:23.903Z → 2026-10-23T06:27:24.257Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T06:27:24.290Z → 2026-10-23T06:27:24.873Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T06:27:24.897Z → 2026-10-23T06:27:25.479Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T06:27:25.506Z → 2026-10-23T06:27:26.028Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T06:27:26.059Z → 2026-10-23T06:27:26.711Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T06:27:26.744Z → 2026-10-23T06:27:27.298Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T06:27:27.329Z → 2026-10-23T06:27:27.865Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T06:27:27.885Z → 2026-10-23T06:27:28.332Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T06:27:28.352Z → 2026-10-23T06:27:28.831Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T06:27:28.851Z → 2026-10-23T06:27:29.316Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T06:27:29.338Z → 2026-10-23T06:27:29.816Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T06:27:29.910Z → 2026-10-23T06:27:30.520Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T06:27:30.543Z → 2026-10-23T06:27:32.136Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T06:27:32.156Z → 2026-10-23T06:27:32.747Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T06:27:32.771Z → 2026-10-23T06:27:33.202Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T06:27:33.221Z → 2026-10-23T06:27:33.859Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T06:27:33.878Z → 2026-10-23T06:27:34.787Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T06:27:34.805Z → 2026-10-23T06:27:35.311Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T06:27:35.399Z → 2026-10-23T06:27:35.920Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T06:27:35.939Z → 2026-10-23T06:27:36.765Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T06:27:36.783Z → 2026-10-23T06:27:37.277Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T06:27:37.295Z → 2026-10-23T06:27:37.788Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T06:27:37.809Z → 2026-10-23T06:27:38.344Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T06:27:38.365Z → 2026-10-23T06:27:38.881Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T06:27:38.903Z → 2026-10-23T06:27:39.678Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T06:27:39.695Z → 2026-10-23T06:27:40.161Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T06:27:40.183Z → 2026-10-23T06:27:40.729Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T06:27:40.748Z → 2026-10-23T06:27:41.664Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T06:27:41.683Z → 2026-10-23T06:27:42.195Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T06:27:42.222Z → 2026-10-23T06:27:43.381Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T06:27:43.400Z → 2026-10-23T06:27:43.780Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T06:27:43.797Z → 2026-10-23T06:27:45.263Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T06:27:45.282Z → 2026-10-23T06:27:45.819Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T06:27:45.840Z → 2026-10-23T06:27:46.510Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T06:27:46.532Z → 2026-10-23T06:27:47.015Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T06:27:47.037Z → 2026-10-23T06:27:48.104Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T06:27:48.123Z → 2026-10-23T06:27:49.059Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T06:27:49.091Z → 2026-10-23T06:27:50.058Z

### core-reliability — FAIL

2026-10-23T06:27:51.010Z → 2026-10-23T06:28:02.358Z

```sh
docker run --rm --name sam-verify-1792736722451-d9f51bed-job-12 --label sam.verification.run=sam-verify-1792736722451-d9f51bed --init --network container:sam-verify-1792736722451-d9f51bed-pg --mount type=bind,src=/tmp/sam-verify-BuhWN0/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=030ac40d4e3191e65a8d1e79d7411e5067da9ed0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 143; signal: none; 2026-10-23T06:27:51.012Z → 2026-10-23T06:28:02.358Z


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

2026-10-23T06:28:02.360Z → 2026-10-23T06:28:03.539Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736722451-d9f51bed-pg
```
Exit: 0; signal: none; 2026-10-23T06:28:02.362Z → 2026-10-23T06:28:02.381Z

```sh
docker rm --force --volumes sam-verify-1792736722451-d9f51bed-pg
```
Exit: 0; signal: none; 2026-10-23T06:28:02.381Z → 2026-10-23T06:28:03.032Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736722451-d9f51bed-job-1
```
Exit: 1; signal: none; 2026-10-23T06:28:03.032Z → 2026-10-23T06:28:03.064Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736722451-d9f51bed-job-2
```
Exit: 1; signal: none; 2026-10-23T06:28:03.064Z → 2026-10-23T06:28:03.102Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736722451-d9f51bed-job-3
```
Exit: 1; signal: none; 2026-10-23T06:28:03.102Z → 2026-10-23T06:28:03.154Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736722451-d9f51bed-job-4
```
Exit: 1; signal: none; 2026-10-23T06:28:03.154Z → 2026-10-23T06:28:03.208Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736722451-d9f51bed-job-5
```
Exit: 1; signal: none; 2026-10-23T06:28:03.208Z → 2026-10-23T06:28:03.234Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736722451-d9f51bed-job-6
```
Exit: 1; signal: none; 2026-10-23T06:28:03.234Z → 2026-10-23T06:28:03.262Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736722451-d9f51bed-job-7
```
Exit: 1; signal: none; 2026-10-23T06:28:03.262Z → 2026-10-23T06:28:03.289Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736722451-d9f51bed-job-8
```
Exit: 1; signal: none; 2026-10-23T06:28:03.289Z → 2026-10-23T06:28:03.315Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736722451-d9f51bed-job-9
```
Exit: 1; signal: none; 2026-10-23T06:28:03.315Z → 2026-10-23T06:28:03.346Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736722451-d9f51bed-job-10
```
Exit: 1; signal: none; 2026-10-23T06:28:03.346Z → 2026-10-23T06:28:03.375Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736722451-d9f51bed-job-11
```
Exit: 1; signal: none; 2026-10-23T06:28:03.375Z → 2026-10-23T06:28:03.402Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736722451-d9f51bed-job-12
```
Exit: 1; signal: none; 2026-10-23T06:28:03.402Z → 2026-10-23T06:28:03.438Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792736722451-d9f51bed-net
```
Exit: 0; signal: none; 2026-10-23T06:28:03.438Z → 2026-10-23T06:28:03.453Z

```sh
docker network rm sam-verify-1792736722451-d9f51bed-net
```
Exit: 0; signal: none; 2026-10-23T06:28:03.453Z → 2026-10-23T06:28:03.513Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
