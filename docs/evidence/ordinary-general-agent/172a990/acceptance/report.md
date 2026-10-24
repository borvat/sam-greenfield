# Independent SAM verification

Status: **PASS**
Source: `172a990d6d84eaa917b6974316180d349c3c73ee` (clean: true)
Started: 2026-10-23T23:46:01.829Z; completed: 2026-10-24T00:04:39.297Z

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
| shared-goal-path | PASS | [log](logs/59-shared-goal-path.log) |
| cleanup | PASS | [log](logs/60-cleanup.log) |

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
- clean-application: `sam-verification:sam-verify-1792799161829-27bbf174`; ID `sha256:919e3aed00e3451ecdc2c088f1150ec08ac3c7bd07725d7ca5584bf4e76d8d05`

## Commands and suite outcomes

### preflight — PASS

2026-10-23T23:46:01.830Z → 2026-10-23T23:46:02.063Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T23:46:01.833Z → 2026-10-23T23:46:01.838Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T23:46:01.838Z → 2026-10-23T23:46:01.840Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T23:46:01.840Z → 2026-10-23T23:46:01.845Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T23:46:01.845Z → 2026-10-23T23:46:01.856Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T23:46:01.856Z → 2026-10-23T23:46:01.874Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T23:46:01.874Z → 2026-10-23T23:46:01.936Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T23:46:01.936Z → 2026-10-23T23:46:02.003Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T23:46:02.003Z → 2026-10-23T23:46:02.048Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T23:46:02.048Z → 2026-10-23T23:46:02.051Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T23:46:02.051Z → 2026-10-23T23:46:02.061Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T23:46:02.061Z → 2026-10-23T23:46:02.063Z


### snapshot — PASS

2026-10-23T23:46:02.064Z → 2026-10-23T23:46:02.138Z

```sh
git archive --format=tar --output /tmp/sam-verify-Y3stAS/source.tar 172a990d6d84eaa917b6974316180d349c3c73ee
```
Exit: 0; signal: none; 2026-10-23T23:46:02.064Z → 2026-10-23T23:46:02.099Z

```sh
tar -xf /tmp/sam-verify-Y3stAS/source.tar -C /tmp/sam-verify-Y3stAS/source
```
Exit: 0; signal: none; 2026-10-23T23:46:02.099Z → 2026-10-23T23:46:02.109Z


### images — PASS

2026-10-23T23:46:02.139Z → 2026-10-23T23:46:02.241Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T23:46:02.140Z → 2026-10-23T23:46:02.153Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T23:46:02.153Z → 2026-10-23T23:46:02.164Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T23:46:02.165Z → 2026-10-23T23:46:02.176Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T23:46:02.176Z → 2026-10-23T23:46:02.189Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T23:46:02.189Z → 2026-10-23T23:46:02.203Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T23:46:02.203Z → 2026-10-23T23:46:02.217Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T23:46:02.217Z → 2026-10-23T23:46:02.229Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T23:46:02.229Z → 2026-10-23T23:46:02.241Z


### isolated-postgres — PASS

2026-10-23T23:46:02.242Z → 2026-10-23T23:46:04.793Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792799161829-27bbf174 sam-verify-1792799161829-27bbf174-net
```
Exit: 0; signal: none; 2026-10-23T23:46:02.243Z → 2026-10-23T23:46:02.272Z

```sh
docker run --detach --name sam-verify-1792799161829-27bbf174-pg --label sam.verification.run=sam-verify-1792799161829-27bbf174 --network sam-verify-1792799161829-27bbf174-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T23:46:02.272Z → 2026-10-23T23:46:03.178Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792799161829-27bbf174-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T23:46:03.178Z → 2026-10-23T23:46:03.313Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792799161829-27bbf174-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T23:46:03.814Z → 2026-10-23T23:46:03.897Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792799161829-27bbf174-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T23:46:04.397Z → 2026-10-23T23:46:04.483Z

```sh
docker exec sam-verify-1792799161829-27bbf174-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T23:46:04.483Z → 2026-10-23T23:46:04.584Z

```sh
docker exec sam-verify-1792799161829-27bbf174-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T23:46:04.584Z → 2026-10-23T23:46:04.698Z

