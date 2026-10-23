# Independent SAM verification

Status: **PASS**
Source: `3a00d1db402bf2dad80d5cd8002789754860edcf` (clean: true)
Started: 2026-10-23T05:17:59.482Z; completed: 2026-10-23T05:30:00.162Z

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
- clean-application: `sam-verification:sam-verify-1792732679481-a80d3655`; ID `sha256:010ee0c6685805e43de82e3674668285dba1f3495ae5ed5525ccf8b20d1de4cb`

## Commands and suite outcomes

### preflight — PASS

2026-10-23T05:17:59.483Z → 2026-10-23T05:17:59.733Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T05:17:59.486Z → 2026-10-23T05:17:59.492Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T05:17:59.492Z → 2026-10-23T05:17:59.495Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T05:17:59.495Z → 2026-10-23T05:17:59.501Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T05:17:59.501Z → 2026-10-23T05:17:59.513Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T05:17:59.513Z → 2026-10-23T05:17:59.533Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T05:17:59.533Z → 2026-10-23T05:17:59.589Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T05:17:59.589Z → 2026-10-23T05:17:59.666Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T05:17:59.666Z → 2026-10-23T05:17:59.719Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T05:17:59.719Z → 2026-10-23T05:17:59.722Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T05:17:59.722Z → 2026-10-23T05:17:59.732Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T05:17:59.732Z → 2026-10-23T05:17:59.733Z


### snapshot — PASS

2026-10-23T05:17:59.735Z → 2026-10-23T05:17:59.805Z

```sh
git archive --format=tar --output /tmp/sam-verify-1HSFFY/source.tar 3a00d1db402bf2dad80d5cd8002789754860edcf
```
Exit: 0; signal: none; 2026-10-23T05:17:59.735Z → 2026-10-23T05:17:59.764Z

```sh
tar -xf /tmp/sam-verify-1HSFFY/source.tar -C /tmp/sam-verify-1HSFFY/source
```
Exit: 0; signal: none; 2026-10-23T05:17:59.764Z → 2026-10-23T05:17:59.773Z


### images — PASS

2026-10-23T05:17:59.806Z → 2026-10-23T05:17:59.918Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T05:17:59.807Z → 2026-10-23T05:17:59.820Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T05:17:59.820Z → 2026-10-23T05:17:59.836Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T05:17:59.836Z → 2026-10-23T05:17:59.849Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T05:17:59.849Z → 2026-10-23T05:17:59.863Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T05:17:59.864Z → 2026-10-23T05:17:59.876Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T05:17:59.876Z → 2026-10-23T05:17:59.890Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T05:17:59.890Z → 2026-10-23T05:17:59.904Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T05:17:59.904Z → 2026-10-23T05:17:59.918Z


### isolated-postgres — PASS

2026-10-23T05:17:59.919Z → 2026-10-23T05:18:04.945Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792732679481-a80d3655 sam-verify-1792732679481-a80d3655-net
```
Exit: 0; signal: none; 2026-10-23T05:17:59.920Z → 2026-10-23T05:17:59.949Z

```sh
docker run --detach --name sam-verify-1792732679481-a80d3655-pg --label sam.verification.run=sam-verify-1792732679481-a80d3655 --network sam-verify-1792732679481-a80d3655-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T05:17:59.949Z → 2026-10-23T05:18:03.272Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792732679481-a80d3655-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T05:18:03.272Z → 2026-10-23T05:18:03.368Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792732679481-a80d3655-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T05:18:03.869Z → 2026-10-23T05:18:03.967Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792732679481-a80d3655-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T05:18:04.467Z → 2026-10-23T05:18:04.559Z

```sh
docker exec sam-verify-1792732679481-a80d3655-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T05:18:04.559Z → 2026-10-23T05:18:04.684Z

```sh
docker exec sam-verify-1792732679481-a80d3655-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T05:18:04.684Z → 2026-10-23T05:18:04.829Z

