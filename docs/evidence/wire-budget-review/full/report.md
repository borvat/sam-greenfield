# Independent SAM verification

Status: **PASS**
Source: `1370842ad3d3f0ecf63ef5227e10386a69690b74` (clean: true)
Started: 2026-10-23T15:32:24.388Z; completed: 2026-10-23T15:46:30.265Z

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
- clean-application: `sam-verification:sam-verify-1792769544387-ae487718`; ID `sha256:1d4691fba7750fa98629eaa8a867e7d4ea0cab01321cba856e2940816de3acdc`

## Commands and suite outcomes

### preflight — PASS

2026-10-23T15:32:24.389Z → 2026-10-23T15:32:24.778Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T15:32:24.394Z → 2026-10-23T15:32:24.401Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T15:32:24.401Z → 2026-10-23T15:32:24.404Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T15:32:24.404Z → 2026-10-23T15:32:24.410Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T15:32:24.410Z → 2026-10-23T15:32:24.432Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T15:32:24.432Z → 2026-10-23T15:32:24.459Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T15:32:24.460Z → 2026-10-23T15:32:24.579Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T15:32:24.579Z → 2026-10-23T15:32:24.676Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T15:32:24.676Z → 2026-10-23T15:32:24.752Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T15:32:24.752Z → 2026-10-23T15:32:24.756Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T15:32:24.756Z → 2026-10-23T15:32:24.776Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T15:32:24.776Z → 2026-10-23T15:32:24.778Z


### snapshot — PASS

2026-10-23T15:32:24.779Z → 2026-10-23T15:32:24.890Z

```sh
git archive --format=tar --output /tmp/sam-verify-KhDu0a/source.tar 1370842ad3d3f0ecf63ef5227e10386a69690b74
```
Exit: 0; signal: none; 2026-10-23T15:32:24.780Z → 2026-10-23T15:32:24.827Z

```sh
tar -xf /tmp/sam-verify-KhDu0a/source.tar -C /tmp/sam-verify-KhDu0a/source
```
Exit: 0; signal: none; 2026-10-23T15:32:24.827Z → 2026-10-23T15:32:24.841Z


### images — PASS

2026-10-23T15:32:24.891Z → 2026-10-23T15:32:25.038Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T15:32:24.892Z → 2026-10-23T15:32:24.910Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T15:32:24.910Z → 2026-10-23T15:32:24.930Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T15:32:24.930Z → 2026-10-23T15:32:24.948Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T15:32:24.948Z → 2026-10-23T15:32:24.965Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T15:32:24.965Z → 2026-10-23T15:32:24.981Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T15:32:24.981Z → 2026-10-23T15:32:24.999Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T15:32:24.999Z → 2026-10-23T15:32:25.019Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T15:32:25.019Z → 2026-10-23T15:32:25.038Z


### isolated-postgres — PASS

2026-10-23T15:32:25.039Z → 2026-10-23T15:32:31.406Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792769544387-ae487718 sam-verify-1792769544387-ae487718-net
```
Exit: 0; signal: none; 2026-10-23T15:32:25.040Z → 2026-10-23T15:32:25.081Z

```sh
docker run --detach --name sam-verify-1792769544387-ae487718-pg --label sam.verification.run=sam-verify-1792769544387-ae487718 --network sam-verify-1792769544387-ae487718-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T15:32:25.081Z → 2026-10-23T15:32:29.014Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792769544387-ae487718-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T15:32:29.014Z → 2026-10-23T15:32:29.116Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792769544387-ae487718-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T15:32:29.617Z → 2026-10-23T15:32:29.730Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792769544387-ae487718-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T15:32:30.231Z → 2026-10-23T15:32:30.353Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792769544387-ae487718-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T15:32:30.854Z → 2026-10-23T15:32:30.973Z

```sh
docker exec sam-verify-1792769544387-ae487718-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T15:32:30.973Z → 2026-10-23T15:32:31.110Z

```sh
docker exec sam-verify-1792769544387-ae487718-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T15:32:31.110Z → 2026-10-23T15:32:31.272Z

