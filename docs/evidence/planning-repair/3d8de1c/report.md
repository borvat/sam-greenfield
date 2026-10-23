# Independent SAM verification

Status: **PASS**
Source: `3d8de1c2620cc519926e608bc66018edc6df0e9e` (clean: true)
Started: 2026-10-23T04:25:24.733Z; completed: 2026-10-23T04:37:09.310Z

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
- clean-application: `sam-verification:sam-verify-1792729524733-1935bb05`; ID `sha256:9a0d1e0aa0898892b4fd138e6809368bc7291937b3e511619adc7fd0b1431835`

## Commands and suite outcomes

### preflight — PASS

2026-10-23T04:25:24.734Z → 2026-10-23T04:25:24.977Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T04:25:24.737Z → 2026-10-23T04:25:24.741Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T04:25:24.741Z → 2026-10-23T04:25:24.744Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T04:25:24.744Z → 2026-10-23T04:25:24.751Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T04:25:24.751Z → 2026-10-23T04:25:24.763Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T04:25:24.764Z → 2026-10-23T04:25:24.781Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T04:25:24.781Z → 2026-10-23T04:25:24.839Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T04:25:24.839Z → 2026-10-23T04:25:24.914Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T04:25:24.914Z → 2026-10-23T04:25:24.964Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T04:25:24.964Z → 2026-10-23T04:25:24.966Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T04:25:24.966Z → 2026-10-23T04:25:24.975Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T04:25:24.975Z → 2026-10-23T04:25:24.977Z


### snapshot — PASS

2026-10-23T04:25:24.978Z → 2026-10-23T04:25:25.046Z

```sh
git archive --format=tar --output /tmp/sam-verify-30RbfQ/source.tar 3d8de1c2620cc519926e608bc66018edc6df0e9e
```
Exit: 0; signal: none; 2026-10-23T04:25:24.979Z → 2026-10-23T04:25:25.005Z

```sh
tar -xf /tmp/sam-verify-30RbfQ/source.tar -C /tmp/sam-verify-30RbfQ/source
```
Exit: 0; signal: none; 2026-10-23T04:25:25.005Z → 2026-10-23T04:25:25.013Z


### images — PASS

2026-10-23T04:25:25.047Z → 2026-10-23T04:25:25.162Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T04:25:25.048Z → 2026-10-23T04:25:25.061Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T04:25:25.061Z → 2026-10-23T04:25:25.076Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T04:25:25.076Z → 2026-10-23T04:25:25.091Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T04:25:25.091Z → 2026-10-23T04:25:25.104Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T04:25:25.104Z → 2026-10-23T04:25:25.119Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T04:25:25.119Z → 2026-10-23T04:25:25.136Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T04:25:25.136Z → 2026-10-23T04:25:25.151Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T04:25:25.151Z → 2026-10-23T04:25:25.162Z


### isolated-postgres — PASS

2026-10-23T04:25:25.163Z → 2026-10-23T04:25:28.706Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792729524733-1935bb05 sam-verify-1792729524733-1935bb05-net
```
Exit: 0; signal: none; 2026-10-23T04:25:25.164Z → 2026-10-23T04:25:25.194Z

```sh
docker run --detach --name sam-verify-1792729524733-1935bb05-pg --label sam.verification.run=sam-verify-1792729524733-1935bb05 --network sam-verify-1792729524733-1935bb05-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T04:25:25.194Z → 2026-10-23T04:25:27.054Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792729524733-1935bb05-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T04:25:27.054Z → 2026-10-23T04:25:27.154Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792729524733-1935bb05-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T04:25:27.655Z → 2026-10-23T04:25:27.738Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792729524733-1935bb05-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T04:25:28.238Z → 2026-10-23T04:25:28.329Z

```sh
docker exec sam-verify-1792729524733-1935bb05-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T04:25:28.329Z → 2026-10-23T04:25:28.469Z

```sh
docker exec sam-verify-1792729524733-1935bb05-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T04:25:28.469Z → 2026-10-23T04:25:28.583Z