```sh
docker exec sam-verify-1792732679481-a80d3655-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T05:18:04.829Z → 2026-10-23T05:18:04.945Z


### node-dependencies — PASS

2026-10-23T05:18:04.949Z → 2026-10-23T05:18:17.830Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-1 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T05:18:04.950Z → 2026-10-23T05:18:17.830Z


### python-dependencies — PASS

2026-10-23T05:18:17.831Z → 2026-10-23T05:18:21.871Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-2 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-1HSFFY/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T05:18:17.832Z → 2026-10-23T05:18:21.871Z


### runtime-versions — PASS

2026-10-23T05:18:21.873Z → 2026-10-23T05:18:51.058Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-3 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T05:18:21.874Z → 2026-10-23T05:18:31.719Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-4 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T05:18:31.720Z → 2026-10-23T05:18:41.360Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-5 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T05:18:41.360Z → 2026-10-23T05:18:50.260Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-6 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T05:18:50.260Z → 2026-10-23T05:18:50.972Z

```sh
docker exec sam-verify-1792732679481-a80d3655-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T05:18:50.972Z → 2026-10-23T05:18:51.058Z


### workflow-tool — PASS

2026-10-23T05:18:51.060Z → 2026-10-23T05:18:51.600Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-1HSFFY/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T05:18:51.061Z → 2026-10-23T05:18:51.556Z

```sh
tar -xzf /tmp/sam-verify-1HSFFY/actionlint.tar.gz -C /tmp/sam-verify-1HSFFY actionlint
```
Exit: 0; signal: none; 2026-10-23T05:18:51.559Z → 2026-10-23T05:18:51.598Z

```sh
/tmp/sam-verify-1HSFFY/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T05:18:51.598Z → 2026-10-23T05:18:51.600Z


### workflow-validation — PASS

2026-10-23T05:18:51.601Z → 2026-10-23T05:18:51.606Z

```sh
/tmp/sam-verify-1HSFFY/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T05:18:51.603Z → 2026-10-23T05:18:51.606Z


### configuration-validation — PASS

2026-10-23T05:18:51.607Z → 2026-10-23T05:19:22.375Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T05:18:51.608Z → 2026-10-23T05:18:51.815Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T05:18:51.815Z → 2026-10-23T05:18:51.878Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T05:18:51.878Z → 2026-10-23T05:18:51.939Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T05:18:51.939Z → 2026-10-23T05:18:52.006Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T05:18:52.006Z → 2026-10-23T05:18:52.072Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-7 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T05:18:52.072Z → 2026-10-23T05:19:02.979Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-8 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T05:19:02.979Z → 2026-10-23T05:19:13.438Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-9 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T05:19:13.438Z → 2026-10-23T05:19:22.375Z


### typecheck — PASS

2026-10-23T05:19:22.377Z → 2026-10-23T05:19:36.436Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-10 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T05:19:22.378Z → 2026-10-23T05:19:36.436Z


### regression — PASS

