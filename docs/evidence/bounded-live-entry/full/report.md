# Independent SAM verification

Status: **PASS**
Source: `da0285f304d47a89eee5076e427cfe3bb179bb7d` (clean: true)
Started: 2026-10-23T15:04:05.975Z; completed: 2026-10-23T15:17:50.965Z

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
| integration-orchestration | PASS | [log](logs/30-integration-orchestration.log) |
| specialist-reasoning | PASS | [log](logs/31-specialist-reasoning.log) |
| specialist-gateway | PASS | [log](logs/32-specialist-gateway.log) |
| specialist-provenance | PASS | [log](logs/33-specialist-provenance.log) |
| specialist-learning-fairness | PASS | [log](logs/34-specialist-learning-fairness.log) |
| specialist-evaluation | PASS | [log](logs/35-specialist-evaluation.log) |
| evaluation-budget | PASS | [log](logs/36-evaluation-budget.log) |
| evaluation-adapter | PASS | [log](logs/37-evaluation-adapter.log) |
| evaluation-orchestration | PASS | [log](logs/38-evaluation-orchestration.log) |
| evaluation-independent-review | PASS | [log](logs/39-evaluation-independent-review.log) |
| evaluation-commercial-market | PASS | [log](logs/40-evaluation-commercial-market.log) |
| evaluation-commercial-profitability | PASS | [log](logs/41-evaluation-commercial-profitability.log) |
| evaluation-commercial-suppliers | PASS | [log](logs/42-evaluation-commercial-suppliers.log) |
| migration-upgrade-rollback | PASS | [log](logs/43-migration-upgrade-rollback.log) |
| specialist-restart-prepare | PASS | [log](logs/44-specialist-restart-prepare.log) |
| evaluation-restart-prepare | PASS | [log](logs/45-evaluation-restart-prepare.log) |
| postgres-restart | PASS | [log](logs/46-postgres-restart.log) |
| migration-after-restart | PASS | [log](logs/47-migration-after-restart.log) |
| specialist-restart-check | PASS | [log](logs/48-specialist-restart-check.log) |
| evaluation-restart-check | PASS | [log](logs/49-evaluation-restart-check.log) |
| phase0-migrations | PASS | [log](logs/50-phase0-migrations.log) |
| phase0-acceptance | PASS | [log](logs/51-phase0-acceptance.log) |
| phase0-postgres | PASS | [log](logs/52-phase0-postgres.log) |
| tenant-isolation | PASS | [log](logs/53-tenant-isolation.log) |
| fail-closed-security | PASS | [log](logs/54-fail-closed-security.log) |
| clean-image | PASS | [log](logs/55-clean-image.log) |
| image-contract | PASS | [log](logs/56-image-contract.log) |
| application-startup-restart | PASS | [log](logs/57-application-startup-restart.log) |
| source-integrity | PASS | [log](logs/58-source-integrity.log) |
| cleanup | PASS | [log](logs/59-cleanup.log) |

## Unresolved defects / blockers