```sh
docker exec sam-verify-1792729524733-1935bb05-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T04:25:28.583Z → 2026-10-23T04:25:28.706Z


### node-dependencies — PASS

2026-10-23T04:25:28.711Z → 2026-10-23T04:25:38.522Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-1 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T04:25:28.711Z → 2026-10-23T04:25:38.522Z


### python-dependencies — PASS

2026-10-23T04:25:38.524Z → 2026-10-23T04:25:43.113Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-2 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-30RbfQ/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T04:25:38.528Z → 2026-10-23T04:25:43.113Z


### runtime-versions — PASS

2026-10-23T04:25:43.115Z → 2026-10-23T04:26:04.086Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-3 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T04:25:43.116Z → 2026-10-23T04:25:48.971Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-4 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T04:25:48.971Z → 2026-10-23T04:25:55.442Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-5 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T04:25:55.442Z → 2026-10-23T04:26:02.236Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-6 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T04:26:02.237Z → 2026-10-23T04:26:03.984Z

```sh
docker exec sam-verify-1792729524733-1935bb05-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T04:26:03.984Z → 2026-10-23T04:26:04.086Z


### workflow-tool — PASS

2026-10-23T04:26:04.087Z → 2026-10-23T04:26:04.775Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-30RbfQ/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T04:26:04.089Z → 2026-10-23T04:26:04.726Z

```sh
tar -xzf /tmp/sam-verify-30RbfQ/actionlint.tar.gz -C /tmp/sam-verify-30RbfQ actionlint
```
Exit: 0; signal: none; 2026-10-23T04:26:04.728Z → 2026-10-23T04:26:04.771Z

```sh
/tmp/sam-verify-30RbfQ/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T04:26:04.771Z → 2026-10-23T04:26:04.775Z


### workflow-validation — PASS

2026-10-23T04:26:04.776Z → 2026-10-23T04:26:04.780Z

```sh
/tmp/sam-verify-30RbfQ/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T04:26:04.777Z → 2026-10-23T04:26:04.780Z


### configuration-validation — PASS

2026-10-23T04:26:04.781Z → 2026-10-23T04:26:27.642Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T04:26:04.781Z → 2026-10-23T04:26:05.019Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T04:26:05.019Z → 2026-10-23T04:26:05.084Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T04:26:05.084Z → 2026-10-23T04:26:05.165Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T04:26:05.165Z → 2026-10-23T04:26:05.267Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T04:26:05.267Z → 2026-10-23T04:26:05.358Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-7 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T04:26:05.358Z → 2026-10-23T04:26:14.623Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-8 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T04:26:14.623Z → 2026-10-23T04:26:19.258Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-9 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T04:26:19.258Z → 2026-10-23T04:26:27.642Z


### typecheck — PASS

2026-10-23T04:26:27.644Z → 2026-10-23T04:26:46.677Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-10 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T04:26:27.645Z → 2026-10-23T04:26:46.677Z


### regression — PASS

