# Independent SAM verification

Status: **PASS**
Source: `49ec0ebd0ff979587d6600ca9c00754679b52adb` (clean: true)
Started: 2026-10-23T05:54:01.830Z; completed: 2026-10-23T06:06:25.313Z

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
- clean-application: `sam-verification:sam-verify-1792734841829-6ff9c6e0`; ID `sha256:b7273815b61d5c971a76d482ec3bcada13a370d5a21972c7bac28784a1555270`

## Commands and suite outcomes

### preflight — PASS

2026-10-23T05:54:01.831Z → 2026-10-23T05:54:02.080Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T05:54:01.835Z → 2026-10-23T05:54:01.840Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T05:54:01.840Z → 2026-10-23T05:54:01.843Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T05:54:01.843Z → 2026-10-23T05:54:01.850Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T05:54:01.850Z → 2026-10-23T05:54:01.863Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T05:54:01.864Z → 2026-10-23T05:54:01.883Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T05:54:01.883Z → 2026-10-23T05:54:01.948Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T05:54:01.948Z → 2026-10-23T05:54:02.015Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T05:54:02.015Z → 2026-10-23T05:54:02.063Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T05:54:02.063Z → 2026-10-23T05:54:02.065Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T05:54:02.065Z → 2026-10-23T05:54:02.078Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T05:54:02.078Z → 2026-10-23T05:54:02.080Z


### snapshot — PASS

2026-10-23T05:54:02.082Z → 2026-10-23T05:54:02.155Z

```sh
git archive --format=tar --output /tmp/sam-verify-jRnpcK/source.tar 49ec0ebd0ff979587d6600ca9c00754679b52adb
```
Exit: 0; signal: none; 2026-10-23T05:54:02.083Z → 2026-10-23T05:54:02.116Z

```sh
tar -xf /tmp/sam-verify-jRnpcK/source.tar -C /tmp/sam-verify-jRnpcK/source
```
Exit: 0; signal: none; 2026-10-23T05:54:02.116Z → 2026-10-23T05:54:02.125Z


### images — PASS

2026-10-23T05:54:02.156Z → 2026-10-23T05:54:02.282Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T05:54:02.157Z → 2026-10-23T05:54:02.173Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T05:54:02.173Z → 2026-10-23T05:54:02.188Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T05:54:02.188Z → 2026-10-23T05:54:02.206Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T05:54:02.206Z → 2026-10-23T05:54:02.222Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T05:54:02.222Z → 2026-10-23T05:54:02.236Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T05:54:02.236Z → 2026-10-23T05:54:02.251Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T05:54:02.252Z → 2026-10-23T05:54:02.268Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T05:54:02.268Z → 2026-10-23T05:54:02.282Z


### isolated-postgres — PASS

2026-10-23T05:54:02.283Z → 2026-10-23T05:54:05.450Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 sam-verify-1792734841829-6ff9c6e0-net
```
Exit: 0; signal: none; 2026-10-23T05:54:02.283Z → 2026-10-23T05:54:02.311Z

```sh
docker run --detach --name sam-verify-1792734841829-6ff9c6e0-pg --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --network sam-verify-1792734841829-6ff9c6e0-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T05:54:02.311Z → 2026-10-23T05:54:03.793Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792734841829-6ff9c6e0-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T05:54:03.794Z → 2026-10-23T05:54:03.888Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792734841829-6ff9c6e0-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T05:54:04.389Z → 2026-10-23T05:54:04.497Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792734841829-6ff9c6e0-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T05:54:04.998Z → 2026-10-23T05:54:05.108Z

```sh
docker exec sam-verify-1792734841829-6ff9c6e0-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T05:54:05.108Z → 2026-10-23T05:54:05.226Z

```sh
docker exec sam-verify-1792734841829-6ff9c6e0-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T05:54:05.226Z → 2026-10-23T05:54:05.340Z

