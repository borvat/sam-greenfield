# Independent SAM verification

Status: **PASS**
Source: `676c910cad77fa35e2cf8c8bbaf026d67b4959f4` (clean: true)
Started: 2026-10-22T20:31:20.767Z; completed: 2026-10-22T20:46:37.980Z

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
- clean-application: `sam-verification:sam-verify-1792701080766-315a30b4`; ID `sha256:d4278bba85308e1578842152490d37350cbd49e41e0e3c1e003a11d2c86f9322`

## Commands and suite outcomes

### preflight — PASS

2026-10-22T20:31:20.768Z → 2026-10-22T20:31:21.157Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-22T20:31:20.772Z → 2026-10-22T20:31:20.777Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-22T20:31:20.777Z → 2026-10-22T20:31:20.780Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-22T20:31:20.780Z → 2026-10-22T20:31:20.788Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-22T20:31:20.788Z → 2026-10-22T20:31:20.822Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-22T20:31:20.822Z → 2026-10-22T20:31:20.869Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-22T20:31:20.869Z → 2026-10-22T20:31:20.967Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-22T20:31:20.967Z → 2026-10-22T20:31:21.083Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-22T20:31:21.083Z → 2026-10-22T20:31:21.140Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-22T20:31:21.140Z → 2026-10-22T20:31:21.142Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-22T20:31:21.142Z → 2026-10-22T20:31:21.155Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-22T20:31:21.155Z → 2026-10-22T20:31:21.157Z


### snapshot — PASS

2026-10-22T20:31:21.158Z → 2026-10-22T20:31:21.246Z

```sh
git archive --format=tar --output /tmp/sam-verify-0nJjTU/source.tar 676c910cad77fa35e2cf8c8bbaf026d67b4959f4
```
Exit: 0; signal: none; 2026-10-22T20:31:21.160Z → 2026-10-22T20:31:21.201Z

```sh
tar -xf /tmp/sam-verify-0nJjTU/source.tar -C /tmp/sam-verify-0nJjTU/source
```
Exit: 0; signal: none; 2026-10-22T20:31:21.201Z → 2026-10-22T20:31:21.210Z


### images — PASS

2026-10-22T20:31:21.247Z → 2026-10-22T20:31:21.365Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-22T20:31:21.248Z → 2026-10-22T20:31:21.267Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-22T20:31:21.267Z → 2026-10-22T20:31:21.284Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-22T20:31:21.284Z → 2026-10-22T20:31:21.297Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-22T20:31:21.297Z → 2026-10-22T20:31:21.310Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-22T20:31:21.310Z → 2026-10-22T20:31:21.325Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-22T20:31:21.325Z → 2026-10-22T20:31:21.339Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-22T20:31:21.339Z → 2026-10-22T20:31:21.352Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-22T20:31:21.352Z → 2026-10-22T20:31:21.365Z


### isolated-postgres — PASS

2026-10-22T20:31:21.366Z → 2026-10-22T20:31:27.115Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792701080766-315a30b4 sam-verify-1792701080766-315a30b4-net
```
Exit: 0; signal: none; 2026-10-22T20:31:21.367Z → 2026-10-22T20:31:21.407Z

```sh
docker run --detach --name sam-verify-1792701080766-315a30b4-pg --label sam.verification.run=sam-verify-1792701080766-315a30b4 --network sam-verify-1792701080766-315a30b4-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-22T20:31:21.407Z → 2026-10-22T20:31:24.630Z

```sh
docker exec sam-verify-1792701080766-315a30b4-pg pg_isready -U postgres -d sam_core_test
```
Exit: 2; signal: none; 2026-10-22T20:31:24.630Z → 2026-10-22T20:31:24.718Z

```sh
docker exec sam-verify-1792701080766-315a30b4-pg pg_isready -U postgres -d sam_core_test
```
Exit: 2; signal: none; 2026-10-22T20:31:25.219Z → 2026-10-22T20:31:25.321Z

```sh
docker exec sam-verify-1792701080766-315a30b4-pg pg_isready -U postgres -d sam_core_test
```
Exit: 1; signal: none; 2026-10-22T20:31:25.822Z → 2026-10-22T20:31:25.971Z

```sh
docker exec sam-verify-1792701080766-315a30b4-pg pg_isready -U postgres -d sam_core_test
```
Exit: 0; signal: none; 2026-10-22T20:31:26.472Z → 2026-10-22T20:31:26.580Z

