# Independent SAM verification

Status: **PASS**
Source: `39db4769e498efe3287bee8216d2c6d0825b0706` (clean: true)
Started: 2026-10-23T18:11:12.664Z; completed: 2026-10-23T18:25:46.731Z

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
- clean-application: `sam-verification:sam-verify-1792779072663-9598c82a`; ID `sha256:72632927c549a028fcab9f1e479e587be59e639bc4e102fae720a0407c39bdb0`

## Commands and suite outcomes

### preflight — PASS

2026-10-23T18:11:12.665Z → 2026-10-23T18:11:12.900Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T18:11:12.671Z → 2026-10-23T18:11:12.677Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T18:11:12.677Z → 2026-10-23T18:11:12.680Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T18:11:12.680Z → 2026-10-23T18:11:12.685Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T18:11:12.685Z → 2026-10-23T18:11:12.698Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T18:11:12.698Z → 2026-10-23T18:11:12.718Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T18:11:12.718Z → 2026-10-23T18:11:12.772Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T18:11:12.772Z → 2026-10-23T18:11:12.838Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T18:11:12.838Z → 2026-10-23T18:11:12.886Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T18:11:12.886Z → 2026-10-23T18:11:12.889Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T18:11:12.889Z → 2026-10-23T18:11:12.898Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T18:11:12.898Z → 2026-10-23T18:11:12.900Z


### snapshot — PASS

2026-10-23T18:11:12.902Z → 2026-10-23T18:11:12.984Z

```sh
git archive --format=tar --output /tmp/sam-verify-0wC0zN/source.tar 39db4769e498efe3287bee8216d2c6d0825b0706
```
Exit: 0; signal: none; 2026-10-23T18:11:12.902Z → 2026-10-23T18:11:12.938Z

```sh
tar -xf /tmp/sam-verify-0wC0zN/source.tar -C /tmp/sam-verify-0wC0zN/source
```
Exit: 0; signal: none; 2026-10-23T18:11:12.938Z → 2026-10-23T18:11:12.948Z


### images — PASS

2026-10-23T18:11:12.985Z → 2026-10-23T18:11:13.104Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T18:11:12.986Z → 2026-10-23T18:11:13.000Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T18:11:13.000Z → 2026-10-23T18:11:13.020Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T18:11:13.020Z → 2026-10-23T18:11:13.032Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T18:11:13.032Z → 2026-10-23T18:11:13.044Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T18:11:13.045Z → 2026-10-23T18:11:13.059Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T18:11:13.059Z → 2026-10-23T18:11:13.076Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T18:11:13.076Z → 2026-10-23T18:11:13.090Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T18:11:13.090Z → 2026-10-23T18:11:13.104Z


### isolated-postgres — PASS

2026-10-23T18:11:13.106Z → 2026-10-23T18:11:15.709Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792779072663-9598c82a sam-verify-1792779072663-9598c82a-net
```
Exit: 0; signal: none; 2026-10-23T18:11:13.107Z → 2026-10-23T18:11:13.137Z

```sh
docker run --detach --name sam-verify-1792779072663-9598c82a-pg --label sam.verification.run=sam-verify-1792779072663-9598c82a --network sam-verify-1792779072663-9598c82a-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T18:11:13.137Z → 2026-10-23T18:11:14.100Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792779072663-9598c82a-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T18:11:14.100Z → 2026-10-23T18:11:14.189Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792779072663-9598c82a-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T18:11:14.690Z → 2026-10-23T18:11:14.778Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792779072663-9598c82a-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T18:11:15.279Z → 2026-10-23T18:11:15.378Z

```sh
docker exec sam-verify-1792779072663-9598c82a-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T18:11:15.378Z → 2026-10-23T18:11:15.494Z

```sh
docker exec sam-verify-1792779072663-9598c82a-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T18:11:15.494Z → 2026-10-23T18:11:15.603Z

