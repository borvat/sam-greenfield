# Independent SAM verification

Status: **FAIL**
Source: `ffff6a872bccc890de138e926223f97a0dea7eca` (clean: true)
Started: 2026-10-23T19:30:30.730Z; completed: 2026-10-23T19:35:53.730Z

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
| render-migration-compatibility | FAIL | [log](logs/26-render-migration-compatibility.log) |
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
| shared-goal-path | NOT_RUN | not executed |
| cleanup | PASS | [log](logs/60-cleanup.log) |

## Unresolved defects / blockers

- render-migration-compatibility: exit 143 (see logs/26-render-migration-compatibility.log)
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

2026-10-23T19:30:30.731Z → 2026-10-23T19:30:30.991Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T19:30:30.735Z → 2026-10-23T19:30:30.741Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T19:30:30.741Z → 2026-10-23T19:30:30.743Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T19:30:30.743Z → 2026-10-23T19:30:30.749Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T19:30:30.749Z → 2026-10-23T19:30:30.763Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T19:30:30.763Z → 2026-10-23T19:30:30.793Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T19:30:30.793Z → 2026-10-23T19:30:30.856Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T19:30:30.856Z → 2026-10-23T19:30:30.930Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T19:30:30.930Z → 2026-10-23T19:30:30.975Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T19:30:30.975Z → 2026-10-23T19:30:30.977Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T19:30:30.977Z → 2026-10-23T19:30:30.989Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T19:30:30.989Z → 2026-10-23T19:30:30.991Z


### snapshot — PASS

2026-10-23T19:30:30.992Z → 2026-10-23T19:30:31.068Z

```sh
git archive --format=tar --output /tmp/sam-verify-OGvcfE/source.tar ffff6a872bccc890de138e926223f97a0dea7eca
```
Exit: 0; signal: none; 2026-10-23T19:30:30.993Z → 2026-10-23T19:30:31.025Z

```sh
tar -xf /tmp/sam-verify-OGvcfE/source.tar -C /tmp/sam-verify-OGvcfE/source
```
Exit: 0; signal: none; 2026-10-23T19:30:31.025Z → 2026-10-23T19:30:31.035Z


### images — PASS

2026-10-23T19:30:31.069Z → 2026-10-23T19:30:31.184Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T19:30:31.070Z → 2026-10-23T19:30:31.084Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T19:30:31.084Z → 2026-10-23T19:30:31.098Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T19:30:31.098Z → 2026-10-23T19:30:31.114Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T19:30:31.114Z → 2026-10-23T19:30:31.129Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T19:30:31.129Z → 2026-10-23T19:30:31.144Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T19:30:31.144Z → 2026-10-23T19:30:31.156Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T19:30:31.156Z → 2026-10-23T19:30:31.169Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T19:30:31.169Z → 2026-10-23T19:30:31.184Z


### isolated-postgres — PASS

2026-10-23T19:30:31.186Z → 2026-10-23T19:30:36.238Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792783830729-6f7e55ec sam-verify-1792783830729-6f7e55ec-net
```
Exit: 0; signal: none; 2026-10-23T19:30:31.186Z → 2026-10-23T19:30:31.214Z

```sh
docker run --detach --name sam-verify-1792783830729-6f7e55ec-pg --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --network sam-verify-1792783830729-6f7e55ec-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T19:30:31.214Z → 2026-10-23T19:30:34.465Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792783830729-6f7e55ec-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T19:30:34.465Z → 2026-10-23T19:30:34.564Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792783830729-6f7e55ec-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T19:30:35.065Z → 2026-10-23T19:30:35.167Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792783830729-6f7e55ec-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T19:30:35.668Z → 2026-10-23T19:30:35.752Z

```sh
docker exec sam-verify-1792783830729-6f7e55ec-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T19:30:35.752Z → 2026-10-23T19:30:35.886Z

```sh
docker exec sam-verify-1792783830729-6f7e55ec-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T19:30:35.886Z → 2026-10-23T19:30:36.059Z

