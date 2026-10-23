# Independent SAM verification

Status: **FAIL**
Source: `d5c3ad27320db404721793f56266919bd8a5fa0a` (clean: true)
Started: 2026-10-23T06:22:03.883Z; completed: 2026-10-23T06:25:08.393Z

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
| postgres-tls | FAIL | [log](logs/15-postgres-tls.log) |
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

- postgres-tls: exit 143 (see logs/15-postgres-tls.log)
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

2026-10-23T06:22:03.884Z → 2026-10-23T06:22:04.188Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T06:22:03.888Z → 2026-10-23T06:22:03.893Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T06:22:03.893Z → 2026-10-23T06:22:03.896Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T06:22:03.896Z → 2026-10-23T06:22:03.902Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T06:22:03.902Z → 2026-10-23T06:22:03.917Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T06:22:03.917Z → 2026-10-23T06:22:03.938Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T06:22:03.938Z → 2026-10-23T06:22:04.017Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T06:22:04.017Z → 2026-10-23T06:22:04.103Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T06:22:04.103Z → 2026-10-23T06:22:04.172Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T06:22:04.172Z → 2026-10-23T06:22:04.175Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T06:22:04.175Z → 2026-10-23T06:22:04.186Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T06:22:04.186Z → 2026-10-23T06:22:04.188Z


### snapshot — PASS

2026-10-23T06:22:04.189Z → 2026-10-23T06:22:04.260Z

```sh
git archive --format=tar --output /tmp/sam-verify-g3hjdg/source.tar d5c3ad27320db404721793f56266919bd8a5fa0a
```
Exit: 0; signal: none; 2026-10-23T06:22:04.190Z → 2026-10-23T06:22:04.220Z

```sh
tar -xf /tmp/sam-verify-g3hjdg/source.tar -C /tmp/sam-verify-g3hjdg/source
```
Exit: 0; signal: none; 2026-10-23T06:22:04.220Z → 2026-10-23T06:22:04.229Z


### images — PASS

2026-10-23T06:22:04.261Z → 2026-10-23T06:22:04.394Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T06:22:04.261Z → 2026-10-23T06:22:04.278Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T06:22:04.278Z → 2026-10-23T06:22:04.292Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T06:22:04.292Z → 2026-10-23T06:22:04.313Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T06:22:04.313Z → 2026-10-23T06:22:04.329Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T06:22:04.329Z → 2026-10-23T06:22:04.342Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T06:22:04.342Z → 2026-10-23T06:22:04.357Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T06:22:04.357Z → 2026-10-23T06:22:04.370Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T06:22:04.370Z → 2026-10-23T06:22:04.394Z


### isolated-postgres — PASS

2026-10-23T06:22:04.395Z → 2026-10-23T06:22:10.640Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792736523883-e182ab2e sam-verify-1792736523883-e182ab2e-net
```
Exit: 0; signal: none; 2026-10-23T06:22:04.396Z → 2026-10-23T06:22:04.432Z

```sh
docker run --detach --name sam-verify-1792736523883-e182ab2e-pg --label sam.verification.run=sam-verify-1792736523883-e182ab2e --network sam-verify-1792736523883-e182ab2e-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T06:22:04.432Z → 2026-10-23T06:22:08.240Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792736523883-e182ab2e-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T06:22:08.240Z → 2026-10-23T06:22:08.378Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792736523883-e182ab2e-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T06:22:08.879Z → 2026-10-23T06:22:08.999Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792736523883-e182ab2e-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T06:22:09.500Z → 2026-10-23T06:22:09.625Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792736523883-e182ab2e-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T06:22:10.125Z → 2026-10-23T06:22:10.230Z

```sh
docker exec sam-verify-1792736523883-e182ab2e-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T06:22:10.230Z → 2026-10-23T06:22:10.383Z

```sh
docker exec sam-verify-1792736523883-e182ab2e-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T06:22:10.383Z → 2026-10-23T06:22:10.511Z

