# Independent SAM verification

Status: **PASS**
Source: `bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0` (clean: true)
Started: 2026-10-24T00:26:40.825Z; completed: 2026-10-24T00:48:28.142Z

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
- clean-application: `sam-verification:sam-verify-1792801600825-ca7ce30a`; ID `sha256:44e4db35b3137d41a44aa9e411179e6b6377af7614ee7ed823daddc8f3a1bc04`

## Commands and suite outcomes

### preflight — PASS

2026-10-24T00:26:40.826Z → 2026-10-24T00:26:41.086Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-24T00:26:40.829Z → 2026-10-24T00:26:40.834Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-24T00:26:40.834Z → 2026-10-24T00:26:40.837Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-24T00:26:40.837Z → 2026-10-24T00:26:40.843Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-24T00:26:40.843Z → 2026-10-24T00:26:40.857Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-24T00:26:40.857Z → 2026-10-24T00:26:40.882Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-24T00:26:40.882Z → 2026-10-24T00:26:40.949Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-24T00:26:40.949Z → 2026-10-24T00:26:41.021Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-24T00:26:41.021Z → 2026-10-24T00:26:41.072Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-24T00:26:41.072Z → 2026-10-24T00:26:41.075Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-24T00:26:41.075Z → 2026-10-24T00:26:41.084Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-24T00:26:41.084Z → 2026-10-24T00:26:41.086Z


### snapshot — PASS

2026-10-24T00:26:41.087Z → 2026-10-24T00:26:41.207Z

```sh
git archive --format=tar --output /tmp/sam-verify-4E5XCk/source.tar bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0
```
Exit: 0; signal: none; 2026-10-24T00:26:41.088Z → 2026-10-24T00:26:41.147Z

```sh
tar -xf /tmp/sam-verify-4E5XCk/source.tar -C /tmp/sam-verify-4E5XCk/source
```
Exit: 0; signal: none; 2026-10-24T00:26:41.147Z → 2026-10-24T00:26:41.162Z


### images — PASS

2026-10-24T00:26:41.208Z → 2026-10-24T00:26:41.337Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-24T00:26:41.209Z → 2026-10-24T00:26:41.226Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-24T00:26:41.226Z → 2026-10-24T00:26:41.241Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-24T00:26:41.241Z → 2026-10-24T00:26:41.257Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-24T00:26:41.257Z → 2026-10-24T00:26:41.278Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-24T00:26:41.278Z → 2026-10-24T00:26:41.294Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-24T00:26:41.294Z → 2026-10-24T00:26:41.309Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-24T00:26:41.309Z → 2026-10-24T00:26:41.323Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-24T00:26:41.323Z → 2026-10-24T00:26:41.337Z


### isolated-postgres — PASS

2026-10-24T00:26:41.338Z → 2026-10-24T00:26:44.074Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792801600825-ca7ce30a sam-verify-1792801600825-ca7ce30a-net
```
Exit: 0; signal: none; 2026-10-24T00:26:41.339Z → 2026-10-24T00:26:41.368Z

```sh
docker run --detach --name sam-verify-1792801600825-ca7ce30a-pg --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --network sam-verify-1792801600825-ca7ce30a-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-24T00:26:41.368Z → 2026-10-24T00:26:42.442Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792801600825-ca7ce30a-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-24T00:26:42.442Z → 2026-10-24T00:26:42.541Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792801600825-ca7ce30a-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-24T00:26:43.042Z → 2026-10-24T00:26:43.146Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792801600825-ca7ce30a-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-24T00:26:43.647Z → 2026-10-24T00:26:43.743Z

```sh
docker exec sam-verify-1792801600825-ca7ce30a-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-24T00:26:43.743Z → 2026-10-24T00:26:43.853Z

```sh
docker exec sam-verify-1792801600825-ca7ce30a-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-24T00:26:43.853Z → 2026-10-24T00:26:43.969Z

```sh
docker exec sam-verify-1792801600825-ca7ce30a-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-24T00:26:43.969Z → 2026-10-24T00:26:44.074Z


### node-dependencies — PASS

2026-10-24T00:26:44.080Z → 2026-10-24T00:26:51.805Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-1 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-24T00:26:44.081Z → 2026-10-24T00:26:51.805Z


### python-dependencies — PASS

2026-10-24T00:26:51.806Z → 2026-10-24T00:26:55.385Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-2 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-4E5XCk/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-24T00:26:51.807Z → 2026-10-24T00:26:55.385Z


### runtime-versions — PASS

2026-10-24T00:26:55.386Z → 2026-10-24T00:27:24.046Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-3 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-24T00:26:55.387Z → 2026-10-24T00:27:02.889Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-4 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-24T00:27:02.889Z → 2026-10-24T00:27:12.987Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-5 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-24T00:27:12.987Z → 2026-10-24T00:27:23.329Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-6 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-24T00:27:23.329Z → 2026-10-24T00:27:23.969Z

```sh
docker exec sam-verify-1792801600825-ca7ce30a-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-24T00:27:23.969Z → 2026-10-24T00:27:24.046Z