```sh
docker exec sam-verify-1792769544387-ae487718-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T15:32:31.272Z → 2026-10-23T15:32:31.406Z


### node-dependencies — PASS

2026-10-23T15:32:31.412Z → 2026-10-23T15:32:52.703Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-1 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T15:32:31.413Z → 2026-10-23T15:32:52.703Z


### python-dependencies — PASS

2026-10-23T15:32:52.705Z → 2026-10-23T15:32:57.006Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-2 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-KhDu0a/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T15:32:52.705Z → 2026-10-23T15:32:57.006Z


### runtime-versions — PASS

2026-10-23T15:32:57.007Z → 2026-10-23T15:33:31.300Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-3 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T15:32:57.008Z → 2026-10-23T15:33:09.889Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-4 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T15:33:09.889Z → 2026-10-23T15:33:21.385Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-5 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T15:33:21.385Z → 2026-10-23T15:33:30.544Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-6 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T15:33:30.544Z → 2026-10-23T15:33:31.219Z

```sh
docker exec sam-verify-1792769544387-ae487718-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T15:33:31.219Z → 2026-10-23T15:33:31.300Z


### workflow-tool — PASS

2026-10-23T15:33:31.302Z → 2026-10-23T15:33:32.020Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-KhDu0a/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T15:33:31.303Z → 2026-10-23T15:33:31.978Z

```sh
tar -xzf /tmp/sam-verify-KhDu0a/actionlint.tar.gz -C /tmp/sam-verify-KhDu0a actionlint
```
Exit: 0; signal: none; 2026-10-23T15:33:31.980Z → 2026-10-23T15:33:32.017Z

```sh
/tmp/sam-verify-KhDu0a/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T15:33:32.017Z → 2026-10-23T15:33:32.020Z


### workflow-validation — PASS

2026-10-23T15:33:32.021Z → 2026-10-23T15:33:32.027Z

```sh
/tmp/sam-verify-KhDu0a/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T15:33:32.023Z → 2026-10-23T15:33:32.027Z


### configuration-validation — PASS

2026-10-23T15:33:32.028Z → 2026-10-23T15:34:05.887Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T15:33:32.029Z → 2026-10-23T15:33:32.258Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T15:33:32.258Z → 2026-10-23T15:33:32.324Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T15:33:32.324Z → 2026-10-23T15:33:32.388Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T15:33:32.388Z → 2026-10-23T15:33:32.454Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T15:33:32.455Z → 2026-10-23T15:33:32.545Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-7 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T15:33:32.545Z → 2026-10-23T15:33:44.346Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-8 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T15:33:44.346Z → 2026-10-23T15:33:54.035Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-9 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T15:33:54.035Z → 2026-10-23T15:34:05.887Z


### typecheck — PASS

2026-10-23T15:34:05.888Z → 2026-10-23T15:34:25.656Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-10 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T15:34:05.889Z → 2026-10-23T15:34:25.656Z


### regression — PASS