```sh
docker exec sam-verify-1792736523883-e182ab2e-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T06:22:10.511Z → 2026-10-23T06:22:10.640Z


### node-dependencies — PASS

2026-10-23T06:22:10.647Z → 2026-10-23T06:22:29.625Z

```sh
docker run --rm --name sam-verify-1792736523883-e182ab2e-job-1 --label sam.verification.run=sam-verify-1792736523883-e182ab2e --init --mount type=bind,src=/tmp/sam-verify-g3hjdg/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T06:22:10.650Z → 2026-10-23T06:22:29.625Z


### python-dependencies — PASS

2026-10-23T06:22:29.627Z → 2026-10-23T06:22:33.285Z

```sh
docker run --rm --name sam-verify-1792736523883-e182ab2e-job-2 --label sam.verification.run=sam-verify-1792736523883-e182ab2e --init --mount type=bind,src=/tmp/sam-verify-g3hjdg/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-g3hjdg/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T06:22:29.628Z → 2026-10-23T06:22:33.285Z


### runtime-versions — PASS

2026-10-23T06:22:33.286Z → 2026-10-23T06:23:07.361Z

```sh
docker run --rm --name sam-verify-1792736523883-e182ab2e-job-3 --label sam.verification.run=sam-verify-1792736523883-e182ab2e --init --network container:sam-verify-1792736523883-e182ab2e-pg --mount type=bind,src=/tmp/sam-verify-g3hjdg/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T06:22:33.287Z → 2026-10-23T06:22:43.611Z

```sh
docker run --rm --name sam-verify-1792736523883-e182ab2e-job-4 --label sam.verification.run=sam-verify-1792736523883-e182ab2e --init --network container:sam-verify-1792736523883-e182ab2e-pg --mount type=bind,src=/tmp/sam-verify-g3hjdg/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T06:22:43.611Z → 2026-10-23T06:22:54.652Z

```sh
docker run --rm --name sam-verify-1792736523883-e182ab2e-job-5 --label sam.verification.run=sam-verify-1792736523883-e182ab2e --init --network container:sam-verify-1792736523883-e182ab2e-pg --mount type=bind,src=/tmp/sam-verify-g3hjdg/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T06:22:54.652Z → 2026-10-23T06:23:05.733Z

```sh
docker run --rm --name sam-verify-1792736523883-e182ab2e-job-6 --label sam.verification.run=sam-verify-1792736523883-e182ab2e --init --network container:sam-verify-1792736523883-e182ab2e-pg --mount type=bind,src=/tmp/sam-verify-g3hjdg/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T06:23:05.733Z → 2026-10-23T06:23:07.270Z

```sh
docker exec sam-verify-1792736523883-e182ab2e-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T06:23:07.271Z → 2026-10-23T06:23:07.361Z


### workflow-tool — PASS

2026-10-23T06:23:07.363Z → 2026-10-23T06:23:07.943Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-g3hjdg/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T06:23:07.364Z → 2026-10-23T06:23:07.895Z

```sh
tar -xzf /tmp/sam-verify-g3hjdg/actionlint.tar.gz -C /tmp/sam-verify-g3hjdg actionlint
```
Exit: 0; signal: none; 2026-10-23T06:23:07.898Z → 2026-10-23T06:23:07.940Z

```sh
/tmp/sam-verify-g3hjdg/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T06:23:07.940Z → 2026-10-23T06:23:07.943Z


### workflow-validation — PASS

2026-10-23T06:23:07.945Z → 2026-10-23T06:23:07.950Z

```sh
/tmp/sam-verify-g3hjdg/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T06:23:07.946Z → 2026-10-23T06:23:07.950Z


### configuration-validation — PASS