```sh
docker exec sam-verify-1792779072663-9598c82a-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T18:11:15.603Z → 2026-10-23T18:11:15.709Z


### node-dependencies — PASS

2026-10-23T18:11:15.715Z → 2026-10-23T18:11:22.814Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-1 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T18:11:15.716Z → 2026-10-23T18:11:22.814Z


### python-dependencies — PASS

2026-10-23T18:11:22.816Z → 2026-10-23T18:11:26.558Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-2 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-0wC0zN/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T18:11:22.817Z → 2026-10-23T18:11:26.558Z


### runtime-versions — PASS

2026-10-23T18:11:26.559Z → 2026-10-23T18:11:58.178Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-3 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T18:11:26.560Z → 2026-10-23T18:11:36.750Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-4 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T18:11:36.750Z → 2026-10-23T18:11:47.500Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-5 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T18:11:47.500Z → 2026-10-23T18:11:57.414Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-6 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T18:11:57.414Z → 2026-10-23T18:11:58.094Z

```sh
docker exec sam-verify-1792779072663-9598c82a-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T18:11:58.094Z → 2026-10-23T18:11:58.177Z


### workflow-tool — PASS

2026-10-23T18:11:58.179Z → 2026-10-23T18:11:58.760Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-0wC0zN/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T18:11:58.180Z → 2026-10-23T18:11:58.715Z

```sh
tar -xzf /tmp/sam-verify-0wC0zN/actionlint.tar.gz -C /tmp/sam-verify-0wC0zN actionlint
```
Exit: 0; signal: none; 2026-10-23T18:11:58.718Z → 2026-10-23T18:11:58.757Z

```sh
/tmp/sam-verify-0wC0zN/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T18:11:58.757Z → 2026-10-23T18:11:58.760Z


### workflow-validation — PASS

2026-10-23T18:11:58.761Z → 2026-10-23T18:11:58.765Z

```sh
/tmp/sam-verify-0wC0zN/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T18:11:58.763Z → 2026-10-23T18:11:58.765Z


### configuration-validation — PASS

2026-10-23T18:11:58.766Z → 2026-10-23T18:12:32.316Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T18:11:58.767Z → 2026-10-23T18:11:59.008Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T18:11:59.008Z → 2026-10-23T18:11:59.079Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T18:11:59.079Z → 2026-10-23T18:11:59.154Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T18:11:59.154Z → 2026-10-23T18:11:59.223Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T18:11:59.223Z → 2026-10-23T18:11:59.293Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-7 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T18:11:59.293Z → 2026-10-23T18:12:11.529Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-8 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T18:12:11.530Z → 2026-10-23T18:12:21.798Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-9 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T18:12:21.798Z → 2026-10-23T18:12:32.316Z


### typecheck — PASS

2026-10-23T18:12:32.318Z → 2026-10-23T18:12:48.372Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-10 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T18:12:32.319Z → 2026-10-23T18:12:48.372Z


### regression — PASS