2026-10-23T04:26:46.678Z → 2026-10-23T04:27:25.309Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-11 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T04:26:46.679Z → 2026-10-23T04:27:25.308Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T04:26:55.008Z → 2026-10-23T04:26:55.629Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T04:26:55.647Z → 2026-10-23T04:26:56.141Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T04:26:56.160Z → 2026-10-23T04:26:56.665Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T04:26:56.686Z → 2026-10-23T04:26:57.170Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T04:26:57.188Z → 2026-10-23T04:26:57.633Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T04:26:57.658Z → 2026-10-23T04:26:58.023Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T04:26:58.042Z → 2026-10-23T04:26:58.879Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T04:26:58.898Z → 2026-10-23T04:26:59.397Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T04:26:59.413Z → 2026-10-23T04:26:59.920Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T04:26:59.943Z → 2026-10-23T04:27:00.437Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T04:27:00.457Z → 2026-10-23T04:27:00.918Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T04:27:00.936Z → 2026-10-23T04:27:01.274Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T04:27:01.292Z → 2026-10-23T04:27:01.835Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T04:27:01.858Z → 2026-10-23T04:27:02.272Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T04:27:02.293Z → 2026-10-23T04:27:02.711Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T04:27:02.728Z → 2026-10-23T04:27:03.303Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T04:27:03.326Z → 2026-10-23T04:27:03.846Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T04:27:03.863Z → 2026-10-23T04:27:04.326Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T04:27:04.343Z → 2026-10-23T04:27:04.788Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T04:27:04.805Z → 2026-10-23T04:27:05.221Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T04:27:05.240Z → 2026-10-23T04:27:05.622Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T04:27:05.638Z → 2026-10-23T04:27:05.939Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T04:27:05.957Z → 2026-10-23T04:27:06.448Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T04:27:06.470Z → 2026-10-23T04:27:07.981Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T04:27:07.997Z → 2026-10-23T04:27:08.558Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T04:27:08.576Z → 2026-10-23T04:27:08.976Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T04:27:08.994Z → 2026-10-23T04:27:09.586Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T04:27:09.603Z → 2026-10-23T04:27:10.582Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T04:27:10.600Z → 2026-10-23T04:27:11.211Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T04:27:11.232Z → 2026-10-23T04:27:11.687Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T04:27:11.706Z → 2026-10-23T04:27:12.450Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T04:27:12.471Z → 2026-10-23T04:27:12.993Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T04:27:13.017Z → 2026-10-23T04:27:13.519Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T04:27:13.542Z → 2026-10-23T04:27:14.076Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T04:27:14.093Z → 2026-10-23T04:27:14.587Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T04:27:14.608Z → 2026-10-23T04:27:15.256Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T04:27:15.275Z → 2026-10-23T04:27:15.758Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T04:27:15.774Z → 2026-10-23T04:27:16.241Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T04:27:16.258Z → 2026-10-23T04:27:16.780Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T04:27:16.808Z → 2026-10-23T04:27:17.301Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T04:27:17.318Z → 2026-10-23T04:27:18.418Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T04:27:18.435Z → 2026-10-23T04:27:18.778Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T04:27:18.795Z → 2026-10-23T04:27:20.234Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T04:27:20.258Z → 2026-10-23T04:27:20.762Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T04:27:20.788Z → 2026-10-23T04:27:21.431Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T04:27:21.448Z → 2026-10-23T04:27:21.915Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T04:27:21.932Z → 2026-10-23T04:27:22.808Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T04:27:22.825Z → 2026-10-23T04:27:23.545Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T04:27:23.574Z → 2026-10-23T04:27:24.408Z

### core-reliability — PASS

2026-10-23T04:27:25.310Z → 2026-10-23T04:27:49.975Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-12 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T04:27:25.312Z → 2026-10-23T04:27:49.974Z

- tests/core/reliability.ts: PASS; 2026-10-23T04:27:35.284Z → 2026-10-23T04:27:40.639Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T04:27:40.666Z → 2026-10-23T04:27:41.367Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T04:27:41.417Z → 2026-10-23T04:27:41.902Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T04:27:41.925Z → 2026-10-23T04:27:42.481Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T04:27:42.499Z → 2026-10-23T04:27:44.368Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T04:27:44.392Z → 2026-10-23T04:27:44.899Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T04:27:44.916Z → 2026-10-23T04:27:46.748Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T04:27:46.768Z → 2026-10-23T04:27:47.444Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T04:27:47.466Z → 2026-10-23T04:27:49.090Z

### provider-auth — PASS

2026-10-23T04:27:49.977Z → 2026-10-23T04:28:00.778Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-13 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T04:27:49.978Z → 2026-10-23T04:28:00.778Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T04:27:59.691Z → 2026-10-23T04:28:00.103Z

### postgres-tls — PASS

2026-10-23T04:28:00.779Z → 2026-10-23T04:28:10.934Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-14 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T04:28:00.782Z → 2026-10-23T04:28:10.933Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T04:28:09.655Z → 2026-10-23T04:28:10.281Z

### contracts — PASS

2026-10-23T04:28:10.935Z → 2026-10-23T04:28:21.936Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-15 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T04:28:10.936Z → 2026-10-23T04:28:21.936Z

- tests/release/contracts.ts: PASS; 2026-10-23T04:28:20.464Z → 2026-10-23T04:28:21.223Z

### synthetic-pilot — PASS