```sh
docker exec sam-verify-1792701080766-315a30b4-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-22T20:31:26.580Z → 2026-10-22T20:31:26.764Z

```sh
docker exec sam-verify-1792701080766-315a30b4-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-22T20:31:26.764Z → 2026-10-22T20:31:27.008Z

```sh
docker exec sam-verify-1792701080766-315a30b4-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-22T20:31:27.008Z → 2026-10-22T20:31:27.115Z


### node-dependencies — PASS

2026-10-22T20:31:27.141Z → 2026-10-22T20:31:36.195Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-1 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.3.13 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-22T20:31:27.147Z → 2026-10-22T20:31:36.195Z


### python-dependencies — PASS

2026-10-22T20:31:36.197Z → 2026-10-22T20:31:41.283Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-2 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.3.13 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-0nJjTU/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-22T20:31:36.199Z → 2026-10-22T20:31:41.283Z


### runtime-versions — PASS

2026-10-22T20:31:41.287Z → 2026-10-22T20:32:28.166Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-3 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-22T20:31:41.289Z → 2026-10-22T20:31:52.849Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-4 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-22T20:31:52.849Z → 2026-10-22T20:32:08.151Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-5 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-22T20:32:08.151Z → 2026-10-22T20:32:25.287Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-6 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-22T20:32:25.287Z → 2026-10-22T20:32:28.071Z

```sh
docker exec sam-verify-1792701080766-315a30b4-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-22T20:32:28.071Z → 2026-10-22T20:32:28.166Z


### workflow-tool — PASS

2026-10-22T20:32:28.170Z → 2026-10-22T20:32:28.504Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-0nJjTU/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-22T20:32:28.172Z → 2026-10-22T20:32:28.457Z

```sh
tar -xzf /tmp/sam-verify-0nJjTU/actionlint.tar.gz -C /tmp/sam-verify-0nJjTU actionlint
```
Exit: 0; signal: none; 2026-10-22T20:32:28.460Z → 2026-10-22T20:32:28.501Z

```sh
/tmp/sam-verify-0nJjTU/actionlint --version
```
Exit: 0; signal: none; 2026-10-22T20:32:28.501Z → 2026-10-22T20:32:28.504Z


### workflow-validation — PASS

2026-10-22T20:32:28.507Z → 2026-10-22T20:32:28.512Z