- No required local check failed. Hosted/governance and deployment gates remain separate.

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
  "actionlint": "1.7.7\ninstalled by downloading from release page\nbuilt with go1.23.4 compiler for linux/amd64",
  "postgresExtensions": "pgcrypto|1.3\nplpgsql|1.0\nvector|0.8.7"
}
```

## Container images

- node: `node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2`; ID `sha256:eefceac94552a7e7e9da532feb53139a8630e3934b862662ce1d7cb877772c86`
- productionBase: `node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc`; ID `sha256:c79227476e31e0f5410cfc4578f1f9a59300510491f2f6f0b5eaf956dbef4986`
- postgres: `pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9`; ID `sha256:4b4956e2ab1f0aec9779dfca20366a9963a3f24c34269c3a115dd838387f0734`
- python: `python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8`; ID `sha256:b4403f3b7acf5e0700a5dd4e7ab01456d62b557a208a04f8a42d3470d93b5730`
- clean-application: `sam-verification:sam-verify-1792767845974-610f962a`; ID `sha256:075aeb2012eb65ed9d400bcce63234bfafcc07b992fcac691bcb25c21fe1bd60`

## Commands and suite outcomes

### preflight — PASS

2026-10-23T15:04:05.976Z → 2026-10-23T15:04:06.300Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T15:04:05.980Z → 2026-10-23T15:04:05.986Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T15:04:05.986Z → 2026-10-23T15:04:05.989Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T15:04:05.989Z → 2026-10-23T15:04:05.994Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T15:04:05.994Z → 2026-10-23T15:04:06.013Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T15:04:06.013Z → 2026-10-23T15:04:06.035Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T15:04:06.036Z → 2026-10-23T15:04:06.143Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T15:04:06.143Z → 2026-10-23T15:04:06.233Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T15:04:06.234Z → 2026-10-23T15:04:06.284Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T15:04:06.284Z → 2026-10-23T15:04:06.286Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T15:04:06.286Z → 2026-10-23T15:04:06.297Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T15:04:06.297Z → 2026-10-23T15:04:06.300Z


### snapshot — PASS

2026-10-23T15:04:06.301Z → 2026-10-23T15:04:06.385Z

```sh
git archive --format=tar --output /tmp/sam-verify-oQt7RL/source.tar da0285f304d47a89eee5076e427cfe3bb179bb7d
```
Exit: 0; signal: none; 2026-10-23T15:04:06.302Z → 2026-10-23T15:04:06.339Z

```sh
tar -xf /tmp/sam-verify-oQt7RL/source.tar -C /tmp/sam-verify-oQt7RL/source
```
Exit: 0; signal: none; 2026-10-23T15:04:06.339Z → 2026-10-23T15:04:06.350Z


### images — PASS

2026-10-23T15:04:06.386Z → 2026-10-23T15:04:06.534Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T15:04:06.387Z → 2026-10-23T15:04:06.432Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T15:04:06.432Z → 2026-10-23T15:04:06.449Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T15:04:06.449Z → 2026-10-23T15:04:06.463Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T15:04:06.463Z → 2026-10-23T15:04:06.479Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T15:04:06.479Z → 2026-10-23T15:04:06.492Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T15:04:06.492Z → 2026-10-23T15:04:06.506Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T15:04:06.506Z → 2026-10-23T15:04:06.520Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T15:04:06.520Z → 2026-10-23T15:04:06.534Z


### isolated-postgres — PASS

2026-10-23T15:04:06.536Z → 2026-10-23T15:04:13.894Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792767845974-610f962a sam-verify-1792767845974-610f962a-net
```
Exit: 0; signal: none; 2026-10-23T15:04:06.536Z → 2026-10-23T15:04:06.564Z

```sh
docker run --detach --name sam-verify-1792767845974-610f962a-pg --label sam.verification.run=sam-verify-1792767845974-610f962a --network sam-verify-1792767845974-610f962a-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T15:04:06.564Z → 2026-10-23T15:04:12.123Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792767845974-610f962a-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T15:04:12.123Z → 2026-10-23T15:04:12.226Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792767845974-610f962a-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T15:04:12.727Z → 2026-10-23T15:04:12.835Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792767845974-610f962a-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T15:04:13.335Z → 2026-10-23T15:04:13.432Z

```sh
docker exec sam-verify-1792767845974-610f962a-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T15:04:13.432Z → 2026-10-23T15:04:13.573Z

```sh
docker exec sam-verify-1792767845974-610f962a-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T15:04:13.573Z → 2026-10-23T15:04:13.769Z

```sh
docker exec sam-verify-1792767845974-610f962a-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T15:04:13.769Z → 2026-10-23T15:04:13.893Z


### node-dependencies — PASS

2026-10-23T15:04:13.900Z → 2026-10-23T15:04:29.441Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-1 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T15:04:13.901Z → 2026-10-23T15:04:29.441Z


### python-dependencies — PASS

2026-10-23T15:04:29.443Z → 2026-10-23T15:04:33.810Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-2 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-oQt7RL/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T15:04:29.444Z → 2026-10-23T15:04:33.810Z


### runtime-versions — PASS

2026-10-23T15:04:33.811Z → 2026-10-23T15:05:03.313Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-3 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T15:04:33.811Z → 2026-10-23T15:04:41.430Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-4 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T15:04:41.431Z → 2026-10-23T15:04:51.478Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-5 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T15:04:51.478Z → 2026-10-23T15:05:01.703Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-6 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T15:05:01.703Z → 2026-10-23T15:05:03.221Z

```sh
docker exec sam-verify-1792767845974-610f962a-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T15:05:03.221Z → 2026-10-23T15:05:03.313Z


### workflow-tool — PASS

2026-10-23T15:05:03.315Z → 2026-10-23T15:05:04.039Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-oQt7RL/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T15:05:03.316Z → 2026-10-23T15:05:03.990Z

```sh
tar -xzf /tmp/sam-verify-oQt7RL/actionlint.tar.gz -C /tmp/sam-verify-oQt7RL actionlint
```
Exit: 0; signal: none; 2026-10-23T15:05:03.992Z → 2026-10-23T15:05:04.036Z

```sh
/tmp/sam-verify-oQt7RL/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T15:05:04.036Z → 2026-10-23T15:05:04.039Z