```sh
docker exec sam-verify-1792799161829-27bbf174-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T23:46:04.698Z → 2026-10-23T23:46:04.793Z


### node-dependencies — PASS

2026-10-23T23:46:04.798Z → 2026-10-23T23:46:12.913Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-1 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T23:46:04.799Z → 2026-10-23T23:46:12.913Z


### python-dependencies — PASS

2026-10-23T23:46:12.914Z → 2026-10-23T23:46:16.515Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-2 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-Y3stAS/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T23:46:12.915Z → 2026-10-23T23:46:16.514Z


### runtime-versions — PASS

2026-10-23T23:46:16.516Z → 2026-10-23T23:46:43.119Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-3 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T23:46:16.516Z → 2026-10-23T23:46:23.897Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-4 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T23:46:23.897Z → 2026-10-23T23:46:33.316Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-5 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T23:46:33.316Z → 2026-10-23T23:46:42.389Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-6 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T23:46:42.389Z → 2026-10-23T23:46:43.033Z

```sh
docker exec sam-verify-1792799161829-27bbf174-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T23:46:43.033Z → 2026-10-23T23:46:43.119Z


### workflow-tool — PASS

2026-10-23T23:46:43.120Z → 2026-10-23T23:46:43.722Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-Y3stAS/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T23:46:43.121Z → 2026-10-23T23:46:43.677Z

```sh
tar -xzf /tmp/sam-verify-Y3stAS/actionlint.tar.gz -C /tmp/sam-verify-Y3stAS actionlint
```
Exit: 0; signal: none; 2026-10-23T23:46:43.680Z → 2026-10-23T23:46:43.719Z

```sh
/tmp/sam-verify-Y3stAS/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T23:46:43.719Z → 2026-10-23T23:46:43.722Z


### workflow-validation — PASS

2026-10-23T23:46:43.723Z → 2026-10-23T23:46:43.727Z

```sh
/tmp/sam-verify-Y3stAS/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T23:46:43.724Z → 2026-10-23T23:46:43.727Z


### configuration-validation — PASS

2026-10-23T23:46:43.728Z → 2026-10-23T23:47:13.920Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T23:46:43.729Z → 2026-10-23T23:46:43.931Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T23:46:43.931Z → 2026-10-23T23:46:44.002Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T23:46:44.002Z → 2026-10-23T23:46:44.081Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T23:46:44.081Z → 2026-10-23T23:46:44.144Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T23:46:44.144Z → 2026-10-23T23:46:44.207Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-7 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T23:46:44.207Z → 2026-10-23T23:46:55.033Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-8 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T23:46:55.033Z → 2026-10-23T23:47:05.309Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-9 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T23:47:05.309Z → 2026-10-23T23:47:13.920Z


### typecheck — PASS

2026-10-23T23:47:13.921Z → 2026-10-23T23:47:30.316Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-10 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T23:47:13.922Z → 2026-10-23T23:47:30.316Z


### regression — PASS

2026-10-23T23:47:30.317Z → 2026-10-23T23:48:05.083Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-11 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T23:47:30.319Z → 2026-10-23T23:48:05.082Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T23:47:38.648Z → 2026-10-23T23:47:39.113Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T23:47:39.130Z → 2026-10-23T23:47:39.544Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T23:47:39.560Z → 2026-10-23T23:47:39.938Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T23:47:39.954Z → 2026-10-23T23:47:40.357Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T23:47:40.373Z → 2026-10-23T23:47:40.773Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T23:47:40.790Z → 2026-10-23T23:47:41.107Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T23:47:41.124Z → 2026-10-23T23:47:41.595Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T23:47:41.612Z → 2026-10-23T23:47:42.048Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T23:47:42.064Z → 2026-10-23T23:47:42.537Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T23:47:42.553Z → 2026-10-23T23:47:42.954Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T23:47:42.970Z → 2026-10-23T23:47:43.354Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T23:47:43.371Z → 2026-10-23T23:47:43.653Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T23:47:43.670Z → 2026-10-23T23:47:44.158Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T23:47:44.175Z → 2026-10-23T23:47:44.546Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T23:47:44.563Z → 2026-10-23T23:47:44.921Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T23:47:44.937Z → 2026-10-23T23:47:45.372Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T23:47:45.392Z → 2026-10-23T23:47:45.845Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T23:47:45.861Z → 2026-10-23T23:47:46.257Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T23:47:46.274Z → 2026-10-23T23:47:46.687Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T23:47:46.703Z → 2026-10-23T23:47:47.039Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T23:47:47.057Z → 2026-10-23T23:47:47.402Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T23:47:47.420Z → 2026-10-23T23:47:47.744Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T23:47:47.761Z → 2026-10-23T23:47:48.186Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T23:47:48.203Z → 2026-10-23T23:47:49.649Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T23:47:49.666Z → 2026-10-23T23:47:50.183Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T23:47:50.200Z → 2026-10-23T23:47:50.604Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T23:47:50.621Z → 2026-10-23T23:47:51.187Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T23:47:51.206Z → 2026-10-23T23:47:51.967Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T23:47:51.985Z → 2026-10-23T23:47:52.400Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T23:47:52.416Z → 2026-10-23T23:47:52.821Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T23:47:52.841Z → 2026-10-23T23:47:53.579Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T23:47:53.597Z → 2026-10-23T23:47:54.016Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T23:47:54.033Z → 2026-10-23T23:47:54.428Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T23:47:54.445Z → 2026-10-23T23:47:54.861Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T23:47:54.883Z → 2026-10-23T23:47:55.293Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T23:47:55.310Z → 2026-10-23T23:47:55.892Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T23:47:55.910Z → 2026-10-23T23:47:56.350Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T23:47:56.368Z → 2026-10-23T23:47:56.837Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T23:47:56.854Z → 2026-10-23T23:47:57.297Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T23:47:57.314Z → 2026-10-23T23:47:57.754Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T23:47:57.771Z → 2026-10-23T23:47:58.733Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T23:47:58.751Z → 2026-10-23T23:47:59.148Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T23:47:59.165Z → 2026-10-23T23:48:00.556Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T23:48:00.576Z → 2026-10-23T23:48:01.020Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T23:48:01.041Z → 2026-10-23T23:48:01.639Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T23:48:01.656Z → 2026-10-23T23:48:02.049Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T23:48:02.066Z → 2026-10-23T23:48:02.867Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T23:48:02.885Z → 2026-10-23T23:48:03.537Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T23:48:03.571Z → 2026-10-23T23:48:04.334Z