2026-10-23T04:28:21.938Z → 2026-10-23T04:28:33.127Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-16 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T04:28:21.941Z → 2026-10-23T04:28:33.127Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T04:28:31.518Z → 2026-10-23T04:28:32.388Z

### managed-schema — PASS

2026-10-23T04:28:33.130Z → 2026-10-23T04:28:42.520Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-17 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T04:28:33.131Z → 2026-10-23T04:28:42.520Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T04:28:41.484Z → 2026-10-23T04:28:41.736Z

### local-bundle — PASS

2026-10-23T04:28:42.522Z → 2026-10-23T04:28:53.458Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-18 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T04:28:42.524Z → 2026-10-23T04:28:53.458Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T04:28:52.265Z → 2026-10-23T04:28:52.691Z

### closed-setup — PASS

2026-10-23T04:28:53.461Z → 2026-10-23T04:29:05.019Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-19 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T04:28:53.462Z → 2026-10-23T04:29:05.019Z

- tests/release/setup.ts: PASS; 2026-10-23T04:29:03.499Z → 2026-10-23T04:29:04.160Z

### database-contract — PASS

2026-10-23T04:29:05.023Z → 2026-10-23T04:29:14.151Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-20 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T04:29:05.025Z → 2026-10-23T04:29:14.151Z

- tests/release/database_check.ts: PASS; 2026-10-23T04:29:12.550Z → 2026-10-23T04:29:13.381Z

### prelaunch-gate — PASS

2026-10-23T04:29:14.154Z → 2026-10-23T04:29:25.102Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-21 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T04:29:14.155Z → 2026-10-23T04:29:25.101Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T04:29:23.811Z → 2026-10-23T04:29:24.312Z

### service-provisioning — PASS

2026-10-23T04:29:25.107Z → 2026-10-23T04:29:39.634Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-22 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T04:29:25.109Z → 2026-10-23T04:29:39.634Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T04:29:35.636Z → 2026-10-23T04:29:38.859Z

### operator-provisioning — PASS

2026-10-23T04:29:39.636Z → 2026-10-23T04:29:55.681Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-23 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T04:29:39.638Z → 2026-10-23T04:29:55.680Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T04:29:49.463Z → 2026-10-23T04:29:54.860Z

### provisioning-backup-recovery — PASS