### workflow-validation — PASS

2026-10-23T15:05:04.040Z → 2026-10-23T15:05:04.045Z

```sh
/tmp/sam-verify-oQt7RL/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T15:05:04.042Z → 2026-10-23T15:05:04.045Z


### configuration-validation — PASS

2026-10-23T15:05:04.046Z → 2026-10-23T15:05:39.488Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T15:05:04.046Z → 2026-10-23T15:05:04.271Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T15:05:04.271Z → 2026-10-23T15:05:04.336Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T15:05:04.336Z → 2026-10-23T15:05:04.406Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T15:05:04.406Z → 2026-10-23T15:05:04.476Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T15:05:04.476Z → 2026-10-23T15:05:04.548Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-7 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T15:05:04.548Z → 2026-10-23T15:05:16.880Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-8 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T15:05:16.880Z → 2026-10-23T15:05:28.108Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-9 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T15:05:28.109Z → 2026-10-23T15:05:39.488Z


### typecheck — PASS

2026-10-23T15:05:39.489Z → 2026-10-23T15:05:56.439Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-10 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T15:05:39.492Z → 2026-10-23T15:05:56.438Z


### regression — PASS

2026-10-23T15:05:56.441Z → 2026-10-23T15:06:36.062Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-11 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T15:05:56.442Z → 2026-10-23T15:06:36.061Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T15:06:05.755Z → 2026-10-23T15:06:06.405Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T15:06:06.432Z → 2026-10-23T15:06:06.995Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T15:06:07.014Z → 2026-10-23T15:06:07.543Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T15:06:07.562Z → 2026-10-23T15:06:08.061Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T15:06:08.082Z → 2026-10-23T15:06:08.526Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T15:06:08.545Z → 2026-10-23T15:06:08.959Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T15:06:08.980Z → 2026-10-23T15:06:09.509Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T15:06:09.527Z → 2026-10-23T15:06:10.033Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T15:06:10.050Z → 2026-10-23T15:06:10.564Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T15:06:10.582Z → 2026-10-23T15:06:11.091Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T15:06:11.110Z → 2026-10-23T15:06:11.553Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T15:06:11.570Z → 2026-10-23T15:06:11.906Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T15:06:11.924Z → 2026-10-23T15:06:12.440Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T15:06:12.465Z → 2026-10-23T15:06:12.867Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T15:06:12.885Z → 2026-10-23T15:06:13.273Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T15:06:13.291Z → 2026-10-23T15:06:13.773Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T15:06:13.789Z → 2026-10-23T15:06:14.283Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T15:06:14.301Z → 2026-10-23T15:06:14.798Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T15:06:14.817Z → 2026-10-23T15:06:15.264Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T15:06:15.282Z → 2026-10-23T15:06:15.685Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T15:06:15.711Z → 2026-10-23T15:06:16.106Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T15:06:16.123Z → 2026-10-23T15:06:16.445Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T15:06:16.463Z → 2026-10-23T15:06:16.937Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T15:06:16.955Z → 2026-10-23T15:06:18.472Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T15:06:18.490Z → 2026-10-23T15:06:19.068Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T15:06:19.087Z → 2026-10-23T15:06:19.471Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T15:06:19.488Z → 2026-10-23T15:06:20.094Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T15:06:20.112Z → 2026-10-23T15:06:21.043Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T15:06:21.065Z → 2026-10-23T15:06:21.786Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T15:06:21.806Z → 2026-10-23T15:06:22.282Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T15:06:22.305Z → 2026-10-23T15:06:23.281Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T15:06:23.303Z → 2026-10-23T15:06:23.933Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T15:06:23.951Z → 2026-10-23T15:06:24.523Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T15:06:24.548Z → 2026-10-23T15:06:24.994Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T15:06:25.014Z → 2026-10-23T15:06:25.472Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T15:06:25.489Z → 2026-10-23T15:06:26.113Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T15:06:26.132Z → 2026-10-23T15:06:26.737Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T15:06:26.760Z → 2026-10-23T15:06:27.258Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T15:06:27.278Z → 2026-10-23T15:06:27.794Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T15:06:27.813Z → 2026-10-23T15:06:28.298Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T15:06:28.315Z → 2026-10-23T15:06:29.314Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T15:06:29.331Z → 2026-10-23T15:06:29.692Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T15:06:29.713Z → 2026-10-23T15:06:31.087Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T15:06:31.104Z → 2026-10-23T15:06:31.631Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T15:06:31.655Z → 2026-10-23T15:06:32.263Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T15:06:32.284Z → 2026-10-23T15:06:32.736Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T15:06:32.753Z → 2026-10-23T15:06:33.594Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T15:06:33.612Z → 2026-10-23T15:06:34.313Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T15:06:34.344Z → 2026-10-23T15:06:35.125Z

### core-reliability — PASS

2026-10-23T15:06:36.065Z → 2026-10-23T15:07:13.984Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-12 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T15:06:36.066Z → 2026-10-23T15:07:13.983Z

- tests/core/reliability.ts: PASS; 2026-10-23T15:06:47.480Z → 2026-10-23T15:06:53.015Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T15:06:53.037Z → 2026-10-23T15:06:53.666Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T15:06:53.691Z → 2026-10-23T15:06:54.196Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T15:06:54.213Z → 2026-10-23T15:06:54.756Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T15:06:54.776Z → 2026-10-23T15:06:56.462Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T15:06:56.483Z → 2026-10-23T15:06:57.011Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T15:06:57.029Z → 2026-10-23T15:06:58.710Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T15:06:58.731Z → 2026-10-23T15:06:59.348Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T15:06:59.365Z → 2026-10-23T15:07:00.769Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T15:07:00.788Z → 2026-10-23T15:07:04.488Z
- tests/core/evidenceTransforms.ts: PASS; 2026-10-23T15:07:04.513Z → 2026-10-23T15:07:05.221Z
- tests/core/evidenceIntegration.ts: PASS; 2026-10-23T15:07:05.241Z → 2026-10-23T15:07:12.162Z
- tests/core/sourceContracts.ts: PASS; 2026-10-23T15:07:12.196Z → 2026-10-23T15:07:13.008Z

### provider-auth — PASS

2026-10-23T15:07:13.986Z → 2026-10-23T15:07:26.416Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-13 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T15:07:13.988Z → 2026-10-23T15:07:26.416Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T15:07:25.203Z → 2026-10-23T15:07:25.614Z

### postgres-tls — PASS

2026-10-23T15:07:26.418Z → 2026-10-23T15:07:36.877Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-14 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T15:07:26.419Z → 2026-10-23T15:07:36.877Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T15:07:35.289Z → 2026-10-23T15:07:36.113Z

### contracts — PASS

2026-10-23T15:07:36.879Z → 2026-10-23T15:07:48.643Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-15 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T15:07:36.880Z → 2026-10-23T15:07:48.643Z

- tests/release/contracts.ts: PASS; 2026-10-23T15:07:47.108Z → 2026-10-23T15:07:47.853Z

### synthetic-pilot — PASS

2026-10-23T15:07:48.645Z → 2026-10-23T15:07:59.891Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-16 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T15:07:48.647Z → 2026-10-23T15:07:59.890Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T15:07:58.245Z → 2026-10-23T15:07:59.015Z

### managed-schema — PASS

2026-10-23T15:07:59.893Z → 2026-10-23T15:08:11.586Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-17 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T15:07:59.894Z → 2026-10-23T15:08:11.586Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T15:08:10.514Z → 2026-10-23T15:08:10.784Z

### local-bundle — PASS

2026-10-23T15:08:11.588Z → 2026-10-23T15:08:22.308Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-18 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T15:08:11.589Z → 2026-10-23T15:08:22.308Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T15:08:21.063Z → 2026-10-23T15:08:21.467Z

### closed-setup — PASS

2026-10-23T15:08:22.311Z → 2026-10-23T15:08:33.184Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-19 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T15:08:22.312Z → 2026-10-23T15:08:33.184Z

- tests/release/setup.ts: PASS; 2026-10-23T15:08:31.878Z → 2026-10-23T15:08:32.410Z

### database-contract — PASS

2026-10-23T15:08:33.186Z → 2026-10-23T15:08:43.949Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-20 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T15:08:33.188Z → 2026-10-23T15:08:43.949Z

- tests/release/database_check.ts: PASS; 2026-10-23T15:08:42.794Z → 2026-10-23T15:08:43.145Z

### prelaunch-gate — PASS

2026-10-23T15:08:43.951Z → 2026-10-23T15:08:55.828Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-21 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T15:08:43.953Z → 2026-10-23T15:08:55.828Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T15:08:54.493Z → 2026-10-23T15:08:54.899Z

### service-provisioning — PASS

2026-10-23T15:08:55.830Z → 2026-10-23T15:09:10.770Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-22 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T15:08:55.831Z → 2026-10-23T15:09:10.769Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T15:09:05.998Z → 2026-10-23T15:09:09.934Z

### operator-provisioning — PASS

2026-10-23T15:09:10.772Z → 2026-10-23T15:09:25.640Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-23 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T15:09:10.774Z → 2026-10-23T15:09:25.640Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T15:09:21.168Z → 2026-10-23T15:09:24.850Z

### provisioning-backup-recovery — PASS

2026-10-23T15:09:25.642Z → 2026-10-23T15:09:29.160Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792767845974-610f962a-pg sam-verify-1792767845974-610f962a
```
Exit: 0; signal: none; 2026-10-23T15:09:25.644Z → 2026-10-23T15:09:29.160Z