### core-reliability — PASS

2026-10-23T23:48:05.084Z → 2026-10-23T23:53:37.707Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-12 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee --mount type=bind,source=/tmp/sam-ordinary-full-172a990/metadata,target=/evidence --env SAM_VERIFICATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T23:48:05.086Z → 2026-10-23T23:53:37.706Z

- tests/core/reliability.ts: PASS; 2026-10-23T23:48:13.976Z → 2026-10-23T23:48:19.137Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T23:48:19.157Z → 2026-10-23T23:48:19.697Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T23:48:19.717Z → 2026-10-23T23:48:20.126Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T23:48:20.149Z → 2026-10-23T23:48:20.630Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T23:48:20.647Z → 2026-10-23T23:48:22.265Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T23:48:22.286Z → 2026-10-23T23:48:22.843Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T23:48:22.861Z → 2026-10-23T23:48:24.519Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T23:48:24.536Z → 2026-10-23T23:48:25.133Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T23:48:25.151Z → 2026-10-23T23:48:26.545Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T23:48:26.562Z → 2026-10-23T23:48:30.507Z
- tests/core/evidenceTransforms.ts: PASS; 2026-10-23T23:48:30.525Z → 2026-10-23T23:48:31.150Z
- tests/core/evidenceIntegration.ts: PASS; 2026-10-23T23:48:31.168Z → 2026-10-23T23:48:43.994Z
- tests/core/sourceContracts.ts: PASS; 2026-10-23T23:48:44.024Z → 2026-10-23T23:48:44.706Z
- tests/core/evidenceChaining.ts: PASS; 2026-10-23T23:48:44.723Z → 2026-10-23T23:48:45.187Z
- tests/core/ordinaryAllowance.ts: PASS; 2026-10-23T23:48:45.205Z → 2026-10-23T23:48:45.710Z
- tests/core/ordinaryPath.ts: PASS; 2026-10-23T23:48:45.728Z → 2026-10-23T23:50:20.594Z
- tests/core/ordinaryZeroTools.ts: PASS; 2026-10-23T23:50:20.627Z → 2026-10-23T23:50:28.133Z
- tests/core/ordinaryMissingRegistration.ts: PASS; 2026-10-23T23:50:28.165Z → 2026-10-23T23:50:29.892Z
- tests/core/ordinaryCancellation.ts: PASS; 2026-10-23T23:50:29.925Z → 2026-10-23T23:50:32.201Z
- tests/core/ordinaryRestart.ts: PASS; 2026-10-23T23:50:32.234Z → 2026-10-23T23:51:57.285Z
- tests/core/ordinaryUnknownSemantics.ts: PASS; 2026-10-23T23:51:57.323Z → 2026-10-23T23:53:01.697Z
- tests/core/ordinaryRevocation.ts: PASS; 2026-10-23T23:53:01.735Z → 2026-10-23T23:53:36.814Z

### provider-auth — PASS