2026-10-23T05:19:36.437Z → 2026-10-23T05:20:12.818Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-11 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T05:19:36.439Z → 2026-10-23T05:20:12.817Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T05:19:45.339Z → 2026-10-23T05:19:45.862Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T05:19:45.883Z → 2026-10-23T05:19:46.321Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T05:19:46.338Z → 2026-10-23T05:19:46.789Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T05:19:46.806Z → 2026-10-23T05:19:47.273Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T05:19:47.290Z → 2026-10-23T05:19:47.789Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T05:19:47.807Z → 2026-10-23T05:19:48.147Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T05:19:48.163Z → 2026-10-23T05:19:48.653Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T05:19:48.670Z → 2026-10-23T05:19:49.129Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T05:19:49.145Z → 2026-10-23T05:19:49.587Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T05:19:49.604Z → 2026-10-23T05:19:50.015Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T05:19:50.035Z → 2026-10-23T05:19:50.429Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T05:19:50.446Z → 2026-10-23T05:19:50.738Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T05:19:50.756Z → 2026-10-23T05:19:51.220Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T05:19:51.238Z → 2026-10-23T05:19:51.610Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T05:19:51.626Z → 2026-10-23T05:19:51.982Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T05:19:52.000Z → 2026-10-23T05:19:52.430Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T05:19:52.449Z → 2026-10-23T05:19:52.868Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T05:19:52.885Z → 2026-10-23T05:19:53.281Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T05:19:53.298Z → 2026-10-23T05:19:53.726Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T05:19:53.744Z → 2026-10-23T05:19:54.122Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T05:19:54.138Z → 2026-10-23T05:19:54.475Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T05:19:54.492Z → 2026-10-23T05:19:54.765Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T05:19:54.782Z → 2026-10-23T05:19:55.204Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T05:19:55.221Z → 2026-10-23T05:19:56.525Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T05:19:56.542Z → 2026-10-23T05:19:57.092Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T05:19:57.110Z → 2026-10-23T05:19:57.492Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T05:19:57.509Z → 2026-10-23T05:19:58.123Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T05:19:58.139Z → 2026-10-23T05:19:58.974Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T05:19:58.992Z → 2026-10-23T05:19:59.439Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T05:19:59.456Z → 2026-10-23T05:19:59.891Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T05:19:59.910Z → 2026-10-23T05:20:00.646Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T05:20:00.664Z → 2026-10-23T05:20:01.136Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T05:20:01.154Z → 2026-10-23T05:20:01.608Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T05:20:01.625Z → 2026-10-23T05:20:02.129Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T05:20:02.146Z → 2026-10-23T05:20:02.604Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T05:20:02.624Z → 2026-10-23T05:20:03.286Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T05:20:03.302Z → 2026-10-23T05:20:03.790Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T05:20:03.810Z → 2026-10-23T05:20:04.328Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T05:20:04.345Z → 2026-10-23T05:20:04.848Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T05:20:04.864Z → 2026-10-23T05:20:05.355Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T05:20:05.374Z → 2026-10-23T05:20:06.402Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T05:20:06.423Z → 2026-10-23T05:20:06.779Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T05:20:06.798Z → 2026-10-23T05:20:08.136Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T05:20:08.154Z → 2026-10-23T05:20:08.625Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T05:20:08.643Z → 2026-10-23T05:20:09.206Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T05:20:09.224Z → 2026-10-23T05:20:09.642Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T05:20:09.662Z → 2026-10-23T05:20:10.441Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T05:20:10.458Z → 2026-10-23T05:20:11.138Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T05:20:11.168Z → 2026-10-23T05:20:11.970Z

### core-reliability — PASS

2026-10-23T05:20:12.819Z → 2026-10-23T05:20:36.954Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-12 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T05:20:12.821Z → 2026-10-23T05:20:36.953Z

- tests/core/reliability.ts: PASS; 2026-10-23T05:20:22.533Z → 2026-10-23T05:20:27.702Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T05:20:27.720Z → 2026-10-23T05:20:28.285Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T05:20:28.303Z → 2026-10-23T05:20:28.760Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T05:20:28.778Z → 2026-10-23T05:20:29.295Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T05:20:29.317Z → 2026-10-23T05:20:30.964Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T05:20:30.982Z → 2026-10-23T05:20:31.479Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T05:20:31.497Z → 2026-10-23T05:20:33.099Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T05:20:33.119Z → 2026-10-23T05:20:33.731Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T05:20:33.752Z → 2026-10-23T05:20:35.169Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T05:20:35.188Z → 2026-10-23T05:20:36.130Z

### provider-auth — PASS

2026-10-23T05:20:36.955Z → 2026-10-23T05:20:48.566Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-13 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T05:20:36.957Z → 2026-10-23T05:20:48.566Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T05:20:47.331Z → 2026-10-23T05:20:47.814Z

### postgres-tls — PASS

2026-10-23T05:20:48.568Z → 2026-10-23T05:20:59.333Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-14 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T05:20:48.569Z → 2026-10-23T05:20:59.333Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T05:20:57.648Z → 2026-10-23T05:20:58.602Z

### contracts — PASS

2026-10-23T05:20:59.335Z → 2026-10-23T05:21:08.981Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-15 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T05:20:59.337Z → 2026-10-23T05:21:08.980Z

- tests/release/contracts.ts: PASS; 2026-10-23T05:21:07.479Z → 2026-10-23T05:21:08.148Z

### synthetic-pilot — PASS