### render-migration-compatibility — PASS

2026-10-23T15:09:29.163Z → 2026-10-23T15:09:42.161Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-24 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T15:09:29.165Z → 2026-10-23T15:09:42.161Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T15:09:39.866Z → 2026-10-23T15:09:41.225Z

### render-google-oauth-contracts — PASS

2026-10-23T15:09:42.163Z → 2026-10-23T15:10:02.264Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-25 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-23T15:09:42.167Z → 2026-10-23T15:10:02.264Z


### integration-migrations — PASS

2026-10-23T15:10:02.267Z → 2026-10-23T15:10:13.939Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-26 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-23T15:10:02.269Z → 2026-10-23T15:10:13.939Z

- tests/integration/migrations.ts: PASS; 2026-10-23T15:10:11.980Z → 2026-10-23T15:10:13.098Z

### integration-oauth-mcp — PASS

2026-10-23T15:10:13.943Z → 2026-10-23T15:10:26.232Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-27 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-23T15:10:13.944Z → 2026-10-23T15:10:26.232Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-23T15:10:24.628Z → 2026-10-23T15:10:25.255Z

### integration-orchestration — PASS

2026-10-23T15:10:26.235Z → 2026-10-23T15:10:44.614Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-28 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T15:10:26.238Z → 2026-10-23T15:10:44.614Z