```sh
docker exec sam-verify-1792734841829-6ff9c6e0-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T05:54:05.340Z → 2026-10-23T05:54:05.450Z


### node-dependencies — PASS

2026-10-23T05:54:05.456Z → 2026-10-23T05:54:13.556Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-1 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T05:54:05.457Z → 2026-10-23T05:54:13.556Z


### python-dependencies — PASS

2026-10-23T05:54:13.559Z → 2026-10-23T05:54:17.391Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-2 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-jRnpcK/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T05:54:13.560Z → 2026-10-23T05:54:17.391Z


### runtime-versions — PASS

2026-10-23T05:54:17.392Z → 2026-10-23T05:54:44.196Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-3 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T05:54:17.393Z → 2026-10-23T05:54:23.849Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-4 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T05:54:23.849Z → 2026-10-23T05:54:34.346Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-5 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T05:54:34.346Z → 2026-10-23T05:54:43.260Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-6 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T05:54:43.260Z → 2026-10-23T05:54:44.067Z

```sh
docker exec sam-verify-1792734841829-6ff9c6e0-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T05:54:44.067Z → 2026-10-23T05:54:44.196Z


### workflow-tool — PASS

2026-10-23T05:54:44.198Z → 2026-10-23T05:54:44.834Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-jRnpcK/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T05:54:44.199Z → 2026-10-23T05:54:44.788Z

```sh
tar -xzf /tmp/sam-verify-jRnpcK/actionlint.tar.gz -C /tmp/sam-verify-jRnpcK actionlint
```
Exit: 0; signal: none; 2026-10-23T05:54:44.791Z → 2026-10-23T05:54:44.829Z

```sh
/tmp/sam-verify-jRnpcK/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T05:54:44.829Z → 2026-10-23T05:54:44.834Z


### workflow-validation — PASS

2026-10-23T05:54:44.841Z → 2026-10-23T05:54:44.846Z

```sh
/tmp/sam-verify-jRnpcK/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T05:54:44.842Z → 2026-10-23T05:54:44.846Z


### configuration-validation — PASS

2026-10-23T05:54:44.848Z → 2026-10-23T05:55:20.294Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T05:54:44.852Z → 2026-10-23T05:54:45.105Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T05:54:45.105Z → 2026-10-23T05:54:45.181Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T05:54:45.181Z → 2026-10-23T05:54:45.256Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T05:54:45.256Z → 2026-10-23T05:54:45.325Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T05:54:45.325Z → 2026-10-23T05:54:45.395Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-7 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T05:54:45.395Z → 2026-10-23T05:54:58.009Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-8 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T05:54:58.010Z → 2026-10-23T05:55:09.519Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-9 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T05:55:09.519Z → 2026-10-23T05:55:20.294Z


### typecheck — PASS

2026-10-23T05:55:20.295Z → 2026-10-23T05:55:36.951Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-10 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T05:55:20.297Z → 2026-10-23T05:55:36.951Z


### regression — PASS