2026-10-23T05:21:08.982Z → 2026-10-23T05:21:21.166Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-16 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T05:21:08.984Z → 2026-10-23T05:21:21.165Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T05:21:19.661Z → 2026-10-23T05:21:20.329Z

### managed-schema — PASS

2026-10-23T05:21:21.168Z → 2026-10-23T05:21:31.320Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-17 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T05:21:21.170Z → 2026-10-23T05:21:31.320Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T05:21:30.293Z → 2026-10-23T05:21:30.558Z

### local-bundle — PASS

2026-10-23T05:21:31.323Z → 2026-10-23T05:21:41.353Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-18 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T05:21:31.324Z → 2026-10-23T05:21:41.353Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T05:21:40.099Z → 2026-10-23T05:21:40.509Z

### closed-setup — PASS

2026-10-23T05:21:41.355Z → 2026-10-23T05:21:52.236Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-19 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T05:21:41.356Z → 2026-10-23T05:21:52.236Z

- tests/release/setup.ts: PASS; 2026-10-23T05:21:50.921Z → 2026-10-23T05:21:51.483Z

### database-contract — PASS

2026-10-23T05:21:52.240Z → 2026-10-23T05:22:01.891Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-20 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T05:21:52.242Z → 2026-10-23T05:22:01.891Z

- tests/release/database_check.ts: PASS; 2026-10-23T05:22:00.827Z → 2026-10-23T05:22:01.144Z

### prelaunch-gate — PASS

2026-10-23T05:22:01.894Z → 2026-10-23T05:22:12.412Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-21 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T05:22:01.899Z → 2026-10-23T05:22:12.412Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T05:22:11.393Z → 2026-10-23T05:22:11.698Z

### service-provisioning — PASS

2026-10-23T05:22:12.414Z → 2026-10-23T05:22:24.343Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-22 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T05:22:12.415Z → 2026-10-23T05:22:24.343Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T05:22:20.755Z → 2026-10-23T05:22:23.545Z

### operator-provisioning — PASS

2026-10-23T05:22:24.345Z → 2026-10-23T05:22:37.436Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-23 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T05:22:24.347Z → 2026-10-23T05:22:37.436Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T05:22:33.139Z → 2026-10-23T05:22:36.640Z

### provisioning-backup-recovery — PASS