```sh
/tmp/sam-verify-0nJjTU/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-22T20:32:28.509Z → 2026-10-22T20:32:28.512Z


### configuration-validation — PASS

2026-10-22T20:32:28.514Z → 2026-10-22T20:33:17.310Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-22T20:32:28.517Z → 2026-10-22T20:32:28.744Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-22T20:32:28.744Z → 2026-10-22T20:32:28.816Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-22T20:32:28.817Z → 2026-10-22T20:32:28.887Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-22T20:32:28.887Z → 2026-10-22T20:32:28.959Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-22T20:32:28.959Z → 2026-10-22T20:32:29.029Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-7 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-22T20:32:29.029Z → 2026-10-22T20:32:45.819Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-8 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-22T20:32:45.819Z → 2026-10-22T20:33:00.915Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-9 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-22T20:33:00.916Z → 2026-10-22T20:33:17.310Z


### typecheck — PASS

2026-10-22T20:33:17.317Z → 2026-10-22T20:33:37.258Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-10 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-22T20:33:17.319Z → 2026-10-22T20:33:37.258Z


### regression — PASS

2026-10-22T20:33:37.264Z → 2026-10-22T20:34:18.757Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-11 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-22T20:33:37.267Z → 2026-10-22T20:34:18.755Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-22T20:33:52.023Z → 2026-10-22T20:33:52.559Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-22T20:33:52.581Z → 2026-10-22T20:33:53.004Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-22T20:33:53.021Z → 2026-10-22T20:33:53.439Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-22T20:33:53.456Z → 2026-10-22T20:33:53.876Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-22T20:33:53.893Z → 2026-10-22T20:33:54.288Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-22T20:33:54.305Z → 2026-10-22T20:33:54.635Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-22T20:33:54.651Z → 2026-10-22T20:33:55.139Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-22T20:33:55.155Z → 2026-10-22T20:33:55.605Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-22T20:33:55.621Z → 2026-10-22T20:33:56.100Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-22T20:33:56.116Z → 2026-10-22T20:33:56.526Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-22T20:33:56.544Z → 2026-10-22T20:33:56.947Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-22T20:33:56.963Z → 2026-10-22T20:33:57.265Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-22T20:33:57.281Z → 2026-10-22T20:33:57.768Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-22T20:33:57.784Z → 2026-10-22T20:33:58.154Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-22T20:33:58.169Z → 2026-10-22T20:33:58.525Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-22T20:33:58.541Z → 2026-10-22T20:33:58.996Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-22T20:33:59.012Z → 2026-10-22T20:33:59.423Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-22T20:33:59.440Z → 2026-10-22T20:33:59.874Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-22T20:33:59.890Z → 2026-10-22T20:34:00.332Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-22T20:34:00.350Z → 2026-10-22T20:34:00.730Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-22T20:34:00.746Z → 2026-10-22T20:34:01.223Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-22T20:34:01.243Z → 2026-10-22T20:34:01.539Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-22T20:34:01.555Z → 2026-10-22T20:34:01.968Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-22T20:34:01.984Z → 2026-10-22T20:34:03.323Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-22T20:34:03.339Z → 2026-10-22T20:34:03.896Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-22T20:34:03.912Z → 2026-10-22T20:34:04.298Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-22T20:34:04.314Z → 2026-10-22T20:34:04.859Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-22T20:34:04.875Z → 2026-10-22T20:34:05.649Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-22T20:34:05.666Z → 2026-10-22T20:34:06.113Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-22T20:34:06.128Z → 2026-10-22T20:34:06.563Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-22T20:34:06.582Z → 2026-10-22T20:34:07.282Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-22T20:34:07.299Z → 2026-10-22T20:34:07.739Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-22T20:34:07.755Z → 2026-10-22T20:34:08.193Z
- tests/phase15/bol_read.ts: PASS; 2026-10-22T20:34:08.209Z → 2026-10-22T20:34:08.635Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-22T20:34:08.652Z → 2026-10-22T20:34:09.081Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-22T20:34:09.097Z → 2026-10-22T20:34:09.691Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-22T20:34:09.707Z → 2026-10-22T20:34:10.142Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-22T20:34:10.157Z → 2026-10-22T20:34:10.614Z
- tests/phase19/command_center.ts: PASS; 2026-10-22T20:34:10.629Z → 2026-10-22T20:34:11.067Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-22T20:34:11.083Z → 2026-10-22T20:34:11.505Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-22T20:34:11.522Z → 2026-10-22T20:34:12.512Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-22T20:34:12.530Z → 2026-10-22T20:34:12.884Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-22T20:34:12.901Z → 2026-10-22T20:34:14.195Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-22T20:34:14.212Z → 2026-10-22T20:34:14.675Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-22T20:34:14.692Z → 2026-10-22T20:34:15.251Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-22T20:34:15.270Z → 2026-10-22T20:34:15.725Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-22T20:34:15.742Z → 2026-10-22T20:34:16.492Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-22T20:34:16.508Z → 2026-10-22T20:34:17.172Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-22T20:34:17.200Z → 2026-10-22T20:34:17.969Z

### core-reliability — PASS

2026-10-22T20:34:18.761Z → 2026-10-22T20:34:43.843Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-12 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-22T20:34:18.765Z → 2026-10-22T20:34:43.841Z

- tests/core/reliability.ts: PASS; 2026-10-22T20:34:31.885Z → 2026-10-22T20:34:37.269Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-22T20:34:37.289Z → 2026-10-22T20:34:37.846Z
- tests/core/reservationRace.ts: PASS; 2026-10-22T20:34:37.863Z → 2026-10-22T20:34:38.307Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-22T20:34:38.323Z → 2026-10-22T20:34:38.823Z
- tests/core/eventBacklog.ts: PASS; 2026-10-22T20:34:38.840Z → 2026-10-22T20:34:40.388Z
- tests/core/learningScheduling.ts: PASS; 2026-10-22T20:34:40.405Z → 2026-10-22T20:34:40.844Z
- tests/core/startupAdmission.ts: PASS; 2026-10-22T20:34:40.863Z → 2026-10-22T20:34:42.495Z
- tests/core/planningDeadline.ts: PASS; 2026-10-22T20:34:42.512Z → 2026-10-22T20:34:43.116Z

### provider-auth — PASS

2026-10-22T20:34:43.846Z → 2026-10-22T20:34:53.507Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-13 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-22T20:34:43.849Z → 2026-10-22T20:34:53.503Z

- tests/release/provider_auth.ts: PASS; 2026-10-22T20:34:52.436Z → 2026-10-22T20:34:52.837Z

### postgres-tls — PASS

2026-10-22T20:34:53.510Z → 2026-10-22T20:35:06.055Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-14 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-22T20:34:53.516Z → 2026-10-22T20:35:06.054Z

- tests/release/postgres_tls.ts: PASS; 2026-10-22T20:35:04.792Z → 2026-10-22T20:35:05.361Z

### contracts — PASS

2026-10-22T20:35:06.059Z → 2026-10-22T20:35:21.423Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-15 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-22T20:35:06.062Z → 2026-10-22T20:35:21.423Z

- tests/release/contracts.ts: PASS; 2026-10-22T20:35:20.061Z → 2026-10-22T20:35:20.745Z

### synthetic-pilot — PASS

2026-10-22T20:35:21.427Z → 2026-10-22T20:35:31.779Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-16 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-22T20:35:21.430Z → 2026-10-22T20:35:31.778Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-22T20:35:30.402Z → 2026-10-22T20:35:31.080Z

### managed-schema — PASS

2026-10-22T20:35:31.782Z → 2026-10-22T20:35:45.738Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-17 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-22T20:35:31.785Z → 2026-10-22T20:35:45.738Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-22T20:35:44.716Z → 2026-10-22T20:35:45.004Z

### local-bundle — PASS

2026-10-22T20:35:45.744Z → 2026-10-22T20:36:03.157Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-18 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-22T20:35:45.747Z → 2026-10-22T20:36:03.156Z

- tests/release/local_bundle.ts: PASS; 2026-10-22T20:36:00.608Z → 2026-10-22T20:36:01.669Z

### closed-setup — PASS

2026-10-22T20:36:03.284Z → 2026-10-22T20:36:20.518Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-19 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-22T20:36:03.288Z → 2026-10-22T20:36:20.518Z

- tests/release/setup.ts: PASS; 2026-10-22T20:36:19.229Z → 2026-10-22T20:36:19.798Z

### database-contract — PASS

2026-10-22T20:36:20.522Z → 2026-10-22T20:36:36.109Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-20 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-22T20:36:20.525Z → 2026-10-22T20:36:36.108Z

- tests/release/database_check.ts: PASS; 2026-10-22T20:36:34.967Z → 2026-10-22T20:36:35.378Z

### prelaunch-gate — PASS

2026-10-22T20:36:36.116Z → 2026-10-22T20:36:53.407Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-21 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-22T20:36:36.123Z → 2026-10-22T20:36:53.406Z

- tests/release/prelaunch.ts: PASS; 2026-10-22T20:36:52.301Z → 2026-10-22T20:36:52.677Z

### service-provisioning — PASS

2026-10-22T20:36:53.412Z → 2026-10-22T20:37:11.604Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-22 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-22T20:36:53.416Z → 2026-10-22T20:37:11.603Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-22T20:37:07.774Z → 2026-10-22T20:37:10.766Z

### operator-provisioning — PASS

2026-10-22T20:37:11.609Z → 2026-10-22T20:37:36.522Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-23 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-22T20:37:11.612Z → 2026-10-22T20:37:36.521Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-22T20:37:31.272Z → 2026-10-22T20:37:35.741Z

### provisioning-backup-recovery — PASS

2026-10-22T20:37:36.525Z → 2026-10-22T20:37:40.537Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792701080766-315a30b4-pg sam-verify-1792701080766-315a30b4
```
Exit: 0; signal: none; 2026-10-22T20:37:36.529Z → 2026-10-22T20:37:40.537Z