```sh
docker exec sam-verify-1792783830729-6f7e55ec-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T19:30:36.059Z → 2026-10-23T19:30:36.238Z


### node-dependencies — PASS

2026-10-23T19:30:36.243Z → 2026-10-23T19:30:49.494Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-1 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T19:30:36.244Z → 2026-10-23T19:30:49.494Z


### python-dependencies — PASS

2026-10-23T19:30:49.495Z → 2026-10-23T19:30:52.895Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-2 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-OGvcfE/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T19:30:49.496Z → 2026-10-23T19:30:52.895Z


### runtime-versions — PASS

2026-10-23T19:30:52.896Z → 2026-10-23T19:31:23.202Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-3 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T19:30:52.897Z → 2026-10-23T19:31:01.362Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-4 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T19:31:01.362Z → 2026-10-23T19:31:10.928Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-5 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T19:31:10.928Z → 2026-10-23T19:31:22.230Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-6 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T19:31:22.230Z → 2026-10-23T19:31:23.116Z

```sh
docker exec sam-verify-1792783830729-6f7e55ec-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T19:31:23.116Z → 2026-10-23T19:31:23.202Z


### workflow-tool — PASS

2026-10-23T19:31:23.204Z → 2026-10-23T19:31:23.789Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-OGvcfE/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T19:31:23.205Z → 2026-10-23T19:31:23.725Z

```sh
tar -xzf /tmp/sam-verify-OGvcfE/actionlint.tar.gz -C /tmp/sam-verify-OGvcfE actionlint
```
Exit: 0; signal: none; 2026-10-23T19:31:23.729Z → 2026-10-23T19:31:23.786Z

```sh
/tmp/sam-verify-OGvcfE/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T19:31:23.786Z → 2026-10-23T19:31:23.789Z


### workflow-validation — PASS

2026-10-23T19:31:23.790Z → 2026-10-23T19:31:23.794Z

```sh
/tmp/sam-verify-OGvcfE/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T19:31:23.791Z → 2026-10-23T19:31:23.794Z


### configuration-validation — PASS

2026-10-23T19:31:23.795Z → 2026-10-23T19:31:57.193Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T19:31:23.796Z → 2026-10-23T19:31:24.004Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T19:31:24.004Z → 2026-10-23T19:31:24.073Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T19:31:24.074Z → 2026-10-23T19:31:24.150Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T19:31:24.150Z → 2026-10-23T19:31:24.230Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T19:31:24.230Z → 2026-10-23T19:31:24.320Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-7 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T19:31:24.320Z → 2026-10-23T19:31:36.268Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-8 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T19:31:36.269Z → 2026-10-23T19:31:46.233Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-9 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T19:31:46.233Z → 2026-10-23T19:31:57.193Z


### typecheck — PASS

2026-10-23T19:31:57.195Z → 2026-10-23T19:32:13.996Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-10 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T19:31:57.197Z → 2026-10-23T19:32:13.996Z


### regression — PASS