2026-10-23T15:34:25.657Z → 2026-10-23T15:35:09.214Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-11 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T15:34:25.658Z → 2026-10-23T15:35:09.213Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T15:34:37.065Z → 2026-10-23T15:34:37.637Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T15:34:37.657Z → 2026-10-23T15:34:38.139Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T15:34:38.158Z → 2026-10-23T15:34:38.641Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T15:34:38.658Z → 2026-10-23T15:34:39.120Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T15:34:39.137Z → 2026-10-23T15:34:39.594Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T15:34:39.616Z → 2026-10-23T15:34:39.995Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T15:34:40.012Z → 2026-10-23T15:34:40.599Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T15:34:40.620Z → 2026-10-23T15:34:41.264Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T15:34:41.282Z → 2026-10-23T15:34:41.877Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T15:34:41.894Z → 2026-10-23T15:34:42.355Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T15:34:42.375Z → 2026-10-23T15:34:42.889Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T15:34:42.906Z → 2026-10-23T15:34:43.303Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T15:34:43.326Z → 2026-10-23T15:34:43.868Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T15:34:43.885Z → 2026-10-23T15:34:44.350Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T15:34:44.368Z → 2026-10-23T15:34:44.820Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T15:34:44.838Z → 2026-10-23T15:34:45.351Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T15:34:45.373Z → 2026-10-23T15:34:45.880Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T15:34:45.901Z → 2026-10-23T15:34:46.384Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T15:34:46.404Z → 2026-10-23T15:34:46.885Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T15:34:46.904Z → 2026-10-23T15:34:47.346Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T15:34:47.364Z → 2026-10-23T15:34:47.959Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T15:34:47.982Z → 2026-10-23T15:34:48.330Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T15:34:48.349Z → 2026-10-23T15:34:48.862Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T15:34:48.881Z → 2026-10-23T15:34:50.407Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T15:34:50.429Z → 2026-10-23T15:34:51.154Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T15:34:51.176Z → 2026-10-23T15:34:51.629Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T15:34:51.646Z → 2026-10-23T15:34:52.355Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T15:34:52.375Z → 2026-10-23T15:34:53.327Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T15:34:53.347Z → 2026-10-23T15:34:53.860Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T15:34:53.903Z → 2026-10-23T15:34:54.379Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T15:34:54.397Z → 2026-10-23T15:34:55.186Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T15:34:55.211Z → 2026-10-23T15:34:55.738Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T15:34:55.764Z → 2026-10-23T15:34:56.321Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T15:34:56.340Z → 2026-10-23T15:34:56.865Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T15:34:56.886Z → 2026-10-23T15:34:57.390Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T15:34:57.409Z → 2026-10-23T15:34:58.125Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T15:34:58.146Z → 2026-10-23T15:34:58.660Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T15:34:58.680Z → 2026-10-23T15:34:59.199Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T15:34:59.217Z → 2026-10-23T15:34:59.762Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T15:34:59.785Z → 2026-10-23T15:35:00.299Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T15:35:00.318Z → 2026-10-23T15:35:01.415Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T15:35:01.434Z → 2026-10-23T15:35:01.798Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T15:35:01.819Z → 2026-10-23T15:35:03.354Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T15:35:03.376Z → 2026-10-23T15:35:04.009Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T15:35:04.032Z → 2026-10-23T15:35:04.687Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T15:35:04.706Z → 2026-10-23T15:35:05.326Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T15:35:05.348Z → 2026-10-23T15:35:06.376Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T15:35:06.396Z → 2026-10-23T15:35:07.229Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T15:35:07.276Z → 2026-10-23T15:35:08.313Z

### core-reliability — PASS

2026-10-23T15:35:09.216Z → 2026-10-23T15:35:47.648Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-12 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T15:35:09.217Z → 2026-10-23T15:35:47.647Z

- tests/core/reliability.ts: PASS; 2026-10-23T15:35:19.695Z → 2026-10-23T15:35:24.969Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T15:35:24.991Z → 2026-10-23T15:35:25.591Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T15:35:25.609Z → 2026-10-23T15:35:26.163Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T15:35:26.182Z → 2026-10-23T15:35:26.876Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T15:35:26.894Z → 2026-10-23T15:35:28.740Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T15:35:28.760Z → 2026-10-23T15:35:29.256Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T15:35:29.274Z → 2026-10-23T15:35:31.003Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T15:35:31.021Z → 2026-10-23T15:35:31.660Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T15:35:31.680Z → 2026-10-23T15:35:33.159Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T15:35:33.181Z → 2026-10-23T15:35:37.352Z
- tests/core/evidenceTransforms.ts: PASS; 2026-10-23T15:35:37.376Z → 2026-10-23T15:35:38.120Z
- tests/core/evidenceIntegration.ts: PASS; 2026-10-23T15:35:38.140Z → 2026-10-23T15:35:45.663Z
- tests/core/sourceContracts.ts: PASS; 2026-10-23T15:35:45.707Z → 2026-10-23T15:35:46.681Z

### provider-auth — PASS

2026-10-23T15:35:47.650Z → 2026-10-23T15:36:00.264Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-13 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T15:35:47.652Z → 2026-10-23T15:36:00.264Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T15:35:58.884Z → 2026-10-23T15:35:59.335Z

### postgres-tls — PASS

2026-10-23T15:36:00.267Z → 2026-10-23T15:36:12.331Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-14 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T15:36:00.268Z → 2026-10-23T15:36:12.331Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T15:36:10.671Z → 2026-10-23T15:36:11.475Z

### contracts — PASS