2026-10-23T23:53:37.712Z → 2026-10-23T23:53:47.577Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-13 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T23:53:37.714Z → 2026-10-23T23:53:47.577Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T23:53:46.393Z → 2026-10-23T23:53:46.824Z

### postgres-tls — PASS

2026-10-23T23:53:47.581Z → 2026-10-23T23:53:57.882Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-14 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T23:53:47.584Z → 2026-10-23T23:53:57.882Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T23:53:56.211Z → 2026-10-23T23:53:57.155Z

### contracts — PASS

2026-10-23T23:53:57.885Z → 2026-10-23T23:54:08.522Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-15 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T23:53:57.888Z → 2026-10-23T23:54:08.522Z

- tests/release/contracts.ts: PASS; 2026-10-23T23:54:07.120Z → 2026-10-23T23:54:07.768Z

### synthetic-pilot — PASS

2026-10-23T23:54:08.526Z → 2026-10-23T23:54:18.317Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-16 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T23:54:08.529Z → 2026-10-23T23:54:18.317Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T23:54:16.798Z → 2026-10-23T23:54:17.529Z

### managed-schema — PASS

2026-10-23T23:54:18.321Z → 2026-10-23T23:54:27.666Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-17 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T23:54:18.324Z → 2026-10-23T23:54:27.666Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T23:54:26.724Z → 2026-10-23T23:54:26.951Z

### local-bundle — PASS

2026-10-23T23:54:27.670Z → 2026-10-23T23:54:37.415Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-18 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T23:54:27.674Z → 2026-10-23T23:54:37.414Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T23:54:36.224Z → 2026-10-23T23:54:36.609Z

### closed-setup — PASS

2026-10-23T23:54:37.419Z → 2026-10-23T23:54:47.015Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-19 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T23:54:37.422Z → 2026-10-23T23:54:47.015Z

- tests/release/setup.ts: PASS; 2026-10-23T23:54:45.753Z → 2026-10-23T23:54:46.263Z

### database-contract — PASS

2026-10-23T23:54:47.019Z → 2026-10-23T23:54:57.582Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-20 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T23:54:47.023Z → 2026-10-23T23:54:57.582Z

- tests/release/database_check.ts: PASS; 2026-10-23T23:54:56.473Z → 2026-10-23T23:54:56.843Z

### prelaunch-gate — PASS

2026-10-23T23:54:57.586Z → 2026-10-23T23:55:07.073Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-21 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T23:54:57.589Z → 2026-10-23T23:55:07.073Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T23:55:06.084Z → 2026-10-23T23:55:06.365Z

### service-provisioning — PASS

2026-10-23T23:55:07.077Z → 2026-10-23T23:55:19.270Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-22 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T23:55:07.080Z → 2026-10-23T23:55:19.270Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T23:55:15.958Z → 2026-10-23T23:55:18.513Z

### operator-provisioning — PASS

2026-10-23T23:55:19.275Z → 2026-10-23T23:55:31.254Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-23 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T23:55:19.278Z → 2026-10-23T23:55:31.254Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T23:55:27.349Z → 2026-10-23T23:55:30.521Z

### provisioning-backup-recovery — PASS