2026-10-23T04:29:55.683Z → 2026-10-23T04:29:59.661Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792729524733-1935bb05-pg sam-verify-1792729524733-1935bb05
```
Exit: 0; signal: none; 2026-10-23T04:29:55.686Z → 2026-10-23T04:29:59.661Z


### render-migration-compatibility — PASS

2026-10-23T04:29:59.663Z → 2026-10-23T04:30:09.968Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-24 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T04:29:59.665Z → 2026-10-23T04:30:09.968Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T04:30:07.992Z → 2026-10-23T04:30:09.244Z

### render-google-oauth-contracts — PASS

2026-10-23T04:30:09.970Z → 2026-10-23T04:30:25.216Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-25 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-23T04:30:09.974Z → 2026-10-23T04:30:25.216Z


### integration-migrations — PASS

2026-10-23T04:30:25.218Z → 2026-10-23T04:30:36.287Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-26 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-23T04:30:25.220Z → 2026-10-23T04:30:36.287Z

- tests/integration/migrations.ts: PASS; 2026-10-23T04:30:34.322Z → 2026-10-23T04:30:35.479Z

### integration-oauth-mcp — PASS

2026-10-23T04:30:36.291Z → 2026-10-23T04:30:46.189Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-27 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-23T04:30:36.293Z → 2026-10-23T04:30:46.189Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-23T04:30:44.880Z → 2026-10-23T04:30:45.435Z

### integration-orchestration — PASS

2026-10-23T04:30:46.191Z → 2026-10-23T04:31:04.768Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-28 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T04:30:46.193Z → 2026-10-23T04:31:04.767Z

- tests/integration/orchestration.ts: PASS; 2026-10-23T04:30:56.211Z → 2026-10-23T04:31:03.971Z

### specialist-reasoning — PASS

2026-10-23T04:31:04.771Z → 2026-10-23T04:32:15.313Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-29 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-23T04:31:04.773Z → 2026-10-23T04:32:15.312Z

- tests/specialists/acceptance.ts: PASS; 2026-10-23T04:31:13.912Z → 2026-10-23T04:32:14.455Z

### specialist-gateway — PASS

2026-10-23T04:32:15.317Z → 2026-10-23T04:32:27.269Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-30 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-23T04:32:15.318Z → 2026-10-23T04:32:27.269Z

- tests/specialists/gateway.ts: PASS; 2026-10-23T04:32:25.917Z → 2026-10-23T04:32:26.477Z

### specialist-provenance — PASS

2026-10-23T04:32:27.273Z → 2026-10-23T04:32:39.033Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-31 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-23T04:32:27.275Z → 2026-10-23T04:32:39.033Z

- tests/specialists/provenance.ts: PASS; 2026-10-23T04:32:37.831Z → 2026-10-23T04:32:38.243Z

### specialist-learning-fairness — PASS

2026-10-23T04:32:39.035Z → 2026-10-23T04:32:52.434Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-32 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-23T04:32:39.038Z → 2026-10-23T04:32:52.434Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-23T04:32:50.592Z → 2026-10-23T04:32:51.652Z

### specialist-evaluation — PASS

2026-10-23T04:32:52.439Z → 2026-10-23T04:33:04.576Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-33 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-23T04:32:52.441Z → 2026-10-23T04:33:04.576Z


### evaluation-budget — PASS

2026-10-23T04:33:04.579Z → 2026-10-23T04:33:20.159Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-34 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e --mount type=bind,source=/tmp/sam-planning-full-replan/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-23T04:33:04.582Z → 2026-10-23T04:33:20.159Z

- tests/evaluation/budgets.ts: PASS; 2026-10-23T04:33:15.524Z → 2026-10-23T04:33:19.396Z

### evaluation-adapter — PASS

2026-10-23T04:33:20.161Z → 2026-10-23T04:33:29.680Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-35 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-23T04:33:20.164Z → 2026-10-23T04:33:29.680Z

- tests/evaluation/adapters.ts: PASS; 2026-10-23T04:33:28.380Z → 2026-10-23T04:33:28.905Z

### evaluation-orchestration — PASS

2026-10-23T04:33:29.683Z → 2026-10-23T04:34:00.755Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-36 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e --mount type=bind,source=/tmp/sam-planning-full-replan/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T04:33:29.685Z → 2026-10-23T04:34:00.755Z

- tests/evaluation/orchestration.ts: PASS; 2026-10-23T04:33:38.708Z → 2026-10-23T04:33:59.915Z

### evaluation-independent-review — PASS

2026-10-23T04:34:00.759Z → 2026-10-23T04:34:10.969Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-37 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-23T04:34:00.761Z → 2026-10-23T04:34:10.968Z

- tests/evaluation/review.ts: PASS; 2026-10-23T04:34:09.415Z → 2026-10-23T04:34:10.232Z

### evaluation-commercial-market — PASS

2026-10-23T04:34:10.971Z → 2026-10-23T04:34:44.486Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-38 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e --mount type=bind,source=/tmp/sam-planning-full-replan/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-23T04:34:10.974Z → 2026-10-23T04:34:44.486Z

- tests/evaluation/market.ts: PASS; 2026-10-23T04:34:20.762Z → 2026-10-23T04:34:43.773Z

### evaluation-commercial-profitability — PASS

2026-10-23T04:34:44.491Z → 2026-10-23T04:35:17.889Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-39 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e --mount type=bind,source=/tmp/sam-planning-full-replan/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-23T04:34:44.494Z → 2026-10-23T04:35:17.889Z

- tests/evaluation/profitability.ts: PASS; 2026-10-23T04:34:53.098Z → 2026-10-23T04:35:17.116Z

### evaluation-commercial-suppliers — PASS

2026-10-23T04:35:17.895Z → 2026-10-23T04:35:49.996Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-40 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e --mount type=bind,source=/tmp/sam-planning-full-replan/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-23T04:35:17.900Z → 2026-10-23T04:35:49.995Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-23T04:35:27.263Z → 2026-10-23T04:35:49.268Z

### migration-upgrade-rollback — PASS

2026-10-23T04:35:50.001Z → 2026-10-23T04:36:00.461Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-41 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-23T04:35:50.005Z → 2026-10-23T04:36:00.461Z


### specialist-restart-prepare — PASS

2026-10-23T04:36:00.466Z → 2026-10-23T04:36:09.159Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-42 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T04:36:00.471Z → 2026-10-23T04:36:09.159Z


### evaluation-restart-prepare — PASS

2026-10-23T04:36:09.170Z → 2026-10-23T04:36:19.386Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-43 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=3d8de1c2620cc519926e608bc66018edc6df0e9e node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T04:36:09.174Z → 2026-10-23T04:36:19.386Z


### postgres-restart — PASS

2026-10-23T04:36:19.391Z → 2026-10-23T04:36:20.116Z

```sh
docker restart --time 10 sam-verify-1792729524733-1935bb05-pg
```
Exit: 0; signal: none; 2026-10-23T04:36:19.396Z → 2026-10-23T04:36:20.021Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792729524733-1935bb05-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T04:36:20.021Z → 2026-10-23T04:36:20.116Z


### migration-after-restart — PASS

2026-10-23T04:36:20.123Z → 2026-10-23T04:36:30.629Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-44 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-23T04:36:20.130Z → 2026-10-23T04:36:30.629Z


### specialist-restart-check — PASS

2026-10-23T04:36:30.634Z → 2026-10-23T04:36:39.632Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-45 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T04:36:30.639Z → 2026-10-23T04:36:39.632Z


### evaluation-restart-check — PASS

2026-10-23T04:36:39.637Z → 2026-10-23T04:36:49.290Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-46 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T04:36:39.642Z → 2026-10-23T04:36:49.290Z


### phase0-migrations — PASS

2026-10-23T04:36:49.296Z → 2026-10-23T04:36:49.923Z

```sh
docker cp /tmp/sam-verify-30RbfQ/source/packages/db/migrations sam-verify-1792729524733-1935bb05-pg:/migrations
```
Exit: 0; signal: none; 2026-10-23T04:36:49.300Z → 2026-10-23T04:36:49.314Z

```sh
docker exec sam-verify-1792729524733-1935bb05-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-23T04:36:49.314Z → 2026-10-23T04:36:49.847Z