- tests/integration/orchestration.ts: PASS; 2026-10-23T15:10:36.357Z → 2026-10-23T15:10:43.741Z

### specialist-reasoning — PASS

2026-10-23T15:10:44.616Z → 2026-10-23T15:11:58.220Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-29 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-23T15:10:44.619Z → 2026-10-23T15:11:58.220Z

- tests/specialists/acceptance.ts: PASS; 2026-10-23T15:10:53.974Z → 2026-10-23T15:11:57.181Z

### specialist-gateway — PASS

2026-10-23T15:11:58.224Z → 2026-10-23T15:12:10.377Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-30 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-23T15:11:58.226Z → 2026-10-23T15:12:10.377Z

- tests/specialists/gateway.ts: PASS; 2026-10-23T15:12:08.980Z → 2026-10-23T15:12:09.496Z

### specialist-provenance — PASS

2026-10-23T15:12:10.380Z → 2026-10-23T15:12:21.699Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-31 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-23T15:12:10.383Z → 2026-10-23T15:12:21.699Z

- tests/specialists/provenance.ts: PASS; 2026-10-23T15:12:20.435Z → 2026-10-23T15:12:20.847Z

### specialist-learning-fairness — PASS

2026-10-23T15:12:21.701Z → 2026-10-23T15:12:33.681Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-32 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-23T15:12:21.704Z → 2026-10-23T15:12:33.680Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-23T15:12:31.802Z → 2026-10-23T15:12:32.825Z

### specialist-evaluation — PASS

2026-10-23T15:12:33.685Z → 2026-10-23T15:12:46.340Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-33 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-23T15:12:33.687Z → 2026-10-23T15:12:46.340Z


### evaluation-budget — PASS

2026-10-23T15:12:46.342Z → 2026-10-23T15:13:24.838Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-34 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d --mount type=bind,source=/tmp/sam-bounded-entry-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-23T15:12:46.345Z → 2026-10-23T15:13:24.838Z

- tests/evaluation/budgets.ts: PASS; 2026-10-23T15:12:56.562Z → 2026-10-23T15:13:24.016Z

### evaluation-adapter — PASS

2026-10-23T15:13:24.840Z → 2026-10-23T15:13:37.990Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-35 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-23T15:13:24.842Z → 2026-10-23T15:13:37.990Z

- tests/evaluation/adapters.ts: PASS; 2026-10-23T15:13:35.900Z → 2026-10-23T15:13:37.077Z

### evaluation-orchestration — PASS

2026-10-23T15:13:37.993Z → 2026-10-23T15:14:15.822Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-36 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d --mount type=bind,source=/tmp/sam-bounded-entry-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T15:13:37.995Z → 2026-10-23T15:14:15.822Z