2026-10-23T23:55:31.259Z → 2026-10-23T23:55:34.641Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792799161829-27bbf174-pg sam-verify-1792799161829-27bbf174
```
Exit: 0; signal: none; 2026-10-23T23:55:31.262Z → 2026-10-23T23:55:34.641Z


### render-migration-compatibility — PASS

2026-10-23T23:55:34.645Z → 2026-10-23T23:55:46.103Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-24 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T23:55:34.648Z → 2026-10-23T23:55:46.102Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T23:55:44.184Z → 2026-10-23T23:55:45.317Z

### render-google-oauth-contracts — PASS

2026-10-23T23:55:46.107Z → 2026-10-23T23:56:05.674Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-25 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/isolated/compact_schema.ts tests/isolated/normalized_connectors.ts tests/isolated/launch_journal_race.ts tests/isolated/render_transport.ts tests/isolated/goal_obligations.ts tests/isolated/collection_receipts.ts tests/isolated/shared_goal_contract.ts tests/isolated/delegation_scope.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-23T23:55:46.112Z → 2026-10-23T23:56:05.674Z


### integration-migrations — PASS

2026-10-23T23:56:05.679Z → 2026-10-23T23:56:16.026Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-26 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-23T23:56:05.683Z → 2026-10-23T23:56:16.025Z

- tests/integration/migrations.ts: PASS; 2026-10-23T23:56:14.278Z → 2026-10-23T23:56:15.292Z

### integration-oauth-mcp — PASS

2026-10-23T23:56:16.030Z → 2026-10-23T23:56:26.540Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-27 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-23T23:56:16.033Z → 2026-10-23T23:56:26.540Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-23T23:56:25.274Z → 2026-10-23T23:56:25.795Z

### integration-orchestration — PASS

2026-10-23T23:56:26.544Z → 2026-10-23T23:56:42.387Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-28 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T23:56:26.548Z → 2026-10-23T23:56:42.387Z

- tests/integration/orchestration.ts: PASS; 2026-10-23T23:56:35.032Z → 2026-10-23T23:56:41.609Z

### specialist-reasoning — PASS

2026-10-23T23:56:42.391Z → 2026-10-23T23:57:46.501Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-29 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-23T23:56:42.394Z → 2026-10-23T23:57:46.501Z

- tests/specialists/acceptance.ts: PASS; 2026-10-23T23:56:50.494Z → 2026-10-23T23:57:45.716Z

### specialist-gateway — PASS

2026-10-23T23:57:46.506Z → 2026-10-23T23:57:56.117Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-30 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-23T23:57:46.509Z → 2026-10-23T23:57:56.117Z

- tests/specialists/gateway.ts: PASS; 2026-10-23T23:57:54.845Z → 2026-10-23T23:57:55.338Z

### specialist-provenance — PASS

2026-10-23T23:57:56.128Z → 2026-10-23T23:58:06.132Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-31 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-23T23:57:56.134Z → 2026-10-23T23:58:06.132Z

- tests/specialists/provenance.ts: PASS; 2026-10-23T23:58:05.038Z → 2026-10-23T23:58:05.420Z

### specialist-learning-fairness — PASS

2026-10-23T23:58:06.137Z → 2026-10-23T23:58:16.594Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-32 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-23T23:58:06.139Z → 2026-10-23T23:58:16.594Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-23T23:58:14.908Z → 2026-10-23T23:58:15.867Z

### specialist-evaluation — PASS

2026-10-23T23:58:16.598Z → 2026-10-23T23:58:27.031Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-33 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-23T23:58:16.602Z → 2026-10-23T23:58:27.031Z


### evaluation-budget — PASS

2026-10-23T23:58:27.036Z → 2026-10-23T23:59:32.784Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-34 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee --mount type=bind,source=/tmp/sam-ordinary-full-172a990/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-23T23:58:27.040Z → 2026-10-23T23:59:32.783Z

- tests/evaluation/budgets.ts: PASS; 2026-10-23T23:58:36.040Z → 2026-10-23T23:59:31.923Z

### evaluation-adapter — PASS

2026-10-23T23:59:32.793Z → 2026-10-23T23:59:44.372Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-35 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-23T23:59:32.798Z → 2026-10-23T23:59:44.372Z

- tests/evaluation/adapters.ts: PASS; 2026-10-23T23:59:42.579Z → 2026-10-23T23:59:43.581Z

### evaluation-orchestration — PASS

2026-10-23T23:59:44.377Z → 2026-10-24T00:00:31.596Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-36 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee --mount type=bind,source=/tmp/sam-ordinary-full-172a990/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T23:59:44.381Z → 2026-10-24T00:00:14.093Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-37 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee --mount type=bind,source=/tmp/sam-ordinary-full-172a990/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/operatorLaunch.ts
```
Exit: 0; signal: none; 2026-10-24T00:00:14.094Z → 2026-10-24T00:00:31.596Z

- tests/evaluation/operatorLaunch.ts: PASS; 2026-10-24T00:00:22.900Z → 2026-10-24T00:00:30.810Z

### evaluation-independent-review — PASS

2026-10-24T00:00:31.603Z → 2026-10-24T00:00:41.346Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-38 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-24T00:00:31.607Z → 2026-10-24T00:00:41.346Z

- tests/evaluation/review.ts: PASS; 2026-10-24T00:00:39.903Z → 2026-10-24T00:00:40.631Z

### evaluation-commercial-market — PASS

2026-10-24T00:00:41.352Z → 2026-10-24T00:01:10.866Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-39 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee --mount type=bind,source=/tmp/sam-ordinary-full-172a990/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-24T00:00:41.361Z → 2026-10-24T00:01:10.866Z

- tests/evaluation/market.ts: PASS; 2026-10-24T00:00:48.988Z → 2026-10-24T00:01:10.106Z

### evaluation-commercial-profitability — PASS