```sh
docker exec sam-verify-1792729524733-1935bb05-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-23T04:36:49.847Z → 2026-10-23T04:36:49.923Z


### phase0-acceptance — PASS

2026-10-23T04:36:49.928Z → 2026-10-23T04:36:51.942Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-47 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-30RbfQ/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-23T04:36:49.932Z → 2026-10-23T04:36:51.942Z


### phase0-postgres — PASS

2026-10-23T04:36:51.947Z → 2026-10-23T04:36:54.224Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-48 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-30RbfQ/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-23T04:36:51.951Z → 2026-10-23T04:36:54.224Z


### tenant-isolation — PASS

2026-10-23T04:36:54.230Z → 2026-10-23T04:36:55.280Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-49 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-30RbfQ/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-23T04:36:54.235Z → 2026-10-23T04:36:55.280Z


### fail-closed-security — PASS

2026-10-23T04:36:55.286Z → 2026-10-23T04:36:56.359Z

```sh
docker run --rm --name sam-verify-1792729524733-1935bb05-job-50 --label sam.verification.run=sam-verify-1792729524733-1935bb05 --init --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-30RbfQ/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-23T04:36:55.290Z → 2026-10-23T04:36:56.359Z


### clean-image — PASS

2026-10-23T04:36:56.365Z → 2026-10-23T04:37:02.089Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792729524733-1935bb05 Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-23T04:36:56.369Z → 2026-10-23T04:37:02.089Z


### image-contract — PASS

2026-10-23T04:37:02.096Z → 2026-10-23T04:37:02.113Z

```sh
docker image inspect sam-verification:sam-verify-1792729524733-1935bb05
```
Exit: 0; signal: none; 2026-10-23T04:37:02.100Z → 2026-10-23T04:37:02.112Z