### workflow-tool — PASS

2026-10-24T00:27:24.047Z → 2026-10-24T00:27:24.662Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-4E5XCk/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-24T00:27:24.048Z → 2026-10-24T00:27:24.621Z

```sh
tar -xzf /tmp/sam-verify-4E5XCk/actionlint.tar.gz -C /tmp/sam-verify-4E5XCk actionlint
```
Exit: 0; signal: none; 2026-10-24T00:27:24.624Z → 2026-10-24T00:27:24.659Z

```sh
/tmp/sam-verify-4E5XCk/actionlint --version
```
Exit: 0; signal: none; 2026-10-24T00:27:24.659Z → 2026-10-24T00:27:24.662Z


### workflow-validation — PASS

2026-10-24T00:27:24.663Z → 2026-10-24T00:27:24.667Z

```sh
/tmp/sam-verify-4E5XCk/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-24T00:27:24.665Z → 2026-10-24T00:27:24.667Z


### configuration-validation — PASS

2026-10-24T00:27:24.668Z → 2026-10-24T00:27:55.484Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-24T00:27:24.669Z → 2026-10-24T00:27:24.882Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-24T00:27:24.882Z → 2026-10-24T00:27:24.939Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-24T00:27:24.940Z → 2026-10-24T00:27:25.004Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-24T00:27:25.005Z → 2026-10-24T00:27:25.068Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-24T00:27:25.068Z → 2026-10-24T00:27:25.137Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-7 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-24T00:27:25.138Z → 2026-10-24T00:27:36.276Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-8 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-24T00:27:36.276Z → 2026-10-24T00:27:45.128Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-9 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-24T00:27:45.128Z → 2026-10-24T00:27:55.484Z


### typecheck — PASS

2026-10-24T00:27:55.485Z → 2026-10-24T00:28:10.636Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-10 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-24T00:27:55.487Z → 2026-10-24T00:28:10.636Z


### regression — PASS

2026-10-24T00:28:10.637Z → 2026-10-24T00:28:45.476Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-11 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-24T00:28:10.639Z → 2026-10-24T00:28:45.475Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-24T00:28:19.803Z → 2026-10-24T00:28:20.280Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-24T00:28:20.299Z → 2026-10-24T00:28:20.714Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-24T00:28:20.730Z → 2026-10-24T00:28:21.130Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-24T00:28:21.148Z → 2026-10-24T00:28:21.556Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-24T00:28:21.573Z → 2026-10-24T00:28:21.969Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-24T00:28:21.988Z → 2026-10-24T00:28:22.297Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-24T00:28:22.315Z → 2026-10-24T00:28:22.788Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-24T00:28:22.805Z → 2026-10-24T00:28:23.254Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-24T00:28:23.270Z → 2026-10-24T00:28:23.691Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-24T00:28:23.709Z → 2026-10-24T00:28:24.082Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-24T00:28:24.098Z → 2026-10-24T00:28:24.471Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-24T00:28:24.489Z → 2026-10-24T00:28:24.764Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-24T00:28:24.781Z → 2026-10-24T00:28:25.232Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-24T00:28:25.250Z → 2026-10-24T00:28:25.589Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-24T00:28:25.607Z → 2026-10-24T00:28:25.943Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-24T00:28:25.959Z → 2026-10-24T00:28:26.388Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-24T00:28:26.404Z → 2026-10-24T00:28:26.830Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-24T00:28:26.847Z → 2026-10-24T00:28:27.265Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-24T00:28:27.282Z → 2026-10-24T00:28:27.701Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-24T00:28:27.718Z → 2026-10-24T00:28:28.046Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-24T00:28:28.063Z → 2026-10-24T00:28:28.395Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-24T00:28:28.411Z → 2026-10-24T00:28:28.677Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-24T00:28:28.693Z → 2026-10-24T00:28:29.090Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-24T00:28:29.107Z → 2026-10-24T00:28:30.528Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-24T00:28:30.546Z → 2026-10-24T00:28:31.082Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-24T00:28:31.099Z → 2026-10-24T00:28:31.463Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-24T00:28:31.484Z → 2026-10-24T00:28:32.038Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-24T00:28:32.054Z → 2026-10-24T00:28:32.804Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-24T00:28:32.820Z → 2026-10-24T00:28:33.232Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-24T00:28:33.249Z → 2026-10-24T00:28:33.631Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-24T00:28:33.647Z → 2026-10-24T00:28:34.304Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-24T00:28:34.321Z → 2026-10-24T00:28:34.738Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-24T00:28:34.754Z → 2026-10-24T00:28:35.152Z
- tests/phase15/bol_read.ts: PASS; 2026-10-24T00:28:35.168Z → 2026-10-24T00:28:35.580Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-24T00:28:35.597Z → 2026-10-24T00:28:36.062Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-24T00:28:36.085Z → 2026-10-24T00:28:36.694Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-24T00:28:36.715Z → 2026-10-24T00:28:37.124Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-24T00:28:37.141Z → 2026-10-24T00:28:37.579Z
- tests/phase19/command_center.ts: PASS; 2026-10-24T00:28:37.595Z → 2026-10-24T00:28:38.023Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-24T00:28:38.042Z → 2026-10-24T00:28:38.448Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-24T00:28:38.465Z → 2026-10-24T00:28:39.399Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-24T00:28:39.417Z → 2026-10-24T00:28:39.735Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-24T00:28:39.752Z → 2026-10-24T00:28:40.956Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-24T00:28:40.974Z → 2026-10-24T00:28:41.410Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-24T00:28:41.430Z → 2026-10-24T00:28:41.941Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-24T00:28:41.960Z → 2026-10-24T00:28:42.378Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-24T00:28:42.399Z → 2026-10-24T00:28:43.208Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-24T00:28:43.224Z → 2026-10-24T00:28:43.890Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-24T00:28:43.919Z → 2026-10-24T00:28:44.648Z

### core-reliability — PASS

2026-10-24T00:28:45.478Z → 2026-10-24T00:37:14.890Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-12 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 --mount type=bind,source=/tmp/sam-ordinary-full-bc95f24/metadata,target=/evidence --env SAM_VERIFICATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-24T00:28:45.479Z → 2026-10-24T00:37:14.889Z

- tests/core/reliability.ts: PASS; 2026-10-24T00:28:54.034Z → 2026-10-24T00:28:59.130Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-24T00:28:59.151Z → 2026-10-24T00:28:59.694Z
- tests/core/reservationRace.ts: PASS; 2026-10-24T00:28:59.711Z → 2026-10-24T00:29:00.167Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-24T00:29:00.184Z → 2026-10-24T00:29:00.721Z
- tests/core/eventBacklog.ts: PASS; 2026-10-24T00:29:00.745Z → 2026-10-24T00:29:02.473Z
- tests/core/learningScheduling.ts: PASS; 2026-10-24T00:29:02.494Z → 2026-10-24T00:29:02.950Z
- tests/core/startupAdmission.ts: PASS; 2026-10-24T00:29:02.969Z → 2026-10-24T00:29:04.812Z
- tests/core/planningDeadline.ts: PASS; 2026-10-24T00:29:04.831Z → 2026-10-24T00:29:05.450Z
- tests/core/planningRepair.ts: PASS; 2026-10-24T00:29:05.468Z → 2026-10-24T00:29:06.933Z
- tests/core/reviewReliability.ts: PASS; 2026-10-24T00:29:06.949Z → 2026-10-24T00:29:10.990Z
- tests/core/evidenceTransforms.ts: PASS; 2026-10-24T00:29:11.011Z → 2026-10-24T00:29:11.612Z
- tests/core/evidenceIntegration.ts: PASS; 2026-10-24T00:29:11.630Z → 2026-10-24T00:29:24.863Z
- tests/core/sourceContracts.ts: PASS; 2026-10-24T00:29:24.891Z → 2026-10-24T00:29:25.591Z
- tests/core/evidenceChaining.ts: PASS; 2026-10-24T00:29:25.611Z → 2026-10-24T00:29:26.090Z
- tests/core/ordinaryAllowance.ts: PASS; 2026-10-24T00:29:26.107Z → 2026-10-24T00:29:26.593Z
- tests/core/ordinaryPath.ts: PASS; 2026-10-24T00:29:26.610Z → 2026-10-24T00:30:59.707Z
- tests/core/ordinaryZeroTools.ts: PASS; 2026-10-24T00:30:59.739Z → 2026-10-24T00:31:08.108Z
- tests/core/ordinaryMissingRegistration.ts: PASS; 2026-10-24T00:31:08.144Z → 2026-10-24T00:31:09.879Z
- tests/core/ordinaryCancellation.ts: PASS; 2026-10-24T00:31:09.912Z → 2026-10-24T00:31:12.575Z
- tests/core/ordinaryRestart.ts: PASS; 2026-10-24T00:31:12.608Z → 2026-10-24T00:32:29.701Z
- tests/core/ordinaryUnknownSemantics.ts: PASS; 2026-10-24T00:32:29.737Z → 2026-10-24T00:33:37.122Z
- tests/core/ordinaryRevocation.ts: PASS; 2026-10-24T00:33:37.159Z → 2026-10-24T00:34:11.272Z
- tests/core/ordinaryLifecycleAtomic.ts: PASS; 2026-10-24T00:34:11.304Z → 2026-10-24T00:34:11.766Z
- tests/core/ordinaryPlannerFailure.ts: PASS; 2026-10-24T00:34:11.786Z → 2026-10-24T00:34:17.978Z
- tests/core/ordinarySourceFailure.ts: PASS; 2026-10-24T00:34:18.011Z → 2026-10-24T00:34:20.927Z
- tests/core/ordinaryReviewWake.ts: PASS; 2026-10-24T00:34:20.960Z → 2026-10-24T00:35:29.250Z
- tests/core/ordinaryReviewExpiry.ts: PASS; 2026-10-24T00:35:29.287Z → 2026-10-24T00:36:31.371Z
- tests/core/ordinaryReviewCancel.ts: PASS; 2026-10-24T00:36:31.404Z → 2026-10-24T00:37:08.654Z
- tests/core/ordinaryLocalToolLimit.ts: PASS; 2026-10-24T00:37:08.697Z → 2026-10-24T00:37:10.444Z
- tests/core/ordinaryLocalReadTime.ts: PASS; 2026-10-24T00:37:10.475Z → 2026-10-24T00:37:12.188Z
- tests/core/ordinaryLocalElapsed.ts: PASS; 2026-10-24T00:37:12.220Z → 2026-10-24T00:37:14.006Z

### provider-auth — PASS

2026-10-24T00:37:14.896Z → 2026-10-24T00:37:25.114Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-13 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-24T00:37:14.901Z → 2026-10-24T00:37:25.113Z

- tests/release/provider_auth.ts: PASS; 2026-10-24T00:37:23.968Z → 2026-10-24T00:37:24.377Z

### postgres-tls — PASS

2026-10-24T00:37:25.118Z → 2026-10-24T00:37:36.358Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-14 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-24T00:37:25.122Z → 2026-10-24T00:37:36.358Z

- tests/release/postgres_tls.ts: PASS; 2026-10-24T00:37:34.495Z → 2026-10-24T00:37:35.586Z

### contracts — PASS

2026-10-24T00:37:36.363Z → 2026-10-24T00:37:45.987Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-15 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-24T00:37:36.367Z → 2026-10-24T00:37:45.986Z

- tests/release/contracts.ts: PASS; 2026-10-24T00:37:44.542Z → 2026-10-24T00:37:45.199Z

### synthetic-pilot — PASS

2026-10-24T00:37:45.991Z → 2026-10-24T00:37:57.335Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-16 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-24T00:37:45.996Z → 2026-10-24T00:37:57.335Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-24T00:37:55.915Z → 2026-10-24T00:37:56.619Z

### managed-schema — PASS

2026-10-24T00:37:57.341Z → 2026-10-24T00:38:06.509Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-17 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-24T00:37:57.345Z → 2026-10-24T00:38:06.509Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-24T00:38:05.499Z → 2026-10-24T00:38:05.739Z

### local-bundle — PASS

2026-10-24T00:38:06.514Z → 2026-10-24T00:38:15.984Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-18 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-24T00:38:06.518Z → 2026-10-24T00:38:15.983Z

- tests/release/local_bundle.ts: PASS; 2026-10-24T00:38:14.834Z → 2026-10-24T00:38:15.194Z

### closed-setup — PASS

2026-10-24T00:38:15.990Z → 2026-10-24T00:38:27.252Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-19 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-24T00:38:15.993Z → 2026-10-24T00:38:27.252Z

- tests/release/setup.ts: PASS; 2026-10-24T00:38:25.909Z → 2026-10-24T00:38:26.475Z

### database-contract — PASS

2026-10-24T00:38:27.257Z → 2026-10-24T00:38:36.545Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-20 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-24T00:38:27.261Z → 2026-10-24T00:38:36.545Z

- tests/release/database_check.ts: PASS; 2026-10-24T00:38:35.443Z → 2026-10-24T00:38:35.787Z

### prelaunch-gate — PASS

2026-10-24T00:38:36.551Z → 2026-10-24T00:38:46.055Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-21 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-24T00:38:36.556Z → 2026-10-24T00:38:46.055Z

- tests/release/prelaunch.ts: PASS; 2026-10-24T00:38:45.059Z → 2026-10-24T00:38:45.345Z

### service-provisioning — PASS

2026-10-24T00:38:46.060Z → 2026-10-24T00:38:59.794Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-22 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-24T00:38:46.064Z → 2026-10-24T00:38:59.794Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-24T00:38:55.492Z → 2026-10-24T00:38:59.011Z

### operator-provisioning — PASS

2026-10-24T00:38:59.803Z → 2026-10-24T00:39:12.755Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-23 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-24T00:38:59.807Z → 2026-10-24T00:39:12.755Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-24T00:39:08.839Z → 2026-10-24T00:39:11.954Z

### provisioning-backup-recovery — PASS

2026-10-24T00:39:12.760Z → 2026-10-24T00:39:16.110Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792801600825-ca7ce30a-pg sam-verify-1792801600825-ca7ce30a
```
Exit: 0; signal: none; 2026-10-24T00:39:12.769Z → 2026-10-24T00:39:16.110Z