2026-10-24T00:01:10.873Z → 2026-10-24T00:01:44.315Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-40 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee --mount type=bind,source=/tmp/sam-ordinary-full-172a990/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-24T00:01:10.878Z → 2026-10-24T00:01:44.314Z

- tests/evaluation/profitability.ts: PASS; 2026-10-24T00:01:21.070Z → 2026-10-24T00:01:43.553Z

### evaluation-commercial-suppliers — PASS

2026-10-24T00:01:44.323Z → 2026-10-24T00:02:14.910Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-41 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee --mount type=bind,source=/tmp/sam-ordinary-full-172a990/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-24T00:01:44.330Z → 2026-10-24T00:02:14.909Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-24T00:01:53.125Z → 2026-10-24T00:02:14.139Z

### migration-upgrade-rollback — PASS

2026-10-24T00:02:14.919Z → 2026-10-24T00:02:25.220Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-42 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-24T00:02:14.926Z → 2026-10-24T00:02:25.220Z


### specialist-restart-prepare — PASS

2026-10-24T00:02:25.229Z → 2026-10-24T00:02:34.609Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-43 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-24T00:02:25.237Z → 2026-10-24T00:02:34.609Z


### evaluation-restart-prepare — PASS

2026-10-24T00:02:34.617Z → 2026-10-24T00:02:44.508Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-44 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-24T00:02:34.624Z → 2026-10-24T00:02:44.508Z


### postgres-restart — PASS

2026-10-24T00:02:44.516Z → 2026-10-24T00:02:44.881Z

```sh
docker restart --time 10 sam-verify-1792799161829-27bbf174-pg
```
Exit: 0; signal: none; 2026-10-24T00:02:44.522Z → 2026-10-24T00:02:44.799Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792799161829-27bbf174-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-24T00:02:44.799Z → 2026-10-24T00:02:44.880Z


### migration-after-restart — PASS

2026-10-24T00:02:44.890Z → 2026-10-24T00:02:55.180Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-45 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-24T00:02:44.897Z → 2026-10-24T00:02:55.180Z


### specialist-restart-check — PASS

2026-10-24T00:02:55.191Z → 2026-10-24T00:03:05.249Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-46 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-24T00:02:55.201Z → 2026-10-24T00:03:05.249Z


### evaluation-restart-check — PASS

2026-10-24T00:03:05.256Z → 2026-10-24T00:03:14.603Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-47 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-24T00:03:05.263Z → 2026-10-24T00:03:14.603Z


### phase0-migrations — PASS

2026-10-24T00:03:14.611Z → 2026-10-24T00:03:15.238Z

```sh
docker cp /tmp/sam-verify-Y3stAS/source/packages/db/migrations sam-verify-1792799161829-27bbf174-pg:/migrations
```
Exit: 0; signal: none; 2026-10-24T00:03:14.618Z → 2026-10-24T00:03:14.635Z

```sh
docker exec sam-verify-1792799161829-27bbf174-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-24T00:03:14.635Z → 2026-10-24T00:03:15.162Z

```sh
docker exec sam-verify-1792799161829-27bbf174-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-24T00:03:15.162Z → 2026-10-24T00:03:15.238Z


### phase0-acceptance — PASS

2026-10-24T00:03:15.246Z → 2026-10-24T00:03:17.235Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-48 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-Y3stAS/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-24T00:03:15.252Z → 2026-10-24T00:03:17.235Z


### phase0-postgres — PASS

2026-10-24T00:03:17.247Z → 2026-10-24T00:03:18.254Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-49 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-Y3stAS/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-24T00:03:17.254Z → 2026-10-24T00:03:18.254Z


### tenant-isolation — PASS

2026-10-24T00:03:18.267Z → 2026-10-24T00:03:19.040Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-50 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-Y3stAS/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-24T00:03:18.274Z → 2026-10-24T00:03:19.040Z


### fail-closed-security — PASS

2026-10-24T00:03:19.049Z → 2026-10-24T00:03:20.843Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-51 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-Y3stAS/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-24T00:03:19.057Z → 2026-10-24T00:03:20.843Z


### clean-image — PASS

2026-10-24T00:03:20.851Z → 2026-10-24T00:03:28.187Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792799161829-27bbf174 Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-24T00:03:20.858Z → 2026-10-24T00:03:28.187Z


### image-contract — PASS

2026-10-24T00:03:28.195Z → 2026-10-24T00:03:28.215Z

```sh
docker image inspect sam-verification:sam-verify-1792799161829-27bbf174
```
Exit: 0; signal: none; 2026-10-24T00:03:28.201Z → 2026-10-24T00:03:28.215Z


