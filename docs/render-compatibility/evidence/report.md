# Independent SAM verification

Status: **PASS**
Source: `23524531860221189f517c43fdbdb6a3b1bf408f` (clean: true)
Started: 2026-10-22T15:11:54.044Z; completed: 2026-10-22T15:27:06.787Z

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
| render-migration-compatibility | PASS | [log](logs/23-render-migration-compatibility.log) |
| render-google-oauth-contracts | PASS | [log](logs/24-render-google-oauth-contracts.log) |
| integration-migrations | PASS | [log](logs/25-integration-migrations.log) |
| integration-oauth-mcp | PASS | [log](logs/26-integration-oauth-mcp.log) |
| integration-orchestration | PASS | [log](logs/27-integration-orchestration.log) |
| specialist-reasoning | PASS | [log](logs/28-specialist-reasoning.log) |
| specialist-gateway | PASS | [log](logs/29-specialist-gateway.log) |
| specialist-provenance | PASS | [log](logs/30-specialist-provenance.log) |
| specialist-learning-fairness | PASS | [log](logs/31-specialist-learning-fairness.log) |
| specialist-evaluation | PASS | [log](logs/32-specialist-evaluation.log) |
| evaluation-budget | PASS | [log](logs/33-evaluation-budget.log) |
| evaluation-adapter | PASS | [log](logs/34-evaluation-adapter.log) |
| evaluation-orchestration | PASS | [log](logs/35-evaluation-orchestration.log) |
| evaluation-independent-review | PASS | [log](logs/36-evaluation-independent-review.log) |
| evaluation-commercial-market | PASS | [log](logs/37-evaluation-commercial-market.log) |
| evaluation-commercial-profitability | PASS | [log](logs/38-evaluation-commercial-profitability.log) |
| evaluation-commercial-suppliers | PASS | [log](logs/39-evaluation-commercial-suppliers.log) |
| migration-upgrade-rollback | PASS | [log](logs/40-migration-upgrade-rollback.log) |
| specialist-restart-prepare | PASS | [log](logs/41-specialist-restart-prepare.log) |
| evaluation-restart-prepare | PASS | [log](logs/42-evaluation-restart-prepare.log) |
| postgres-restart | PASS | [log](logs/43-postgres-restart.log) |
| migration-after-restart | PASS | [log](logs/44-migration-after-restart.log) |
| specialist-restart-check | PASS | [log](logs/45-specialist-restart-check.log) |
| evaluation-restart-check | PASS | [log](logs/46-evaluation-restart-check.log) |
| phase0-migrations | PASS | [log](logs/47-phase0-migrations.log) |
| phase0-acceptance | PASS | [log](logs/48-phase0-acceptance.log) |
| phase0-postgres | PASS | [log](logs/49-phase0-postgres.log) |
| tenant-isolation | PASS | [log](logs/50-tenant-isolation.log) |
| fail-closed-security | PASS | [log](logs/51-fail-closed-security.log) |
| clean-image | PASS | [log](logs/52-clean-image.log) |
| image-contract | PASS | [log](logs/53-image-contract.log) |
| application-startup-restart | PASS | [log](logs/54-application-startup-restart.log) |
| source-integrity | PASS | [log](logs/55-source-integrity.log) |
| cleanup | PASS | [log](logs/56-cleanup.log) |

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
- clean-application: `sam-verification:sam-verify-1792681914043-e182fd0d`; ID `sha256:e3937f65befc1359d8b4b0a4d93f75e06a7ec3b3f2f63fc67d341e24ff54622a`

## Commands and suite outcomes

### preflight — PASS

2026-10-22T15:11:54.045Z → 2026-10-22T15:11:54.451Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-22T15:11:54.050Z → 2026-10-22T15:11:54.055Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-22T15:11:54.055Z → 2026-10-22T15:11:54.058Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-22T15:11:54.058Z → 2026-10-22T15:11:54.064Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-22T15:11:54.064Z → 2026-10-22T15:11:54.100Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-22T15:11:54.100Z → 2026-10-22T15:11:54.155Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-22T15:11:54.155Z → 2026-10-22T15:11:54.254Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-22T15:11:54.254Z → 2026-10-22T15:11:54.368Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-22T15:11:54.368Z → 2026-10-22T15:11:54.421Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-22T15:11:54.421Z → 2026-10-22T15:11:54.424Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-22T15:11:54.424Z → 2026-10-22T15:11:54.447Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-22T15:11:54.447Z → 2026-10-22T15:11:54.451Z


### snapshot — PASS

2026-10-22T15:11:54.452Z → 2026-10-22T15:11:54.529Z