### render-migration-compatibility — PASS

2026-10-22T20:37:40.541Z → 2026-10-22T20:37:56.141Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-24 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-22T20:37:40.543Z → 2026-10-22T20:37:56.140Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-22T20:37:54.302Z → 2026-10-22T20:37:55.460Z

### render-google-oauth-contracts — PASS

2026-10-22T20:37:56.144Z → 2026-10-22T20:38:19.455Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-25 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-22T20:37:56.147Z → 2026-10-22T20:38:19.455Z


### integration-migrations — PASS

2026-10-22T20:38:19.461Z → 2026-10-22T20:38:33.924Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-26 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-22T20:38:19.467Z → 2026-10-22T20:38:33.922Z

- tests/integration/migrations.ts: PASS; 2026-10-22T20:38:31.995Z → 2026-10-22T20:38:33.200Z

### integration-oauth-mcp — PASS

2026-10-22T20:38:33.928Z → 2026-10-22T20:38:50.992Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-27 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-22T20:38:33.932Z → 2026-10-22T20:38:50.990Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-22T20:38:48.865Z → 2026-10-22T20:38:50.005Z

### integration-orchestration — PASS

2026-10-22T20:38:50.999Z → 2026-10-22T20:39:16.864Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-28 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-22T20:38:51.004Z → 2026-10-22T20:39:16.863Z