2026-10-23T15:36:12.334Z → 2026-10-23T15:36:23.845Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-15 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T15:36:12.335Z → 2026-10-23T15:36:23.845Z

- tests/release/contracts.ts: PASS; 2026-10-23T15:36:22.245Z → 2026-10-23T15:36:22.999Z

### synthetic-pilot — PASS

2026-10-23T15:36:23.849Z → 2026-10-23T15:36:35.305Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-16 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T15:36:23.851Z → 2026-10-23T15:36:35.305Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T15:36:33.778Z → 2026-10-23T15:36:34.540Z

### managed-schema — PASS

2026-10-23T15:36:35.308Z → 2026-10-23T15:36:45.664Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-17 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T15:36:35.309Z → 2026-10-23T15:36:45.664Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T15:36:44.558Z → 2026-10-23T15:36:44.807Z

### local-bundle — PASS

2026-10-23T15:36:45.666Z → 2026-10-23T15:36:56.307Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-18 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T15:36:45.668Z → 2026-10-23T15:36:56.307Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T15:36:55.119Z → 2026-10-23T15:36:55.527Z

### closed-setup — PASS

2026-10-23T15:36:56.311Z → 2026-10-23T15:37:07.146Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-19 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T15:36:56.312Z → 2026-10-23T15:37:07.146Z

- tests/release/setup.ts: PASS; 2026-10-23T15:37:05.699Z → 2026-10-23T15:37:06.290Z

### database-contract — PASS

2026-10-23T15:37:07.149Z → 2026-10-23T15:37:19.050Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-20 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T15:37:07.151Z → 2026-10-23T15:37:19.050Z

- tests/release/database_check.ts: PASS; 2026-10-23T15:37:17.808Z → 2026-10-23T15:37:18.225Z

### prelaunch-gate — PASS

2026-10-23T15:37:19.053Z → 2026-10-23T15:37:30.369Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-21 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T15:37:19.058Z → 2026-10-23T15:37:30.369Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T15:37:29.201Z → 2026-10-23T15:37:29.551Z

### service-provisioning — PASS

2026-10-23T15:37:30.372Z → 2026-10-23T15:37:43.852Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-22 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T15:37:30.374Z → 2026-10-23T15:37:43.851Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T15:37:39.273Z → 2026-10-23T15:37:43.059Z

### operator-provisioning — PASS

2026-10-23T15:37:43.854Z → 2026-10-23T15:37:59.040Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-23 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T15:37:43.856Z → 2026-10-23T15:37:59.040Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T15:37:54.176Z → 2026-10-23T15:37:58.179Z

### provisioning-backup-recovery — PASS