2026-10-23T18:12:48.373Z → 2026-10-23T18:13:26.619Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-11 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T18:12:48.374Z → 2026-10-23T18:13:26.619Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T18:12:58.035Z → 2026-10-23T18:12:58.542Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T18:12:58.561Z → 2026-10-23T18:12:59.003Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T18:12:59.024Z → 2026-10-23T18:12:59.432Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T18:12:59.450Z → 2026-10-23T18:12:59.923Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T18:12:59.940Z → 2026-10-23T18:13:00.379Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T18:13:00.397Z → 2026-10-23T18:13:00.751Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T18:13:00.772Z → 2026-10-23T18:13:01.278Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T18:13:01.297Z → 2026-10-23T18:13:01.751Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T18:13:01.768Z → 2026-10-23T18:13:02.242Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T18:13:02.263Z → 2026-10-23T18:13:02.686Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T18:13:02.704Z → 2026-10-23T18:13:03.144Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T18:13:03.162Z → 2026-10-23T18:13:03.507Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T18:13:03.524Z → 2026-10-23T18:13:04.054Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T18:13:04.071Z → 2026-10-23T18:13:04.474Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T18:13:04.495Z → 2026-10-23T18:13:04.894Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T18:13:04.921Z → 2026-10-23T18:13:05.424Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T18:13:05.446Z → 2026-10-23T18:13:05.928Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T18:13:05.948Z → 2026-10-23T18:13:06.446Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T18:13:06.463Z → 2026-10-23T18:13:06.940Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T18:13:06.958Z → 2026-10-23T18:13:07.335Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T18:13:07.352Z → 2026-10-23T18:13:07.702Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T18:13:07.720Z → 2026-10-23T18:13:08.020Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T18:13:08.041Z → 2026-10-23T18:13:08.481Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T18:13:08.500Z → 2026-10-23T18:13:09.887Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T18:13:09.907Z → 2026-10-23T18:13:10.441Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T18:13:10.459Z → 2026-10-23T18:13:10.843Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T18:13:10.859Z → 2026-10-23T18:13:11.754Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T18:13:11.771Z → 2026-10-23T18:13:12.567Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T18:13:12.588Z → 2026-10-23T18:13:13.029Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T18:13:13.047Z → 2026-10-23T18:13:13.468Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T18:13:13.487Z → 2026-10-23T18:13:14.237Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T18:13:14.255Z → 2026-10-23T18:13:14.698Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T18:13:14.719Z → 2026-10-23T18:13:15.191Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T18:13:15.210Z → 2026-10-23T18:13:15.670Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T18:13:15.693Z → 2026-10-23T18:13:16.180Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T18:13:16.199Z → 2026-10-23T18:13:16.866Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T18:13:16.947Z → 2026-10-23T18:13:17.399Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T18:13:17.418Z → 2026-10-23T18:13:17.982Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T18:13:18.002Z → 2026-10-23T18:13:18.510Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T18:13:18.528Z → 2026-10-23T18:13:18.957Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T18:13:18.974Z → 2026-10-23T18:13:19.947Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T18:13:19.965Z → 2026-10-23T18:13:20.292Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T18:13:20.310Z → 2026-10-23T18:13:21.672Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T18:13:21.695Z → 2026-10-23T18:13:22.158Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T18:13:22.178Z → 2026-10-23T18:13:22.746Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T18:13:22.763Z → 2026-10-23T18:13:23.203Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T18:13:23.223Z → 2026-10-23T18:13:24.049Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T18:13:24.072Z → 2026-10-23T18:13:24.797Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T18:13:24.829Z → 2026-10-23T18:13:25.634Z

### core-reliability — PASS

2026-10-23T18:13:26.621Z → 2026-10-23T18:14:02.558Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-12 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T18:13:26.623Z → 2026-10-23T18:14:02.557Z

- tests/core/reliability.ts: PASS; 2026-10-23T18:13:36.222Z → 2026-10-23T18:13:41.422Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T18:13:41.442Z → 2026-10-23T18:13:42.014Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T18:13:42.033Z → 2026-10-23T18:13:42.463Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T18:13:42.481Z → 2026-10-23T18:13:43.003Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T18:13:43.023Z → 2026-10-23T18:13:44.681Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T18:13:44.703Z → 2026-10-23T18:13:45.177Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T18:13:45.195Z → 2026-10-23T18:13:46.923Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T18:13:46.948Z → 2026-10-23T18:13:47.550Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T18:13:47.571Z → 2026-10-23T18:13:48.982Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T18:13:49.000Z → 2026-10-23T18:13:53.126Z
- tests/core/evidenceTransforms.ts: PASS; 2026-10-23T18:13:53.147Z → 2026-10-23T18:13:53.807Z
- tests/core/evidenceIntegration.ts: PASS; 2026-10-23T18:13:53.824Z → 2026-10-23T18:14:00.468Z
- tests/core/sourceContracts.ts: PASS; 2026-10-23T18:14:00.497Z → 2026-10-23T18:14:01.208Z
- tests/core/evidenceChaining.ts: PASS; 2026-10-23T18:14:01.225Z → 2026-10-23T18:14:01.699Z

### provider-auth — PASS

2026-10-23T18:14:02.559Z → 2026-10-23T18:14:12.815Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-13 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T18:14:02.561Z → 2026-10-23T18:14:12.815Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T18:14:11.717Z → 2026-10-23T18:14:12.104Z

### postgres-tls — PASS

2026-10-23T18:14:12.817Z → 2026-10-23T18:14:24.014Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-14 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T18:14:12.819Z → 2026-10-23T18:14:24.014Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T18:14:22.577Z → 2026-10-23T18:14:23.285Z

### contracts — PASS

2026-10-23T18:14:24.017Z → 2026-10-23T18:14:35.905Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-15 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T18:14:24.018Z → 2026-10-23T18:14:35.905Z

- tests/release/contracts.ts: PASS; 2026-10-23T18:14:34.394Z → 2026-10-23T18:14:35.090Z

### synthetic-pilot — PASS