### application-startup-restart — PASS

2026-10-23T04:37:02.118Z → 2026-10-23T04:37:07.880Z

```sh
docker run --rm --init --name sam-verify-1792729524733-1935bb05-application --label sam.verification.run=sam-verify-1792729524733-1935bb05 --network container:sam-verify-1792729524733-1935bb05-pg --mount type=bind,src=/tmp/sam-verify-30RbfQ/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792729524733-1935bb05 node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-23T04:37:02.123Z → 2026-10-23T04:37:07.880Z


### source-integrity — PASS

2026-10-23T04:37:07.886Z → 2026-10-23T04:37:07.900Z


### cleanup — PASS

2026-10-23T04:37:07.905Z → 2026-10-23T04:37:09.303Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-pg
```
Exit: 0; signal: none; 2026-10-23T04:37:07.909Z → 2026-10-23T04:37:07.922Z

```sh
docker rm --force --volumes sam-verify-1792729524733-1935bb05-pg
```
Exit: 0; signal: none; 2026-10-23T04:37:07.922Z → 2026-10-23T04:37:08.255Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-1
```
Exit: 1; signal: none; 2026-10-23T04:37:08.255Z → 2026-10-23T04:37:08.274Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-2
```
Exit: 1; signal: none; 2026-10-23T04:37:08.274Z → 2026-10-23T04:37:08.292Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-3
```
Exit: 1; signal: none; 2026-10-23T04:37:08.292Z → 2026-10-23T04:37:08.310Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-4
```
Exit: 1; signal: none; 2026-10-23T04:37:08.310Z → 2026-10-23T04:37:08.328Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-5
```
Exit: 1; signal: none; 2026-10-23T04:37:08.328Z → 2026-10-23T04:37:08.346Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-6
```
Exit: 1; signal: none; 2026-10-23T04:37:08.346Z → 2026-10-23T04:37:08.364Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-7
```
Exit: 1; signal: none; 2026-10-23T04:37:08.364Z → 2026-10-23T04:37:08.383Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-8
```
Exit: 1; signal: none; 2026-10-23T04:37:08.383Z → 2026-10-23T04:37:08.403Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-9
```
Exit: 1; signal: none; 2026-10-23T04:37:08.403Z → 2026-10-23T04:37:08.427Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-10
```
Exit: 1; signal: none; 2026-10-23T04:37:08.427Z → 2026-10-23T04:37:08.446Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-11
```
Exit: 1; signal: none; 2026-10-23T04:37:08.446Z → 2026-10-23T04:37:08.463Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-12
```
Exit: 1; signal: none; 2026-10-23T04:37:08.463Z → 2026-10-23T04:37:08.480Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-13
```
Exit: 1; signal: none; 2026-10-23T04:37:08.480Z → 2026-10-23T04:37:08.498Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-14
```
Exit: 1; signal: none; 2026-10-23T04:37:08.498Z → 2026-10-23T04:37:08.519Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-15
```
Exit: 1; signal: none; 2026-10-23T04:37:08.519Z → 2026-10-23T04:37:08.539Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-16
```
Exit: 1; signal: none; 2026-10-23T04:37:08.539Z → 2026-10-23T04:37:08.561Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-17
```
Exit: 1; signal: none; 2026-10-23T04:37:08.561Z → 2026-10-23T04:37:08.581Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-18
```
Exit: 1; signal: none; 2026-10-23T04:37:08.581Z → 2026-10-23T04:37:08.601Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-19
```
Exit: 1; signal: none; 2026-10-23T04:37:08.601Z → 2026-10-23T04:37:08.623Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-20
```
Exit: 1; signal: none; 2026-10-23T04:37:08.623Z → 2026-10-23T04:37:08.640Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-21
```
Exit: 1; signal: none; 2026-10-23T04:37:08.640Z → 2026-10-23T04:37:08.661Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-22
```
Exit: 1; signal: none; 2026-10-23T04:37:08.661Z → 2026-10-23T04:37:08.681Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-23
```
Exit: 1; signal: none; 2026-10-23T04:37:08.681Z → 2026-10-23T04:37:08.702Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-24
```
Exit: 1; signal: none; 2026-10-23T04:37:08.702Z → 2026-10-23T04:37:08.721Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-25
```
Exit: 1; signal: none; 2026-10-23T04:37:08.721Z → 2026-10-23T04:37:08.740Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-26
```
Exit: 1; signal: none; 2026-10-23T04:37:08.740Z → 2026-10-23T04:37:08.759Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-27
```
Exit: 1; signal: none; 2026-10-23T04:37:08.759Z → 2026-10-23T04:37:08.779Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-28
```
Exit: 1; signal: none; 2026-10-23T04:37:08.779Z → 2026-10-23T04:37:08.799Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-29
```
Exit: 1; signal: none; 2026-10-23T04:37:08.799Z → 2026-10-23T04:37:08.817Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-30
```
Exit: 1; signal: none; 2026-10-23T04:37:08.817Z → 2026-10-23T04:37:08.835Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-31
```
Exit: 1; signal: none; 2026-10-23T04:37:08.835Z → 2026-10-23T04:37:08.854Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-32
```
Exit: 1; signal: none; 2026-10-23T04:37:08.854Z → 2026-10-23T04:37:08.874Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-33
```
Exit: 1; signal: none; 2026-10-23T04:37:08.874Z → 2026-10-23T04:37:08.896Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-34
```
Exit: 1; signal: none; 2026-10-23T04:37:08.896Z → 2026-10-23T04:37:08.916Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-35
```
Exit: 1; signal: none; 2026-10-23T04:37:08.916Z → 2026-10-23T04:37:08.932Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-36
```
Exit: 1; signal: none; 2026-10-23T04:37:08.932Z → 2026-10-23T04:37:08.950Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-37
```
Exit: 1; signal: none; 2026-10-23T04:37:08.950Z → 2026-10-23T04:37:08.967Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-38
```
Exit: 1; signal: none; 2026-10-23T04:37:08.967Z → 2026-10-23T04:37:08.984Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-39
```
Exit: 1; signal: none; 2026-10-23T04:37:08.984Z → 2026-10-23T04:37:09.001Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-40
```
Exit: 1; signal: none; 2026-10-23T04:37:09.001Z → 2026-10-23T04:37:09.020Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-41
```
Exit: 1; signal: none; 2026-10-23T04:37:09.020Z → 2026-10-23T04:37:09.040Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-42
```
Exit: 1; signal: none; 2026-10-23T04:37:09.040Z → 2026-10-23T04:37:09.060Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-43
```
Exit: 1; signal: none; 2026-10-23T04:37:09.060Z → 2026-10-23T04:37:09.077Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-44
```
Exit: 1; signal: none; 2026-10-23T04:37:09.077Z → 2026-10-23T04:37:09.096Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-45
```
Exit: 1; signal: none; 2026-10-23T04:37:09.096Z → 2026-10-23T04:37:09.116Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-46
```
Exit: 1; signal: none; 2026-10-23T04:37:09.116Z → 2026-10-23T04:37:09.137Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-47
```
Exit: 1; signal: none; 2026-10-23T04:37:09.137Z → 2026-10-23T04:37:09.155Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-48
```
Exit: 1; signal: none; 2026-10-23T04:37:09.155Z → 2026-10-23T04:37:09.174Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-49
```
Exit: 1; signal: none; 2026-10-23T04:37:09.174Z → 2026-10-23T04:37:09.193Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-job-50
```
Exit: 1; signal: none; 2026-10-23T04:37:09.193Z → 2026-10-23T04:37:09.209Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-application
```
Exit: 1; signal: none; 2026-10-23T04:37:09.209Z → 2026-10-23T04:37:09.226Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792729524733-1935bb05-net
```
Exit: 0; signal: none; 2026-10-23T04:37:09.226Z → 2026-10-23T04:37:09.237Z

```sh
docker network rm sam-verify-1792729524733-1935bb05-net
```
Exit: 0; signal: none; 2026-10-23T04:37:09.237Z → 2026-10-23T04:37:09.279Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