2026-10-23T19:32:13.997Z → 2026-10-23T19:32:52.303Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-11 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ffff6a872bccc890de138e926223f97a0dea7eca node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T19:32:13.999Z → 2026-10-23T19:32:52.302Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T19:32:24.649Z → 2026-10-23T19:32:25.173Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T19:32:25.192Z → 2026-10-23T19:32:25.667Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T19:32:25.686Z → 2026-10-23T19:32:26.148Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T19:32:26.165Z → 2026-10-23T19:32:26.614Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T19:32:26.633Z → 2026-10-23T19:32:27.091Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T19:32:27.111Z → 2026-10-23T19:32:27.506Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T19:32:27.527Z → 2026-10-23T19:32:28.052Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T19:32:28.069Z → 2026-10-23T19:32:28.547Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T19:32:28.565Z → 2026-10-23T19:32:29.064Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T19:32:29.083Z → 2026-10-23T19:32:29.516Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T19:32:29.534Z → 2026-10-23T19:32:29.941Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T19:32:29.966Z → 2026-10-23T19:32:30.335Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T19:32:30.355Z → 2026-10-23T19:32:30.877Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T19:32:30.894Z → 2026-10-23T19:32:31.290Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T19:32:31.307Z → 2026-10-23T19:32:31.709Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T19:32:31.725Z → 2026-10-23T19:32:32.178Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T19:32:32.198Z → 2026-10-23T19:32:32.637Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T19:32:32.654Z → 2026-10-23T19:32:33.079Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T19:32:33.097Z → 2026-10-23T19:32:33.534Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T19:32:33.551Z → 2026-10-23T19:32:33.928Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T19:32:33.946Z → 2026-10-23T19:32:34.301Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T19:32:34.319Z → 2026-10-23T19:32:34.619Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T19:32:34.636Z → 2026-10-23T19:32:35.152Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T19:32:35.171Z → 2026-10-23T19:32:36.529Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T19:32:36.546Z → 2026-10-23T19:32:37.113Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T19:32:37.131Z → 2026-10-23T19:32:37.507Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T19:32:37.524Z → 2026-10-23T19:32:38.104Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T19:32:38.120Z → 2026-10-23T19:32:38.952Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T19:32:38.969Z → 2026-10-23T19:32:39.402Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T19:32:39.419Z → 2026-10-23T19:32:39.858Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T19:32:39.878Z → 2026-10-23T19:32:40.576Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T19:32:40.595Z → 2026-10-23T19:32:41.028Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T19:32:41.049Z → 2026-10-23T19:32:41.491Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T19:32:41.510Z → 2026-10-23T19:32:41.996Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T19:32:42.013Z → 2026-10-23T19:32:42.420Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T19:32:42.437Z → 2026-10-23T19:32:43.054Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T19:32:43.071Z → 2026-10-23T19:32:43.502Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T19:32:43.521Z → 2026-10-23T19:32:43.986Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T19:32:44.004Z → 2026-10-23T19:32:44.458Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T19:32:44.475Z → 2026-10-23T19:32:44.917Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T19:32:44.934Z → 2026-10-23T19:32:45.877Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T19:32:45.896Z → 2026-10-23T19:32:46.222Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T19:32:46.239Z → 2026-10-23T19:32:47.599Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T19:32:47.621Z → 2026-10-23T19:32:48.111Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T19:32:48.128Z → 2026-10-23T19:32:48.678Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T19:32:48.695Z → 2026-10-23T19:32:49.122Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T19:32:49.139Z → 2026-10-23T19:32:49.925Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T19:32:49.942Z → 2026-10-23T19:32:50.606Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T19:32:50.635Z → 2026-10-23T19:32:51.440Z

### core-reliability — PASS

2026-10-23T19:32:52.305Z → 2026-10-23T19:33:34.053Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-12 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ffff6a872bccc890de138e926223f97a0dea7eca node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T19:32:52.306Z → 2026-10-23T19:33:34.052Z

- tests/core/reliability.ts: PASS; 2026-10-23T19:33:01.190Z → 2026-10-23T19:33:06.517Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T19:33:06.542Z → 2026-10-23T19:33:07.270Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T19:33:07.288Z → 2026-10-23T19:33:07.797Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T19:33:07.818Z → 2026-10-23T19:33:08.396Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T19:33:08.416Z → 2026-10-23T19:33:10.224Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T19:33:10.246Z → 2026-10-23T19:33:10.717Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T19:33:10.736Z → 2026-10-23T19:33:12.388Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T19:33:12.407Z → 2026-10-23T19:33:13.052Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T19:33:13.070Z → 2026-10-23T19:33:14.510Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T19:33:14.527Z → 2026-10-23T19:33:18.687Z
- tests/core/evidenceTransforms.ts: PASS; 2026-10-23T19:33:18.708Z → 2026-10-23T19:33:19.334Z
- tests/core/evidenceIntegration.ts: PASS; 2026-10-23T19:33:19.353Z → 2026-10-23T19:33:31.951Z
- tests/core/sourceContracts.ts: PASS; 2026-10-23T19:33:31.982Z → 2026-10-23T19:33:32.763Z
- tests/core/evidenceChaining.ts: PASS; 2026-10-23T19:33:32.783Z → 2026-10-23T19:33:33.237Z

### provider-auth — PASS

2026-10-23T19:33:34.054Z → 2026-10-23T19:33:45.058Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-13 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ffff6a872bccc890de138e926223f97a0dea7eca node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T19:33:34.056Z → 2026-10-23T19:33:45.058Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T19:33:43.888Z → 2026-10-23T19:33:44.278Z

### postgres-tls — PASS