2026-10-23T18:14:35.908Z → 2026-10-23T18:14:47.895Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-16 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T18:14:35.909Z → 2026-10-23T18:14:47.895Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T18:14:46.233Z → 2026-10-23T18:14:47.001Z

### managed-schema — PASS

2026-10-23T18:14:47.898Z → 2026-10-23T18:14:59.088Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-17 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T18:14:47.899Z → 2026-10-23T18:14:59.088Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T18:14:58.100Z → 2026-10-23T18:14:58.350Z

### local-bundle — PASS

2026-10-23T18:14:59.091Z → 2026-10-23T18:15:10.026Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-18 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T18:14:59.092Z → 2026-10-23T18:15:10.025Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T18:15:08.861Z → 2026-10-23T18:15:09.217Z

### closed-setup — PASS

2026-10-23T18:15:10.028Z → 2026-10-23T18:15:21.717Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-19 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T18:15:10.030Z → 2026-10-23T18:15:21.716Z

- tests/release/setup.ts: PASS; 2026-10-23T18:15:20.271Z → 2026-10-23T18:15:20.882Z

### database-contract — PASS

2026-10-23T18:15:21.720Z → 2026-10-23T18:15:32.445Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-20 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T18:15:21.721Z → 2026-10-23T18:15:32.445Z

- tests/release/database_check.ts: PASS; 2026-10-23T18:15:31.295Z → 2026-10-23T18:15:31.658Z

### prelaunch-gate — PASS

2026-10-23T18:15:32.448Z → 2026-10-23T18:15:42.326Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-21 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T18:15:32.452Z → 2026-10-23T18:15:42.326Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T18:15:41.273Z → 2026-10-23T18:15:41.585Z

### service-provisioning — PASS

2026-10-23T18:15:42.329Z → 2026-10-23T18:15:55.630Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-22 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T18:15:42.331Z → 2026-10-23T18:15:55.630Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T18:15:51.254Z → 2026-10-23T18:15:54.890Z

### operator-provisioning — PASS

2026-10-23T18:15:55.633Z → 2026-10-23T18:16:10.065Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-23 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T18:15:55.635Z → 2026-10-23T18:16:10.065Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T18:16:04.840Z → 2026-10-23T18:16:09.295Z

### provisioning-backup-recovery — PASS