2026-10-23T05:22:37.439Z → 2026-10-23T05:22:41.075Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792732679481-a80d3655-pg sam-verify-1792732679481-a80d3655
```
Exit: 0; signal: none; 2026-10-23T05:22:37.441Z → 2026-10-23T05:22:41.075Z


### render-migration-compatibility — PASS

2026-10-23T05:22:41.077Z → 2026-10-23T05:22:53.384Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-24 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T05:22:41.079Z → 2026-10-23T05:22:53.384Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T05:22:51.391Z → 2026-10-23T05:22:52.658Z

### render-google-oauth-contracts — PASS

2026-10-23T05:22:53.387Z → 2026-10-23T05:23:09.252Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-25 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-23T05:22:53.389Z → 2026-10-23T05:23:09.252Z


### integration-migrations — PASS

2026-10-23T05:23:09.254Z → 2026-10-23T05:23:19.757Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-26 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-23T05:23:09.255Z → 2026-10-23T05:23:19.756Z

- tests/integration/migrations.ts: PASS; 2026-10-23T05:23:17.455Z → 2026-10-23T05:23:18.951Z

### integration-oauth-mcp — PASS

2026-10-23T05:23:19.760Z → 2026-10-23T05:23:30.895Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-27 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-23T05:23:19.761Z → 2026-10-23T05:23:30.895Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-23T05:23:29.607Z → 2026-10-23T05:23:30.135Z

### integration-orchestration — PASS

2026-10-23T05:23:30.898Z → 2026-10-23T05:23:48.711Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-28 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T05:23:30.900Z → 2026-10-23T05:23:48.711Z

- tests/integration/orchestration.ts: PASS; 2026-10-23T05:23:40.764Z → 2026-10-23T05:23:47.944Z

### specialist-reasoning — PASS

2026-10-23T05:23:48.715Z → 2026-10-23T05:24:57.024Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-29 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-23T05:23:48.717Z → 2026-10-23T05:24:57.023Z

- tests/specialists/acceptance.ts: PASS; 2026-10-23T05:23:57.912Z → 2026-10-23T05:24:56.076Z

### specialist-gateway — PASS

2026-10-23T05:24:57.027Z → 2026-10-23T05:25:07.797Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-30 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-23T05:24:57.028Z → 2026-10-23T05:25:07.797Z

- tests/specialists/gateway.ts: PASS; 2026-10-23T05:25:06.557Z → 2026-10-23T05:25:07.042Z

### specialist-provenance — PASS

2026-10-23T05:25:07.800Z → 2026-10-23T05:25:18.564Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-31 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-23T05:25:07.801Z → 2026-10-23T05:25:18.564Z

- tests/specialists/provenance.ts: PASS; 2026-10-23T05:25:17.255Z → 2026-10-23T05:25:17.755Z

### specialist-learning-fairness — PASS

2026-10-23T05:25:18.566Z → 2026-10-23T05:25:29.067Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-32 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-23T05:25:18.568Z → 2026-10-23T05:25:29.066Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-23T05:25:27.369Z → 2026-10-23T05:25:28.346Z

### specialist-evaluation — PASS

2026-10-23T05:25:29.071Z → 2026-10-23T05:25:40.165Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-33 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-23T05:25:29.073Z → 2026-10-23T05:25:40.165Z


### evaluation-budget — PASS

2026-10-23T05:25:40.168Z → 2026-10-23T05:25:54.260Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-34 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf --mount type=bind,source=/tmp/sam-review-full-v2/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-23T05:25:40.170Z → 2026-10-23T05:25:54.260Z

- tests/evaluation/budgets.ts: PASS; 2026-10-23T05:25:49.858Z → 2026-10-23T05:25:53.424Z

### evaluation-adapter — PASS

2026-10-23T05:25:54.291Z → 2026-10-23T05:26:04.605Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-35 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-23T05:25:54.293Z → 2026-10-23T05:26:04.604Z

- tests/evaluation/adapters.ts: PASS; 2026-10-23T05:26:03.316Z → 2026-10-23T05:26:03.793Z

### evaluation-orchestration — PASS

2026-10-23T05:26:04.608Z → 2026-10-23T05:26:35.807Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-36 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf --mount type=bind,source=/tmp/sam-review-full-v2/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T05:26:04.610Z → 2026-10-23T05:26:35.807Z

- tests/evaluation/orchestration.ts: PASS; 2026-10-23T05:26:13.881Z → 2026-10-23T05:26:35.037Z

### evaluation-independent-review — PASS

2026-10-23T05:26:35.812Z → 2026-10-23T05:26:47.064Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-37 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-23T05:26:35.814Z → 2026-10-23T05:26:47.063Z

- tests/evaluation/review.ts: PASS; 2026-10-23T05:26:45.452Z → 2026-10-23T05:26:46.246Z

### evaluation-commercial-market — PASS

2026-10-23T05:26:47.067Z → 2026-10-23T05:27:22.382Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-38 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf --mount type=bind,source=/tmp/sam-review-full-v2/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-23T05:26:47.071Z → 2026-10-23T05:27:22.382Z

- tests/evaluation/market.ts: PASS; 2026-10-23T05:26:56.820Z → 2026-10-23T05:27:21.515Z

### evaluation-commercial-profitability — PASS

2026-10-23T05:27:22.387Z → 2026-10-23T05:27:55.680Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-39 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf --mount type=bind,source=/tmp/sam-review-full-v2/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-23T05:27:22.391Z → 2026-10-23T05:27:55.680Z

- tests/evaluation/profitability.ts: PASS; 2026-10-23T05:27:31.590Z → 2026-10-23T05:27:54.889Z

### evaluation-commercial-suppliers — PASS

2026-10-23T05:27:55.685Z → 2026-10-23T05:28:32.502Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-40 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf --mount type=bind,source=/tmp/sam-review-full-v2/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-23T05:27:55.690Z → 2026-10-23T05:28:32.502Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-23T05:28:05.756Z → 2026-10-23T05:28:31.637Z

### migration-upgrade-rollback — PASS

2026-10-23T05:28:32.511Z → 2026-10-23T05:28:43.832Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-41 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-23T05:28:32.517Z → 2026-10-23T05:28:43.832Z


### specialist-restart-prepare — PASS

2026-10-23T05:28:43.838Z → 2026-10-23T05:28:55.066Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-42 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T05:28:43.844Z → 2026-10-23T05:28:55.066Z


### evaluation-restart-prepare — PASS

2026-10-23T05:28:55.071Z → 2026-10-23T05:29:06.269Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-43 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=3a00d1db402bf2dad80d5cd8002789754860edcf node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T05:28:55.076Z → 2026-10-23T05:29:06.269Z


### postgres-restart — PASS

2026-10-23T05:29:06.275Z → 2026-10-23T05:29:06.952Z

```sh
docker restart --time 10 sam-verify-1792732679481-a80d3655-pg
```
Exit: 0; signal: none; 2026-10-23T05:29:06.280Z → 2026-10-23T05:29:06.859Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792732679481-a80d3655-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T05:29:06.859Z → 2026-10-23T05:29:06.952Z


### migration-after-restart — PASS

2026-10-23T05:29:06.958Z → 2026-10-23T05:29:19.086Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-44 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-23T05:29:06.962Z → 2026-10-23T05:29:19.086Z


### specialist-restart-check — PASS

2026-10-23T05:29:19.092Z → 2026-10-23T05:29:30.359Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-45 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T05:29:19.097Z → 2026-10-23T05:29:30.359Z


### evaluation-restart-check — PASS

2026-10-23T05:29:30.365Z → 2026-10-23T05:29:40.154Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-46 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T05:29:30.374Z → 2026-10-23T05:29:40.154Z


### phase0-migrations — PASS

2026-10-23T05:29:40.161Z → 2026-10-23T05:29:40.914Z

```sh
docker cp /tmp/sam-verify-1HSFFY/source/packages/db/migrations sam-verify-1792732679481-a80d3655-pg:/migrations
```
Exit: 0; signal: none; 2026-10-23T05:29:40.165Z → 2026-10-23T05:29:40.186Z

```sh
docker exec sam-verify-1792732679481-a80d3655-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-23T05:29:40.186Z → 2026-10-23T05:29:40.831Z

