# Independent SAM verification

Status: **PASS**
Source: `00b821d73a764d2c89c0a3f1e6e3535642fa5349` (clean: true)
Started: 2026-10-23T04:21:43.132Z; completed: 2026-10-23T04:33:40.077Z

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
- clean-application: `sam-verification:sam-verify-1792729303132-f5570f60`; ID `sha256:b359fe8a3e13fbfd8ad39311fc1f246a870fcf22b11dfa259b797afac7c9b83a`

## Commands and suite outcomes

### preflight — PASS

2026-10-23T04:21:43.133Z → 2026-10-23T04:21:43.358Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T04:21:43.136Z → 2026-10-23T04:21:43.140Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T04:21:43.140Z → 2026-10-23T04:21:43.142Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T04:21:43.142Z → 2026-10-23T04:21:43.147Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T04:21:43.147Z → 2026-10-23T04:21:43.157Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T04:21:43.157Z → 2026-10-23T04:21:43.175Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T04:21:43.175Z → 2026-10-23T04:21:43.229Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T04:21:43.229Z → 2026-10-23T04:21:43.294Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T04:21:43.294Z → 2026-10-23T04:21:43.344Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T04:21:43.344Z → 2026-10-23T04:21:43.347Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T04:21:43.347Z → 2026-10-23T04:21:43.357Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T04:21:43.357Z → 2026-10-23T04:21:43.358Z


### snapshot — PASS

2026-10-23T04:21:43.359Z → 2026-10-23T04:21:43.422Z

```sh
git archive --format=tar --output /tmp/sam-verify-uuSbUe/source.tar 00b821d73a764d2c89c0a3f1e6e3535642fa5349
```
Exit: 0; signal: none; 2026-10-23T04:21:43.360Z → 2026-10-23T04:21:43.389Z

```sh
tar -xf /tmp/sam-verify-uuSbUe/source.tar -C /tmp/sam-verify-uuSbUe/source
```
Exit: 0; signal: none; 2026-10-23T04:21:43.389Z → 2026-10-23T04:21:43.396Z


### images — PASS

2026-10-23T04:21:43.423Z → 2026-10-23T04:21:43.525Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T04:21:43.424Z → 2026-10-23T04:21:43.443Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T04:21:43.443Z → 2026-10-23T04:21:43.455Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T04:21:43.455Z → 2026-10-23T04:21:43.469Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T04:21:43.469Z → 2026-10-23T04:21:43.480Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T04:21:43.480Z → 2026-10-23T04:21:43.490Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T04:21:43.490Z → 2026-10-23T04:21:43.502Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T04:21:43.502Z → 2026-10-23T04:21:43.513Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T04:21:43.513Z → 2026-10-23T04:21:43.525Z


### isolated-postgres — PASS

2026-10-23T04:21:43.526Z → 2026-10-23T04:21:48.111Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792729303132-f5570f60 sam-verify-1792729303132-f5570f60-net
```
Exit: 0; signal: none; 2026-10-23T04:21:43.526Z → 2026-10-23T04:21:43.557Z

```sh
docker run --detach --name sam-verify-1792729303132-f5570f60-pg --label sam.verification.run=sam-verify-1792729303132-f5570f60 --network sam-verify-1792729303132-f5570f60-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T04:21:43.557Z → 2026-10-23T04:21:46.455Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792729303132-f5570f60-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T04:21:46.455Z → 2026-10-23T04:21:46.539Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792729303132-f5570f60-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T04:21:47.040Z → 2026-10-23T04:21:47.137Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792729303132-f5570f60-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T04:21:47.638Z → 2026-10-23T04:21:47.739Z

```sh
docker exec sam-verify-1792729303132-f5570f60-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T04:21:47.739Z → 2026-10-23T04:21:47.869Z

```sh
docker exec sam-verify-1792729303132-f5570f60-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T04:21:47.869Z → 2026-10-23T04:21:48.000Z