### render-migration-compatibility — PASS

2026-10-24T00:39:16.116Z → 2026-10-24T00:39:27.960Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-24 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-24T00:39:16.120Z → 2026-10-24T00:39:27.960Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-24T00:39:25.988Z → 2026-10-24T00:39:27.192Z

### render-google-oauth-contracts — PASS

2026-10-24T00:39:27.965Z → 2026-10-24T00:39:47.522Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-25 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/isolated/compact_schema.ts tests/isolated/normalized_connectors.ts tests/isolated/launch_journal_race.ts tests/isolated/render_transport.ts tests/isolated/goal_obligations.ts tests/isolated/collection_receipts.ts tests/isolated/shared_goal_contract.ts tests/isolated/delegation_scope.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-24T00:39:27.968Z → 2026-10-24T00:39:47.522Z


### integration-migrations — PASS

2026-10-24T00:39:47.528Z → 2026-10-24T00:39:58.220Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-26 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-24T00:39:47.532Z → 2026-10-24T00:39:58.220Z

- tests/integration/migrations.ts: PASS; 2026-10-24T00:39:56.390Z → 2026-10-24T00:39:57.407Z

### integration-oauth-mcp — PASS

2026-10-24T00:39:58.225Z → 2026-10-24T00:40:07.914Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-27 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-24T00:39:58.230Z → 2026-10-24T00:40:07.913Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-24T00:40:06.596Z → 2026-10-24T00:40:07.079Z