```sh
git archive --format=tar --output /tmp/sam-verify-Nu2HAN/source.tar 23524531860221189f517c43fdbdb6a3b1bf408f
```
Exit: 0; signal: none; 2026-10-22T15:11:54.454Z → 2026-10-22T15:11:54.492Z

```sh
tar -xf /tmp/sam-verify-Nu2HAN/source.tar -C /tmp/sam-verify-Nu2HAN/source
```
Exit: 0; signal: none; 2026-10-22T15:11:54.492Z → 2026-10-22T15:11:54.503Z


### images — PASS

2026-10-22T15:11:54.531Z → 2026-10-22T15:11:54.648Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-22T15:11:54.532Z → 2026-10-22T15:11:54.550Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-22T15:11:54.550Z → 2026-10-22T15:11:54.565Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-22T15:11:54.566Z → 2026-10-22T15:11:54.580Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-22T15:11:54.580Z → 2026-10-22T15:11:54.595Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-22T15:11:54.595Z → 2026-10-22T15:11:54.608Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-22T15:11:54.608Z → 2026-10-22T15:11:54.622Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-22T15:11:54.622Z → 2026-10-22T15:11:54.636Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-22T15:11:54.636Z → 2026-10-22T15:11:54.648Z


### isolated-postgres — PASS

2026-10-22T15:11:54.649Z → 2026-10-22T15:12:00.730Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792681914043-e182fd0d sam-verify-1792681914043-e182fd0d-net
```
Exit: 0; signal: none; 2026-10-22T15:11:54.650Z → 2026-10-22T15:11:54.690Z

```sh
docker run --detach --name sam-verify-1792681914043-e182fd0d-pg --label sam.verification.run=sam-verify-1792681914043-e182fd0d --network sam-verify-1792681914043-e182fd0d-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-22T15:11:54.690Z → 2026-10-22T15:11:59.063Z

```sh
docker exec sam-verify-1792681914043-e182fd0d-pg pg_isready -U postgres -d sam_core_test
```
Exit: 2; signal: none; 2026-10-22T15:11:59.063Z → 2026-10-22T15:11:59.157Z

```sh
docker exec sam-verify-1792681914043-e182fd0d-pg pg_isready -U postgres -d sam_core_test
```
Exit: 2; signal: none; 2026-10-22T15:11:59.658Z → 2026-10-22T15:11:59.783Z

```sh
docker exec sam-verify-1792681914043-e182fd0d-pg pg_isready -U postgres -d sam_core_test
```
Exit: 0; signal: none; 2026-10-22T15:12:00.284Z → 2026-10-22T15:12:00.366Z

```sh
docker exec sam-verify-1792681914043-e182fd0d-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-22T15:12:00.366Z → 2026-10-22T15:12:00.470Z

```sh
docker exec sam-verify-1792681914043-e182fd0d-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-22T15:12:00.470Z → 2026-10-22T15:12:00.633Z

```sh
docker exec sam-verify-1792681914043-e182fd0d-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-22T15:12:00.633Z → 2026-10-22T15:12:00.730Z


### node-dependencies — PASS

2026-10-22T15:12:00.736Z → 2026-10-22T15:12:16.904Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-1 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.3.13 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-22T15:12:00.737Z → 2026-10-22T15:12:16.904Z


### python-dependencies — PASS

2026-10-22T15:12:16.906Z → 2026-10-22T15:12:21.670Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-2 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.3.13 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-Nu2HAN/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-22T15:12:16.908Z → 2026-10-22T15:12:21.669Z


### runtime-versions — PASS

2026-10-22T15:12:21.671Z → 2026-10-22T15:13:02.741Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-3 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-22T15:12:21.672Z → 2026-10-22T15:12:31.724Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-4 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-22T15:12:31.724Z → 2026-10-22T15:12:45.269Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-5 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-22T15:12:45.269Z → 2026-10-22T15:13:00.111Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-6 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-22T15:13:00.112Z → 2026-10-22T15:13:02.656Z

```sh
docker exec sam-verify-1792681914043-e182fd0d-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-22T15:13:02.656Z → 2026-10-22T15:13:02.741Z


### workflow-tool — PASS

2026-10-22T15:13:02.743Z → 2026-10-22T15:13:03.115Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-Nu2HAN/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-22T15:13:02.746Z → 2026-10-22T15:13:03.060Z

```sh
tar -xzf /tmp/sam-verify-Nu2HAN/actionlint.tar.gz -C /tmp/sam-verify-Nu2HAN actionlint
```
Exit: 0; signal: none; 2026-10-22T15:13:03.063Z → 2026-10-22T15:13:03.111Z