```sh
docker exec sam-verify-1792729303132-f5570f60-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T04:21:48.000Z → 2026-10-23T04:21:48.111Z


### node-dependencies — PASS

2026-10-23T04:21:48.115Z → 2026-10-23T04:21:56.599Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-1 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T04:21:48.116Z → 2026-10-23T04:21:56.599Z


### python-dependencies — PASS

2026-10-23T04:21:56.601Z → 2026-10-23T04:22:00.159Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-2 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-uuSbUe/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T04:21:56.602Z → 2026-10-23T04:22:00.159Z


### runtime-versions — PASS

2026-10-23T04:22:00.160Z → 2026-10-23T04:22:27.071Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-3 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T04:22:00.161Z → 2026-10-23T04:22:07.198Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-4 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T04:22:07.198Z → 2026-10-23T04:22:16.064Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-5 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T04:22:16.064Z → 2026-10-23T04:22:26.356Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-6 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T04:22:26.356Z → 2026-10-23T04:22:26.980Z

```sh
docker exec sam-verify-1792729303132-f5570f60-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T04:22:26.980Z → 2026-10-23T04:22:27.071Z


### workflow-tool — PASS

2026-10-23T04:22:27.072Z → 2026-10-23T04:22:27.684Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-uuSbUe/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T04:22:27.073Z → 2026-10-23T04:22:27.641Z

```sh
tar -xzf /tmp/sam-verify-uuSbUe/actionlint.tar.gz -C /tmp/sam-verify-uuSbUe actionlint
```
Exit: 0; signal: none; 2026-10-23T04:22:27.643Z → 2026-10-23T04:22:27.682Z

```sh
/tmp/sam-verify-uuSbUe/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T04:22:27.682Z → 2026-10-23T04:22:27.684Z


### workflow-validation — PASS

2026-10-23T04:22:27.685Z → 2026-10-23T04:22:27.689Z

```sh
/tmp/sam-verify-uuSbUe/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T04:22:27.687Z → 2026-10-23T04:22:27.689Z


### configuration-validation — PASS

2026-10-23T04:22:27.690Z → 2026-10-23T04:23:01.487Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T04:22:27.691Z → 2026-10-23T04:22:27.903Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T04:22:27.903Z → 2026-10-23T04:22:27.961Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T04:22:27.961Z → 2026-10-23T04:22:28.031Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T04:22:28.031Z → 2026-10-23T04:22:28.098Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T04:22:28.098Z → 2026-10-23T04:22:28.164Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-7 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T04:22:28.164Z → 2026-10-23T04:22:39.776Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-8 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T04:22:39.776Z → 2026-10-23T04:22:50.136Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-9 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T04:22:50.136Z → 2026-10-23T04:23:01.487Z


### typecheck — PASS

2026-10-23T04:23:01.488Z → 2026-10-23T04:23:17.248Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-10 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T04:23:01.489Z → 2026-10-23T04:23:17.248Z


### regression — PASS