- tests/integration/orchestration.ts: PASS; 2026-10-22T20:39:08.156Z → 2026-10-22T20:39:16.057Z

### specialist-reasoning — PASS

2026-10-22T20:39:16.870Z → 2026-10-22T20:40:27.547Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-29 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-22T20:39:16.873Z → 2026-10-22T20:40:27.545Z

- tests/specialists/acceptance.ts: PASS; 2026-10-22T20:39:33.498Z → 2026-10-22T20:40:26.271Z

### specialist-gateway — PASS

2026-10-22T20:40:27.555Z → 2026-10-22T20:40:44.983Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-30 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-22T20:40:27.561Z → 2026-10-22T20:40:44.983Z

- tests/specialists/gateway.ts: PASS; 2026-10-22T20:40:43.693Z → 2026-10-22T20:40:44.249Z

### specialist-provenance — PASS

2026-10-22T20:40:44.987Z → 2026-10-22T20:41:00.240Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-31 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-22T20:40:44.992Z → 2026-10-22T20:41:00.240Z

- tests/specialists/provenance.ts: PASS; 2026-10-22T20:40:59.065Z → 2026-10-22T20:40:59.521Z

### specialist-learning-fairness — PASS

2026-10-22T20:41:00.243Z → 2026-10-22T20:41:16.390Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-32 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-22T20:41:00.246Z → 2026-10-22T20:41:16.390Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-22T20:41:14.666Z → 2026-10-22T20:41:15.646Z

### specialist-evaluation — PASS

2026-10-22T20:41:16.394Z → 2026-10-22T20:41:29.231Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-33 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-22T20:41:16.398Z → 2026-10-22T20:41:29.231Z


### evaluation-budget — PASS

2026-10-22T20:41:29.239Z → 2026-10-22T20:41:46.160Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-34 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 --mount type=bind,source=/workspace/sam-operator-provisioning-acceptance/full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-22T20:41:29.245Z → 2026-10-22T20:41:46.159Z

- tests/evaluation/budgets.ts: PASS; 2026-10-22T20:41:41.970Z → 2026-10-22T20:41:45.464Z

### evaluation-adapter — PASS

2026-10-22T20:41:46.165Z → 2026-10-22T20:42:01.161Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-35 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-22T20:41:46.168Z → 2026-10-22T20:42:01.160Z

- tests/evaluation/adapters.ts: PASS; 2026-10-22T20:41:59.951Z → 2026-10-22T20:42:00.494Z

### evaluation-orchestration — PASS

2026-10-22T20:42:01.166Z → 2026-10-22T20:42:34.756Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-36 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 --mount type=bind,source=/workspace/sam-operator-provisioning-acceptance/full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-22T20:42:01.171Z → 2026-10-22T20:42:34.754Z

- tests/evaluation/orchestration.ts: PASS; 2026-10-22T20:42:15.842Z → 2026-10-22T20:42:33.921Z

### evaluation-independent-review — PASS

2026-10-22T20:42:34.765Z → 2026-10-22T20:42:52.943Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-37 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-22T20:42:34.769Z → 2026-10-22T20:42:52.943Z

- tests/evaluation/review.ts: PASS; 2026-10-22T20:42:51.444Z → 2026-10-22T20:42:52.250Z

### evaluation-commercial-market — PASS

2026-10-22T20:42:52.951Z → 2026-10-22T20:43:30.157Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-38 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 --mount type=bind,source=/workspace/sam-operator-provisioning-acceptance/full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-22T20:42:52.957Z → 2026-10-22T20:43:30.156Z

- tests/evaluation/market.ts: PASS; 2026-10-22T20:43:08.016Z → 2026-10-22T20:43:29.081Z

### evaluation-commercial-profitability — PASS