### integration-orchestration — PASS

2026-10-24T00:40:07.919Z → 2026-10-24T00:40:25.398Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-28 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-24T00:40:07.923Z → 2026-10-24T00:40:25.397Z

- tests/integration/orchestration.ts: PASS; 2026-10-24T00:40:17.862Z → 2026-10-24T00:40:24.627Z

### specialist-reasoning — PASS

2026-10-24T00:40:25.406Z → 2026-10-24T00:41:29.662Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-29 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-24T00:40:25.411Z → 2026-10-24T00:41:29.662Z

- tests/specialists/acceptance.ts: PASS; 2026-10-24T00:40:33.443Z → 2026-10-24T00:41:28.866Z

### specialist-gateway — PASS

2026-10-24T00:41:29.668Z → 2026-10-24T00:41:39.590Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-30 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-24T00:41:29.672Z → 2026-10-24T00:41:39.590Z

- tests/specialists/gateway.ts: PASS; 2026-10-24T00:41:38.333Z → 2026-10-24T00:41:38.829Z

### specialist-provenance — PASS

2026-10-24T00:41:39.596Z → 2026-10-24T00:41:49.875Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-31 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-24T00:41:39.600Z → 2026-10-24T00:41:49.874Z

- tests/specialists/provenance.ts: PASS; 2026-10-24T00:41:48.730Z → 2026-10-24T00:41:49.115Z