2026-10-23T04:23:17.249Z → 2026-10-23T04:23:57.072Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-11 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T04:23:17.251Z → 2026-10-23T04:23:57.071Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T04:23:27.131Z → 2026-10-23T04:23:27.745Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T04:23:27.776Z → 2026-10-23T04:23:28.262Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T04:23:28.279Z → 2026-10-23T04:23:28.751Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T04:23:28.768Z → 2026-10-23T04:23:29.253Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T04:23:29.269Z → 2026-10-23T04:23:29.785Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T04:23:29.804Z → 2026-10-23T04:23:30.206Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T04:23:30.223Z → 2026-10-23T04:23:30.756Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T04:23:30.774Z → 2026-10-23T04:23:31.307Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T04:23:31.325Z → 2026-10-23T04:23:31.854Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T04:23:31.871Z → 2026-10-23T04:23:32.339Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T04:23:32.355Z → 2026-10-23T04:23:32.803Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T04:23:32.823Z → 2026-10-23T04:23:33.164Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T04:23:33.184Z → 2026-10-23T04:23:33.703Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T04:23:33.724Z → 2026-10-23T04:23:34.110Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T04:23:34.128Z → 2026-10-23T04:23:34.503Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T04:23:34.520Z → 2026-10-23T04:23:35.018Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T04:23:35.034Z → 2026-10-23T04:23:35.506Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T04:23:35.523Z → 2026-10-23T04:23:35.997Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T04:23:36.018Z → 2026-10-23T04:23:36.523Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T04:23:36.541Z → 2026-10-23T04:23:36.921Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T04:23:36.938Z → 2026-10-23T04:23:37.318Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T04:23:37.335Z → 2026-10-23T04:23:37.635Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T04:23:37.653Z → 2026-10-23T04:23:38.110Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T04:23:38.128Z → 2026-10-23T04:23:39.508Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T04:23:39.525Z → 2026-10-23T04:23:40.049Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T04:23:40.068Z → 2026-10-23T04:23:40.444Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T04:23:40.462Z → 2026-10-23T04:23:41.018Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T04:23:41.036Z → 2026-10-23T04:23:41.832Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T04:23:41.848Z → 2026-10-23T04:23:42.303Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T04:23:42.322Z → 2026-10-23T04:23:42.747Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T04:23:42.766Z → 2026-10-23T04:23:43.502Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T04:23:43.519Z → 2026-10-23T04:23:43.979Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T04:23:43.995Z → 2026-10-23T04:23:44.440Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T04:23:44.457Z → 2026-10-23T04:23:44.914Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T04:23:44.932Z → 2026-10-23T04:23:45.374Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T04:23:45.392Z → 2026-10-23T04:23:46.073Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T04:23:46.093Z → 2026-10-23T04:23:46.610Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T04:23:46.630Z → 2026-10-23T04:23:47.302Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T04:23:47.323Z → 2026-10-23T04:23:48.026Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T04:23:48.049Z → 2026-10-23T04:23:48.599Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T04:23:48.616Z → 2026-10-23T04:23:49.718Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T04:23:49.742Z → 2026-10-23T04:23:50.229Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T04:23:50.252Z → 2026-10-23T04:23:51.979Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T04:23:52.001Z → 2026-10-23T04:23:52.490Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T04:23:52.509Z → 2026-10-23T04:23:53.110Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T04:23:53.131Z → 2026-10-23T04:23:53.554Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T04:23:53.572Z → 2026-10-23T04:23:54.404Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T04:23:54.420Z → 2026-10-23T04:23:55.110Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T04:23:55.150Z → 2026-10-23T04:23:56.134Z

### core-reliability — PASS

2026-10-23T04:23:57.074Z → 2026-10-23T04:24:21.767Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-12 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T04:23:57.075Z → 2026-10-23T04:24:21.767Z

- tests/core/reliability.ts: PASS; 2026-10-23T04:24:08.089Z → 2026-10-23T04:24:13.486Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T04:24:13.519Z → 2026-10-23T04:24:14.100Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T04:24:14.120Z → 2026-10-23T04:24:14.595Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T04:24:14.613Z → 2026-10-23T04:24:15.127Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T04:24:15.146Z → 2026-10-23T04:24:16.782Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T04:24:16.803Z → 2026-10-23T04:24:17.309Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T04:24:17.329Z → 2026-10-23T04:24:19.042Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T04:24:19.060Z → 2026-10-23T04:24:19.653Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T04:24:19.669Z → 2026-10-23T04:24:20.974Z

### provider-auth — PASS

2026-10-23T04:24:21.768Z → 2026-10-23T04:24:25.225Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-13 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T04:24:21.770Z → 2026-10-23T04:24:25.225Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T04:24:24.184Z → 2026-10-23T04:24:24.553Z

### postgres-tls — PASS

2026-10-23T04:24:25.227Z → 2026-10-23T04:24:35.044Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-14 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T04:24:25.228Z → 2026-10-23T04:24:35.044Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T04:24:33.418Z → 2026-10-23T04:24:34.335Z

### contracts — PASS

2026-10-23T04:24:35.046Z → 2026-10-23T04:24:47.071Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-15 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T04:24:35.047Z → 2026-10-23T04:24:47.071Z

- tests/release/contracts.ts: PASS; 2026-10-23T04:24:45.678Z → 2026-10-23T04:24:46.393Z

### synthetic-pilot — PASS