2026-10-23T18:16:10.067Z → 2026-10-23T18:16:13.486Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792779072663-9598c82a-pg sam-verify-1792779072663-9598c82a
```
Exit: 0; signal: none; 2026-10-23T18:16:10.069Z → 2026-10-23T18:16:13.486Z


### render-migration-compatibility — PASS

2026-10-23T18:16:13.488Z → 2026-10-23T18:16:25.791Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-24 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T18:16:13.490Z → 2026-10-23T18:16:25.791Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T18:16:23.755Z → 2026-10-23T18:16:25.020Z

### render-google-oauth-contracts — PASS

2026-10-23T18:16:25.793Z → 2026-10-23T18:16:43.328Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-25 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/isolated/goal_obligations.ts tests/isolated/collection_receipts.ts tests/isolated/shared_goal_contract.ts tests/isolated/delegation_scope.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-23T18:16:25.795Z → 2026-10-23T18:16:43.328Z


### integration-migrations — PASS

2026-10-23T18:16:43.331Z → 2026-10-23T18:16:55.248Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-26 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-23T18:16:43.332Z → 2026-10-23T18:16:55.248Z

- tests/integration/migrations.ts: PASS; 2026-10-23T18:16:53.345Z → 2026-10-23T18:16:54.452Z

### integration-oauth-mcp — PASS

2026-10-23T18:16:55.252Z → 2026-10-23T18:17:06.213Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-27 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-23T18:16:55.254Z → 2026-10-23T18:17:06.213Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-23T18:17:04.612Z → 2026-10-23T18:17:05.330Z

### integration-orchestration — PASS

2026-10-23T18:17:06.215Z → 2026-10-23T18:17:23.852Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-28 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T18:17:06.217Z → 2026-10-23T18:17:23.852Z

- tests/integration/orchestration.ts: PASS; 2026-10-23T18:17:15.989Z → 2026-10-23T18:17:23.049Z

### specialist-reasoning — PASS

2026-10-23T18:17:23.856Z → 2026-10-23T18:18:36.625Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-29 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-23T18:17:23.858Z → 2026-10-23T18:18:36.624Z

- tests/specialists/acceptance.ts: PASS; 2026-10-23T18:17:33.516Z → 2026-10-23T18:18:35.537Z

### specialist-gateway — PASS

2026-10-23T18:18:36.629Z → 2026-10-23T18:18:48.935Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-30 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-23T18:18:36.631Z → 2026-10-23T18:18:48.935Z

- tests/specialists/gateway.ts: PASS; 2026-10-23T18:18:47.309Z → 2026-10-23T18:18:48.003Z

### specialist-provenance — PASS

2026-10-23T18:18:48.938Z → 2026-10-23T18:19:01.274Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-31 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-23T18:18:48.940Z → 2026-10-23T18:19:01.274Z

- tests/specialists/provenance.ts: PASS; 2026-10-23T18:18:59.950Z → 2026-10-23T18:19:00.407Z

### specialist-learning-fairness — PASS

2026-10-23T18:19:01.276Z → 2026-10-23T18:19:13.255Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-32 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-23T18:19:01.279Z → 2026-10-23T18:19:13.255Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-23T18:19:10.963Z → 2026-10-23T18:19:12.375Z

### specialist-evaluation — PASS

2026-10-23T18:19:13.258Z → 2026-10-23T18:19:24.432Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-33 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-23T18:19:13.260Z → 2026-10-23T18:19:24.432Z


### evaluation-budget — PASS

2026-10-23T18:19:24.435Z → 2026-10-23T18:20:35.955Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-34 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 --mount type=bind,source=/tmp/sam-shared-39db476-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-23T18:19:24.440Z → 2026-10-23T18:20:35.954Z

- tests/evaluation/budgets.ts: PASS; 2026-10-23T18:19:33.704Z → 2026-10-23T18:20:35.085Z

### evaluation-adapter — PASS

2026-10-23T18:20:35.958Z → 2026-10-23T18:20:43.924Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-35 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-23T18:20:35.960Z → 2026-10-23T18:20:43.924Z

- tests/evaluation/adapters.ts: PASS; 2026-10-23T18:20:42.052Z → 2026-10-23T18:20:43.112Z

### evaluation-orchestration — PASS

2026-10-23T18:20:43.931Z → 2026-10-23T18:21:14.479Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-36 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 --mount type=bind,source=/tmp/sam-shared-39db476-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T18:20:43.933Z → 2026-10-23T18:21:14.479Z

- tests/evaluation/orchestration.ts: PASS; 2026-10-23T18:20:50.930Z → 2026-10-23T18:21:13.483Z

### evaluation-independent-review — PASS

2026-10-23T18:21:14.483Z → 2026-10-23T18:21:21.929Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-37 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-23T18:21:14.488Z → 2026-10-23T18:21:21.929Z

- tests/evaluation/review.ts: PASS; 2026-10-23T18:21:19.929Z → 2026-10-23T18:21:21.009Z

### evaluation-commercial-market — PASS

2026-10-23T18:21:21.934Z → 2026-10-23T18:21:56.881Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-38 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 --mount type=bind,source=/tmp/sam-shared-39db476-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-23T18:21:21.937Z → 2026-10-23T18:21:56.880Z

- tests/evaluation/market.ts: PASS; 2026-10-23T18:21:28.945Z → 2026-10-23T18:21:55.896Z

### evaluation-commercial-profitability — PASS

2026-10-23T18:21:56.885Z → 2026-10-23T18:22:26.493Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-39 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 --mount type=bind,source=/tmp/sam-shared-39db476-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-23T18:21:56.889Z → 2026-10-23T18:22:26.493Z

- tests/evaluation/profitability.ts: PASS; 2026-10-23T18:22:00.491Z → 2026-10-23T18:22:25.555Z

### evaluation-commercial-suppliers — PASS

2026-10-23T18:22:26.499Z → 2026-10-23T18:22:56.445Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-40 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 --mount type=bind,source=/tmp/sam-shared-39db476-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-23T18:22:26.503Z → 2026-10-23T18:22:56.444Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-23T18:22:29.613Z → 2026-10-23T18:22:55.484Z

### migration-upgrade-rollback — PASS

2026-10-23T18:22:56.452Z → 2026-10-23T18:23:07.658Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-41 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-23T18:22:56.458Z → 2026-10-23T18:23:07.658Z


### specialist-restart-prepare — PASS

2026-10-23T18:23:07.665Z → 2026-10-23T18:23:17.642Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-42 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T18:23:07.671Z → 2026-10-23T18:23:17.642Z


### evaluation-restart-prepare — PASS

2026-10-23T18:23:17.650Z → 2026-10-23T18:23:28.247Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-43 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T18:23:17.659Z → 2026-10-23T18:23:28.247Z


### postgres-restart — PASS

2026-10-23T18:23:28.256Z → 2026-10-23T18:23:28.838Z

```sh
docker restart --time 10 sam-verify-1792779072663-9598c82a-pg
```
Exit: 0; signal: none; 2026-10-23T18:23:28.262Z → 2026-10-23T18:23:28.742Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792779072663-9598c82a-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T18:23:28.742Z → 2026-10-23T18:23:28.838Z


### migration-after-restart — PASS

2026-10-23T18:23:28.846Z → 2026-10-23T18:23:41.050Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-44 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-23T18:23:28.852Z → 2026-10-23T18:23:41.050Z


### specialist-restart-check — PASS

2026-10-23T18:23:41.060Z → 2026-10-23T18:23:53.583Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-45 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T18:23:41.069Z → 2026-10-23T18:23:53.583Z


### evaluation-restart-check — PASS

2026-10-23T18:23:53.590Z → 2026-10-23T18:24:05.993Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-46 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T18:23:53.596Z → 2026-10-23T18:24:05.993Z


### phase0-migrations — PASS

2026-10-23T18:24:06.000Z → 2026-10-23T18:24:06.799Z

```sh
docker cp /tmp/sam-verify-0wC0zN/source/packages/db/migrations sam-verify-1792779072663-9598c82a-pg:/migrations
```
Exit: 0; signal: none; 2026-10-23T18:24:06.005Z → 2026-10-23T18:24:06.028Z

```sh
docker exec sam-verify-1792779072663-9598c82a-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-23T18:24:06.028Z → 2026-10-23T18:24:06.684Z