2026-10-23T19:33:45.060Z → 2026-10-23T19:33:57.429Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-14 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ffff6a872bccc890de138e926223f97a0dea7eca node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T19:33:45.061Z → 2026-10-23T19:33:57.429Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T19:33:55.769Z → 2026-10-23T19:33:56.626Z

### contracts — PASS

2026-10-23T19:33:57.431Z → 2026-10-23T19:34:07.795Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-15 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ffff6a872bccc890de138e926223f97a0dea7eca node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T19:33:57.432Z → 2026-10-23T19:34:07.795Z

- tests/release/contracts.ts: PASS; 2026-10-23T19:34:06.379Z → 2026-10-23T19:34:07.082Z

### synthetic-pilot — PASS

2026-10-23T19:34:07.798Z → 2026-10-23T19:34:20.059Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-16 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ffff6a872bccc890de138e926223f97a0dea7eca node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T19:34:07.799Z → 2026-10-23T19:34:20.059Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T19:34:18.175Z → 2026-10-23T19:34:19.078Z

### managed-schema — PASS

2026-10-23T19:34:20.062Z → 2026-10-23T19:34:32.340Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-17 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ffff6a872bccc890de138e926223f97a0dea7eca node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T19:34:20.064Z → 2026-10-23T19:34:32.340Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T19:34:31.267Z → 2026-10-23T19:34:31.537Z

### local-bundle — PASS

2026-10-23T19:34:32.343Z → 2026-10-23T19:34:43.604Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-18 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ffff6a872bccc890de138e926223f97a0dea7eca node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T19:34:32.344Z → 2026-10-23T19:34:43.604Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T19:34:42.344Z → 2026-10-23T19:34:42.774Z

### closed-setup — PASS

2026-10-23T19:34:43.607Z → 2026-10-23T19:34:55.274Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-19 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ffff6a872bccc890de138e926223f97a0dea7eca node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T19:34:43.608Z → 2026-10-23T19:34:55.273Z

- tests/release/setup.ts: PASS; 2026-10-23T19:34:53.799Z → 2026-10-23T19:34:54.395Z

### database-contract — PASS

2026-10-23T19:34:55.276Z → 2026-10-23T19:35:06.216Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-20 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ffff6a872bccc890de138e926223f97a0dea7eca node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T19:34:55.278Z → 2026-10-23T19:35:06.216Z

- tests/release/database_check.ts: PASS; 2026-10-23T19:35:04.902Z → 2026-10-23T19:35:05.326Z

### prelaunch-gate — PASS

2026-10-23T19:35:06.219Z → 2026-10-23T19:35:17.066Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-21 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ffff6a872bccc890de138e926223f97a0dea7eca node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T19:35:06.221Z → 2026-10-23T19:35:17.066Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T19:35:15.828Z → 2026-10-23T19:35:16.235Z

### service-provisioning — PASS

2026-10-23T19:35:17.069Z → 2026-10-23T19:35:31.375Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-22 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ffff6a872bccc890de138e926223f97a0dea7eca node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T19:35:17.070Z → 2026-10-23T19:35:31.374Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T19:35:27.464Z → 2026-10-23T19:35:30.468Z

### operator-provisioning — PASS

2026-10-23T19:35:31.377Z → 2026-10-23T19:35:45.900Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-23 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ffff6a872bccc890de138e926223f97a0dea7eca node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T19:35:31.379Z → 2026-10-23T19:35:45.900Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T19:35:41.137Z → 2026-10-23T19:35:45.117Z

### provisioning-backup-recovery — PASS

2026-10-23T19:35:45.903Z → 2026-10-23T19:35:49.461Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792783830729-6f7e55ec-pg sam-verify-1792783830729-6f7e55ec
```
Exit: 0; signal: none; 2026-10-23T19:35:45.905Z → 2026-10-23T19:35:49.461Z


### render-migration-compatibility — FAIL

2026-10-23T19:35:49.463Z → 2026-10-23T19:35:52.641Z

```sh
docker run --rm --name sam-verify-1792783830729-6f7e55ec-job-24 --label sam.verification.run=sam-verify-1792783830729-6f7e55ec --init --network container:sam-verify-1792783830729-6f7e55ec-pg --mount type=bind,src=/tmp/sam-verify-OGvcfE/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ffff6a872bccc890de138e926223f97a0dea7eca node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 143; signal: none; 2026-10-23T19:35:49.465Z → 2026-10-23T19:35:52.641Z


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