```sh
docker exec sam-verify-1792732679481-a80d3655-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-23T05:29:40.831Z → 2026-10-23T05:29:40.914Z


### phase0-acceptance — PASS

2026-10-23T05:29:40.919Z → 2026-10-23T05:29:42.782Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-47 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-1HSFFY/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-23T05:29:40.924Z → 2026-10-23T05:29:42.782Z


### phase0-postgres — PASS

2026-10-23T05:29:42.788Z → 2026-10-23T05:29:44.439Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-48 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-1HSFFY/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-23T05:29:42.793Z → 2026-10-23T05:29:44.439Z


### tenant-isolation — PASS

2026-10-23T05:29:44.445Z → 2026-10-23T05:29:45.257Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-49 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-1HSFFY/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-23T05:29:44.450Z → 2026-10-23T05:29:45.257Z


### fail-closed-security — PASS

2026-10-23T05:29:45.264Z → 2026-10-23T05:29:46.067Z

```sh
docker run --rm --name sam-verify-1792732679481-a80d3655-job-50 --label sam.verification.run=sam-verify-1792732679481-a80d3655 --init --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-1HSFFY/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-23T05:29:45.268Z → 2026-10-23T05:29:46.067Z


### clean-image — PASS

2026-10-23T05:29:46.073Z → 2026-10-23T05:29:53.070Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792732679481-a80d3655 Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-23T05:29:46.077Z → 2026-10-23T05:29:53.070Z


### image-contract — PASS

2026-10-23T05:29:53.076Z → 2026-10-23T05:29:53.093Z

```sh
docker image inspect sam-verification:sam-verify-1792732679481-a80d3655
```
Exit: 0; signal: none; 2026-10-23T05:29:53.081Z → 2026-10-23T05:29:53.093Z