### specialist-learning-fairness — PASS

2026-10-24T00:41:49.880Z → 2026-10-24T00:42:01.184Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-32 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-24T00:41:49.885Z → 2026-10-24T00:42:01.184Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-24T00:41:59.362Z → 2026-10-24T00:42:00.375Z

### specialist-evaluation — PASS

2026-10-24T00:42:01.189Z → 2026-10-24T00:42:12.593Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-33 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-24T00:42:01.194Z → 2026-10-24T00:42:12.593Z


### evaluation-budget — PASS

2026-10-24T00:42:12.597Z → 2026-10-24T00:43:18.388Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-34 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 --mount type=bind,source=/tmp/sam-ordinary-full-bc95f24/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-24T00:42:12.602Z → 2026-10-24T00:43:18.388Z

- tests/evaluation/budgets.ts: PASS; 2026-10-24T00:42:20.991Z → 2026-10-24T00:43:17.532Z

### evaluation-adapter — PASS

2026-10-24T00:43:18.395Z → 2026-10-24T00:43:28.222Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-35 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-24T00:43:18.401Z → 2026-10-24T00:43:28.221Z

- tests/evaluation/adapters.ts: PASS; 2026-10-24T00:43:26.503Z → 2026-10-24T00:43:27.467Z

### evaluation-orchestration — PASS