2026-10-23T06:23:07.951Z → 2026-10-23T06:23:39.006Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T06:23:07.953Z → 2026-10-23T06:23:08.178Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:23:08.178Z → 2026-10-23T06:23:08.242Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:23:08.242Z → 2026-10-23T06:23:08.312Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:23:08.312Z → 2026-10-23T06:23:08.389Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:23:08.389Z → 2026-10-23T06:23:08.468Z

```sh
docker run --rm --name sam-verify-1792736523883-e182ab2e-job-7 --label sam.verification.run=sam-verify-1792736523883-e182ab2e --init --network container:sam-verify-1792736523883-e182ab2e-pg --mount type=bind,src=/tmp/sam-verify-g3hjdg/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T06:23:08.468Z → 2026-10-23T06:23:20.790Z

```sh
docker run --rm --name sam-verify-1792736523883-e182ab2e-job-8 --label sam.verification.run=sam-verify-1792736523883-e182ab2e --init --network container:sam-verify-1792736523883-e182ab2e-pg --mount type=bind,src=/tmp/sam-verify-g3hjdg/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T06:23:20.790Z → 2026-10-23T06:23:30.114Z

```sh
docker run --rm --name sam-verify-1792736523883-e182ab2e-job-9 --label sam.verification.run=sam-verify-1792736523883-e182ab2e --init --network container:sam-verify-1792736523883-e182ab2e-pg --mount type=bind,src=/tmp/sam-verify-g3hjdg/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T06:23:30.114Z → 2026-10-23T06:23:39.006Z


### typecheck — PASS

2026-10-23T06:23:39.007Z → 2026-10-23T06:23:53.334Z

```sh
docker run --rm --name sam-verify-1792736523883-e182ab2e-job-10 --label sam.verification.run=sam-verify-1792736523883-e182ab2e --init --network container:sam-verify-1792736523883-e182ab2e-pg --mount type=bind,src=/tmp/sam-verify-g3hjdg/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T06:23:39.009Z → 2026-10-23T06:23:53.334Z


### regression — PASS

2026-10-23T06:23:53.336Z → 2026-10-23T06:24:31.667Z