```sh
/tmp/sam-verify-Nu2HAN/actionlint --version
```
Exit: 0; signal: none; 2026-10-22T15:13:03.111Z → 2026-10-22T15:13:03.115Z


### workflow-validation — PASS

2026-10-22T15:13:03.116Z → 2026-10-22T15:13:03.126Z

```sh
/tmp/sam-verify-Nu2HAN/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-22T15:13:03.122Z → 2026-10-22T15:13:03.126Z


### configuration-validation — PASS

2026-10-22T15:13:03.132Z → 2026-10-22T15:13:48.980Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-22T15:13:03.133Z → 2026-10-22T15:13:03.413Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-22T15:13:03.413Z → 2026-10-22T15:13:03.484Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-22T15:13:03.484Z → 2026-10-22T15:13:03.553Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-22T15:13:03.553Z → 2026-10-22T15:13:03.624Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-22T15:13:03.624Z → 2026-10-22T15:13:03.693Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-7 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-22T15:13:03.693Z → 2026-10-22T15:13:19.482Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-8 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-22T15:13:19.483Z → 2026-10-22T15:13:34.692Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-9 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-22T15:13:34.692Z → 2026-10-22T15:13:48.979Z


### typecheck — PASS

2026-10-22T15:13:48.982Z → 2026-10-22T15:14:08.869Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-10 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-22T15:13:48.985Z → 2026-10-22T15:14:08.869Z


### regression — PASS

2026-10-22T15:14:08.873Z → 2026-10-22T15:14:51.480Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-11 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-22T15:14:08.876Z → 2026-10-22T15:14:51.476Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-22T15:14:23.663Z → 2026-10-22T15:14:24.205Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-22T15:14:24.226Z → 2026-10-22T15:14:24.644Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-22T15:14:24.661Z → 2026-10-22T15:14:25.103Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-22T15:14:25.119Z → 2026-10-22T15:14:25.539Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-22T15:14:25.556Z → 2026-10-22T15:14:25.969Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-22T15:14:25.986Z → 2026-10-22T15:14:26.350Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-22T15:14:26.367Z → 2026-10-22T15:14:26.862Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-22T15:14:26.878Z → 2026-10-22T15:14:27.341Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-22T15:14:27.358Z → 2026-10-22T15:14:27.827Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-22T15:14:27.844Z → 2026-10-22T15:14:28.269Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-22T15:14:28.286Z → 2026-10-22T15:14:28.685Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-22T15:14:28.701Z → 2026-10-22T15:14:29.008Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-22T15:14:29.024Z → 2026-10-22T15:14:29.499Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-22T15:14:29.517Z → 2026-10-22T15:14:29.895Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-22T15:14:29.912Z → 2026-10-22T15:14:30.297Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-22T15:14:30.314Z → 2026-10-22T15:14:30.803Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-22T15:14:30.820Z → 2026-10-22T15:14:31.299Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-22T15:14:31.316Z → 2026-10-22T15:14:31.770Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-22T15:14:31.789Z → 2026-10-22T15:14:32.223Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-22T15:14:32.239Z → 2026-10-22T15:14:32.642Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-22T15:14:32.661Z → 2026-10-22T15:14:33.039Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-22T15:14:33.055Z → 2026-10-22T15:14:33.355Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-22T15:14:33.371Z → 2026-10-22T15:14:33.814Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-22T15:14:33.831Z → 2026-10-22T15:14:35.235Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-22T15:14:35.253Z → 2026-10-22T15:14:35.829Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-22T15:14:35.847Z → 2026-10-22T15:14:36.244Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-22T15:14:36.269Z → 2026-10-22T15:14:36.871Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-22T15:14:36.889Z → 2026-10-22T15:14:37.692Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-22T15:14:37.709Z → 2026-10-22T15:14:38.173Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-22T15:14:38.190Z → 2026-10-22T15:14:38.620Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-22T15:14:38.636Z → 2026-10-22T15:14:39.365Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-22T15:14:39.382Z → 2026-10-22T15:14:39.840Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-22T15:14:39.857Z → 2026-10-22T15:14:40.307Z
- tests/phase15/bol_read.ts: PASS; 2026-10-22T15:14:40.324Z → 2026-10-22T15:14:40.790Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-22T15:14:40.807Z → 2026-10-22T15:14:41.235Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-22T15:14:41.253Z → 2026-10-22T15:14:41.896Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-22T15:14:41.913Z → 2026-10-22T15:14:42.375Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-22T15:14:42.392Z → 2026-10-22T15:14:42.892Z
- tests/phase19/command_center.ts: PASS; 2026-10-22T15:14:42.909Z → 2026-10-22T15:14:43.455Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-22T15:14:43.472Z → 2026-10-22T15:14:44.003Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-22T15:14:44.020Z → 2026-10-22T15:14:45.027Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-22T15:14:45.045Z → 2026-10-22T15:14:45.424Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-22T15:14:45.442Z → 2026-10-22T15:14:46.690Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-22T15:14:46.708Z → 2026-10-22T15:14:47.196Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-22T15:14:47.212Z → 2026-10-22T15:14:47.791Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-22T15:14:47.809Z → 2026-10-22T15:14:48.254Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-22T15:14:48.272Z → 2026-10-22T15:14:49.103Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-22T15:14:49.121Z → 2026-10-22T15:14:49.810Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-22T15:14:49.838Z → 2026-10-22T15:14:50.650Z

### core-reliability — PASS

2026-10-22T15:14:51.491Z → 2026-10-22T15:15:19.472Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-12 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-22T15:14:51.495Z → 2026-10-22T15:15:19.471Z

- tests/core/reliability.ts: PASS; 2026-10-22T15:15:07.399Z → 2026-10-22T15:15:12.671Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-22T15:15:12.692Z → 2026-10-22T15:15:13.230Z
- tests/core/reservationRace.ts: PASS; 2026-10-22T15:15:13.247Z → 2026-10-22T15:15:13.716Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-22T15:15:13.733Z → 2026-10-22T15:15:14.250Z
- tests/core/eventBacklog.ts: PASS; 2026-10-22T15:15:14.267Z → 2026-10-22T15:15:15.857Z
- tests/core/learningScheduling.ts: PASS; 2026-10-22T15:15:15.877Z → 2026-10-22T15:15:16.366Z
- tests/core/startupAdmission.ts: PASS; 2026-10-22T15:15:16.382Z → 2026-10-22T15:15:18.073Z
- tests/core/planningDeadline.ts: PASS; 2026-10-22T15:15:18.093Z → 2026-10-22T15:15:18.711Z

### provider-auth — PASS

2026-10-22T15:15:19.479Z → 2026-10-22T15:15:34.882Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-13 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-22T15:15:19.483Z → 2026-10-22T15:15:34.880Z

- tests/release/provider_auth.ts: PASS; 2026-10-22T15:15:33.600Z → 2026-10-22T15:15:34.097Z

### postgres-tls — PASS

2026-10-22T15:15:34.887Z → 2026-10-22T15:15:51.047Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-14 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-22T15:15:34.892Z → 2026-10-22T15:15:51.046Z

- tests/release/postgres_tls.ts: PASS; 2026-10-22T15:15:49.659Z → 2026-10-22T15:15:50.303Z

### contracts — PASS

2026-10-22T15:15:51.052Z → 2026-10-22T15:16:07.175Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-15 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-22T15:15:51.054Z → 2026-10-22T15:16:07.175Z

- tests/release/contracts.ts: PASS; 2026-10-22T15:16:05.581Z → 2026-10-22T15:16:06.349Z

### synthetic-pilot — PASS

2026-10-22T15:16:07.180Z → 2026-10-22T15:16:22.030Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-16 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-22T15:16:07.183Z → 2026-10-22T15:16:22.030Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-22T15:16:20.648Z → 2026-10-22T15:16:21.370Z

### managed-schema — PASS

2026-10-22T15:16:22.033Z → 2026-10-22T15:16:36.221Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-17 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-22T15:16:22.036Z → 2026-10-22T15:16:36.220Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-22T15:16:35.259Z → 2026-10-22T15:16:35.524Z

### local-bundle — PASS

2026-10-22T15:16:36.224Z → 2026-10-22T15:16:50.542Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-18 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-22T15:16:36.227Z → 2026-10-22T15:16:50.542Z

- tests/release/local_bundle.ts: PASS; 2026-10-22T15:16:49.492Z → 2026-10-22T15:16:49.881Z

### closed-setup — PASS

2026-10-22T15:16:50.546Z → 2026-10-22T15:17:03.799Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-19 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-22T15:16:50.549Z → 2026-10-22T15:17:03.799Z

- tests/release/setup.ts: PASS; 2026-10-22T15:17:02.538Z → 2026-10-22T15:17:03.107Z

### database-contract — PASS

2026-10-22T15:17:03.803Z → 2026-10-22T15:17:17.564Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-20 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-22T15:17:03.806Z → 2026-10-22T15:17:17.564Z

- tests/release/database_check.ts: PASS; 2026-10-22T15:17:16.547Z → 2026-10-22T15:17:16.884Z

### prelaunch-gate — PASS

2026-10-22T15:17:17.568Z → 2026-10-22T15:17:30.888Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-21 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-22T15:17:17.571Z → 2026-10-22T15:17:30.888Z

- tests/release/prelaunch.ts: PASS; 2026-10-22T15:17:29.891Z → 2026-10-22T15:17:30.198Z

### render-migration-compatibility — PASS

2026-10-22T15:17:30.892Z → 2026-10-22T15:17:46.570Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-22 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-22T15:17:30.896Z → 2026-10-22T15:17:46.569Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-22T15:17:44.678Z → 2026-10-22T15:17:45.886Z

### render-google-oauth-contracts — PASS

2026-10-22T15:17:46.573Z → 2026-10-22T15:18:07.151Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-23 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-22T15:17:46.577Z → 2026-10-22T15:18:07.151Z


### integration-migrations — PASS

2026-10-22T15:18:07.157Z → 2026-10-22T15:18:25.205Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-24 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-22T15:18:07.163Z → 2026-10-22T15:18:25.204Z

- tests/integration/migrations.ts: PASS; 2026-10-22T15:18:23.139Z → 2026-10-22T15:18:24.205Z

### integration-oauth-mcp — PASS

2026-10-22T15:18:25.210Z → 2026-10-22T15:18:43.130Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-25 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-22T15:18:25.213Z → 2026-10-22T15:18:43.129Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-22T15:18:41.745Z → 2026-10-22T15:18:42.367Z

### integration-orchestration — PASS

2026-10-22T15:18:43.135Z → 2026-10-22T15:19:09.148Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-26 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-22T15:18:43.138Z → 2026-10-22T15:19:09.147Z

- tests/integration/orchestration.ts: PASS; 2026-10-22T15:19:00.045Z → 2026-10-22T15:19:08.362Z

### specialist-reasoning — PASS

2026-10-22T15:19:09.153Z → 2026-10-22T15:20:24.563Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-27 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-22T15:19:09.157Z → 2026-10-22T15:20:24.561Z

- tests/specialists/acceptance.ts: PASS; 2026-10-22T15:19:26.637Z → 2026-10-22T15:20:23.524Z

### specialist-gateway — PASS

2026-10-22T15:20:24.574Z → 2026-10-22T15:20:47.464Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-28 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-22T15:20:24.579Z → 2026-10-22T15:20:47.462Z

- tests/specialists/gateway.ts: PASS; 2026-10-22T15:20:45.820Z → 2026-10-22T15:20:46.520Z

### specialist-provenance — PASS

2026-10-22T15:20:47.472Z → 2026-10-22T15:21:04.698Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-29 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-22T15:20:47.479Z → 2026-10-22T15:21:04.698Z

- tests/specialists/provenance.ts: PASS; 2026-10-22T15:21:03.501Z → 2026-10-22T15:21:03.928Z

### specialist-learning-fairness — PASS

2026-10-22T15:21:04.701Z → 2026-10-22T15:21:21.213Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-30 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-22T15:21:04.705Z → 2026-10-22T15:21:21.212Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-22T15:21:19.110Z → 2026-10-22T15:21:20.352Z

### specialist-evaluation — PASS

2026-10-22T15:21:21.219Z → 2026-10-22T15:21:39.451Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-31 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-22T15:21:21.222Z → 2026-10-22T15:21:39.451Z


### evaluation-budget — PASS

2026-10-22T15:21:39.454Z → 2026-10-22T15:21:56.956Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-32 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f --mount type=bind,source=/workspace/sam-render-compatibility-acceptance/complete/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-22T15:21:39.458Z → 2026-10-22T15:21:56.956Z

- tests/evaluation/budgets.ts: PASS; 2026-10-22T15:21:52.449Z → 2026-10-22T15:21:56.230Z

### evaluation-adapter — PASS

2026-10-22T15:21:56.960Z → 2026-10-22T15:22:15.633Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-33 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-22T15:21:56.964Z → 2026-10-22T15:22:15.631Z

- tests/evaluation/adapters.ts: PASS; 2026-10-22T15:22:12.940Z → 2026-10-22T15:22:14.705Z

### evaluation-orchestration — PASS

2026-10-22T15:22:15.646Z → 2026-10-22T15:22:52.443Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-34 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f --mount type=bind,source=/workspace/sam-render-compatibility-acceptance/complete/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-22T15:22:15.651Z → 2026-10-22T15:22:52.440Z

- tests/evaluation/orchestration.ts: PASS; 2026-10-22T15:22:29.840Z → 2026-10-22T15:22:51.370Z

### evaluation-independent-review — PASS

2026-10-22T15:22:52.452Z → 2026-10-22T15:23:09.558Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-35 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-22T15:22:52.460Z → 2026-10-22T15:23:09.550Z

- tests/evaluation/review.ts: PASS; 2026-10-22T15:23:07.421Z → 2026-10-22T15:23:08.691Z

### evaluation-commercial-market — PASS

2026-10-22T15:23:09.592Z → 2026-10-22T15:23:49.118Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-36 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f --mount type=bind,source=/workspace/sam-render-compatibility-acceptance/complete/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-22T15:23:09.614Z → 2026-10-22T15:23:49.117Z

- tests/evaluation/market.ts: PASS; 2026-10-22T15:23:25.752Z → 2026-10-22T15:23:48.266Z

### evaluation-commercial-profitability — PASS

2026-10-22T15:23:49.131Z → 2026-10-22T15:24:29.236Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-37 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f --mount type=bind,source=/workspace/sam-render-compatibility-acceptance/complete/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-22T15:23:49.135Z → 2026-10-22T15:24:29.235Z

- tests/evaluation/profitability.ts: PASS; 2026-10-22T15:24:06.996Z → 2026-10-22T15:24:28.398Z

### evaluation-commercial-suppliers — PASS

2026-10-22T15:24:29.247Z → 2026-10-22T15:25:08.288Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-38 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f --mount type=bind,source=/workspace/sam-render-compatibility-acceptance/complete/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-22T15:24:29.255Z → 2026-10-22T15:25:08.287Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-22T15:24:45.683Z → 2026-10-22T15:25:07.485Z

### migration-upgrade-rollback — PASS

2026-10-22T15:25:08.301Z → 2026-10-22T15:25:25.875Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-39 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-22T15:25:08.306Z → 2026-10-22T15:25:25.875Z


### specialist-restart-prepare — PASS

2026-10-22T15:25:25.884Z → 2026-10-22T15:25:40.375Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-40 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-22T15:25:25.892Z → 2026-10-22T15:25:40.375Z


### evaluation-restart-prepare — PASS

2026-10-22T15:25:40.383Z → 2026-10-22T15:25:53.805Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-41 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=23524531860221189f517c43fdbdb6a3b1bf408f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-22T15:25:40.389Z → 2026-10-22T15:25:53.805Z


### postgres-restart — PASS

2026-10-22T15:25:53.818Z → 2026-10-22T15:25:54.500Z

```sh
docker restart --time 10 sam-verify-1792681914043-e182fd0d-pg
```
Exit: 0; signal: none; 2026-10-22T15:25:53.829Z → 2026-10-22T15:25:54.383Z

```sh
docker exec sam-verify-1792681914043-e182fd0d-pg pg_isready -U postgres -d sam_core_test
```
Exit: 0; signal: none; 2026-10-22T15:25:54.383Z → 2026-10-22T15:25:54.500Z


### migration-after-restart — PASS

2026-10-22T15:25:54.510Z → 2026-10-22T15:26:09.584Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-42 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-22T15:25:54.516Z → 2026-10-22T15:26:09.584Z


### specialist-restart-check — PASS

2026-10-22T15:26:09.591Z → 2026-10-22T15:26:23.478Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-43 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-22T15:26:09.596Z → 2026-10-22T15:26:23.478Z


### evaluation-restart-check — PASS

2026-10-22T15:26:23.514Z → 2026-10-22T15:26:37.639Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-44 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-22T15:26:23.532Z → 2026-10-22T15:26:37.639Z


### phase0-migrations — PASS

2026-10-22T15:26:37.646Z → 2026-10-22T15:26:38.329Z

```sh
docker cp /tmp/sam-verify-Nu2HAN/source/packages/db/migrations sam-verify-1792681914043-e182fd0d-pg:/migrations
```
Exit: 0; signal: none; 2026-10-22T15:26:37.651Z → 2026-10-22T15:26:37.672Z

```sh
docker exec sam-verify-1792681914043-e182fd0d-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-22T15:26:37.672Z → 2026-10-22T15:26:38.243Z