2026-10-24T00:43:28.227Z → 2026-10-24T00:44:15.131Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-36 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 --mount type=bind,source=/tmp/sam-ordinary-full-bc95f24/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-24T00:43:28.231Z → 2026-10-24T00:43:57.506Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-37 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 --mount type=bind,source=/tmp/sam-ordinary-full-bc95f24/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/operatorLaunch.ts
```
Exit: 0; signal: none; 2026-10-24T00:43:57.506Z → 2026-10-24T00:44:15.131Z

- tests/evaluation/operatorLaunch.ts: PASS; 2026-10-24T00:44:06.239Z → 2026-10-24T00:44:14.364Z

### evaluation-independent-review — PASS

2026-10-24T00:44:15.146Z → 2026-10-24T00:44:26.508Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-38 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-24T00:44:15.152Z → 2026-10-24T00:44:26.508Z

- tests/evaluation/review.ts: PASS; 2026-10-24T00:44:24.967Z → 2026-10-24T00:44:25.759Z

### evaluation-commercial-market — PASS

2026-10-24T00:44:26.514Z → 2026-10-24T00:44:59.205Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-39 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 --mount type=bind,source=/tmp/sam-ordinary-full-bc95f24/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-24T00:44:26.519Z → 2026-10-24T00:44:59.204Z

- tests/evaluation/market.ts: PASS; 2026-10-24T00:44:35.273Z → 2026-10-24T00:44:58.380Z

### evaluation-commercial-profitability — PASS

2026-10-24T00:44:59.213Z → 2026-10-24T00:45:30.541Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-40 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 --mount type=bind,source=/tmp/sam-ordinary-full-bc95f24/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-24T00:44:59.219Z → 2026-10-24T00:45:30.541Z

- tests/evaluation/profitability.ts: PASS; 2026-10-24T00:45:08.305Z → 2026-10-24T00:45:29.752Z

### evaluation-commercial-suppliers — PASS

2026-10-24T00:45:30.551Z → 2026-10-24T00:46:01.526Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-41 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 --mount type=bind,source=/tmp/sam-ordinary-full-bc95f24/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-24T00:45:30.559Z → 2026-10-24T00:46:01.526Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-24T00:45:39.038Z → 2026-10-24T00:46:00.731Z

### migration-upgrade-rollback — PASS

2026-10-24T00:46:01.535Z → 2026-10-24T00:46:11.082Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-42 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-24T00:46:01.541Z → 2026-10-24T00:46:11.082Z


### specialist-restart-prepare — PASS

2026-10-24T00:46:11.090Z → 2026-10-24T00:46:21.825Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-43 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-24T00:46:11.097Z → 2026-10-24T00:46:21.824Z


### evaluation-restart-prepare — PASS

2026-10-24T00:46:21.834Z → 2026-10-24T00:46:32.127Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-44 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-24T00:46:21.842Z → 2026-10-24T00:46:32.127Z


### postgres-restart — PASS

2026-10-24T00:46:32.137Z → 2026-10-24T00:46:32.486Z

```sh
docker restart --time 10 sam-verify-1792801600825-ca7ce30a-pg
```
Exit: 0; signal: none; 2026-10-24T00:46:32.146Z → 2026-10-24T00:46:32.396Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792801600825-ca7ce30a-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-24T00:46:32.396Z → 2026-10-24T00:46:32.486Z


### migration-after-restart — PASS

2026-10-24T00:46:32.495Z → 2026-10-24T00:46:42.798Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-45 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-24T00:46:32.502Z → 2026-10-24T00:46:42.798Z


### specialist-restart-check — PASS

2026-10-24T00:46:42.808Z → 2026-10-24T00:46:52.804Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-46 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-24T00:46:42.815Z → 2026-10-24T00:46:52.804Z


### evaluation-restart-check — PASS

2026-10-24T00:46:52.818Z → 2026-10-24T00:47:03.355Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-47 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-24T00:46:52.825Z → 2026-10-24T00:47:03.355Z


### phase0-migrations — PASS

2026-10-24T00:47:03.365Z → 2026-10-24T00:47:04.051Z

```sh
docker cp /tmp/sam-verify-4E5XCk/source/packages/db/migrations sam-verify-1792801600825-ca7ce30a-pg:/migrations
```
Exit: 0; signal: none; 2026-10-24T00:47:03.373Z → 2026-10-24T00:47:03.388Z

```sh
docker exec sam-verify-1792801600825-ca7ce30a-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-24T00:47:03.388Z → 2026-10-24T00:47:03.966Z