### application-startup-restart — PASS

2026-10-24T00:03:28.223Z → 2026-10-24T00:03:32.984Z

```sh
docker run --rm --init --name sam-verify-1792799161829-27bbf174-application --label sam.verification.run=sam-verify-1792799161829-27bbf174 --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792799161829-27bbf174 node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-24T00:03:28.230Z → 2026-10-24T00:03:32.984Z


### source-integrity — PASS

2026-10-24T00:03:32.994Z → 2026-10-24T00:03:33.014Z


### shared-goal-path — PASS

2026-10-24T00:03:33.020Z → 2026-10-24T00:04:37.720Z

```sh
docker run --rm --name sam-verify-1792799161829-27bbf174-job-53 --label sam.verification.run=sam-verify-1792799161829-27bbf174 --init --network container:sam-verify-1792799161829-27bbf174-pg --mount type=bind,src=/tmp/sam-verify-Y3stAS/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=172a990d6d84eaa917b6974316180d349c3c73ee --mount type=bind,source=/tmp/sam-ordinary-full-172a990/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/sharedPath.ts
```
Exit: 0; signal: none; 2026-10-24T00:03:33.026Z → 2026-10-24T00:04:37.720Z

- tests/evaluation/sharedPath.ts: PASS; 2026-10-24T00:03:38.789Z → 2026-10-24T00:04:36.952Z

### cleanup — PASS

2026-10-24T00:04:37.730Z → 2026-10-24T00:04:39.286Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-pg
```
Exit: 0; signal: none; 2026-10-24T00:04:37.738Z → 2026-10-24T00:04:37.750Z