2026-10-23T05:55:36.953Z → 2026-10-23T05:56:17.391Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-11 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T05:55:36.955Z → 2026-10-23T05:56:17.390Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T05:55:47.390Z → 2026-10-23T05:55:48.055Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T05:55:48.082Z → 2026-10-23T05:55:48.561Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T05:55:48.580Z → 2026-10-23T05:55:49.018Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T05:55:49.040Z → 2026-10-23T05:55:49.516Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T05:55:49.537Z → 2026-10-23T05:55:49.964Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T05:55:49.983Z → 2026-10-23T05:55:50.356Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T05:55:50.377Z → 2026-10-23T05:55:50.900Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T05:55:50.917Z → 2026-10-23T05:55:51.401Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T05:55:51.421Z → 2026-10-23T05:55:51.891Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T05:55:51.907Z → 2026-10-23T05:55:52.349Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T05:55:52.366Z → 2026-10-23T05:55:52.791Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T05:55:52.809Z → 2026-10-23T05:55:53.131Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T05:55:53.148Z → 2026-10-23T05:55:53.637Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T05:55:53.654Z → 2026-10-23T05:55:54.049Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T05:55:54.068Z → 2026-10-23T05:55:54.460Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T05:55:54.477Z → 2026-10-23T05:55:54.963Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T05:55:54.982Z → 2026-10-23T05:55:55.430Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T05:55:55.448Z → 2026-10-23T05:55:55.909Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T05:55:55.929Z → 2026-10-23T05:55:56.359Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T05:55:56.379Z → 2026-10-23T05:55:56.759Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T05:55:56.781Z → 2026-10-23T05:55:57.152Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T05:55:57.170Z → 2026-10-23T05:55:57.496Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T05:55:57.520Z → 2026-10-23T05:55:57.984Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T05:55:58.002Z → 2026-10-23T05:55:59.468Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T05:55:59.487Z → 2026-10-23T05:56:00.104Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T05:56:00.124Z → 2026-10-23T05:56:00.606Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T05:56:00.627Z → 2026-10-23T05:56:01.309Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T05:56:01.333Z → 2026-10-23T05:56:02.223Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T05:56:02.242Z → 2026-10-23T05:56:02.751Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T05:56:02.772Z → 2026-10-23T05:56:03.280Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T05:56:03.304Z → 2026-10-23T05:56:04.097Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T05:56:04.113Z → 2026-10-23T05:56:04.633Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T05:56:04.659Z → 2026-10-23T05:56:05.193Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T05:56:05.212Z → 2026-10-23T05:56:05.777Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T05:56:05.797Z → 2026-10-23T05:56:06.371Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T05:56:06.394Z → 2026-10-23T05:56:07.054Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T05:56:07.073Z → 2026-10-23T05:56:07.575Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T05:56:07.594Z → 2026-10-23T05:56:08.095Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T05:56:08.112Z → 2026-10-23T05:56:08.576Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T05:56:08.596Z → 2026-10-23T05:56:09.086Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T05:56:09.109Z → 2026-10-23T05:56:10.099Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T05:56:10.119Z → 2026-10-23T05:56:10.489Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T05:56:10.515Z → 2026-10-23T05:56:12.089Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T05:56:12.108Z → 2026-10-23T05:56:12.634Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T05:56:12.657Z → 2026-10-23T05:56:13.309Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T05:56:13.328Z → 2026-10-23T05:56:13.787Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T05:56:13.809Z → 2026-10-23T05:56:14.675Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T05:56:14.693Z → 2026-10-23T05:56:15.520Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T05:56:15.554Z → 2026-10-23T05:56:16.436Z

### core-reliability — PASS

2026-10-23T05:56:17.393Z → 2026-10-23T05:56:46.013Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-12 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T05:56:17.394Z → 2026-10-23T05:56:46.012Z

- tests/core/reliability.ts: PASS; 2026-10-23T05:56:27.916Z → 2026-10-23T05:56:33.426Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T05:56:33.448Z → 2026-10-23T05:56:34.037Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T05:56:34.054Z → 2026-10-23T05:56:34.535Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T05:56:34.553Z → 2026-10-23T05:56:35.166Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T05:56:35.184Z → 2026-10-23T05:56:36.931Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T05:56:36.952Z → 2026-10-23T05:56:37.444Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T05:56:37.463Z → 2026-10-23T05:56:39.279Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T05:56:39.296Z → 2026-10-23T05:56:39.915Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T05:56:39.932Z → 2026-10-23T05:56:41.337Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T05:56:41.358Z → 2026-10-23T05:56:45.131Z

### provider-auth — PASS

2026-10-23T05:56:46.014Z → 2026-10-23T05:56:57.219Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-13 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T05:56:46.016Z → 2026-10-23T05:56:57.218Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T05:56:55.995Z → 2026-10-23T05:56:56.408Z

### postgres-tls — PASS

2026-10-23T05:56:57.221Z → 2026-10-23T05:57:07.813Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-14 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T05:56:57.222Z → 2026-10-23T05:57:07.813Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T05:57:06.131Z → 2026-10-23T05:57:07.091Z

### contracts — PASS

2026-10-23T05:57:07.815Z → 2026-10-23T05:57:19.437Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-15 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T05:57:07.817Z → 2026-10-23T05:57:19.437Z

- tests/release/contracts.ts: PASS; 2026-10-23T05:57:18.047Z → 2026-10-23T05:57:18.708Z

### synthetic-pilot — PASS