2026-10-22T20:43:30.171Z → 2026-10-22T20:44:05.697Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-39 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 --mount type=bind,source=/workspace/sam-operator-provisioning-acceptance/full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-22T20:43:30.178Z → 2026-10-22T20:44:05.695Z

- tests/evaluation/profitability.ts: PASS; 2026-10-22T20:43:44.323Z → 2026-10-22T20:44:04.778Z

### evaluation-commercial-suppliers — PASS

2026-10-22T20:44:05.710Z → 2026-10-22T20:44:38.564Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-40 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 --mount type=bind,source=/workspace/sam-operator-provisioning-acceptance/full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-22T20:44:05.724Z → 2026-10-22T20:44:38.563Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-22T20:44:18.348Z → 2026-10-22T20:44:37.814Z

### migration-upgrade-rollback — PASS

2026-10-22T20:44:38.575Z → 2026-10-22T20:44:51.615Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-41 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-22T20:44:38.582Z → 2026-10-22T20:44:51.615Z


### specialist-restart-prepare — PASS

2026-10-22T20:44:51.625Z → 2026-10-22T20:45:05.702Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-42 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-22T20:44:51.630Z → 2026-10-22T20:45:05.702Z


### evaluation-restart-prepare — PASS

2026-10-22T20:45:05.717Z → 2026-10-22T20:45:20.233Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-43 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=676c910cad77fa35e2cf8c8bbaf026d67b4959f4 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-22T20:45:05.724Z → 2026-10-22T20:45:20.233Z


### postgres-restart — PASS

2026-10-22T20:45:20.245Z → 2026-10-22T20:45:20.721Z

```sh
docker restart --time 10 sam-verify-1792701080766-315a30b4-pg
```
Exit: 0; signal: none; 2026-10-22T20:45:20.250Z → 2026-10-22T20:45:20.627Z

```sh
docker exec sam-verify-1792701080766-315a30b4-pg pg_isready -U postgres -d sam_core_test
```
Exit: 0; signal: none; 2026-10-22T20:45:20.627Z → 2026-10-22T20:45:20.721Z


### migration-after-restart — PASS

2026-10-22T20:45:20.727Z → 2026-10-22T20:45:36.260Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-44 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-22T20:45:20.733Z → 2026-10-22T20:45:36.260Z


### specialist-restart-check — PASS

2026-10-22T20:45:36.271Z → 2026-10-22T20:45:52.353Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-45 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-22T20:45:36.279Z → 2026-10-22T20:45:52.353Z


### evaluation-restart-check — PASS

2026-10-22T20:45:52.368Z → 2026-10-22T20:46:07.269Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-46 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-22T20:45:52.375Z → 2026-10-22T20:46:07.269Z


### phase0-migrations — PASS

2026-10-22T20:46:07.280Z → 2026-10-22T20:46:08.024Z

```sh
docker cp /tmp/sam-verify-0nJjTU/source/packages/db/migrations sam-verify-1792701080766-315a30b4-pg:/migrations
```
Exit: 0; signal: none; 2026-10-22T20:46:07.291Z → 2026-10-22T20:46:07.312Z

```sh
docker exec sam-verify-1792701080766-315a30b4-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-22T20:46:07.312Z → 2026-10-22T20:46:07.940Z

```sh
docker exec sam-verify-1792701080766-315a30b4-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-22T20:46:07.940Z → 2026-10-22T20:46:08.024Z


### phase0-acceptance — PASS

2026-10-22T20:46:08.033Z → 2026-10-22T20:46:11.658Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-47 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-0nJjTU/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-22T20:46:08.039Z → 2026-10-22T20:46:11.658Z


### phase0-postgres — PASS

2026-10-22T20:46:11.667Z → 2026-10-22T20:46:14.151Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-48 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-0nJjTU/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-22T20:46:11.673Z → 2026-10-22T20:46:14.151Z


### tenant-isolation — PASS

2026-10-22T20:46:14.167Z → 2026-10-22T20:46:16.387Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-49 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-0nJjTU/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-22T20:46:14.174Z → 2026-10-22T20:46:16.387Z


### fail-closed-security — PASS

2026-10-22T20:46:16.400Z → 2026-10-22T20:46:18.188Z