### shared-goal-path — NOT_RUN

not started → not completed


### cleanup — PASS

2026-10-23T19:35:52.643Z → 2026-10-23T19:35:53.727Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-pg
```
Exit: 0; signal: none; 2026-10-23T19:35:52.645Z → 2026-10-23T19:35:52.659Z

```sh
docker rm --force --volumes sam-verify-1792783830729-6f7e55ec-pg
```
Exit: 0; signal: none; 2026-10-23T19:35:52.659Z → 2026-10-23T19:35:53.100Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-1
```
Exit: 1; signal: none; 2026-10-23T19:35:53.100Z → 2026-10-23T19:35:53.123Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-2
```
Exit: 1; signal: none; 2026-10-23T19:35:53.124Z → 2026-10-23T19:35:53.146Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-3
```
Exit: 1; signal: none; 2026-10-23T19:35:53.146Z → 2026-10-23T19:35:53.174Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-4
```
Exit: 1; signal: none; 2026-10-23T19:35:53.174Z → 2026-10-23T19:35:53.197Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-5
```
Exit: 1; signal: none; 2026-10-23T19:35:53.198Z → 2026-10-23T19:35:53.218Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-6
```
Exit: 1; signal: none; 2026-10-23T19:35:53.218Z → 2026-10-23T19:35:53.239Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-7
```
Exit: 1; signal: none; 2026-10-23T19:35:53.239Z → 2026-10-23T19:35:53.260Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-8
```
Exit: 1; signal: none; 2026-10-23T19:35:53.260Z → 2026-10-23T19:35:53.281Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-9
```
Exit: 1; signal: none; 2026-10-23T19:35:53.281Z → 2026-10-23T19:35:53.306Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-10
```
Exit: 1; signal: none; 2026-10-23T19:35:53.306Z → 2026-10-23T19:35:53.329Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-11
```
Exit: 1; signal: none; 2026-10-23T19:35:53.329Z → 2026-10-23T19:35:53.350Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-12
```
Exit: 1; signal: none; 2026-10-23T19:35:53.350Z → 2026-10-23T19:35:53.369Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-13
```
Exit: 1; signal: none; 2026-10-23T19:35:53.370Z → 2026-10-23T19:35:53.392Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-14
```
Exit: 1; signal: none; 2026-10-23T19:35:53.392Z → 2026-10-23T19:35:53.415Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-15
```
Exit: 1; signal: none; 2026-10-23T19:35:53.415Z → 2026-10-23T19:35:53.437Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-16
```
Exit: 1; signal: none; 2026-10-23T19:35:53.437Z → 2026-10-23T19:35:53.459Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-17
```
Exit: 1; signal: none; 2026-10-23T19:35:53.459Z → 2026-10-23T19:35:53.484Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-18
```
Exit: 1; signal: none; 2026-10-23T19:35:53.484Z → 2026-10-23T19:35:53.505Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-19
```
Exit: 1; signal: none; 2026-10-23T19:35:53.505Z → 2026-10-23T19:35:53.527Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-20
```
Exit: 1; signal: none; 2026-10-23T19:35:53.527Z → 2026-10-23T19:35:53.548Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-21
```
Exit: 1; signal: none; 2026-10-23T19:35:53.548Z → 2026-10-23T19:35:53.570Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-22
```
Exit: 1; signal: none; 2026-10-23T19:35:53.570Z → 2026-10-23T19:35:53.593Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-23
```
Exit: 1; signal: none; 2026-10-23T19:35:53.593Z → 2026-10-23T19:35:53.619Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-job-24
```
Exit: 1; signal: none; 2026-10-23T19:35:53.619Z → 2026-10-23T19:35:53.640Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792783830729-6f7e55ec-net
```
Exit: 0; signal: none; 2026-10-23T19:35:53.640Z → 2026-10-23T19:35:53.655Z

```sh
docker network rm sam-verify-1792783830729-6f7e55ec-net
```
Exit: 0; signal: none; 2026-10-23T19:35:53.655Z → 2026-10-23T19:35:53.701Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