```sh
docker exec sam-verify-1792801600825-ca7ce30a-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-24T00:47:03.966Z → 2026-10-24T00:47:04.050Z


### phase0-acceptance — PASS

2026-10-24T00:47:04.059Z → 2026-10-24T00:47:06.422Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-48 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-4E5XCk/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-24T00:47:04.067Z → 2026-10-24T00:47:06.422Z


### phase0-postgres — PASS

2026-10-24T00:47:06.438Z → 2026-10-24T00:47:07.962Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-49 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-4E5XCk/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-24T00:47:06.448Z → 2026-10-24T00:47:07.962Z


### tenant-isolation — PASS

2026-10-24T00:47:07.972Z → 2026-10-24T00:47:10.187Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-50 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-4E5XCk/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-24T00:47:07.979Z → 2026-10-24T00:47:10.187Z


### fail-closed-security — PASS

2026-10-24T00:47:10.203Z → 2026-10-24T00:47:11.419Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-51 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-4E5XCk/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-24T00:47:10.209Z → 2026-10-24T00:47:11.418Z


### clean-image — PASS

2026-10-24T00:47:11.428Z → 2026-10-24T00:47:18.041Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792801600825-ca7ce30a Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-24T00:47:11.434Z → 2026-10-24T00:47:18.041Z


### image-contract — PASS

2026-10-24T00:47:18.050Z → 2026-10-24T00:47:18.072Z

```sh
docker image inspect sam-verification:sam-verify-1792801600825-ca7ce30a
```
Exit: 0; signal: none; 2026-10-24T00:47:18.058Z → 2026-10-24T00:47:18.072Z


### application-startup-restart — PASS

2026-10-24T00:47:18.081Z → 2026-10-24T00:47:23.499Z

```sh
docker run --rm --init --name sam-verify-1792801600825-ca7ce30a-application --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792801600825-ca7ce30a node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-24T00:47:18.088Z → 2026-10-24T00:47:23.499Z


### source-integrity — PASS

2026-10-24T00:47:23.509Z → 2026-10-24T00:47:23.550Z


### shared-goal-path — PASS

2026-10-24T00:47:23.558Z → 2026-10-24T00:48:26.573Z

```sh
docker run --rm --name sam-verify-1792801600825-ca7ce30a-job-53 --label sam.verification.run=sam-verify-1792801600825-ca7ce30a --init --network container:sam-verify-1792801600825-ca7ce30a-pg --mount type=bind,src=/tmp/sam-verify-4E5XCk/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=bc95f24ca11ac104c575ab1aae3c6cf2b3f5ebc0 --mount type=bind,source=/tmp/sam-ordinary-full-bc95f24/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/sharedPath.ts
```
Exit: 0; signal: none; 2026-10-24T00:47:23.567Z → 2026-10-24T00:48:26.572Z

- tests/evaluation/sharedPath.ts: PASS; 2026-10-24T00:47:29.926Z → 2026-10-24T00:48:25.786Z

### cleanup — PASS