### application-startup-restart — PASS

2026-10-23T05:29:53.098Z → 2026-10-23T05:29:58.611Z

```sh
docker run --rm --init --name sam-verify-1792732679481-a80d3655-application --label sam.verification.run=sam-verify-1792732679481-a80d3655 --network container:sam-verify-1792732679481-a80d3655-pg --mount type=bind,src=/tmp/sam-verify-1HSFFY/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792732679481-a80d3655 node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-23T05:29:53.104Z → 2026-10-23T05:29:58.611Z


### source-integrity — PASS

2026-10-23T05:29:58.617Z → 2026-10-23T05:29:58.635Z


### cleanup — PASS

2026-10-23T05:29:58.640Z → 2026-10-23T05:30:00.152Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-pg
```
Exit: 0; signal: none; 2026-10-23T05:29:58.645Z → 2026-10-23T05:29:58.659Z

```sh
docker rm --force --volumes sam-verify-1792732679481-a80d3655-pg
```
Exit: 0; signal: none; 2026-10-23T05:29:58.659Z → 2026-10-23T05:29:59.037Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-1
```
Exit: 1; signal: none; 2026-10-23T05:29:59.037Z → 2026-10-23T05:29:59.057Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-2
```
Exit: 1; signal: none; 2026-10-23T05:29:59.057Z → 2026-10-23T05:29:59.076Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-3
```
Exit: 1; signal: none; 2026-10-23T05:29:59.077Z → 2026-10-23T05:29:59.096Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-4
```
Exit: 1; signal: none; 2026-10-23T05:29:59.096Z → 2026-10-23T05:29:59.115Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-5
```
Exit: 1; signal: none; 2026-10-23T05:29:59.115Z → 2026-10-23T05:29:59.136Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-6
```
Exit: 1; signal: none; 2026-10-23T05:29:59.136Z → 2026-10-23T05:29:59.157Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-7
```
Exit: 1; signal: none; 2026-10-23T05:29:59.157Z → 2026-10-23T05:29:59.177Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-8
```
Exit: 1; signal: none; 2026-10-23T05:29:59.177Z → 2026-10-23T05:29:59.198Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-9
```
Exit: 1; signal: none; 2026-10-23T05:29:59.198Z → 2026-10-23T05:29:59.219Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-10
```
Exit: 1; signal: none; 2026-10-23T05:29:59.219Z → 2026-10-23T05:29:59.237Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-11
```
Exit: 1; signal: none; 2026-10-23T05:29:59.237Z → 2026-10-23T05:29:59.257Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-12
```
Exit: 1; signal: none; 2026-10-23T05:29:59.257Z → 2026-10-23T05:29:59.279Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-13
```
Exit: 1; signal: none; 2026-10-23T05:29:59.279Z → 2026-10-23T05:29:59.301Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-14
```
Exit: 1; signal: none; 2026-10-23T05:29:59.301Z → 2026-10-23T05:29:59.322Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-15
```
Exit: 1; signal: none; 2026-10-23T05:29:59.322Z → 2026-10-23T05:29:59.342Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-16
```
Exit: 1; signal: none; 2026-10-23T05:29:59.342Z → 2026-10-23T05:29:59.365Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-17
```
Exit: 1; signal: none; 2026-10-23T05:29:59.365Z → 2026-10-23T05:29:59.386Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-18
```
Exit: 1; signal: none; 2026-10-23T05:29:59.386Z → 2026-10-23T05:29:59.407Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-19
```
Exit: 1; signal: none; 2026-10-23T05:29:59.407Z → 2026-10-23T05:29:59.427Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-20
```
Exit: 1; signal: none; 2026-10-23T05:29:59.427Z → 2026-10-23T05:29:59.447Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-21
```
Exit: 1; signal: none; 2026-10-23T05:29:59.447Z → 2026-10-23T05:29:59.468Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-22
```
Exit: 1; signal: none; 2026-10-23T05:29:59.468Z → 2026-10-23T05:29:59.489Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-23
```
Exit: 1; signal: none; 2026-10-23T05:29:59.490Z → 2026-10-23T05:29:59.509Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-24
```
Exit: 1; signal: none; 2026-10-23T05:29:59.509Z → 2026-10-23T05:29:59.529Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-25
```
Exit: 1; signal: none; 2026-10-23T05:29:59.529Z → 2026-10-23T05:29:59.550Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-26
```
Exit: 1; signal: none; 2026-10-23T05:29:59.550Z → 2026-10-23T05:29:59.571Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-27
```
Exit: 1; signal: none; 2026-10-23T05:29:59.571Z → 2026-10-23T05:29:59.592Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-28
```
Exit: 1; signal: none; 2026-10-23T05:29:59.592Z → 2026-10-23T05:29:59.612Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-29
```
Exit: 1; signal: none; 2026-10-23T05:29:59.612Z → 2026-10-23T05:29:59.632Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-30
```
Exit: 1; signal: none; 2026-10-23T05:29:59.632Z → 2026-10-23T05:29:59.653Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-31
```
Exit: 1; signal: none; 2026-10-23T05:29:59.653Z → 2026-10-23T05:29:59.674Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-32
```
Exit: 1; signal: none; 2026-10-23T05:29:59.674Z → 2026-10-23T05:29:59.693Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-33
```
Exit: 1; signal: none; 2026-10-23T05:29:59.693Z → 2026-10-23T05:29:59.712Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-34
```
Exit: 1; signal: none; 2026-10-23T05:29:59.712Z → 2026-10-23T05:29:59.731Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-35
```
Exit: 1; signal: none; 2026-10-23T05:29:59.731Z → 2026-10-23T05:29:59.751Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-36
```
Exit: 1; signal: none; 2026-10-23T05:29:59.751Z → 2026-10-23T05:29:59.770Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-37
```
Exit: 1; signal: none; 2026-10-23T05:29:59.770Z → 2026-10-23T05:29:59.789Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-38
```
Exit: 1; signal: none; 2026-10-23T05:29:59.789Z → 2026-10-23T05:29:59.808Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-39
```
Exit: 1; signal: none; 2026-10-23T05:29:59.808Z → 2026-10-23T05:29:59.825Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-40
```
Exit: 1; signal: none; 2026-10-23T05:29:59.825Z → 2026-10-23T05:29:59.846Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-41
```
Exit: 1; signal: none; 2026-10-23T05:29:59.846Z → 2026-10-23T05:29:59.866Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-42
```
Exit: 1; signal: none; 2026-10-23T05:29:59.866Z → 2026-10-23T05:29:59.884Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-43
```
Exit: 1; signal: none; 2026-10-23T05:29:59.884Z → 2026-10-23T05:29:59.904Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-44
```
Exit: 1; signal: none; 2026-10-23T05:29:59.904Z → 2026-10-23T05:29:59.923Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-45
```
Exit: 1; signal: none; 2026-10-23T05:29:59.923Z → 2026-10-23T05:29:59.941Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-46
```
Exit: 1; signal: none; 2026-10-23T05:29:59.941Z → 2026-10-23T05:29:59.963Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-47
```
Exit: 1; signal: none; 2026-10-23T05:29:59.963Z → 2026-10-23T05:29:59.982Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-48
```
Exit: 1; signal: none; 2026-10-23T05:29:59.982Z → 2026-10-23T05:30:00.005Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-49
```
Exit: 1; signal: none; 2026-10-23T05:30:00.005Z → 2026-10-23T05:30:00.026Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-job-50
```
Exit: 1; signal: none; 2026-10-23T05:30:00.026Z → 2026-10-23T05:30:00.044Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-application
```
Exit: 1; signal: none; 2026-10-23T05:30:00.044Z → 2026-10-23T05:30:00.062Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792732679481-a80d3655-net
```
Exit: 0; signal: none; 2026-10-23T05:30:00.062Z → 2026-10-23T05:30:00.073Z

```sh
docker network rm sam-verify-1792732679481-a80d3655-net
```
Exit: 0; signal: none; 2026-10-23T05:30:00.073Z → 2026-10-23T05:30:00.119Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