```sh
docker run --rm --name sam-verify-1792701080766-315a30b4-job-50 --label sam.verification.run=sam-verify-1792701080766-315a30b4 --init --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-0nJjTU/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-22T20:46:16.407Z → 2026-10-22T20:46:18.188Z


### clean-image — PASS

2026-10-22T20:46:18.196Z → 2026-10-22T20:46:29.298Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792701080766-315a30b4 Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-22T20:46:18.207Z → 2026-10-22T20:46:29.298Z


### image-contract — PASS

2026-10-22T20:46:29.307Z → 2026-10-22T20:46:29.332Z

```sh
docker image inspect sam-verification:sam-verify-1792701080766-315a30b4
```
Exit: 0; signal: none; 2026-10-22T20:46:29.315Z → 2026-10-22T20:46:29.332Z


### application-startup-restart — PASS

2026-10-22T20:46:29.338Z → 2026-10-22T20:46:36.133Z

```sh
docker run --rm --init --name sam-verify-1792701080766-315a30b4-application --label sam.verification.run=sam-verify-1792701080766-315a30b4 --network container:sam-verify-1792701080766-315a30b4-pg --mount type=bind,src=/tmp/sam-verify-0nJjTU/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792701080766-315a30b4 node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-22T20:46:29.344Z → 2026-10-22T20:46:36.133Z


### source-integrity — PASS

2026-10-22T20:46:36.141Z → 2026-10-22T20:46:36.178Z


### cleanup — PASS