```sh
docker exec sam-verify-1792681914043-e182fd0d-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-22T15:26:38.243Z → 2026-10-22T15:26:38.329Z


### phase0-acceptance — PASS

2026-10-22T15:26:38.336Z → 2026-10-22T15:26:41.292Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-45 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-Nu2HAN/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-22T15:26:38.341Z → 2026-10-22T15:26:41.292Z


### phase0-postgres — PASS

2026-10-22T15:26:41.303Z → 2026-10-22T15:26:42.725Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-46 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-Nu2HAN/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-22T15:26:41.309Z → 2026-10-22T15:26:42.725Z


### tenant-isolation — PASS

2026-10-22T15:26:42.733Z → 2026-10-22T15:26:44.218Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-47 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-Nu2HAN/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-22T15:26:42.738Z → 2026-10-22T15:26:44.218Z


### fail-closed-security — PASS

2026-10-22T15:26:44.229Z → 2026-10-22T15:26:45.360Z

```sh
docker run --rm --name sam-verify-1792681914043-e182fd0d-job-48 --label sam.verification.run=sam-verify-1792681914043-e182fd0d --init --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-Nu2HAN/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-22T15:26:44.234Z → 2026-10-22T15:26:45.360Z


### clean-image — PASS

2026-10-22T15:26:45.366Z → 2026-10-22T15:26:57.064Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792681914043-e182fd0d Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-22T15:26:45.376Z → 2026-10-22T15:26:57.063Z