```sh
docker exec sam-verify-1792779072663-9598c82a-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-23T18:24:06.684Z → 2026-10-23T18:24:06.799Z


### phase0-acceptance — PASS

2026-10-23T18:24:06.806Z → 2026-10-23T18:24:09.138Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-47 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-0wC0zN/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-23T18:24:06.811Z → 2026-10-23T18:24:09.138Z


### phase0-postgres — PASS

2026-10-23T18:24:09.145Z → 2026-10-23T18:24:11.395Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-48 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-0wC0zN/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-23T18:24:09.150Z → 2026-10-23T18:24:11.395Z


### tenant-isolation — PASS

2026-10-23T18:24:11.405Z → 2026-10-23T18:24:13.595Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-49 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-0wC0zN/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-23T18:24:11.411Z → 2026-10-23T18:24:13.595Z


### fail-closed-security — PASS

2026-10-23T18:24:13.603Z → 2026-10-23T18:24:15.549Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-50 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-0wC0zN/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-23T18:24:13.608Z → 2026-10-23T18:24:15.549Z


### clean-image — PASS

2026-10-23T18:24:15.556Z → 2026-10-23T18:24:22.067Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792779072663-9598c82a Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-23T18:24:15.563Z → 2026-10-23T18:24:22.067Z


### image-contract — PASS

2026-10-23T18:24:22.074Z → 2026-10-23T18:24:22.095Z

```sh
docker image inspect sam-verification:sam-verify-1792779072663-9598c82a
```
Exit: 0; signal: none; 2026-10-23T18:24:22.080Z → 2026-10-23T18:24:22.094Z


### application-startup-restart — PASS

2026-10-23T18:24:22.103Z → 2026-10-23T18:24:28.533Z

```sh
docker run --rm --init --name sam-verify-1792779072663-9598c82a-application --label sam.verification.run=sam-verify-1792779072663-9598c82a --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792779072663-9598c82a node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-23T18:24:22.111Z → 2026-10-23T18:24:28.533Z


### source-integrity — PASS