2026-10-23T04:24:47.073Z → 2026-10-23T04:24:58.431Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-16 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T04:24:47.074Z → 2026-10-23T04:24:58.431Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T04:24:57.058Z → 2026-10-23T04:24:57.766Z

### managed-schema — PASS

2026-10-23T04:24:58.433Z → 2026-10-23T04:25:07.819Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-17 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T04:24:58.441Z → 2026-10-23T04:25:07.818Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T04:25:06.865Z → 2026-10-23T04:25:07.106Z

### local-bundle — PASS

2026-10-23T04:25:07.821Z → 2026-10-23T04:25:18.200Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-18 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T04:25:07.822Z → 2026-10-23T04:25:18.200Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T04:25:17.050Z → 2026-10-23T04:25:17.413Z

### closed-setup — PASS

2026-10-23T04:25:18.202Z → 2026-10-23T04:25:28.387Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-19 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T04:25:18.204Z → 2026-10-23T04:25:28.387Z

- tests/release/setup.ts: PASS; 2026-10-23T04:25:26.670Z → 2026-10-23T04:25:27.326Z

### database-contract — PASS

2026-10-23T04:25:28.390Z → 2026-10-23T04:25:35.223Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-20 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T04:25:28.391Z → 2026-10-23T04:25:35.223Z

- tests/release/database_check.ts: PASS; 2026-10-23T04:25:34.065Z → 2026-10-23T04:25:34.470Z

### prelaunch-gate — PASS

2026-10-23T04:25:35.225Z → 2026-10-23T04:25:43.263Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-21 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T04:25:35.227Z → 2026-10-23T04:25:43.262Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T04:25:42.240Z → 2026-10-23T04:25:42.552Z

### service-provisioning — PASS

2026-10-23T04:25:43.265Z → 2026-10-23T04:25:52.983Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-22 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T04:25:43.266Z → 2026-10-23T04:25:52.982Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T04:25:48.167Z → 2026-10-23T04:25:52.121Z

### operator-provisioning — PASS

2026-10-23T04:25:52.985Z → 2026-10-23T04:26:04.541Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-23 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T04:25:52.987Z → 2026-10-23T04:26:04.541Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T04:25:59.438Z → 2026-10-23T04:26:03.757Z

### provisioning-backup-recovery — PASS