2026-10-24T00:48:26.584Z → 2026-10-24T00:48:28.130Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-pg
```
Exit: 0; signal: none; 2026-10-24T00:48:26.593Z → 2026-10-24T00:48:26.606Z

```sh
docker rm --force --volumes sam-verify-1792801600825-ca7ce30a-pg
```
Exit: 0; signal: none; 2026-10-24T00:48:26.606Z → 2026-10-24T00:48:27.020Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-1
```
Exit: 1; signal: none; 2026-10-24T00:48:27.020Z → 2026-10-24T00:48:27.040Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-2
```
Exit: 1; signal: none; 2026-10-24T00:48:27.041Z → 2026-10-24T00:48:27.060Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-3
```
Exit: 1; signal: none; 2026-10-24T00:48:27.060Z → 2026-10-24T00:48:27.079Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-4
```
Exit: 1; signal: none; 2026-10-24T00:48:27.079Z → 2026-10-24T00:48:27.100Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-5
```
Exit: 1; signal: none; 2026-10-24T00:48:27.100Z → 2026-10-24T00:48:27.121Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-6
```
Exit: 1; signal: none; 2026-10-24T00:48:27.121Z → 2026-10-24T00:48:27.140Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-7
```
Exit: 1; signal: none; 2026-10-24T00:48:27.140Z → 2026-10-24T00:48:27.158Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-8
```
Exit: 1; signal: none; 2026-10-24T00:48:27.158Z → 2026-10-24T00:48:27.179Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-9
```
Exit: 1; signal: none; 2026-10-24T00:48:27.179Z → 2026-10-24T00:48:27.198Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-10
```
Exit: 1; signal: none; 2026-10-24T00:48:27.198Z → 2026-10-24T00:48:27.217Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-11
```
Exit: 1; signal: none; 2026-10-24T00:48:27.217Z → 2026-10-24T00:48:27.237Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-12
```
Exit: 1; signal: none; 2026-10-24T00:48:27.237Z → 2026-10-24T00:48:27.259Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-13
```
Exit: 1; signal: none; 2026-10-24T00:48:27.259Z → 2026-10-24T00:48:27.280Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-14
```
Exit: 1; signal: none; 2026-10-24T00:48:27.281Z → 2026-10-24T00:48:27.299Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-15
```
Exit: 1; signal: none; 2026-10-24T00:48:27.299Z → 2026-10-24T00:48:27.317Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-16
```
Exit: 1; signal: none; 2026-10-24T00:48:27.317Z → 2026-10-24T00:48:27.335Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-17
```
Exit: 1; signal: none; 2026-10-24T00:48:27.335Z → 2026-10-24T00:48:27.355Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-18
```
Exit: 1; signal: none; 2026-10-24T00:48:27.355Z → 2026-10-24T00:48:27.374Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-19
```
Exit: 1; signal: none; 2026-10-24T00:48:27.374Z → 2026-10-24T00:48:27.393Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-20
```
Exit: 1; signal: none; 2026-10-24T00:48:27.393Z → 2026-10-24T00:48:27.415Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-21
```
Exit: 1; signal: none; 2026-10-24T00:48:27.415Z → 2026-10-24T00:48:27.434Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-22
```
Exit: 1; signal: none; 2026-10-24T00:48:27.434Z → 2026-10-24T00:48:27.455Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-23
```
Exit: 1; signal: none; 2026-10-24T00:48:27.455Z → 2026-10-24T00:48:27.475Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-24
```
Exit: 1; signal: none; 2026-10-24T00:48:27.475Z → 2026-10-24T00:48:27.494Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-25
```
Exit: 1; signal: none; 2026-10-24T00:48:27.494Z → 2026-10-24T00:48:27.515Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-26
```
Exit: 1; signal: none; 2026-10-24T00:48:27.516Z → 2026-10-24T00:48:27.534Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-27
```
Exit: 1; signal: none; 2026-10-24T00:48:27.534Z → 2026-10-24T00:48:27.553Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-28
```
Exit: 1; signal: none; 2026-10-24T00:48:27.553Z → 2026-10-24T00:48:27.573Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-29
```
Exit: 1; signal: none; 2026-10-24T00:48:27.573Z → 2026-10-24T00:48:27.593Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-30
```
Exit: 1; signal: none; 2026-10-24T00:48:27.593Z → 2026-10-24T00:48:27.611Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-31
```
Exit: 1; signal: none; 2026-10-24T00:48:27.611Z → 2026-10-24T00:48:27.631Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-32
```
Exit: 1; signal: none; 2026-10-24T00:48:27.631Z → 2026-10-24T00:48:27.651Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-33
```
Exit: 1; signal: none; 2026-10-24T00:48:27.651Z → 2026-10-24T00:48:27.671Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-34
```
Exit: 1; signal: none; 2026-10-24T00:48:27.671Z → 2026-10-24T00:48:27.690Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-35
```
Exit: 1; signal: none; 2026-10-24T00:48:27.690Z → 2026-10-24T00:48:27.710Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-36
```
Exit: 1; signal: none; 2026-10-24T00:48:27.710Z → 2026-10-24T00:48:27.730Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-37
```
Exit: 1; signal: none; 2026-10-24T00:48:27.730Z → 2026-10-24T00:48:27.752Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-38
```
Exit: 1; signal: none; 2026-10-24T00:48:27.752Z → 2026-10-24T00:48:27.771Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-39
```
Exit: 1; signal: none; 2026-10-24T00:48:27.771Z → 2026-10-24T00:48:27.790Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-40
```
Exit: 1; signal: none; 2026-10-24T00:48:27.790Z → 2026-10-24T00:48:27.808Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-41
```
Exit: 1; signal: none; 2026-10-24T00:48:27.808Z → 2026-10-24T00:48:27.827Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-42
```
Exit: 1; signal: none; 2026-10-24T00:48:27.827Z → 2026-10-24T00:48:27.845Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-43
```
Exit: 1; signal: none; 2026-10-24T00:48:27.845Z → 2026-10-24T00:48:27.864Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-44
```
Exit: 1; signal: none; 2026-10-24T00:48:27.864Z → 2026-10-24T00:48:27.883Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-45
```
Exit: 1; signal: none; 2026-10-24T00:48:27.883Z → 2026-10-24T00:48:27.902Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-46
```
Exit: 1; signal: none; 2026-10-24T00:48:27.902Z → 2026-10-24T00:48:27.921Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-47
```
Exit: 1; signal: none; 2026-10-24T00:48:27.921Z → 2026-10-24T00:48:27.941Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-48
```
Exit: 1; signal: none; 2026-10-24T00:48:27.941Z → 2026-10-24T00:48:27.958Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-49
```
Exit: 1; signal: none; 2026-10-24T00:48:27.958Z → 2026-10-24T00:48:27.977Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-50
```
Exit: 1; signal: none; 2026-10-24T00:48:27.977Z → 2026-10-24T00:48:27.995Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-51
```
Exit: 1; signal: none; 2026-10-24T00:48:27.995Z → 2026-10-24T00:48:28.013Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-application
```
Exit: 1; signal: none; 2026-10-24T00:48:28.013Z → 2026-10-24T00:48:28.033Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-job-53
```
Exit: 1; signal: none; 2026-10-24T00:48:28.033Z → 2026-10-24T00:48:28.052Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792801600825-ca7ce30a-net
```
Exit: 0; signal: none; 2026-10-24T00:48:28.052Z → 2026-10-24T00:48:28.064Z

```sh
docker network rm sam-verify-1792801600825-ca7ce30a-net
```
Exit: 0; signal: none; 2026-10-24T00:48:28.064Z → 2026-10-24T00:48:28.104Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