2026-10-23T18:24:28.542Z → 2026-10-23T18:24:28.561Z


### shared-goal-path — PASS

2026-10-23T18:24:28.568Z → 2026-10-23T18:25:44.833Z

```sh
docker run --rm --name sam-verify-1792779072663-9598c82a-job-52 --label sam.verification.run=sam-verify-1792779072663-9598c82a --init --network container:sam-verify-1792779072663-9598c82a-pg --mount type=bind,src=/tmp/sam-verify-0wC0zN/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=39db4769e498efe3287bee8216d2c6d0825b0706 --mount type=bind,source=/tmp/sam-shared-39db476-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/sharedPath.ts
```
Exit: 0; signal: none; 2026-10-23T18:24:28.575Z → 2026-10-23T18:25:44.833Z

- tests/evaluation/sharedPath.ts: PASS; 2026-10-23T18:24:34.365Z → 2026-10-23T18:25:43.891Z

### cleanup — PASS

2026-10-23T18:25:44.844Z → 2026-10-23T18:25:46.719Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-pg
```
Exit: 0; signal: none; 2026-10-23T18:25:44.854Z → 2026-10-23T18:25:44.871Z

```sh
docker rm --force --volumes sam-verify-1792779072663-9598c82a-pg
```
Exit: 0; signal: none; 2026-10-23T18:25:44.871Z → 2026-10-23T18:25:45.269Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-1
```
Exit: 1; signal: none; 2026-10-23T18:25:45.269Z → 2026-10-23T18:25:45.292Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-2
```
Exit: 1; signal: none; 2026-10-23T18:25:45.292Z → 2026-10-23T18:25:45.314Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-3
```
Exit: 1; signal: none; 2026-10-23T18:25:45.314Z → 2026-10-23T18:25:45.349Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-4
```
Exit: 1; signal: none; 2026-10-23T18:25:45.349Z → 2026-10-23T18:25:45.378Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-5
```
Exit: 1; signal: none; 2026-10-23T18:25:45.378Z → 2026-10-23T18:25:45.409Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-6
```
Exit: 1; signal: none; 2026-10-23T18:25:45.409Z → 2026-10-23T18:25:45.438Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-7
```
Exit: 1; signal: none; 2026-10-23T18:25:45.438Z → 2026-10-23T18:25:45.475Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-8
```
Exit: 1; signal: none; 2026-10-23T18:25:45.475Z → 2026-10-23T18:25:45.498Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-9
```
Exit: 1; signal: none; 2026-10-23T18:25:45.498Z → 2026-10-23T18:25:45.520Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-10
```
Exit: 1; signal: none; 2026-10-23T18:25:45.521Z → 2026-10-23T18:25:45.548Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-11
```
Exit: 1; signal: none; 2026-10-23T18:25:45.548Z → 2026-10-23T18:25:45.579Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-12
```
Exit: 1; signal: none; 2026-10-23T18:25:45.579Z → 2026-10-23T18:25:45.606Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-13
```
Exit: 1; signal: none; 2026-10-23T18:25:45.606Z → 2026-10-23T18:25:45.630Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-14
```
Exit: 1; signal: none; 2026-10-23T18:25:45.630Z → 2026-10-23T18:25:45.656Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-15
```
Exit: 1; signal: none; 2026-10-23T18:25:45.656Z → 2026-10-23T18:25:45.687Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-16
```
Exit: 1; signal: none; 2026-10-23T18:25:45.687Z → 2026-10-23T18:25:45.712Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-17
```
Exit: 1; signal: none; 2026-10-23T18:25:45.712Z → 2026-10-23T18:25:45.732Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-18
```
Exit: 1; signal: none; 2026-10-23T18:25:45.732Z → 2026-10-23T18:25:45.753Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-19
```
Exit: 1; signal: none; 2026-10-23T18:25:45.753Z → 2026-10-23T18:25:45.780Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-20
```
Exit: 1; signal: none; 2026-10-23T18:25:45.781Z → 2026-10-23T18:25:45.805Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-21
```
Exit: 1; signal: none; 2026-10-23T18:25:45.806Z → 2026-10-23T18:25:45.828Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-22
```
Exit: 1; signal: none; 2026-10-23T18:25:45.828Z → 2026-10-23T18:25:45.858Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-23
```
Exit: 1; signal: none; 2026-10-23T18:25:45.858Z → 2026-10-23T18:25:45.887Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-24
```
Exit: 1; signal: none; 2026-10-23T18:25:45.887Z → 2026-10-23T18:25:45.909Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-25
```
Exit: 1; signal: none; 2026-10-23T18:25:45.909Z → 2026-10-23T18:25:45.932Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-26
```
Exit: 1; signal: none; 2026-10-23T18:25:45.932Z → 2026-10-23T18:25:45.963Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-27
```
Exit: 1; signal: none; 2026-10-23T18:25:45.963Z → 2026-10-23T18:25:45.986Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-28
```
Exit: 1; signal: none; 2026-10-23T18:25:45.986Z → 2026-10-23T18:25:46.006Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-29
```
Exit: 1; signal: none; 2026-10-23T18:25:46.006Z → 2026-10-23T18:25:46.033Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-30
```
Exit: 1; signal: none; 2026-10-23T18:25:46.033Z → 2026-10-23T18:25:46.054Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-31
```
Exit: 1; signal: none; 2026-10-23T18:25:46.054Z → 2026-10-23T18:25:46.081Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-32
```
Exit: 1; signal: none; 2026-10-23T18:25:46.081Z → 2026-10-23T18:25:46.105Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-33
```
Exit: 1; signal: none; 2026-10-23T18:25:46.105Z → 2026-10-23T18:25:46.128Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-34
```
Exit: 1; signal: none; 2026-10-23T18:25:46.128Z → 2026-10-23T18:25:46.149Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-35
```
Exit: 1; signal: none; 2026-10-23T18:25:46.149Z → 2026-10-23T18:25:46.178Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-36
```
Exit: 1; signal: none; 2026-10-23T18:25:46.178Z → 2026-10-23T18:25:46.203Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-37
```
Exit: 1; signal: none; 2026-10-23T18:25:46.203Z → 2026-10-23T18:25:46.226Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-38
```
Exit: 1; signal: none; 2026-10-23T18:25:46.226Z → 2026-10-23T18:25:46.250Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-39
```
Exit: 1; signal: none; 2026-10-23T18:25:46.250Z → 2026-10-23T18:25:46.273Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-40
```
Exit: 1; signal: none; 2026-10-23T18:25:46.273Z → 2026-10-23T18:25:46.295Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-41
```
Exit: 1; signal: none; 2026-10-23T18:25:46.295Z → 2026-10-23T18:25:46.316Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-42
```
Exit: 1; signal: none; 2026-10-23T18:25:46.316Z → 2026-10-23T18:25:46.336Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-43
```
Exit: 1; signal: none; 2026-10-23T18:25:46.336Z → 2026-10-23T18:25:46.358Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-44
```
Exit: 1; signal: none; 2026-10-23T18:25:46.358Z → 2026-10-23T18:25:46.381Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-45
```
Exit: 1; signal: none; 2026-10-23T18:25:46.381Z → 2026-10-23T18:25:46.403Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-46
```
Exit: 1; signal: none; 2026-10-23T18:25:46.403Z → 2026-10-23T18:25:46.431Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-47
```
Exit: 1; signal: none; 2026-10-23T18:25:46.431Z → 2026-10-23T18:25:46.453Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-48
```
Exit: 1; signal: none; 2026-10-23T18:25:46.453Z → 2026-10-23T18:25:46.471Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-49
```
Exit: 1; signal: none; 2026-10-23T18:25:46.471Z → 2026-10-23T18:25:46.493Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-50
```
Exit: 1; signal: none; 2026-10-23T18:25:46.493Z → 2026-10-23T18:25:46.514Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-application
```
Exit: 1; signal: none; 2026-10-23T18:25:46.514Z → 2026-10-23T18:25:46.534Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-job-52
```
Exit: 1; signal: none; 2026-10-23T18:25:46.534Z → 2026-10-23T18:25:46.555Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792779072663-9598c82a-net
```
Exit: 0; signal: none; 2026-10-23T18:25:46.555Z → 2026-10-23T18:25:46.568Z

```sh
docker network rm sam-verify-1792779072663-9598c82a-net
```
Exit: 0; signal: none; 2026-10-23T18:25:46.568Z → 2026-10-23T18:25:46.690Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