2026-10-23T04:26:04.543Z → 2026-10-23T04:26:08.735Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792729303132-f5570f60-pg sam-verify-1792729303132-f5570f60
```
Exit: 0; signal: none; 2026-10-23T04:26:04.545Z → 2026-10-23T04:26:08.735Z


### render-migration-compatibility — PASS

2026-10-23T04:26:08.737Z → 2026-10-23T04:26:25.764Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-24 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T04:26:08.739Z → 2026-10-23T04:26:25.763Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T04:26:14.447Z → 2026-10-23T04:26:25.025Z

### render-google-oauth-contracts — PASS

2026-10-23T04:26:25.766Z → 2026-10-23T04:26:43.445Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-25 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-23T04:26:25.768Z → 2026-10-23T04:26:43.445Z


### integration-migrations — PASS

2026-10-23T04:26:43.448Z → 2026-10-23T04:26:52.208Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-26 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-23T04:26:43.449Z → 2026-10-23T04:26:52.208Z

- tests/integration/migrations.ts: PASS; 2026-10-23T04:26:49.848Z → 2026-10-23T04:26:51.407Z

### integration-oauth-mcp — PASS

2026-10-23T04:26:52.212Z → 2026-10-23T04:27:03.950Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-27 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-23T04:26:52.214Z → 2026-10-23T04:27:03.950Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-23T04:27:02.484Z → 2026-10-23T04:27:03.124Z

### integration-orchestration — PASS

2026-10-23T04:27:03.952Z → 2026-10-23T04:27:21.260Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-28 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T04:27:03.954Z → 2026-10-23T04:27:21.260Z

- tests/integration/orchestration.ts: PASS; 2026-10-23T04:27:14.114Z → 2026-10-23T04:27:20.520Z

### specialist-reasoning — PASS

2026-10-23T04:27:21.262Z → 2026-10-23T04:28:30.962Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-29 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-23T04:27:21.264Z → 2026-10-23T04:28:30.962Z

- tests/specialists/acceptance.ts: PASS; 2026-10-23T04:27:29.004Z → 2026-10-23T04:28:30.180Z

### specialist-gateway — PASS

2026-10-23T04:28:30.965Z → 2026-10-23T04:28:41.116Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-30 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-23T04:28:30.967Z → 2026-10-23T04:28:41.116Z

- tests/specialists/gateway.ts: PASS; 2026-10-23T04:28:39.896Z → 2026-10-23T04:28:40.366Z

### specialist-provenance — PASS

2026-10-23T04:28:41.120Z → 2026-10-23T04:28:51.222Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-31 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-23T04:28:41.122Z → 2026-10-23T04:28:51.221Z

- tests/specialists/provenance.ts: PASS; 2026-10-23T04:28:50.030Z → 2026-10-23T04:28:50.508Z

### specialist-learning-fairness — PASS

2026-10-23T04:28:51.224Z → 2026-10-23T04:29:01.674Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-32 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-23T04:28:51.227Z → 2026-10-23T04:29:01.674Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-23T04:28:59.727Z → 2026-10-23T04:29:00.883Z

### specialist-evaluation — PASS

2026-10-23T04:29:01.676Z → 2026-10-23T04:29:10.895Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-33 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-23T04:29:01.678Z → 2026-10-23T04:29:10.895Z


### evaluation-budget — PASS

2026-10-23T04:29:10.897Z → 2026-10-23T04:29:26.010Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-34 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 --mount type=bind,source=/tmp/sam-planning-full-ready/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-23T04:29:10.899Z → 2026-10-23T04:29:26.010Z

- tests/evaluation/budgets.ts: PASS; 2026-10-23T04:29:21.213Z → 2026-10-23T04:29:25.184Z

### evaluation-adapter — PASS

2026-10-23T04:29:26.012Z → 2026-10-23T04:29:39.328Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-35 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-23T04:29:26.016Z → 2026-10-23T04:29:39.327Z

- tests/evaluation/adapters.ts: PASS; 2026-10-23T04:29:37.937Z → 2026-10-23T04:29:38.588Z

### evaluation-orchestration — PASS

2026-10-23T04:29:39.330Z → 2026-10-23T04:30:12.914Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-36 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 --mount type=bind,source=/tmp/sam-planning-full-ready/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T04:29:39.332Z → 2026-10-23T04:30:12.914Z

- tests/evaluation/orchestration.ts: PASS; 2026-10-23T04:29:48.733Z → 2026-10-23T04:30:12.127Z

### evaluation-independent-review — PASS

2026-10-23T04:30:12.919Z → 2026-10-23T04:30:26.372Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-37 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-23T04:30:12.921Z → 2026-10-23T04:30:26.372Z

- tests/evaluation/review.ts: PASS; 2026-10-23T04:30:24.825Z → 2026-10-23T04:30:25.600Z

### evaluation-commercial-market — PASS

2026-10-23T04:30:26.378Z → 2026-10-23T04:31:01.559Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-38 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 --mount type=bind,source=/tmp/sam-planning-full-ready/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-23T04:30:26.381Z → 2026-10-23T04:31:01.559Z

- tests/evaluation/market.ts: PASS; 2026-10-23T04:30:36.210Z → 2026-10-23T04:31:00.766Z

### evaluation-commercial-profitability — PASS

2026-10-23T04:31:01.565Z → 2026-10-23T04:31:35.279Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-39 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 --mount type=bind,source=/tmp/sam-planning-full-ready/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-23T04:31:01.569Z → 2026-10-23T04:31:35.279Z

- tests/evaluation/profitability.ts: PASS; 2026-10-23T04:31:09.310Z → 2026-10-23T04:31:34.384Z

### evaluation-commercial-suppliers — PASS

2026-10-23T04:31:35.283Z → 2026-10-23T04:32:08.147Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-40 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 --mount type=bind,source=/tmp/sam-planning-full-ready/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-23T04:31:35.288Z → 2026-10-23T04:32:08.147Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-23T04:31:43.456Z → 2026-10-23T04:32:07.441Z

### migration-upgrade-rollback — PASS

2026-10-23T04:32:08.152Z → 2026-10-23T04:32:19.950Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-41 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-23T04:32:08.159Z → 2026-10-23T04:32:19.949Z


### specialist-restart-prepare — PASS

2026-10-23T04:32:19.957Z → 2026-10-23T04:32:29.534Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-42 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T04:32:19.962Z → 2026-10-23T04:32:29.534Z


### evaluation-restart-prepare — PASS

2026-10-23T04:32:29.539Z → 2026-10-23T04:32:39.962Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-43 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=00b821d73a764d2c89c0a3f1e6e3535642fa5349 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T04:32:29.543Z → 2026-10-23T04:32:39.962Z


### postgres-restart — PASS

2026-10-23T04:32:39.968Z → 2026-10-23T04:32:40.342Z

```sh
docker restart --time 10 sam-verify-1792729303132-f5570f60-pg
```
Exit: 0; signal: none; 2026-10-23T04:32:39.973Z → 2026-10-23T04:32:40.243Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792729303132-f5570f60-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T04:32:40.243Z → 2026-10-23T04:32:40.342Z


### migration-after-restart — PASS

2026-10-23T04:32:40.349Z → 2026-10-23T04:32:52.649Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-44 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-23T04:32:40.354Z → 2026-10-23T04:32:52.649Z


### specialist-restart-check — PASS

2026-10-23T04:32:52.660Z → 2026-10-23T04:33:04.625Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-45 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T04:32:52.666Z → 2026-10-23T04:33:04.625Z


### evaluation-restart-check — PASS

2026-10-23T04:33:04.632Z → 2026-10-23T04:33:16.851Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-46 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T04:33:04.638Z → 2026-10-23T04:33:16.851Z


### phase0-migrations — PASS

2026-10-23T04:33:16.860Z → 2026-10-23T04:33:17.626Z

```sh
docker cp /tmp/sam-verify-uuSbUe/source/packages/db/migrations sam-verify-1792729303132-f5570f60-pg:/migrations
```
Exit: 0; signal: none; 2026-10-23T04:33:16.866Z → 2026-10-23T04:33:16.884Z

```sh
docker exec sam-verify-1792729303132-f5570f60-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-23T04:33:16.884Z → 2026-10-23T04:33:17.539Z