- tests/evaluation/orchestration.ts: PASS; 2026-10-23T15:13:50.234Z → 2026-10-23T15:14:14.894Z

### evaluation-independent-review — PASS

2026-10-23T15:14:15.826Z → 2026-10-23T15:14:28.832Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-37 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-23T15:14:15.829Z → 2026-10-23T15:14:28.832Z

- tests/evaluation/review.ts: PASS; 2026-10-23T15:14:27.230Z → 2026-10-23T15:14:28.021Z

### evaluation-commercial-market — PASS

2026-10-23T15:14:28.836Z → 2026-10-23T15:15:04.795Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-38 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d --mount type=bind,source=/tmp/sam-bounded-entry-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-23T15:14:28.838Z → 2026-10-23T15:15:04.795Z

- tests/evaluation/market.ts: PASS; 2026-10-23T15:14:39.405Z → 2026-10-23T15:15:03.726Z

### evaluation-commercial-profitability — PASS

2026-10-23T15:15:04.800Z → 2026-10-23T15:15:41.639Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-39 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d --mount type=bind,source=/tmp/sam-bounded-entry-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-23T15:15:04.803Z → 2026-10-23T15:15:41.639Z

- tests/evaluation/profitability.ts: PASS; 2026-10-23T15:15:15.718Z → 2026-10-23T15:15:40.865Z

### evaluation-commercial-suppliers — PASS

2026-10-23T15:15:41.644Z → 2026-10-23T15:16:18.118Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-40 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d --mount type=bind,source=/tmp/sam-bounded-entry-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-23T15:15:41.648Z → 2026-10-23T15:16:18.117Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-23T15:15:51.783Z → 2026-10-23T15:16:17.209Z

### migration-upgrade-rollback — PASS

2026-10-23T15:16:18.124Z → 2026-10-23T15:16:29.700Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-41 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-23T15:16:18.129Z → 2026-10-23T15:16:29.700Z


### specialist-restart-prepare — PASS

2026-10-23T15:16:29.706Z → 2026-10-23T15:16:40.836Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-42 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T15:16:29.711Z → 2026-10-23T15:16:40.836Z


### evaluation-restart-prepare — PASS

2026-10-23T15:16:40.844Z → 2026-10-23T15:16:52.434Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-43 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=da0285f304d47a89eee5076e427cfe3bb179bb7d node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T15:16:40.852Z → 2026-10-23T15:16:52.434Z


### postgres-restart — PASS

2026-10-23T15:16:52.440Z → 2026-10-23T15:16:52.847Z

```sh
docker restart --time 10 sam-verify-1792767845974-610f962a-pg
```
Exit: 0; signal: none; 2026-10-23T15:16:52.444Z → 2026-10-23T15:16:52.750Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792767845974-610f962a-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T15:16:52.750Z → 2026-10-23T15:16:52.847Z


### migration-after-restart — PASS

2026-10-23T15:16:52.853Z → 2026-10-23T15:17:03.809Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-44 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-23T15:16:52.857Z → 2026-10-23T15:17:03.809Z


### specialist-restart-check — PASS

2026-10-23T15:17:03.815Z → 2026-10-23T15:17:15.034Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-45 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T15:17:03.820Z → 2026-10-23T15:17:15.033Z


### evaluation-restart-check — PASS

2026-10-23T15:17:15.040Z → 2026-10-23T15:17:27.757Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-46 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T15:17:15.045Z → 2026-10-23T15:17:27.757Z


### phase0-migrations — PASS

2026-10-23T15:17:27.764Z → 2026-10-23T15:17:28.461Z

```sh
docker cp /tmp/sam-verify-oQt7RL/source/packages/db/migrations sam-verify-1792767845974-610f962a-pg:/migrations
```
Exit: 0; signal: none; 2026-10-23T15:17:27.768Z → 2026-10-23T15:17:27.784Z

```sh
docker exec sam-verify-1792767845974-610f962a-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-23T15:17:27.784Z → 2026-10-23T15:17:28.373Z

```sh
docker exec sam-verify-1792767845974-610f962a-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-23T15:17:28.373Z → 2026-10-23T15:17:28.461Z


### phase0-acceptance — PASS

2026-10-23T15:17:28.467Z → 2026-10-23T15:17:30.795Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-47 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-oQt7RL/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-23T15:17:28.472Z → 2026-10-23T15:17:30.795Z


### phase0-postgres — PASS

2026-10-23T15:17:30.803Z → 2026-10-23T15:17:32.770Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-48 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-oQt7RL/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-23T15:17:30.809Z → 2026-10-23T15:17:32.770Z


### tenant-isolation — PASS