2026-10-23T05:57:19.440Z → 2026-10-23T05:57:30.100Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-16 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T05:57:19.441Z → 2026-10-23T05:57:30.100Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T05:57:28.500Z → 2026-10-23T05:57:29.268Z

### managed-schema — PASS

2026-10-23T05:57:30.103Z → 2026-10-23T05:57:40.852Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-17 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T05:57:30.104Z → 2026-10-23T05:57:40.852Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T05:57:39.836Z → 2026-10-23T05:57:40.085Z

### local-bundle — PASS

2026-10-23T05:57:40.855Z → 2026-10-23T05:57:52.095Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-18 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T05:57:40.856Z → 2026-10-23T05:57:52.095Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T05:57:50.943Z → 2026-10-23T05:57:51.353Z

### closed-setup — PASS

2026-10-23T05:57:52.098Z → 2026-10-23T05:58:03.623Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-19 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T05:57:52.100Z → 2026-10-23T05:58:03.623Z

- tests/release/setup.ts: PASS; 2026-10-23T05:58:02.126Z → 2026-10-23T05:58:02.723Z

### database-contract — PASS

2026-10-23T05:58:03.626Z → 2026-10-23T05:58:13.823Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-20 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T05:58:03.627Z → 2026-10-23T05:58:13.823Z

- tests/release/database_check.ts: PASS; 2026-10-23T05:58:12.729Z → 2026-10-23T05:58:13.085Z

### prelaunch-gate — PASS

2026-10-23T05:58:13.826Z → 2026-10-23T05:58:24.866Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-21 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T05:58:13.828Z → 2026-10-23T05:58:24.866Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T05:58:23.771Z → 2026-10-23T05:58:24.108Z

### service-provisioning — PASS

2026-10-23T05:58:24.869Z → 2026-10-23T05:58:38.368Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-22 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T05:58:24.871Z → 2026-10-23T05:58:38.368Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T05:58:34.763Z → 2026-10-23T05:58:37.606Z

### operator-provisioning — PASS

2026-10-23T05:58:38.370Z → 2026-10-23T05:58:51.490Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-23 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T05:58:38.372Z → 2026-10-23T05:58:51.490Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T05:58:47.067Z → 2026-10-23T05:58:50.706Z

### provisioning-backup-recovery — PASS