```sh
docker exec sam-verify-1792729303132-f5570f60-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-23T04:33:17.539Z → 2026-10-23T04:33:17.626Z


### phase0-acceptance — PASS

2026-10-23T04:33:17.632Z → 2026-10-23T04:33:19.289Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-47 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-uuSbUe/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-23T04:33:17.637Z → 2026-10-23T04:33:19.289Z


### phase0-postgres — PASS

2026-10-23T04:33:19.296Z → 2026-10-23T04:33:20.309Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-48 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-uuSbUe/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-23T04:33:19.300Z → 2026-10-23T04:33:20.309Z


### tenant-isolation — PASS

2026-10-23T04:33:20.321Z → 2026-10-23T04:33:21.939Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-49 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-uuSbUe/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-23T04:33:20.327Z → 2026-10-23T04:33:21.939Z


### fail-closed-security — PASS

2026-10-23T04:33:21.945Z → 2026-10-23T04:33:24.918Z

```sh
docker run --rm --name sam-verify-1792729303132-f5570f60-job-50 --label sam.verification.run=sam-verify-1792729303132-f5570f60 --init --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-uuSbUe/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-23T04:33:21.949Z → 2026-10-23T04:33:24.918Z


### clean-image — PASS

2026-10-23T04:33:24.923Z → 2026-10-23T04:33:32.531Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792729303132-f5570f60 Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-23T04:33:24.935Z → 2026-10-23T04:33:32.531Z


### image-contract — PASS

2026-10-23T04:33:32.537Z → 2026-10-23T04:33:32.558Z

```sh
docker image inspect sam-verification:sam-verify-1792729303132-f5570f60
```
Exit: 0; signal: none; 2026-10-23T04:33:32.542Z → 2026-10-23T04:33:32.557Z