2026-10-23T15:37:59.044Z → 2026-10-23T15:38:02.698Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792769544387-ae487718-pg sam-verify-1792769544387-ae487718
```
Exit: 0; signal: none; 2026-10-23T15:37:59.046Z → 2026-10-23T15:38:02.698Z


### render-migration-compatibility — PASS

2026-10-23T15:38:02.701Z → 2026-10-23T15:38:15.601Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-24 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T15:38:02.703Z → 2026-10-23T15:38:15.601Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T15:38:13.490Z → 2026-10-23T15:38:14.755Z

### render-google-oauth-contracts — PASS

2026-10-23T15:38:15.604Z → 2026-10-23T15:38:32.737Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-25 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-23T15:38:15.607Z → 2026-10-23T15:38:32.737Z


### integration-migrations — PASS

2026-10-23T15:38:32.740Z → 2026-10-23T15:38:44.658Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-26 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-23T15:38:32.741Z → 2026-10-23T15:38:44.657Z

- tests/integration/migrations.ts: PASS; 2026-10-23T15:38:42.523Z → 2026-10-23T15:38:43.816Z

### integration-oauth-mcp — PASS

2026-10-23T15:38:44.661Z → 2026-10-23T15:38:57.217Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-27 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-23T15:38:44.663Z → 2026-10-23T15:38:57.217Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-23T15:38:55.503Z → 2026-10-23T15:38:56.248Z

### integration-orchestration — PASS

2026-10-23T15:38:57.221Z → 2026-10-23T15:39:16.011Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-28 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T15:38:57.224Z → 2026-10-23T15:39:16.011Z

- tests/integration/orchestration.ts: PASS; 2026-10-23T15:39:08.394Z → 2026-10-23T15:39:15.151Z

### specialist-reasoning — PASS

2026-10-23T15:39:16.013Z → 2026-10-23T15:40:34.397Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-29 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-23T15:39:16.016Z → 2026-10-23T15:40:34.397Z

- tests/specialists/acceptance.ts: PASS; 2026-10-23T15:39:27.383Z → 2026-10-23T15:40:33.449Z

### specialist-gateway — PASS

2026-10-23T15:40:34.400Z → 2026-10-23T15:40:45.364Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-30 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-23T15:40:34.402Z → 2026-10-23T15:40:45.364Z

- tests/specialists/gateway.ts: PASS; 2026-10-23T15:40:43.960Z → 2026-10-23T15:40:44.498Z

### specialist-provenance — PASS

2026-10-23T15:40:45.368Z → 2026-10-23T15:40:56.996Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-31 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-23T15:40:45.370Z → 2026-10-23T15:40:56.996Z

- tests/specialists/provenance.ts: PASS; 2026-10-23T15:40:55.567Z → 2026-10-23T15:40:56.077Z

### specialist-learning-fairness — PASS

2026-10-23T15:40:56.998Z → 2026-10-23T15:41:10.506Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-32 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-23T15:40:57.001Z → 2026-10-23T15:41:10.506Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-23T15:41:08.429Z → 2026-10-23T15:41:09.613Z

### specialist-evaluation — PASS

2026-10-23T15:41:10.509Z → 2026-10-23T15:41:23.571Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-33 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-23T15:41:10.512Z → 2026-10-23T15:41:23.571Z


### evaluation-budget — PASS

2026-10-23T15:41:23.574Z → 2026-10-23T15:42:15.500Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-34 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 --mount type=bind,source=/tmp/sam-wire-budget-full-v3/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-23T15:41:23.577Z → 2026-10-23T15:42:15.500Z

- tests/evaluation/budgets.ts: PASS; 2026-10-23T15:41:33.051Z → 2026-10-23T15:42:14.634Z

### evaluation-adapter — PASS

2026-10-23T15:42:15.504Z → 2026-10-23T15:42:26.715Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-35 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-23T15:42:15.507Z → 2026-10-23T15:42:26.715Z

- tests/evaluation/adapters.ts: PASS; 2026-10-23T15:42:24.888Z → 2026-10-23T15:42:25.852Z

### evaluation-orchestration — PASS

2026-10-23T15:42:26.718Z → 2026-10-23T15:43:01.247Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-36 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 --mount type=bind,source=/tmp/sam-wire-budget-full-v3/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T15:42:26.720Z → 2026-10-23T15:43:01.246Z

- tests/evaluation/orchestration.ts: PASS; 2026-10-23T15:42:36.699Z → 2026-10-23T15:43:00.322Z

### evaluation-independent-review — PASS

2026-10-23T15:43:01.251Z → 2026-10-23T15:43:13.397Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-37 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-23T15:43:01.254Z → 2026-10-23T15:43:13.397Z

- tests/evaluation/review.ts: PASS; 2026-10-23T15:43:11.643Z → 2026-10-23T15:43:12.497Z

### evaluation-commercial-market — PASS

2026-10-23T15:43:13.401Z → 2026-10-23T15:43:48.421Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-38 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 --mount type=bind,source=/tmp/sam-wire-budget-full-v3/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-23T15:43:13.404Z → 2026-10-23T15:43:48.420Z

- tests/evaluation/market.ts: PASS; 2026-10-23T15:43:22.942Z → 2026-10-23T15:43:47.499Z

### evaluation-commercial-profitability — PASS

2026-10-23T15:43:48.427Z → 2026-10-23T15:44:22.117Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-39 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 --mount type=bind,source=/tmp/sam-wire-budget-full-v3/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-23T15:43:48.435Z → 2026-10-23T15:44:22.117Z

- tests/evaluation/profitability.ts: PASS; 2026-10-23T15:43:57.192Z → 2026-10-23T15:44:21.191Z

### evaluation-commercial-suppliers — PASS

2026-10-23T15:44:22.123Z → 2026-10-23T15:44:56.554Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-40 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 --mount type=bind,source=/tmp/sam-wire-budget-full-v3/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-23T15:44:22.127Z → 2026-10-23T15:44:56.554Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-23T15:44:32.311Z → 2026-10-23T15:44:55.693Z

### migration-upgrade-rollback — PASS

2026-10-23T15:44:56.563Z → 2026-10-23T15:45:06.857Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-41 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-23T15:44:56.570Z → 2026-10-23T15:45:06.857Z


### specialist-restart-prepare — PASS

2026-10-23T15:45:06.865Z → 2026-10-23T15:45:18.454Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-42 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T15:45:06.869Z → 2026-10-23T15:45:18.454Z


### evaluation-restart-prepare — PASS

2026-10-23T15:45:18.460Z → 2026-10-23T15:45:30.173Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-43 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=1370842ad3d3f0ecf63ef5227e10386a69690b74 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T15:45:18.466Z → 2026-10-23T15:45:30.173Z


### postgres-restart — PASS

2026-10-23T15:45:30.180Z → 2026-10-23T15:45:30.623Z

```sh
docker restart --time 10 sam-verify-1792769544387-ae487718-pg
```
Exit: 0; signal: none; 2026-10-23T15:45:30.185Z → 2026-10-23T15:45:30.531Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792769544387-ae487718-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T15:45:30.531Z → 2026-10-23T15:45:30.623Z


### migration-after-restart — PASS

2026-10-23T15:45:30.630Z → 2026-10-23T15:45:42.071Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-44 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-23T15:45:30.634Z → 2026-10-23T15:45:42.071Z


### specialist-restart-check — PASS

2026-10-23T15:45:42.079Z → 2026-10-23T15:45:53.653Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-45 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T15:45:42.084Z → 2026-10-23T15:45:53.653Z


### evaluation-restart-check — PASS

2026-10-23T15:45:53.660Z → 2026-10-23T15:46:04.573Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-46 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T15:45:53.666Z → 2026-10-23T15:46:04.573Z


### phase0-migrations — PASS

2026-10-23T15:46:04.580Z → 2026-10-23T15:46:05.263Z

```sh
docker cp /tmp/sam-verify-KhDu0a/source/packages/db/migrations sam-verify-1792769544387-ae487718-pg:/migrations
```
Exit: 0; signal: none; 2026-10-23T15:46:04.586Z → 2026-10-23T15:46:04.603Z

```sh
docker exec sam-verify-1792769544387-ae487718-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-23T15:46:04.603Z → 2026-10-23T15:46:05.177Z