2026-10-23T15:17:32.778Z → 2026-10-23T15:17:34.301Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-49 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-oQt7RL/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-23T15:17:32.784Z → 2026-10-23T15:17:34.301Z


### fail-closed-security — PASS

2026-10-23T15:17:34.308Z → 2026-10-23T15:17:35.611Z

```sh
docker run --rm --name sam-verify-1792767845974-610f962a-job-50 --label sam.verification.run=sam-verify-1792767845974-610f962a --init --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-oQt7RL/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-23T15:17:34.313Z → 2026-10-23T15:17:35.611Z


### clean-image — PASS

2026-10-23T15:17:35.618Z → 2026-10-23T15:17:43.282Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792767845974-610f962a Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-23T15:17:35.622Z → 2026-10-23T15:17:43.282Z


### image-contract — PASS

2026-10-23T15:17:43.288Z → 2026-10-23T15:17:43.307Z

```sh
docker image inspect sam-verification:sam-verify-1792767845974-610f962a
```
Exit: 0; signal: none; 2026-10-23T15:17:43.293Z → 2026-10-23T15:17:43.306Z


### application-startup-restart — PASS

2026-10-23T15:17:43.314Z → 2026-10-23T15:17:49.343Z

```sh
docker run --rm --init --name sam-verify-1792767845974-610f962a-application --label sam.verification.run=sam-verify-1792767845974-610f962a --network container:sam-verify-1792767845974-610f962a-pg --mount type=bind,src=/tmp/sam-verify-oQt7RL/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792767845974-610f962a node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-23T15:17:43.319Z → 2026-10-23T15:17:49.343Z


### source-integrity — PASS

2026-10-23T15:17:49.349Z → 2026-10-23T15:17:49.367Z


### cleanup — PASS