### application-startup-restart — PASS

2026-10-23T04:33:32.563Z → 2026-10-23T04:33:38.343Z

```sh
docker run --rm --init --name sam-verify-1792729303132-f5570f60-application --label sam.verification.run=sam-verify-1792729303132-f5570f60 --network container:sam-verify-1792729303132-f5570f60-pg --mount type=bind,src=/tmp/sam-verify-uuSbUe/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792729303132-f5570f60 node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-23T04:33:32.569Z → 2026-10-23T04:33:38.343Z


### source-integrity — PASS

2026-10-23T04:33:38.348Z → 2026-10-23T04:33:38.363Z


### cleanup — PASS

2026-10-23T04:33:38.370Z → 2026-10-23T04:33:40.070Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-pg
```
Exit: 0; signal: none; 2026-10-23T04:33:38.374Z → 2026-10-23T04:33:38.389Z

```sh
docker rm --force --volumes sam-verify-1792729303132-f5570f60-pg
```
Exit: 0; signal: none; 2026-10-23T04:33:38.389Z → 2026-10-23T04:33:38.745Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-1
```
Exit: 1; signal: none; 2026-10-23T04:33:38.745Z → 2026-10-23T04:33:38.768Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-2
```
Exit: 1; signal: none; 2026-10-23T04:33:38.768Z → 2026-10-23T04:33:38.792Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-3
```
Exit: 1; signal: none; 2026-10-23T04:33:38.792Z → 2026-10-23T04:33:38.814Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-4
```
Exit: 1; signal: none; 2026-10-23T04:33:38.814Z → 2026-10-23T04:33:38.837Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-5
```
Exit: 1; signal: none; 2026-10-23T04:33:38.837Z → 2026-10-23T04:33:38.863Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-6
```
Exit: 1; signal: none; 2026-10-23T04:33:38.864Z → 2026-10-23T04:33:38.885Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-7
```
Exit: 1; signal: none; 2026-10-23T04:33:38.885Z → 2026-10-23T04:33:38.907Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-8
```
Exit: 1; signal: none; 2026-10-23T04:33:38.907Z → 2026-10-23T04:33:38.928Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-9
```
Exit: 1; signal: none; 2026-10-23T04:33:38.928Z → 2026-10-23T04:33:38.949Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-10
```
Exit: 1; signal: none; 2026-10-23T04:33:38.949Z → 2026-10-23T04:33:38.973Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-11
```
Exit: 1; signal: none; 2026-10-23T04:33:38.973Z → 2026-10-23T04:33:38.992Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-12
```
Exit: 1; signal: none; 2026-10-23T04:33:38.992Z → 2026-10-23T04:33:39.025Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-13
```
Exit: 1; signal: none; 2026-10-23T04:33:39.025Z → 2026-10-23T04:33:39.058Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-14
```
Exit: 1; signal: none; 2026-10-23T04:33:39.058Z → 2026-10-23T04:33:39.085Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-15
```
Exit: 1; signal: none; 2026-10-23T04:33:39.085Z → 2026-10-23T04:33:39.107Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-16
```
Exit: 1; signal: none; 2026-10-23T04:33:39.107Z → 2026-10-23T04:33:39.129Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-17
```
Exit: 1; signal: none; 2026-10-23T04:33:39.129Z → 2026-10-23T04:33:39.156Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-18
```
Exit: 1; signal: none; 2026-10-23T04:33:39.156Z → 2026-10-23T04:33:39.178Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-19
```
Exit: 1; signal: none; 2026-10-23T04:33:39.178Z → 2026-10-23T04:33:39.199Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-20
```
Exit: 1; signal: none; 2026-10-23T04:33:39.200Z → 2026-10-23T04:33:39.226Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-21
```
Exit: 1; signal: none; 2026-10-23T04:33:39.226Z → 2026-10-23T04:33:39.253Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-22
```
Exit: 1; signal: none; 2026-10-23T04:33:39.253Z → 2026-10-23T04:33:39.275Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-23
```
Exit: 1; signal: none; 2026-10-23T04:33:39.275Z → 2026-10-23T04:33:39.300Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-24
```
Exit: 1; signal: none; 2026-10-23T04:33:39.300Z → 2026-10-23T04:33:39.323Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-25
```
Exit: 1; signal: none; 2026-10-23T04:33:39.323Z → 2026-10-23T04:33:39.346Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-26
```
Exit: 1; signal: none; 2026-10-23T04:33:39.346Z → 2026-10-23T04:33:39.372Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-27
```
Exit: 1; signal: none; 2026-10-23T04:33:39.372Z → 2026-10-23T04:33:39.395Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-28
```
Exit: 1; signal: none; 2026-10-23T04:33:39.395Z → 2026-10-23T04:33:39.417Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-29
```
Exit: 1; signal: none; 2026-10-23T04:33:39.417Z → 2026-10-23T04:33:39.439Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-30
```
Exit: 1; signal: none; 2026-10-23T04:33:39.439Z → 2026-10-23T04:33:39.459Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-31
```
Exit: 1; signal: none; 2026-10-23T04:33:39.459Z → 2026-10-23T04:33:39.479Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-32
```
Exit: 1; signal: none; 2026-10-23T04:33:39.479Z → 2026-10-23T04:33:39.501Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-33
```
Exit: 1; signal: none; 2026-10-23T04:33:39.501Z → 2026-10-23T04:33:39.523Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-34
```
Exit: 1; signal: none; 2026-10-23T04:33:39.523Z → 2026-10-23T04:33:39.544Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-35
```
Exit: 1; signal: none; 2026-10-23T04:33:39.544Z → 2026-10-23T04:33:39.566Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-36
```
Exit: 1; signal: none; 2026-10-23T04:33:39.566Z → 2026-10-23T04:33:39.588Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-37
```
Exit: 1; signal: none; 2026-10-23T04:33:39.588Z → 2026-10-23T04:33:39.612Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-38
```
Exit: 1; signal: none; 2026-10-23T04:33:39.612Z → 2026-10-23T04:33:39.634Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-39
```
Exit: 1; signal: none; 2026-10-23T04:33:39.634Z → 2026-10-23T04:33:39.665Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-40
```
Exit: 1; signal: none; 2026-10-23T04:33:39.665Z → 2026-10-23T04:33:39.694Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-41
```
Exit: 1; signal: none; 2026-10-23T04:33:39.694Z → 2026-10-23T04:33:39.734Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-42
```
Exit: 1; signal: none; 2026-10-23T04:33:39.734Z → 2026-10-23T04:33:39.757Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-43
```
Exit: 1; signal: none; 2026-10-23T04:33:39.757Z → 2026-10-23T04:33:39.778Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-44
```
Exit: 1; signal: none; 2026-10-23T04:33:39.778Z → 2026-10-23T04:33:39.802Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-45
```
Exit: 1; signal: none; 2026-10-23T04:33:39.803Z → 2026-10-23T04:33:39.827Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-46
```
Exit: 1; signal: none; 2026-10-23T04:33:39.827Z → 2026-10-23T04:33:39.847Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-47
```
Exit: 1; signal: none; 2026-10-23T04:33:39.847Z → 2026-10-23T04:33:39.868Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-48
```
Exit: 1; signal: none; 2026-10-23T04:33:39.868Z → 2026-10-23T04:33:39.901Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-49
```
Exit: 1; signal: none; 2026-10-23T04:33:39.901Z → 2026-10-23T04:33:39.922Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-job-50
```
Exit: 1; signal: none; 2026-10-23T04:33:39.922Z → 2026-10-23T04:33:39.949Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-application
```
Exit: 1; signal: none; 2026-10-23T04:33:39.949Z → 2026-10-23T04:33:39.979Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792729303132-f5570f60-net
```
Exit: 0; signal: none; 2026-10-23T04:33:39.979Z → 2026-10-23T04:33:39.993Z

```sh
docker network rm sam-verify-1792729303132-f5570f60-net
```
Exit: 0; signal: none; 2026-10-23T04:33:39.993Z → 2026-10-23T04:33:40.046Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