### image-contract — PASS

2026-10-22T15:26:57.071Z → 2026-10-22T15:26:57.092Z

```sh
docker image inspect sam-verification:sam-verify-1792681914043-e182fd0d
```
Exit: 0; signal: none; 2026-10-22T15:26:57.077Z → 2026-10-22T15:26:57.091Z


### application-startup-restart — PASS

2026-10-22T15:26:57.098Z → 2026-10-22T15:27:05.004Z

```sh
docker run --rm --init --name sam-verify-1792681914043-e182fd0d-application --label sam.verification.run=sam-verify-1792681914043-e182fd0d --network container:sam-verify-1792681914043-e182fd0d-pg --mount type=bind,src=/tmp/sam-verify-Nu2HAN/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792681914043-e182fd0d node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-22T15:26:57.103Z → 2026-10-22T15:27:05.004Z


### source-integrity — PASS

2026-10-22T15:27:05.012Z → 2026-10-22T15:27:05.039Z


### cleanup — PASS

2026-10-22T15:27:05.044Z → 2026-10-22T15:27:06.778Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-pg
```
Exit: 0; signal: none; 2026-10-22T15:27:05.051Z → 2026-10-22T15:27:05.084Z

```sh
docker rm --force --volumes sam-verify-1792681914043-e182fd0d-pg
```
Exit: 0; signal: none; 2026-10-22T15:27:05.084Z → 2026-10-22T15:27:05.569Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-1
```
Exit: 1; signal: none; 2026-10-22T15:27:05.569Z → 2026-10-22T15:27:05.599Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-2
```
Exit: 1; signal: none; 2026-10-22T15:27:05.600Z → 2026-10-22T15:27:05.631Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-3
```
Exit: 1; signal: none; 2026-10-22T15:27:05.631Z → 2026-10-22T15:27:05.654Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-4
```
Exit: 1; signal: none; 2026-10-22T15:27:05.654Z → 2026-10-22T15:27:05.683Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-5
```
Exit: 1; signal: none; 2026-10-22T15:27:05.683Z → 2026-10-22T15:27:05.709Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-6
```
Exit: 1; signal: none; 2026-10-22T15:27:05.709Z → 2026-10-22T15:27:05.732Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-7
```
Exit: 1; signal: none; 2026-10-22T15:27:05.732Z → 2026-10-22T15:27:05.756Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-8
```
Exit: 1; signal: none; 2026-10-22T15:27:05.756Z → 2026-10-22T15:27:05.786Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-9
```
Exit: 1; signal: none; 2026-10-22T15:27:05.786Z → 2026-10-22T15:27:05.807Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-10
```
Exit: 1; signal: none; 2026-10-22T15:27:05.807Z → 2026-10-22T15:27:05.828Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-11
```
Exit: 1; signal: none; 2026-10-22T15:27:05.828Z → 2026-10-22T15:27:05.848Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-12
```
Exit: 1; signal: none; 2026-10-22T15:27:05.848Z → 2026-10-22T15:27:05.870Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-13
```
Exit: 1; signal: none; 2026-10-22T15:27:05.870Z → 2026-10-22T15:27:05.892Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-14
```
Exit: 1; signal: none; 2026-10-22T15:27:05.892Z → 2026-10-22T15:27:05.912Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-15
```
Exit: 1; signal: none; 2026-10-22T15:27:05.912Z → 2026-10-22T15:27:05.932Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-16
```
Exit: 1; signal: none; 2026-10-22T15:27:05.932Z → 2026-10-22T15:27:05.953Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-17
```
Exit: 1; signal: none; 2026-10-22T15:27:05.953Z → 2026-10-22T15:27:05.974Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-18
```
Exit: 1; signal: none; 2026-10-22T15:27:05.974Z → 2026-10-22T15:27:05.998Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-19
```
Exit: 1; signal: none; 2026-10-22T15:27:05.998Z → 2026-10-22T15:27:06.020Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-20
```
Exit: 1; signal: none; 2026-10-22T15:27:06.020Z → 2026-10-22T15:27:06.039Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-21
```
Exit: 1; signal: none; 2026-10-22T15:27:06.039Z → 2026-10-22T15:27:06.063Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-22
```
Exit: 1; signal: none; 2026-10-22T15:27:06.063Z → 2026-10-22T15:27:06.084Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-23
```
Exit: 1; signal: none; 2026-10-22T15:27:06.084Z → 2026-10-22T15:27:06.110Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-24
```
Exit: 1; signal: none; 2026-10-22T15:27:06.110Z → 2026-10-22T15:27:06.132Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-25
```
Exit: 1; signal: none; 2026-10-22T15:27:06.132Z → 2026-10-22T15:27:06.153Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-26
```
Exit: 1; signal: none; 2026-10-22T15:27:06.153Z → 2026-10-22T15:27:06.174Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-27
```
Exit: 1; signal: none; 2026-10-22T15:27:06.174Z → 2026-10-22T15:27:06.195Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-28
```
Exit: 1; signal: none; 2026-10-22T15:27:06.195Z → 2026-10-22T15:27:06.221Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-29
```
Exit: 1; signal: none; 2026-10-22T15:27:06.221Z → 2026-10-22T15:27:06.243Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-30
```
Exit: 1; signal: none; 2026-10-22T15:27:06.243Z → 2026-10-22T15:27:06.264Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-31
```
Exit: 1; signal: none; 2026-10-22T15:27:06.264Z → 2026-10-22T15:27:06.291Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-32
```
Exit: 1; signal: none; 2026-10-22T15:27:06.291Z → 2026-10-22T15:27:06.313Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-33
```
Exit: 1; signal: none; 2026-10-22T15:27:06.313Z → 2026-10-22T15:27:06.333Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-34
```
Exit: 1; signal: none; 2026-10-22T15:27:06.333Z → 2026-10-22T15:27:06.355Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-35
```
Exit: 1; signal: none; 2026-10-22T15:27:06.355Z → 2026-10-22T15:27:06.377Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-36
```
Exit: 1; signal: none; 2026-10-22T15:27:06.377Z → 2026-10-22T15:27:06.396Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-37
```
Exit: 1; signal: none; 2026-10-22T15:27:06.396Z → 2026-10-22T15:27:06.416Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-38
```
Exit: 1; signal: none; 2026-10-22T15:27:06.416Z → 2026-10-22T15:27:06.437Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-39
```
Exit: 1; signal: none; 2026-10-22T15:27:06.437Z → 2026-10-22T15:27:06.459Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-40
```
Exit: 1; signal: none; 2026-10-22T15:27:06.459Z → 2026-10-22T15:27:06.479Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-41
```
Exit: 1; signal: none; 2026-10-22T15:27:06.479Z → 2026-10-22T15:27:06.499Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-42
```
Exit: 1; signal: none; 2026-10-22T15:27:06.499Z → 2026-10-22T15:27:06.519Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-43
```
Exit: 1; signal: none; 2026-10-22T15:27:06.519Z → 2026-10-22T15:27:06.539Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-44
```
Exit: 1; signal: none; 2026-10-22T15:27:06.539Z → 2026-10-22T15:27:06.568Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-45
```
Exit: 1; signal: none; 2026-10-22T15:27:06.568Z → 2026-10-22T15:27:06.593Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-46
```
Exit: 1; signal: none; 2026-10-22T15:27:06.593Z → 2026-10-22T15:27:06.614Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-47
```
Exit: 1; signal: none; 2026-10-22T15:27:06.614Z → 2026-10-22T15:27:06.635Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-job-48
```
Exit: 1; signal: none; 2026-10-22T15:27:06.635Z → 2026-10-22T15:27:06.655Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-application
```
Exit: 1; signal: none; 2026-10-22T15:27:06.655Z → 2026-10-22T15:27:06.676Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792681914043-e182fd0d-net
```
Exit: 0; signal: none; 2026-10-22T15:27:06.676Z → 2026-10-22T15:27:06.689Z

```sh
docker network rm sam-verify-1792681914043-e182fd0d-net
```
Exit: 0; signal: none; 2026-10-22T15:27:06.689Z → 2026-10-22T15:27:06.744Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