2026-10-23T05:58:51.492Z → 2026-10-23T05:58:54.759Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792734841829-6ff9c6e0-pg sam-verify-1792734841829-6ff9c6e0
```
Exit: 0; signal: none; 2026-10-23T05:58:51.494Z → 2026-10-23T05:58:54.759Z


### render-migration-compatibility — PASS

2026-10-23T05:58:54.761Z → 2026-10-23T05:59:07.037Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-24 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T05:58:54.764Z → 2026-10-23T05:59:07.037Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T05:59:04.835Z → 2026-10-23T05:59:06.189Z

### render-google-oauth-contracts — PASS

2026-10-23T05:59:07.040Z → 2026-10-23T05:59:26.957Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-25 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-23T05:59:07.042Z → 2026-10-23T05:59:26.957Z


### integration-migrations — PASS

2026-10-23T05:59:26.959Z → 2026-10-23T05:59:39.350Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-26 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-23T05:59:26.961Z → 2026-10-23T05:59:39.349Z

- tests/integration/migrations.ts: PASS; 2026-10-23T05:59:37.319Z → 2026-10-23T05:59:38.515Z

### integration-oauth-mcp — PASS

2026-10-23T05:59:39.352Z → 2026-10-23T05:59:50.500Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-27 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-23T05:59:39.354Z → 2026-10-23T05:59:50.499Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-23T05:59:49.116Z → 2026-10-23T05:59:49.696Z

### integration-orchestration — PASS

2026-10-23T05:59:50.503Z → 2026-10-23T06:00:07.878Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-28 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T05:59:50.505Z → 2026-10-23T06:00:07.878Z

- tests/integration/orchestration.ts: PASS; 2026-10-23T05:59:59.798Z → 2026-10-23T06:00:07.108Z

### specialist-reasoning — PASS

2026-10-23T06:00:07.881Z → 2026-10-23T06:01:18.822Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-29 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-23T06:00:07.884Z → 2026-10-23T06:01:18.821Z

- tests/specialists/acceptance.ts: PASS; 2026-10-23T06:00:18.040Z → 2026-10-23T06:01:17.911Z

### specialist-gateway — PASS

2026-10-23T06:01:18.825Z → 2026-10-23T06:01:30.416Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-30 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-23T06:01:18.828Z → 2026-10-23T06:01:30.416Z

- tests/specialists/gateway.ts: PASS; 2026-10-23T06:01:29.163Z → 2026-10-23T06:01:29.676Z

### specialist-provenance — PASS

2026-10-23T06:01:30.420Z → 2026-10-23T06:01:40.873Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-31 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-23T06:01:30.422Z → 2026-10-23T06:01:40.873Z

- tests/specialists/provenance.ts: PASS; 2026-10-23T06:01:39.494Z → 2026-10-23T06:01:39.971Z

### specialist-learning-fairness — PASS

2026-10-23T06:01:40.876Z → 2026-10-23T06:01:52.616Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-32 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-23T06:01:40.878Z → 2026-10-23T06:01:52.615Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-23T06:01:50.828Z → 2026-10-23T06:01:51.876Z

### specialist-evaluation — PASS

2026-10-23T06:01:52.620Z → 2026-10-23T06:02:03.589Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-33 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-23T06:01:52.623Z → 2026-10-23T06:02:03.589Z


### evaluation-budget — PASS

2026-10-23T06:02:03.594Z → 2026-10-23T06:02:17.215Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-34 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb --mount type=bind,source=/tmp/sam-input-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-23T06:02:03.595Z → 2026-10-23T06:02:17.214Z

- tests/evaluation/budgets.ts: PASS; 2026-10-23T06:02:12.879Z → 2026-10-23T06:02:16.395Z

### evaluation-adapter — PASS

2026-10-23T06:02:17.217Z → 2026-10-23T06:02:27.834Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-35 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-23T06:02:17.219Z → 2026-10-23T06:02:27.834Z

- tests/evaluation/adapters.ts: PASS; 2026-10-23T06:02:26.565Z → 2026-10-23T06:02:27.103Z

### evaluation-orchestration — PASS

2026-10-23T06:02:27.837Z → 2026-10-23T06:02:58.952Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-36 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb --mount type=bind,source=/tmp/sam-input-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T06:02:27.839Z → 2026-10-23T06:02:58.952Z

- tests/evaluation/orchestration.ts: PASS; 2026-10-23T06:02:37.544Z → 2026-10-23T06:02:58.132Z

### evaluation-independent-review — PASS

2026-10-23T06:02:58.957Z → 2026-10-23T06:03:10.700Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-37 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-23T06:02:58.959Z → 2026-10-23T06:03:10.700Z

- tests/evaluation/review.ts: PASS; 2026-10-23T06:03:09.079Z → 2026-10-23T06:03:09.884Z

### evaluation-commercial-market — PASS

2026-10-23T06:03:10.704Z → 2026-10-23T06:03:46.181Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-38 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb --mount type=bind,source=/tmp/sam-input-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-23T06:03:10.708Z → 2026-10-23T06:03:46.180Z

- tests/evaluation/market.ts: PASS; 2026-10-23T06:03:20.523Z → 2026-10-23T06:03:45.353Z

### evaluation-commercial-profitability — PASS

2026-10-23T06:03:46.185Z → 2026-10-23T06:04:25.332Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-39 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb --mount type=bind,source=/tmp/sam-input-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-23T06:03:46.189Z → 2026-10-23T06:04:25.332Z

- tests/evaluation/profitability.ts: PASS; 2026-10-23T06:03:57.688Z → 2026-10-23T06:04:24.473Z

### evaluation-commercial-suppliers — PASS

2026-10-23T06:04:25.339Z → 2026-10-23T06:04:57.778Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-40 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb --mount type=bind,source=/tmp/sam-input-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-23T06:04:25.344Z → 2026-10-23T06:04:57.777Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-23T06:04:34.559Z → 2026-10-23T06:04:57.025Z

### migration-upgrade-rollback — PASS

2026-10-23T06:04:57.785Z → 2026-10-23T06:05:07.965Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-41 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-23T06:04:57.789Z → 2026-10-23T06:05:07.965Z


### specialist-restart-prepare — PASS

2026-10-23T06:05:07.970Z → 2026-10-23T06:05:18.592Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-42 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T06:05:07.975Z → 2026-10-23T06:05:18.592Z


### evaluation-restart-prepare — PASS

2026-10-23T06:05:18.597Z → 2026-10-23T06:05:29.699Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-43 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=49ec0ebd0ff979587d6600ca9c00754679b52adb node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T06:05:18.602Z → 2026-10-23T06:05:29.699Z


### postgres-restart — PASS

2026-10-23T06:05:29.708Z → 2026-10-23T06:05:30.165Z

```sh
docker restart --time 10 sam-verify-1792734841829-6ff9c6e0-pg
```
Exit: 0; signal: none; 2026-10-23T06:05:29.713Z → 2026-10-23T06:05:30.052Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792734841829-6ff9c6e0-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T06:05:30.052Z → 2026-10-23T06:05:30.165Z


### migration-after-restart — PASS

2026-10-23T06:05:30.172Z → 2026-10-23T06:05:41.412Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-44 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-23T06:05:30.177Z → 2026-10-23T06:05:41.412Z


### specialist-restart-check — PASS

2026-10-23T06:05:41.427Z → 2026-10-23T06:05:50.827Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-45 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T06:05:41.433Z → 2026-10-23T06:05:50.826Z


### evaluation-restart-check — PASS

2026-10-23T06:05:50.846Z → 2026-10-23T06:06:02.786Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-46 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T06:05:50.854Z → 2026-10-23T06:06:02.786Z


### phase0-migrations — PASS

2026-10-23T06:06:02.792Z → 2026-10-23T06:06:03.579Z

```sh
docker cp /tmp/sam-verify-jRnpcK/source/packages/db/migrations sam-verify-1792734841829-6ff9c6e0-pg:/migrations
```
Exit: 0; signal: none; 2026-10-23T06:06:02.797Z → 2026-10-23T06:06:02.814Z

```sh
docker exec sam-verify-1792734841829-6ff9c6e0-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-23T06:06:02.814Z → 2026-10-23T06:06:03.475Z