```sh
docker run --rm --name sam-verify-1792736523883-e182ab2e-job-11 --label sam.verification.run=sam-verify-1792736523883-e182ab2e --init --network container:sam-verify-1792736523883-e182ab2e-pg --mount type=bind,src=/tmp/sam-verify-g3hjdg/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=d5c3ad27320db404721793f56266919bd8a5fa0a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T06:23:53.338Z → 2026-10-23T06:24:31.666Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T06:23:58.535Z → 2026-10-23T06:23:59.113Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T06:23:59.142Z → 2026-10-23T06:23:59.621Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T06:23:59.648Z → 2026-10-23T06:24:00.189Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T06:24:00.207Z → 2026-10-23T06:24:00.701Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T06:24:00.717Z → 2026-10-23T06:24:01.160Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T06:24:01.181Z → 2026-10-23T06:24:01.571Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T06:24:01.591Z → 2026-10-23T06:24:02.143Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T06:24:02.163Z → 2026-10-23T06:24:02.654Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T06:24:02.674Z → 2026-10-23T06:24:03.180Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T06:24:03.200Z → 2026-10-23T06:24:03.633Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T06:24:03.652Z → 2026-10-23T06:24:04.106Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T06:24:04.128Z → 2026-10-23T06:24:04.462Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T06:24:04.479Z → 2026-10-23T06:24:05.034Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T06:24:05.052Z → 2026-10-23T06:24:05.636Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T06:24:05.652Z → 2026-10-23T06:24:06.108Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T06:24:06.129Z → 2026-10-23T06:24:06.696Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T06:24:06.719Z → 2026-10-23T06:24:07.260Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T06:24:07.285Z → 2026-10-23T06:24:07.748Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T06:24:07.774Z → 2026-10-23T06:24:08.643Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T06:24:08.661Z → 2026-10-23T06:24:09.063Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T06:24:09.081Z → 2026-10-23T06:24:09.458Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T06:24:09.481Z → 2026-10-23T06:24:09.798Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T06:24:09.828Z → 2026-10-23T06:24:10.387Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T06:24:10.405Z → 2026-10-23T06:24:12.015Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T06:24:12.038Z → 2026-10-23T06:24:12.657Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T06:24:12.679Z → 2026-10-23T06:24:13.236Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T06:24:13.259Z → 2026-10-23T06:24:14.005Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T06:24:14.023Z → 2026-10-23T06:24:14.943Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T06:24:14.962Z → 2026-10-23T06:24:15.497Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T06:24:15.514Z → 2026-10-23T06:24:15.982Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T06:24:16.002Z → 2026-10-23T06:24:16.884Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T06:24:16.901Z → 2026-10-23T06:24:17.430Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T06:24:17.453Z → 2026-10-23T06:24:18.032Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T06:24:18.051Z → 2026-10-23T06:24:18.528Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T06:24:18.547Z → 2026-10-23T06:24:19.207Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T06:24:19.238Z → 2026-10-23T06:24:20.493Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T06:24:20.523Z → 2026-10-23T06:24:21.135Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T06:24:21.184Z → 2026-10-23T06:24:21.749Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T06:24:21.767Z → 2026-10-23T06:24:22.321Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T06:24:22.353Z → 2026-10-23T06:24:22.990Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T06:24:23.017Z → 2026-10-23T06:24:24.174Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T06:24:24.197Z → 2026-10-23T06:24:24.587Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T06:24:24.608Z → 2026-10-23T06:24:26.143Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T06:24:26.160Z → 2026-10-23T06:24:26.690Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T06:24:26.708Z → 2026-10-23T06:24:27.379Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T06:24:27.398Z → 2026-10-23T06:24:27.897Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T06:24:27.917Z → 2026-10-23T06:24:28.860Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T06:24:28.877Z → 2026-10-23T06:24:29.635Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T06:24:29.667Z → 2026-10-23T06:24:30.639Z

### core-reliability — PASS

2026-10-23T06:24:31.669Z → 2026-10-23T06:24:56.367Z

```sh
docker run --rm --name sam-verify-1792736523883-e182ab2e-job-12 --label sam.verification.run=sam-verify-1792736523883-e182ab2e --init --network container:sam-verify-1792736523883-e182ab2e-pg --mount type=bind,src=/tmp/sam-verify-g3hjdg/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=d5c3ad27320db404721793f56266919bd8a5fa0a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T06:24:31.670Z → 2026-10-23T06:24:56.367Z

- tests/core/reliability.ts: PASS; 2026-10-23T06:24:38.950Z → 2026-10-23T06:24:44.977Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T06:24:45.005Z → 2026-10-23T06:24:45.716Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T06:24:45.736Z → 2026-10-23T06:24:46.293Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T06:24:46.311Z → 2026-10-23T06:24:47.030Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T06:24:47.056Z → 2026-10-23T06:24:49.030Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T06:24:49.052Z → 2026-10-23T06:24:49.579Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T06:24:49.606Z → 2026-10-23T06:24:51.374Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T06:24:51.399Z → 2026-10-23T06:24:52.050Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T06:24:52.080Z → 2026-10-23T06:24:53.557Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T06:24:53.583Z → 2026-10-23T06:24:54.682Z
- tests/core/evidenceTransforms.ts: PASS; 2026-10-23T06:24:54.712Z → 2026-10-23T06:24:55.403Z

### provider-auth — PASS

2026-10-23T06:24:56.369Z → 2026-10-23T06:25:05.690Z