```sh
docker exec sam-verify-1792769544387-ae487718-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-23T15:46:05.177Z → 2026-10-23T15:46:05.263Z


### phase0-acceptance — PASS

2026-10-23T15:46:05.270Z → 2026-10-23T15:46:07.851Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-47 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-KhDu0a/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-23T15:46:05.275Z → 2026-10-23T15:46:07.851Z


### phase0-postgres — PASS

2026-10-23T15:46:07.860Z → 2026-10-23T15:46:10.108Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-48 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-KhDu0a/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-23T15:46:07.864Z → 2026-10-23T15:46:10.108Z


### tenant-isolation — PASS

2026-10-23T15:46:10.115Z → 2026-10-23T15:46:11.683Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-49 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-KhDu0a/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-23T15:46:10.120Z → 2026-10-23T15:46:11.683Z


### fail-closed-security — PASS

2026-10-23T15:46:11.692Z → 2026-10-23T15:46:13.334Z

```sh
docker run --rm --name sam-verify-1792769544387-ae487718-job-50 --label sam.verification.run=sam-verify-1792769544387-ae487718 --init --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-KhDu0a/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-23T15:46:11.698Z → 2026-10-23T15:46:13.334Z


### clean-image — PASS

2026-10-23T15:46:13.341Z → 2026-10-23T15:46:22.486Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792769544387-ae487718 Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-23T15:46:13.348Z → 2026-10-23T15:46:22.486Z


### image-contract — PASS

2026-10-23T15:46:22.493Z → 2026-10-23T15:46:22.517Z