```sh
docker exec sam-verify-1792734841829-6ff9c6e0-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-23T06:06:03.475Z → 2026-10-23T06:06:03.579Z


### phase0-acceptance — PASS

2026-10-23T06:06:03.589Z → 2026-10-23T06:06:05.796Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-47 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-jRnpcK/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-23T06:06:03.594Z → 2026-10-23T06:06:05.796Z


### phase0-postgres — PASS

2026-10-23T06:06:05.803Z → 2026-10-23T06:06:07.648Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-48 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-jRnpcK/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-23T06:06:05.808Z → 2026-10-23T06:06:07.648Z


### tenant-isolation — PASS

2026-10-23T06:06:07.661Z → 2026-10-23T06:06:08.797Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-49 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-jRnpcK/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-23T06:06:07.666Z → 2026-10-23T06:06:08.797Z


### fail-closed-security — PASS

2026-10-23T06:06:08.808Z → 2026-10-23T06:06:10.422Z

```sh
docker run --rm --name sam-verify-1792734841829-6ff9c6e0-job-50 --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --init --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-jRnpcK/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-23T06:06:08.815Z → 2026-10-23T06:06:10.422Z


### clean-image — PASS

2026-10-23T06:06:10.428Z → 2026-10-23T06:06:17.679Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792734841829-6ff9c6e0 Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-23T06:06:10.434Z → 2026-10-23T06:06:17.679Z


### image-contract — PASS

2026-10-23T06:06:17.689Z → 2026-10-23T06:06:17.714Z

```sh
docker image inspect sam-verification:sam-verify-1792734841829-6ff9c6e0
```
Exit: 0; signal: none; 2026-10-23T06:06:17.695Z → 2026-10-23T06:06:17.714Z