```sh
docker run --rm --name sam-verify-1792736523883-e182ab2e-job-13 --label sam.verification.run=sam-verify-1792736523883-e182ab2e --init --network container:sam-verify-1792736523883-e182ab2e-pg --mount type=bind,src=/tmp/sam-verify-g3hjdg/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=d5c3ad27320db404721793f56266919bd8a5fa0a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T06:24:56.371Z → 2026-10-23T06:25:05.690Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T06:25:03.910Z → 2026-10-23T06:25:04.481Z

### postgres-tls — FAIL

2026-10-23T06:25:05.693Z → 2026-10-23T06:25:07.064Z

```sh
docker run --rm --name sam-verify-1792736523883-e182ab2e-job-14 --label sam.verification.run=sam-verify-1792736523883-e182ab2e --init --network container:sam-verify-1792736523883-e182ab2e-pg --mount type=bind,src=/tmp/sam-verify-g3hjdg/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=d5c3ad27320db404721793f56266919bd8a5fa0a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 143; signal: none; 2026-10-23T06:25:05.695Z → 2026-10-23T06:25:07.064Z


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

2026-10-23T06:25:07.067Z → 2026-10-23T06:25:08.389Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736523883-e182ab2e-pg
```
Exit: 0; signal: none; 2026-10-23T06:25:07.069Z → 2026-10-23T06:25:07.098Z

```sh
docker rm --force --volumes sam-verify-1792736523883-e182ab2e-pg
```
Exit: 0; signal: none; 2026-10-23T06:25:07.098Z → 2026-10-23T06:25:07.766Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736523883-e182ab2e-job-1
```
Exit: 1; signal: none; 2026-10-23T06:25:07.766Z → 2026-10-23T06:25:07.802Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736523883-e182ab2e-job-2
```
Exit: 1; signal: none; 2026-10-23T06:25:07.802Z → 2026-10-23T06:25:07.840Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736523883-e182ab2e-job-3
```
Exit: 1; signal: none; 2026-10-23T06:25:07.840Z → 2026-10-23T06:25:07.875Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736523883-e182ab2e-job-4
```
Exit: 1; signal: none; 2026-10-23T06:25:07.875Z → 2026-10-23T06:25:07.904Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736523883-e182ab2e-job-5
```
Exit: 1; signal: none; 2026-10-23T06:25:07.904Z → 2026-10-23T06:25:07.933Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736523883-e182ab2e-job-6
```
Exit: 1; signal: none; 2026-10-23T06:25:07.934Z → 2026-10-23T06:25:07.975Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736523883-e182ab2e-job-7
```
Exit: 1; signal: none; 2026-10-23T06:25:07.975Z → 2026-10-23T06:25:08.007Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736523883-e182ab2e-job-8
```
Exit: 1; signal: none; 2026-10-23T06:25:08.007Z → 2026-10-23T06:25:08.050Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736523883-e182ab2e-job-9
```
Exit: 1; signal: none; 2026-10-23T06:25:08.050Z → 2026-10-23T06:25:08.092Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736523883-e182ab2e-job-10
```
Exit: 1; signal: none; 2026-10-23T06:25:08.092Z → 2026-10-23T06:25:08.135Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736523883-e182ab2e-job-11
```
Exit: 1; signal: none; 2026-10-23T06:25:08.135Z → 2026-10-23T06:25:08.169Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736523883-e182ab2e-job-12
```
Exit: 1; signal: none; 2026-10-23T06:25:08.169Z → 2026-10-23T06:25:08.215Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736523883-e182ab2e-job-13
```
Exit: 1; signal: none; 2026-10-23T06:25:08.215Z → 2026-10-23T06:25:08.244Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736523883-e182ab2e-job-14
```
Exit: 1; signal: none; 2026-10-23T06:25:08.244Z → 2026-10-23T06:25:08.275Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792736523883-e182ab2e-net
```
Exit: 0; signal: none; 2026-10-23T06:25:08.275Z → 2026-10-23T06:25:08.289Z

```sh
docker network rm sam-verify-1792736523883-e182ab2e-net
```
Exit: 0; signal: none; 2026-10-23T06:25:08.289Z → 2026-10-23T06:25:08.350Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