2026-10-23T15:17:49.372Z → 2026-10-23T15:17:50.956Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-pg
```
Exit: 0; signal: none; 2026-10-23T15:17:49.378Z → 2026-10-23T15:17:49.391Z

```sh
docker rm --force --volumes sam-verify-1792767845974-610f962a-pg
```
Exit: 0; signal: none; 2026-10-23T15:17:49.391Z → 2026-10-23T15:17:49.793Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-1
```
Exit: 1; signal: none; 2026-10-23T15:17:49.796Z → 2026-10-23T15:17:49.820Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-2
```
Exit: 1; signal: none; 2026-10-23T15:17:49.821Z → 2026-10-23T15:17:49.842Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-3
```
Exit: 1; signal: none; 2026-10-23T15:17:49.842Z → 2026-10-23T15:17:49.862Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-4
```
Exit: 1; signal: none; 2026-10-23T15:17:49.862Z → 2026-10-23T15:17:49.883Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-5
```
Exit: 1; signal: none; 2026-10-23T15:17:49.883Z → 2026-10-23T15:17:49.903Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-6
```
Exit: 1; signal: none; 2026-10-23T15:17:49.903Z → 2026-10-23T15:17:49.923Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-7
```
Exit: 1; signal: none; 2026-10-23T15:17:49.923Z → 2026-10-23T15:17:49.941Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-8
```
Exit: 1; signal: none; 2026-10-23T15:17:49.941Z → 2026-10-23T15:17:49.961Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-9
```
Exit: 1; signal: none; 2026-10-23T15:17:49.961Z → 2026-10-23T15:17:49.982Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-10
```
Exit: 1; signal: none; 2026-10-23T15:17:49.982Z → 2026-10-23T15:17:50.004Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-11
```
Exit: 1; signal: none; 2026-10-23T15:17:50.004Z → 2026-10-23T15:17:50.026Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-12
```
Exit: 1; signal: none; 2026-10-23T15:17:50.026Z → 2026-10-23T15:17:50.046Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-13
```
Exit: 1; signal: none; 2026-10-23T15:17:50.046Z → 2026-10-23T15:17:50.066Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-14
```
Exit: 1; signal: none; 2026-10-23T15:17:50.066Z → 2026-10-23T15:17:50.088Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-15
```
Exit: 1; signal: none; 2026-10-23T15:17:50.088Z → 2026-10-23T15:17:50.107Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-16
```
Exit: 1; signal: none; 2026-10-23T15:17:50.107Z → 2026-10-23T15:17:50.126Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-17
```
Exit: 1; signal: none; 2026-10-23T15:17:50.126Z → 2026-10-23T15:17:50.150Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-18
```
Exit: 1; signal: none; 2026-10-23T15:17:50.150Z → 2026-10-23T15:17:50.172Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-19
```
Exit: 1; signal: none; 2026-10-23T15:17:50.172Z → 2026-10-23T15:17:50.192Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-20
```
Exit: 1; signal: none; 2026-10-23T15:17:50.192Z → 2026-10-23T15:17:50.211Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-21
```
Exit: 1; signal: none; 2026-10-23T15:17:50.211Z → 2026-10-23T15:17:50.229Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-22
```
Exit: 1; signal: none; 2026-10-23T15:17:50.229Z → 2026-10-23T15:17:50.250Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-23
```
Exit: 1; signal: none; 2026-10-23T15:17:50.251Z → 2026-10-23T15:17:50.272Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-24
```
Exit: 1; signal: none; 2026-10-23T15:17:50.272Z → 2026-10-23T15:17:50.293Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-25
```
Exit: 1; signal: none; 2026-10-23T15:17:50.293Z → 2026-10-23T15:17:50.316Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-26
```
Exit: 1; signal: none; 2026-10-23T15:17:50.316Z → 2026-10-23T15:17:50.337Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-27
```
Exit: 1; signal: none; 2026-10-23T15:17:50.337Z → 2026-10-23T15:17:50.358Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-28
```
Exit: 1; signal: none; 2026-10-23T15:17:50.358Z → 2026-10-23T15:17:50.384Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-29
```
Exit: 1; signal: none; 2026-10-23T15:17:50.384Z → 2026-10-23T15:17:50.406Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-30
```
Exit: 1; signal: none; 2026-10-23T15:17:50.406Z → 2026-10-23T15:17:50.427Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-31
```
Exit: 1; signal: none; 2026-10-23T15:17:50.427Z → 2026-10-23T15:17:50.447Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-32
```
Exit: 1; signal: none; 2026-10-23T15:17:50.447Z → 2026-10-23T15:17:50.468Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-33
```
Exit: 1; signal: none; 2026-10-23T15:17:50.468Z → 2026-10-23T15:17:50.490Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-34
```
Exit: 1; signal: none; 2026-10-23T15:17:50.490Z → 2026-10-23T15:17:50.511Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-35
```
Exit: 1; signal: none; 2026-10-23T15:17:50.511Z → 2026-10-23T15:17:50.533Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-36
```
Exit: 1; signal: none; 2026-10-23T15:17:50.533Z → 2026-10-23T15:17:50.554Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-37
```
Exit: 1; signal: none; 2026-10-23T15:17:50.554Z → 2026-10-23T15:17:50.576Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-38
```
Exit: 1; signal: none; 2026-10-23T15:17:50.576Z → 2026-10-23T15:17:50.595Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-39
```
Exit: 1; signal: none; 2026-10-23T15:17:50.595Z → 2026-10-23T15:17:50.616Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-40
```
Exit: 1; signal: none; 2026-10-23T15:17:50.616Z → 2026-10-23T15:17:50.637Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-41
```
Exit: 1; signal: none; 2026-10-23T15:17:50.637Z → 2026-10-23T15:17:50.657Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-42
```
Exit: 1; signal: none; 2026-10-23T15:17:50.657Z → 2026-10-23T15:17:50.681Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-43
```
Exit: 1; signal: none; 2026-10-23T15:17:50.681Z → 2026-10-23T15:17:50.701Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-44
```
Exit: 1; signal: none; 2026-10-23T15:17:50.701Z → 2026-10-23T15:17:50.721Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-45
```
Exit: 1; signal: none; 2026-10-23T15:17:50.721Z → 2026-10-23T15:17:50.745Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-46
```
Exit: 1; signal: none; 2026-10-23T15:17:50.745Z → 2026-10-23T15:17:50.766Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-47
```
Exit: 1; signal: none; 2026-10-23T15:17:50.766Z → 2026-10-23T15:17:50.788Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-48
```
Exit: 1; signal: none; 2026-10-23T15:17:50.788Z → 2026-10-23T15:17:50.809Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-49
```
Exit: 1; signal: none; 2026-10-23T15:17:50.810Z → 2026-10-23T15:17:50.831Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-job-50
```
Exit: 1; signal: none; 2026-10-23T15:17:50.831Z → 2026-10-23T15:17:50.851Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-application
```
Exit: 1; signal: none; 2026-10-23T15:17:50.851Z → 2026-10-23T15:17:50.871Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792767845974-610f962a-net
```
Exit: 0; signal: none; 2026-10-23T15:17:50.871Z → 2026-10-23T15:17:50.885Z

```sh
docker network rm sam-verify-1792767845974-610f962a-net
```
Exit: 0; signal: none; 2026-10-23T15:17:50.885Z → 2026-10-23T15:17:50.932Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