```sh
docker image inspect sam-verification:sam-verify-1792769544387-ae487718
```
Exit: 0; signal: none; 2026-10-23T15:46:22.498Z → 2026-10-23T15:46:22.516Z


### application-startup-restart — PASS

2026-10-23T15:46:22.529Z → 2026-10-23T15:46:28.439Z

```sh
docker run --rm --init --name sam-verify-1792769544387-ae487718-application --label sam.verification.run=sam-verify-1792769544387-ae487718 --network container:sam-verify-1792769544387-ae487718-pg --mount type=bind,src=/tmp/sam-verify-KhDu0a/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792769544387-ae487718 node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-23T15:46:22.536Z → 2026-10-23T15:46:28.439Z


### source-integrity — PASS

2026-10-23T15:46:28.446Z → 2026-10-23T15:46:28.464Z


### cleanup — PASS

2026-10-23T15:46:28.469Z → 2026-10-23T15:46:30.255Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-pg
```
Exit: 0; signal: none; 2026-10-23T15:46:28.475Z → 2026-10-23T15:46:28.489Z

```sh
docker rm --force --volumes sam-verify-1792769544387-ae487718-pg
```
Exit: 0; signal: none; 2026-10-23T15:46:28.489Z → 2026-10-23T15:46:28.912Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-1
```
Exit: 1; signal: none; 2026-10-23T15:46:28.912Z → 2026-10-23T15:46:28.941Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-2
```
Exit: 1; signal: none; 2026-10-23T15:46:28.941Z → 2026-10-23T15:46:28.975Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-3
```
Exit: 1; signal: none; 2026-10-23T15:46:28.975Z → 2026-10-23T15:46:29.010Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-4
```
Exit: 1; signal: none; 2026-10-23T15:46:29.010Z → 2026-10-23T15:46:29.050Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-5
```
Exit: 1; signal: none; 2026-10-23T15:46:29.050Z → 2026-10-23T15:46:29.077Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-6
```
Exit: 1; signal: none; 2026-10-23T15:46:29.077Z → 2026-10-23T15:46:29.103Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-7
```
Exit: 1; signal: none; 2026-10-23T15:46:29.103Z → 2026-10-23T15:46:29.127Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-8
```
Exit: 1; signal: none; 2026-10-23T15:46:29.127Z → 2026-10-23T15:46:29.152Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-9
```
Exit: 1; signal: none; 2026-10-23T15:46:29.152Z → 2026-10-23T15:46:29.181Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-10
```
Exit: 1; signal: none; 2026-10-23T15:46:29.181Z → 2026-10-23T15:46:29.216Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-11
```
Exit: 1; signal: none; 2026-10-23T15:46:29.216Z → 2026-10-23T15:46:29.243Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-12
```
Exit: 1; signal: none; 2026-10-23T15:46:29.243Z → 2026-10-23T15:46:29.266Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-13
```
Exit: 1; signal: none; 2026-10-23T15:46:29.266Z → 2026-10-23T15:46:29.290Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-14
```
Exit: 1; signal: none; 2026-10-23T15:46:29.290Z → 2026-10-23T15:46:29.315Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-15
```
Exit: 1; signal: none; 2026-10-23T15:46:29.315Z → 2026-10-23T15:46:29.342Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-16
```
Exit: 1; signal: none; 2026-10-23T15:46:29.342Z → 2026-10-23T15:46:29.373Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-17
```
Exit: 1; signal: none; 2026-10-23T15:46:29.373Z → 2026-10-23T15:46:29.397Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-18
```
Exit: 1; signal: none; 2026-10-23T15:46:29.397Z → 2026-10-23T15:46:29.422Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-19
```
Exit: 1; signal: none; 2026-10-23T15:46:29.422Z → 2026-10-23T15:46:29.446Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-20
```
Exit: 1; signal: none; 2026-10-23T15:46:29.446Z → 2026-10-23T15:46:29.470Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-21
```
Exit: 1; signal: none; 2026-10-23T15:46:29.470Z → 2026-10-23T15:46:29.493Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-22
```
Exit: 1; signal: none; 2026-10-23T15:46:29.493Z → 2026-10-23T15:46:29.517Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-23
```
Exit: 1; signal: none; 2026-10-23T15:46:29.517Z → 2026-10-23T15:46:29.541Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-24
```
Exit: 1; signal: none; 2026-10-23T15:46:29.541Z → 2026-10-23T15:46:29.565Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-25
```
Exit: 1; signal: none; 2026-10-23T15:46:29.565Z → 2026-10-23T15:46:29.592Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-26
```
Exit: 1; signal: none; 2026-10-23T15:46:29.592Z → 2026-10-23T15:46:29.614Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-27
```
Exit: 1; signal: none; 2026-10-23T15:46:29.614Z → 2026-10-23T15:46:29.634Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-28
```
Exit: 1; signal: none; 2026-10-23T15:46:29.634Z → 2026-10-23T15:46:29.658Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-29
```
Exit: 1; signal: none; 2026-10-23T15:46:29.658Z → 2026-10-23T15:46:29.680Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-30
```
Exit: 1; signal: none; 2026-10-23T15:46:29.680Z → 2026-10-23T15:46:29.701Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-31
```
Exit: 1; signal: none; 2026-10-23T15:46:29.701Z → 2026-10-23T15:46:29.722Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-32
```
Exit: 1; signal: none; 2026-10-23T15:46:29.722Z → 2026-10-23T15:46:29.743Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-33
```
Exit: 1; signal: none; 2026-10-23T15:46:29.743Z → 2026-10-23T15:46:29.763Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-34
```
Exit: 1; signal: none; 2026-10-23T15:46:29.763Z → 2026-10-23T15:46:29.786Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-35
```
Exit: 1; signal: none; 2026-10-23T15:46:29.786Z → 2026-10-23T15:46:29.808Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-36
```
Exit: 1; signal: none; 2026-10-23T15:46:29.808Z → 2026-10-23T15:46:29.832Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-37
```
Exit: 1; signal: none; 2026-10-23T15:46:29.833Z → 2026-10-23T15:46:29.854Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-38
```
Exit: 1; signal: none; 2026-10-23T15:46:29.854Z → 2026-10-23T15:46:29.879Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-39
```
Exit: 1; signal: none; 2026-10-23T15:46:29.879Z → 2026-10-23T15:46:29.904Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-40
```
Exit: 1; signal: none; 2026-10-23T15:46:29.904Z → 2026-10-23T15:46:29.924Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-41
```
Exit: 1; signal: none; 2026-10-23T15:46:29.924Z → 2026-10-23T15:46:29.945Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-42
```
Exit: 1; signal: none; 2026-10-23T15:46:29.945Z → 2026-10-23T15:46:29.969Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-43
```
Exit: 1; signal: none; 2026-10-23T15:46:29.969Z → 2026-10-23T15:46:29.990Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-44
```
Exit: 1; signal: none; 2026-10-23T15:46:29.990Z → 2026-10-23T15:46:30.011Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-45
```
Exit: 1; signal: none; 2026-10-23T15:46:30.011Z → 2026-10-23T15:46:30.032Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-46
```
Exit: 1; signal: none; 2026-10-23T15:46:30.032Z → 2026-10-23T15:46:30.053Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-47
```
Exit: 1; signal: none; 2026-10-23T15:46:30.053Z → 2026-10-23T15:46:30.071Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-48
```
Exit: 1; signal: none; 2026-10-23T15:46:30.071Z → 2026-10-23T15:46:30.091Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-49
```
Exit: 1; signal: none; 2026-10-23T15:46:30.091Z → 2026-10-23T15:46:30.112Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-job-50
```
Exit: 1; signal: none; 2026-10-23T15:46:30.112Z → 2026-10-23T15:46:30.132Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-application
```
Exit: 1; signal: none; 2026-10-23T15:46:30.132Z → 2026-10-23T15:46:30.158Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792769544387-ae487718-net
```
Exit: 0; signal: none; 2026-10-23T15:46:30.158Z → 2026-10-23T15:46:30.173Z

```sh
docker network rm sam-verify-1792769544387-ae487718-net
```
Exit: 0; signal: none; 2026-10-23T15:46:30.173Z → 2026-10-23T15:46:30.224Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