### application-startup-restart — PASS

2026-10-23T06:06:17.726Z → 2026-10-23T06:06:23.379Z

```sh
docker run --rm --init --name sam-verify-1792734841829-6ff9c6e0-application --label sam.verification.run=sam-verify-1792734841829-6ff9c6e0 --network container:sam-verify-1792734841829-6ff9c6e0-pg --mount type=bind,src=/tmp/sam-verify-jRnpcK/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792734841829-6ff9c6e0 node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-23T06:06:17.735Z → 2026-10-23T06:06:23.379Z


### source-integrity — PASS

2026-10-23T06:06:23.387Z → 2026-10-23T06:06:23.411Z


### cleanup — PASS

2026-10-23T06:06:23.420Z → 2026-10-23T06:06:25.305Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-pg
```
Exit: 0; signal: none; 2026-10-23T06:06:23.426Z → 2026-10-23T06:06:23.443Z

```sh
docker rm --force --volumes sam-verify-1792734841829-6ff9c6e0-pg
```
Exit: 0; signal: none; 2026-10-23T06:06:23.443Z → 2026-10-23T06:06:23.964Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-1
```
Exit: 1; signal: none; 2026-10-23T06:06:23.964Z → 2026-10-23T06:06:23.991Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-2
```
Exit: 1; signal: none; 2026-10-23T06:06:23.991Z → 2026-10-23T06:06:24.015Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-3
```
Exit: 1; signal: none; 2026-10-23T06:06:24.015Z → 2026-10-23T06:06:24.046Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-4
```
Exit: 1; signal: none; 2026-10-23T06:06:24.046Z → 2026-10-23T06:06:24.072Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-5
```
Exit: 1; signal: none; 2026-10-23T06:06:24.072Z → 2026-10-23T06:06:24.093Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-6
```
Exit: 1; signal: none; 2026-10-23T06:06:24.093Z → 2026-10-23T06:06:24.118Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-7
```
Exit: 1; signal: none; 2026-10-23T06:06:24.118Z → 2026-10-23T06:06:24.146Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-8
```
Exit: 1; signal: none; 2026-10-23T06:06:24.146Z → 2026-10-23T06:06:24.173Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-9
```
Exit: 1; signal: none; 2026-10-23T06:06:24.173Z → 2026-10-23T06:06:24.197Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-10
```
Exit: 1; signal: none; 2026-10-23T06:06:24.197Z → 2026-10-23T06:06:24.218Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-11
```
Exit: 1; signal: none; 2026-10-23T06:06:24.218Z → 2026-10-23T06:06:24.241Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-12
```
Exit: 1; signal: none; 2026-10-23T06:06:24.241Z → 2026-10-23T06:06:24.263Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-13
```
Exit: 1; signal: none; 2026-10-23T06:06:24.263Z → 2026-10-23T06:06:24.284Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-14
```
Exit: 1; signal: none; 2026-10-23T06:06:24.284Z → 2026-10-23T06:06:24.304Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-15
```
Exit: 1; signal: none; 2026-10-23T06:06:24.304Z → 2026-10-23T06:06:24.329Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-16
```
Exit: 1; signal: none; 2026-10-23T06:06:24.329Z → 2026-10-23T06:06:24.353Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-17
```
Exit: 1; signal: none; 2026-10-23T06:06:24.353Z → 2026-10-23T06:06:24.376Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-18
```
Exit: 1; signal: none; 2026-10-23T06:06:24.376Z → 2026-10-23T06:06:24.400Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-19
```
Exit: 1; signal: none; 2026-10-23T06:06:24.400Z → 2026-10-23T06:06:24.424Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-20
```
Exit: 1; signal: none; 2026-10-23T06:06:24.424Z → 2026-10-23T06:06:24.449Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-21
```
Exit: 1; signal: none; 2026-10-23T06:06:24.449Z → 2026-10-23T06:06:24.474Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-22
```
Exit: 1; signal: none; 2026-10-23T06:06:24.474Z → 2026-10-23T06:06:24.498Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-23
```
Exit: 1; signal: none; 2026-10-23T06:06:24.498Z → 2026-10-23T06:06:24.523Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-24
```
Exit: 1; signal: none; 2026-10-23T06:06:24.523Z → 2026-10-23T06:06:24.546Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-25
```
Exit: 1; signal: none; 2026-10-23T06:06:24.547Z → 2026-10-23T06:06:24.569Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-26
```
Exit: 1; signal: none; 2026-10-23T06:06:24.569Z → 2026-10-23T06:06:24.595Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-27
```
Exit: 1; signal: none; 2026-10-23T06:06:24.595Z → 2026-10-23T06:06:24.617Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-28
```
Exit: 1; signal: none; 2026-10-23T06:06:24.617Z → 2026-10-23T06:06:24.641Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-29
```
Exit: 1; signal: none; 2026-10-23T06:06:24.641Z → 2026-10-23T06:06:24.667Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-30
```
Exit: 1; signal: none; 2026-10-23T06:06:24.667Z → 2026-10-23T06:06:24.690Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-31
```
Exit: 1; signal: none; 2026-10-23T06:06:24.690Z → 2026-10-23T06:06:24.714Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-32
```
Exit: 1; signal: none; 2026-10-23T06:06:24.714Z → 2026-10-23T06:06:24.736Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-33
```
Exit: 1; signal: none; 2026-10-23T06:06:24.736Z → 2026-10-23T06:06:24.766Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-34
```
Exit: 1; signal: none; 2026-10-23T06:06:24.766Z → 2026-10-23T06:06:24.792Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-35
```
Exit: 1; signal: none; 2026-10-23T06:06:24.792Z → 2026-10-23T06:06:24.817Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-36
```
Exit: 1; signal: none; 2026-10-23T06:06:24.817Z → 2026-10-23T06:06:24.840Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-37
```
Exit: 1; signal: none; 2026-10-23T06:06:24.840Z → 2026-10-23T06:06:24.860Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-38
```
Exit: 1; signal: none; 2026-10-23T06:06:24.860Z → 2026-10-23T06:06:24.881Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-39
```
Exit: 1; signal: none; 2026-10-23T06:06:24.881Z → 2026-10-23T06:06:24.901Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-40
```
Exit: 1; signal: none; 2026-10-23T06:06:24.901Z → 2026-10-23T06:06:24.926Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-41
```
Exit: 1; signal: none; 2026-10-23T06:06:24.926Z → 2026-10-23T06:06:24.953Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-42
```
Exit: 1; signal: none; 2026-10-23T06:06:24.953Z → 2026-10-23T06:06:24.975Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-43
```
Exit: 1; signal: none; 2026-10-23T06:06:24.975Z → 2026-10-23T06:06:24.999Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-44
```
Exit: 1; signal: none; 2026-10-23T06:06:24.999Z → 2026-10-23T06:06:25.022Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-45
```
Exit: 1; signal: none; 2026-10-23T06:06:25.022Z → 2026-10-23T06:06:25.048Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-46
```
Exit: 1; signal: none; 2026-10-23T06:06:25.048Z → 2026-10-23T06:06:25.073Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-47
```
Exit: 1; signal: none; 2026-10-23T06:06:25.073Z → 2026-10-23T06:06:25.098Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-48
```
Exit: 1; signal: none; 2026-10-23T06:06:25.098Z → 2026-10-23T06:06:25.121Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-49
```
Exit: 1; signal: none; 2026-10-23T06:06:25.121Z → 2026-10-23T06:06:25.147Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-job-50
```
Exit: 1; signal: none; 2026-10-23T06:06:25.147Z → 2026-10-23T06:06:25.171Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-application
```
Exit: 1; signal: none; 2026-10-23T06:06:25.171Z → 2026-10-23T06:06:25.196Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792734841829-6ff9c6e0-net
```
Exit: 0; signal: none; 2026-10-23T06:06:25.196Z → 2026-10-23T06:06:25.212Z

```sh
docker network rm sam-verify-1792734841829-6ff9c6e0-net
```
Exit: 0; signal: none; 2026-10-23T06:06:25.212Z → 2026-10-23T06:06:25.270Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