```sh
docker rm --force --volumes sam-verify-1792799161829-27bbf174-pg
```
Exit: 0; signal: none; 2026-10-24T00:04:37.750Z → 2026-10-24T00:04:38.151Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-1
```
Exit: 1; signal: none; 2026-10-24T00:04:38.151Z → 2026-10-24T00:04:38.173Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-2
```
Exit: 1; signal: none; 2026-10-24T00:04:38.173Z → 2026-10-24T00:04:38.192Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-3
```
Exit: 1; signal: none; 2026-10-24T00:04:38.192Z → 2026-10-24T00:04:38.213Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-4
```
Exit: 1; signal: none; 2026-10-24T00:04:38.213Z → 2026-10-24T00:04:38.233Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-5
```
Exit: 1; signal: none; 2026-10-24T00:04:38.233Z → 2026-10-24T00:04:38.251Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-6
```
Exit: 1; signal: none; 2026-10-24T00:04:38.251Z → 2026-10-24T00:04:38.269Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-7
```
Exit: 1; signal: none; 2026-10-24T00:04:38.269Z → 2026-10-24T00:04:38.289Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-8
```
Exit: 1; signal: none; 2026-10-24T00:04:38.289Z → 2026-10-24T00:04:38.311Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-9
```
Exit: 1; signal: none; 2026-10-24T00:04:38.311Z → 2026-10-24T00:04:38.329Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-10
```
Exit: 1; signal: none; 2026-10-24T00:04:38.329Z → 2026-10-24T00:04:38.348Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-11
```
Exit: 1; signal: none; 2026-10-24T00:04:38.348Z → 2026-10-24T00:04:38.365Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-12
```
Exit: 1; signal: none; 2026-10-24T00:04:38.365Z → 2026-10-24T00:04:38.384Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-13
```
Exit: 1; signal: none; 2026-10-24T00:04:38.384Z → 2026-10-24T00:04:38.405Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-14
```
Exit: 1; signal: none; 2026-10-24T00:04:38.405Z → 2026-10-24T00:04:38.427Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-15
```
Exit: 1; signal: none; 2026-10-24T00:04:38.427Z → 2026-10-24T00:04:38.448Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-16
```
Exit: 1; signal: none; 2026-10-24T00:04:38.448Z → 2026-10-24T00:04:38.469Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-17
```
Exit: 1; signal: none; 2026-10-24T00:04:38.469Z → 2026-10-24T00:04:38.488Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-18
```
Exit: 1; signal: none; 2026-10-24T00:04:38.489Z → 2026-10-24T00:04:38.508Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-19
```
Exit: 1; signal: none; 2026-10-24T00:04:38.508Z → 2026-10-24T00:04:38.539Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-20
```
Exit: 1; signal: none; 2026-10-24T00:04:38.539Z → 2026-10-24T00:04:38.559Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-21
```
Exit: 1; signal: none; 2026-10-24T00:04:38.559Z → 2026-10-24T00:04:38.583Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-22
```
Exit: 1; signal: none; 2026-10-24T00:04:38.583Z → 2026-10-24T00:04:38.603Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-23
```
Exit: 1; signal: none; 2026-10-24T00:04:38.603Z → 2026-10-24T00:04:38.621Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-24
```
Exit: 1; signal: none; 2026-10-24T00:04:38.621Z → 2026-10-24T00:04:38.639Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-25
```
Exit: 1; signal: none; 2026-10-24T00:04:38.639Z → 2026-10-24T00:04:38.658Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-26
```
Exit: 1; signal: none; 2026-10-24T00:04:38.658Z → 2026-10-24T00:04:38.680Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-27
```
Exit: 1; signal: none; 2026-10-24T00:04:38.680Z → 2026-10-24T00:04:38.701Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-28
```
Exit: 1; signal: none; 2026-10-24T00:04:38.701Z → 2026-10-24T00:04:38.720Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-29
```
Exit: 1; signal: none; 2026-10-24T00:04:38.720Z → 2026-10-24T00:04:38.739Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-30
```
Exit: 1; signal: none; 2026-10-24T00:04:38.739Z → 2026-10-24T00:04:38.758Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-31
```
Exit: 1; signal: none; 2026-10-24T00:04:38.758Z → 2026-10-24T00:04:38.779Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-32
```
Exit: 1; signal: none; 2026-10-24T00:04:38.779Z → 2026-10-24T00:04:38.798Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-33
```
Exit: 1; signal: none; 2026-10-24T00:04:38.798Z → 2026-10-24T00:04:38.818Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-34
```
Exit: 1; signal: none; 2026-10-24T00:04:38.818Z → 2026-10-24T00:04:38.839Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-35
```
Exit: 1; signal: none; 2026-10-24T00:04:38.839Z → 2026-10-24T00:04:38.857Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-36
```
Exit: 1; signal: none; 2026-10-24T00:04:38.857Z → 2026-10-24T00:04:38.875Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-37
```
Exit: 1; signal: none; 2026-10-24T00:04:38.875Z → 2026-10-24T00:04:38.894Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-38
```
Exit: 1; signal: none; 2026-10-24T00:04:38.894Z → 2026-10-24T00:04:38.912Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-39
```
Exit: 1; signal: none; 2026-10-24T00:04:38.912Z → 2026-10-24T00:04:38.930Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-40
```
Exit: 1; signal: none; 2026-10-24T00:04:38.930Z → 2026-10-24T00:04:38.949Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-41
```
Exit: 1; signal: none; 2026-10-24T00:04:38.949Z → 2026-10-24T00:04:38.972Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-42
```
Exit: 1; signal: none; 2026-10-24T00:04:38.972Z → 2026-10-24T00:04:38.991Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-43
```
Exit: 1; signal: none; 2026-10-24T00:04:38.991Z → 2026-10-24T00:04:39.013Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-44
```
Exit: 1; signal: none; 2026-10-24T00:04:39.013Z → 2026-10-24T00:04:39.032Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-45
```
Exit: 1; signal: none; 2026-10-24T00:04:39.032Z → 2026-10-24T00:04:39.060Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-46
```
Exit: 1; signal: none; 2026-10-24T00:04:39.060Z → 2026-10-24T00:04:39.080Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-47
```
Exit: 1; signal: none; 2026-10-24T00:04:39.080Z → 2026-10-24T00:04:39.098Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-48
```
Exit: 1; signal: none; 2026-10-24T00:04:39.098Z → 2026-10-24T00:04:39.116Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-49
```
Exit: 1; signal: none; 2026-10-24T00:04:39.116Z → 2026-10-24T00:04:39.135Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-50
```
Exit: 1; signal: none; 2026-10-24T00:04:39.135Z → 2026-10-24T00:04:39.155Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-51
```
Exit: 1; signal: none; 2026-10-24T00:04:39.155Z → 2026-10-24T00:04:39.174Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-application
```
Exit: 1; signal: none; 2026-10-24T00:04:39.174Z → 2026-10-24T00:04:39.193Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-job-53
```
Exit: 1; signal: none; 2026-10-24T00:04:39.193Z → 2026-10-24T00:04:39.211Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792799161829-27bbf174-net
```
Exit: 0; signal: none; 2026-10-24T00:04:39.211Z → 2026-10-24T00:04:39.223Z

```sh
docker network rm sam-verify-1792799161829-27bbf174-net
```
Exit: 0; signal: none; 2026-10-24T00:04:39.223Z → 2026-10-24T00:04:39.262Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