2026-10-22T20:46:36.184Z → 2026-10-22T20:46:37.971Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-pg
```
Exit: 0; signal: none; 2026-10-22T20:46:36.190Z → 2026-10-22T20:46:36.210Z

```sh
docker rm --force --volumes sam-verify-1792701080766-315a30b4-pg
```
Exit: 0; signal: none; 2026-10-22T20:46:36.210Z → 2026-10-22T20:46:36.761Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-1
```
Exit: 1; signal: none; 2026-10-22T20:46:36.761Z → 2026-10-22T20:46:36.807Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-2
```
Exit: 1; signal: none; 2026-10-22T20:46:36.807Z → 2026-10-22T20:46:36.831Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-3
```
Exit: 1; signal: none; 2026-10-22T20:46:36.831Z → 2026-10-22T20:46:36.856Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-4
```
Exit: 1; signal: none; 2026-10-22T20:46:36.856Z → 2026-10-22T20:46:36.878Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-5
```
Exit: 1; signal: none; 2026-10-22T20:46:36.878Z → 2026-10-22T20:46:36.906Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-6
```
Exit: 1; signal: none; 2026-10-22T20:46:36.906Z → 2026-10-22T20:46:36.926Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-7
```
Exit: 1; signal: none; 2026-10-22T20:46:36.926Z → 2026-10-22T20:46:36.947Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-8
```
Exit: 1; signal: none; 2026-10-22T20:46:36.947Z → 2026-10-22T20:46:36.973Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-9
```
Exit: 1; signal: none; 2026-10-22T20:46:36.973Z → 2026-10-22T20:46:36.994Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-10
```
Exit: 1; signal: none; 2026-10-22T20:46:36.994Z → 2026-10-22T20:46:37.015Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-11
```
Exit: 1; signal: none; 2026-10-22T20:46:37.015Z → 2026-10-22T20:46:37.035Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-12
```
Exit: 1; signal: none; 2026-10-22T20:46:37.035Z → 2026-10-22T20:46:37.056Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-13
```
Exit: 1; signal: none; 2026-10-22T20:46:37.056Z → 2026-10-22T20:46:37.079Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-14
```
Exit: 1; signal: none; 2026-10-22T20:46:37.079Z → 2026-10-22T20:46:37.100Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-15
```
Exit: 1; signal: none; 2026-10-22T20:46:37.100Z → 2026-10-22T20:46:37.122Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-16
```
Exit: 1; signal: none; 2026-10-22T20:46:37.122Z → 2026-10-22T20:46:37.143Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-17
```
Exit: 1; signal: none; 2026-10-22T20:46:37.143Z → 2026-10-22T20:46:37.163Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-18
```
Exit: 1; signal: none; 2026-10-22T20:46:37.163Z → 2026-10-22T20:46:37.183Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-19
```
Exit: 1; signal: none; 2026-10-22T20:46:37.183Z → 2026-10-22T20:46:37.208Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-20
```
Exit: 1; signal: none; 2026-10-22T20:46:37.208Z → 2026-10-22T20:46:37.228Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-21
```
Exit: 1; signal: none; 2026-10-22T20:46:37.228Z → 2026-10-22T20:46:37.248Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-22
```
Exit: 1; signal: none; 2026-10-22T20:46:37.248Z → 2026-10-22T20:46:37.268Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-23
```
Exit: 1; signal: none; 2026-10-22T20:46:37.268Z → 2026-10-22T20:46:37.288Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-24
```
Exit: 1; signal: none; 2026-10-22T20:46:37.288Z → 2026-10-22T20:46:37.308Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-25
```
Exit: 1; signal: none; 2026-10-22T20:46:37.308Z → 2026-10-22T20:46:37.329Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-26
```
Exit: 1; signal: none; 2026-10-22T20:46:37.329Z → 2026-10-22T20:46:37.350Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-27
```
Exit: 1; signal: none; 2026-10-22T20:46:37.350Z → 2026-10-22T20:46:37.369Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-28
```
Exit: 1; signal: none; 2026-10-22T20:46:37.370Z → 2026-10-22T20:46:37.390Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-29
```
Exit: 1; signal: none; 2026-10-22T20:46:37.390Z → 2026-10-22T20:46:37.410Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-30
```
Exit: 1; signal: none; 2026-10-22T20:46:37.410Z → 2026-10-22T20:46:37.432Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-31
```
Exit: 1; signal: none; 2026-10-22T20:46:37.432Z → 2026-10-22T20:46:37.451Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-32
```
Exit: 1; signal: none; 2026-10-22T20:46:37.451Z → 2026-10-22T20:46:37.470Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-33
```
Exit: 1; signal: none; 2026-10-22T20:46:37.470Z → 2026-10-22T20:46:37.490Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-34
```
Exit: 1; signal: none; 2026-10-22T20:46:37.490Z → 2026-10-22T20:46:37.510Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-35
```
Exit: 1; signal: none; 2026-10-22T20:46:37.510Z → 2026-10-22T20:46:37.529Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-36
```
Exit: 1; signal: none; 2026-10-22T20:46:37.529Z → 2026-10-22T20:46:37.551Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-37
```
Exit: 1; signal: none; 2026-10-22T20:46:37.551Z → 2026-10-22T20:46:37.571Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-38
```
Exit: 1; signal: none; 2026-10-22T20:46:37.571Z → 2026-10-22T20:46:37.591Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-39
```
Exit: 1; signal: none; 2026-10-22T20:46:37.591Z → 2026-10-22T20:46:37.612Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-40
```
Exit: 1; signal: none; 2026-10-22T20:46:37.612Z → 2026-10-22T20:46:37.633Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-41
```
Exit: 1; signal: none; 2026-10-22T20:46:37.633Z → 2026-10-22T20:46:37.651Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-42
```
Exit: 1; signal: none; 2026-10-22T20:46:37.651Z → 2026-10-22T20:46:37.670Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-43
```
Exit: 1; signal: none; 2026-10-22T20:46:37.670Z → 2026-10-22T20:46:37.691Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-44
```
Exit: 1; signal: none; 2026-10-22T20:46:37.691Z → 2026-10-22T20:46:37.711Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-45
```
Exit: 1; signal: none; 2026-10-22T20:46:37.711Z → 2026-10-22T20:46:37.734Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-46
```
Exit: 1; signal: none; 2026-10-22T20:46:37.734Z → 2026-10-22T20:46:37.757Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-47
```
Exit: 1; signal: none; 2026-10-22T20:46:37.758Z → 2026-10-22T20:46:37.778Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-48
```
Exit: 1; signal: none; 2026-10-22T20:46:37.778Z → 2026-10-22T20:46:37.798Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-49
```
Exit: 1; signal: none; 2026-10-22T20:46:37.798Z → 2026-10-22T20:46:37.817Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-job-50
```
Exit: 1; signal: none; 2026-10-22T20:46:37.817Z → 2026-10-22T20:46:37.841Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-application
```
Exit: 1; signal: none; 2026-10-22T20:46:37.841Z → 2026-10-22T20:46:37.861Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792701080766-315a30b4-net
```
Exit: 0; signal: none; 2026-10-22T20:46:37.861Z → 2026-10-22T20:46:37.873Z

```sh
docker network rm sam-verify-1792701080766-315a30b4-net
```
Exit: 0; signal: none; 2026-10-22T20:46:37.873Z → 2026-10-22T20:46:37.926Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
