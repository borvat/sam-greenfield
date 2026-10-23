# Independent SAM verification

Status: **PASS**
Source: `5bfe7b8342756623f77f4c3d158a12b7435d32d1` (clean: true)
Started: 2026-10-23T16:42:24.208Z; completed: 2026-10-23T16:56:13.165Z

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
- clean-application: `sam-verification:sam-verify-1792773744208-e54260da`; ID `sha256:5df30955eef3b4be55fd34d89dd49ecb1c802860abc6bb7e433d9838eebc91d9`

## Commands and suite outcomes

### preflight — PASS

2026-10-23T16:42:24.209Z → 2026-10-23T16:42:24.479Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T16:42:24.216Z → 2026-10-23T16:42:24.221Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T16:42:24.221Z → 2026-10-23T16:42:24.223Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T16:42:24.223Z → 2026-10-23T16:42:24.228Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T16:42:24.228Z → 2026-10-23T16:42:24.243Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T16:42:24.243Z → 2026-10-23T16:42:24.264Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T16:42:24.264Z → 2026-10-23T16:42:24.326Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T16:42:24.326Z → 2026-10-23T16:42:24.409Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T16:42:24.409Z → 2026-10-23T16:42:24.465Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T16:42:24.465Z → 2026-10-23T16:42:24.468Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T16:42:24.468Z → 2026-10-23T16:42:24.477Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T16:42:24.477Z → 2026-10-23T16:42:24.479Z


### snapshot — PASS

2026-10-23T16:42:24.480Z → 2026-10-23T16:42:24.553Z

```sh
git archive --format=tar --output /tmp/sam-verify-XIfpiJ/source.tar 5bfe7b8342756623f77f4c3d158a12b7435d32d1
```
Exit: 0; signal: none; 2026-10-23T16:42:24.481Z → 2026-10-23T16:42:24.513Z

```sh
tar -xf /tmp/sam-verify-XIfpiJ/source.tar -C /tmp/sam-verify-XIfpiJ/source
```
Exit: 0; signal: none; 2026-10-23T16:42:24.513Z → 2026-10-23T16:42:24.522Z


### images — PASS

2026-10-23T16:42:24.554Z → 2026-10-23T16:42:24.670Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T16:42:24.555Z → 2026-10-23T16:42:24.568Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T16:42:24.568Z → 2026-10-23T16:42:24.583Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T16:42:24.583Z → 2026-10-23T16:42:24.599Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T16:42:24.599Z → 2026-10-23T16:42:24.614Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T16:42:24.614Z → 2026-10-23T16:42:24.629Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T16:42:24.629Z → 2026-10-23T16:42:24.644Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T16:42:24.644Z → 2026-10-23T16:42:24.656Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T16:42:24.656Z → 2026-10-23T16:42:24.669Z


### isolated-postgres — PASS

2026-10-23T16:42:24.671Z → 2026-10-23T16:42:29.416Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792773744208-e54260da sam-verify-1792773744208-e54260da-net
```
Exit: 0; signal: none; 2026-10-23T16:42:24.672Z → 2026-10-23T16:42:24.701Z

```sh
docker run --detach --name sam-verify-1792773744208-e54260da-pg --label sam.verification.run=sam-verify-1792773744208-e54260da --network sam-verify-1792773744208-e54260da-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T16:42:24.702Z → 2026-10-23T16:42:27.640Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792773744208-e54260da-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T16:42:27.640Z → 2026-10-23T16:42:27.736Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792773744208-e54260da-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T16:42:28.237Z → 2026-10-23T16:42:28.337Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792773744208-e54260da-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T16:42:28.838Z → 2026-10-23T16:42:28.928Z

```sh
docker exec sam-verify-1792773744208-e54260da-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T16:42:28.928Z → 2026-10-23T16:42:29.066Z

```sh
docker exec sam-verify-1792773744208-e54260da-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T16:42:29.066Z → 2026-10-23T16:42:29.241Z

```sh
docker exec sam-verify-1792773744208-e54260da-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T16:42:29.241Z → 2026-10-23T16:42:29.416Z


### node-dependencies — PASS

2026-10-23T16:42:29.421Z → 2026-10-23T16:42:41.291Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-1 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T16:42:29.422Z → 2026-10-23T16:42:41.290Z


### python-dependencies — PASS

2026-10-23T16:42:41.292Z → 2026-10-23T16:42:44.880Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-2 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-XIfpiJ/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T16:42:41.293Z → 2026-10-23T16:42:44.880Z


### runtime-versions — PASS

2026-10-23T16:42:44.881Z → 2026-10-23T16:43:16.721Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-3 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T16:42:44.882Z → 2026-10-23T16:42:53.856Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-4 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T16:42:53.856Z → 2026-10-23T16:43:04.571Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-5 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T16:43:04.571Z → 2026-10-23T16:43:15.149Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-6 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T16:43:15.149Z → 2026-10-23T16:43:16.621Z

```sh
docker exec sam-verify-1792773744208-e54260da-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T16:43:16.621Z → 2026-10-23T16:43:16.721Z


### workflow-tool — PASS

2026-10-23T16:43:16.723Z → 2026-10-23T16:43:17.340Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-XIfpiJ/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T16:43:16.724Z → 2026-10-23T16:43:17.286Z

```sh
tar -xzf /tmp/sam-verify-XIfpiJ/actionlint.tar.gz -C /tmp/sam-verify-XIfpiJ actionlint
```
Exit: 0; signal: none; 2026-10-23T16:43:17.289Z → 2026-10-23T16:43:17.335Z

```sh
/tmp/sam-verify-XIfpiJ/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T16:43:17.335Z → 2026-10-23T16:43:17.340Z


### workflow-validation — PASS

2026-10-23T16:43:17.341Z → 2026-10-23T16:43:17.349Z

```sh
/tmp/sam-verify-XIfpiJ/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T16:43:17.343Z → 2026-10-23T16:43:17.349Z


### configuration-validation — PASS

2026-10-23T16:43:17.350Z → 2026-10-23T16:43:55.027Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T16:43:17.351Z → 2026-10-23T16:43:17.698Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T16:43:17.698Z → 2026-10-23T16:43:17.822Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T16:43:17.822Z → 2026-10-23T16:43:17.952Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T16:43:17.952Z → 2026-10-23T16:43:18.039Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T16:43:18.039Z → 2026-10-23T16:43:18.113Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-7 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T16:43:18.113Z → 2026-10-23T16:43:30.792Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-8 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T16:43:30.792Z → 2026-10-23T16:43:43.560Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-9 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T16:43:43.560Z → 2026-10-23T16:43:55.027Z


### typecheck — PASS

2026-10-23T16:43:55.029Z → 2026-10-23T16:44:13.332Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-10 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T16:43:55.032Z → 2026-10-23T16:44:13.332Z


### regression — PASS

2026-10-23T16:44:13.333Z → 2026-10-23T16:44:52.512Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-11 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T16:44:13.334Z → 2026-10-23T16:44:52.511Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T16:44:23.123Z → 2026-10-23T16:44:23.632Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T16:44:23.651Z → 2026-10-23T16:44:24.122Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T16:44:24.140Z → 2026-10-23T16:44:24.561Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T16:44:24.582Z → 2026-10-23T16:44:25.051Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T16:44:25.068Z → 2026-10-23T16:44:25.476Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T16:44:25.495Z → 2026-10-23T16:44:25.869Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T16:44:25.888Z → 2026-10-23T16:44:26.472Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T16:44:26.491Z → 2026-10-23T16:44:27.000Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T16:44:27.018Z → 2026-10-23T16:44:27.509Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T16:44:27.528Z → 2026-10-23T16:44:27.930Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T16:44:27.947Z → 2026-10-23T16:44:28.382Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T16:44:28.399Z → 2026-10-23T16:44:28.717Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T16:44:28.734Z → 2026-10-23T16:44:29.236Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T16:44:29.253Z → 2026-10-23T16:44:29.656Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T16:44:29.674Z → 2026-10-23T16:44:30.040Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T16:44:30.058Z → 2026-10-23T16:44:30.508Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T16:44:30.525Z → 2026-10-23T16:44:31.014Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T16:44:31.037Z → 2026-10-23T16:44:31.574Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T16:44:31.594Z → 2026-10-23T16:44:32.063Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T16:44:32.084Z → 2026-10-23T16:44:32.486Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T16:44:32.504Z → 2026-10-23T16:44:32.887Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T16:44:32.910Z → 2026-10-23T16:44:33.199Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T16:44:33.217Z → 2026-10-23T16:44:33.673Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T16:44:33.692Z → 2026-10-23T16:44:35.124Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T16:44:35.145Z → 2026-10-23T16:44:35.722Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T16:44:35.742Z → 2026-10-23T16:44:36.185Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T16:44:36.207Z → 2026-10-23T16:44:36.816Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T16:44:36.834Z → 2026-10-23T16:44:37.723Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T16:44:37.741Z → 2026-10-23T16:44:38.203Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T16:44:38.221Z → 2026-10-23T16:44:38.665Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T16:44:38.682Z → 2026-10-23T16:44:39.404Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T16:44:39.424Z → 2026-10-23T16:44:39.891Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T16:44:39.910Z → 2026-10-23T16:44:40.332Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T16:44:40.351Z → 2026-10-23T16:44:40.790Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T16:44:40.809Z → 2026-10-23T16:44:41.262Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T16:44:41.280Z → 2026-10-23T16:44:41.880Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T16:44:41.898Z → 2026-10-23T16:44:42.393Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T16:44:42.411Z → 2026-10-23T16:44:42.951Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T16:44:42.978Z → 2026-10-23T16:44:43.530Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T16:44:43.552Z → 2026-10-23T16:44:44.023Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T16:44:44.042Z → 2026-10-23T16:44:45.148Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T16:44:45.166Z → 2026-10-23T16:44:45.508Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T16:44:45.525Z → 2026-10-23T16:44:46.959Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T16:44:46.977Z → 2026-10-23T16:44:47.508Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T16:44:47.528Z → 2026-10-23T16:44:48.204Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T16:44:48.224Z → 2026-10-23T16:44:48.696Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T16:44:48.717Z → 2026-10-23T16:44:50.027Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T16:44:50.044Z → 2026-10-23T16:44:50.780Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T16:44:50.812Z → 2026-10-23T16:44:51.606Z

### core-reliability — PASS

2026-10-23T16:44:52.514Z → 2026-10-23T16:45:29.108Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-12 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T16:44:52.515Z → 2026-10-23T16:45:29.108Z

- tests/core/reliability.ts: PASS; 2026-10-23T16:45:01.854Z → 2026-10-23T16:45:07.158Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T16:45:07.190Z → 2026-10-23T16:45:07.895Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T16:45:07.913Z → 2026-10-23T16:45:08.383Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T16:45:08.403Z → 2026-10-23T16:45:08.962Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T16:45:08.981Z → 2026-10-23T16:45:10.700Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T16:45:10.719Z → 2026-10-23T16:45:11.176Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T16:45:11.198Z → 2026-10-23T16:45:12.933Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T16:45:12.954Z → 2026-10-23T16:45:13.594Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T16:45:13.615Z → 2026-10-23T16:45:15.078Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T16:45:15.097Z → 2026-10-23T16:45:19.517Z
- tests/core/evidenceTransforms.ts: PASS; 2026-10-23T16:45:19.541Z → 2026-10-23T16:45:20.255Z
- tests/core/evidenceIntegration.ts: PASS; 2026-10-23T16:45:20.274Z → 2026-10-23T16:45:27.407Z
- tests/core/sourceContracts.ts: PASS; 2026-10-23T16:45:27.438Z → 2026-10-23T16:45:28.218Z

### provider-auth — PASS

2026-10-23T16:45:29.110Z → 2026-10-23T16:45:40.538Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-13 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T16:45:29.112Z → 2026-10-23T16:45:40.538Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T16:45:39.276Z → 2026-10-23T16:45:39.708Z

### postgres-tls — PASS

2026-10-23T16:45:40.540Z → 2026-10-23T16:45:51.273Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-14 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T16:45:40.541Z → 2026-10-23T16:45:51.273Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T16:45:49.978Z → 2026-10-23T16:45:50.512Z

### contracts — PASS

2026-10-23T16:45:51.275Z → 2026-10-23T16:46:01.649Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-15 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T16:45:51.276Z → 2026-10-23T16:46:01.649Z

- tests/release/contracts.ts: PASS; 2026-10-23T16:46:00.228Z → 2026-10-23T16:46:00.904Z

### synthetic-pilot — PASS

2026-10-23T16:46:01.655Z → 2026-10-23T16:46:12.797Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-16 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T16:46:01.657Z → 2026-10-23T16:46:12.797Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T16:46:11.165Z → 2026-10-23T16:46:11.933Z

### managed-schema — PASS

2026-10-23T16:46:12.800Z → 2026-10-23T16:46:24.039Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-17 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T16:46:12.801Z → 2026-10-23T16:46:24.039Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T16:46:22.947Z → 2026-10-23T16:46:23.205Z

### local-bundle — PASS

2026-10-23T16:46:24.041Z → 2026-10-23T16:46:35.868Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-18 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T16:46:24.043Z → 2026-10-23T16:46:35.867Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T16:46:34.600Z → 2026-10-23T16:46:35.036Z

### closed-setup — PASS

2026-10-23T16:46:35.871Z → 2026-10-23T16:46:47.693Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-19 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T16:46:35.872Z → 2026-10-23T16:46:47.693Z

- tests/release/setup.ts: PASS; 2026-10-23T16:46:46.247Z → 2026-10-23T16:46:46.826Z

### database-contract — PASS

2026-10-23T16:46:47.696Z → 2026-10-23T16:46:58.768Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-20 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T16:46:47.700Z → 2026-10-23T16:46:58.767Z

- tests/release/database_check.ts: PASS; 2026-10-23T16:46:57.488Z → 2026-10-23T16:46:57.856Z

### prelaunch-gate — PASS

2026-10-23T16:46:58.770Z → 2026-10-23T16:47:10.490Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-21 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T16:46:58.773Z → 2026-10-23T16:47:10.490Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T16:47:09.387Z → 2026-10-23T16:47:09.698Z

### service-provisioning — PASS

2026-10-23T16:47:10.493Z → 2026-10-23T16:47:24.074Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-22 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T16:47:10.495Z → 2026-10-23T16:47:24.073Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T16:47:20.242Z → 2026-10-23T16:47:23.257Z

### operator-provisioning — PASS

2026-10-23T16:47:24.076Z → 2026-10-23T16:47:39.155Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-23 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T16:47:24.078Z → 2026-10-23T16:47:39.155Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T16:47:34.656Z → 2026-10-23T16:47:38.341Z

### provisioning-backup-recovery — PASS

2026-10-23T16:47:39.157Z → 2026-10-23T16:47:42.848Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792773744208-e54260da-pg sam-verify-1792773744208-e54260da
```
Exit: 0; signal: none; 2026-10-23T16:47:39.159Z → 2026-10-23T16:47:42.848Z


### render-migration-compatibility — PASS

2026-10-23T16:47:42.850Z → 2026-10-23T16:47:56.143Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-24 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T16:47:42.852Z → 2026-10-23T16:47:56.143Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T16:47:53.923Z → 2026-10-23T16:47:55.306Z

### render-google-oauth-contracts — PASS

2026-10-23T16:47:56.146Z → 2026-10-23T16:48:13.921Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-25 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/isolated/goal_obligations.ts tests/isolated/collection_receipts.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-23T16:47:56.148Z → 2026-10-23T16:48:13.921Z


### integration-migrations — PASS

2026-10-23T16:48:13.924Z → 2026-10-23T16:48:26.346Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-26 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-23T16:48:13.926Z → 2026-10-23T16:48:26.346Z

- tests/integration/migrations.ts: PASS; 2026-10-23T16:48:24.351Z → 2026-10-23T16:48:25.490Z

### integration-oauth-mcp — PASS

2026-10-23T16:48:26.348Z → 2026-10-23T16:48:37.630Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-27 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-23T16:48:26.350Z → 2026-10-23T16:48:37.630Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-23T16:48:36.055Z → 2026-10-23T16:48:36.692Z

### integration-orchestration — PASS

2026-10-23T16:48:37.633Z → 2026-10-23T16:48:56.031Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-28 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T16:48:37.636Z → 2026-10-23T16:48:56.031Z

- tests/integration/orchestration.ts: PASS; 2026-10-23T16:48:47.713Z → 2026-10-23T16:48:55.186Z

### specialist-reasoning — PASS

2026-10-23T16:48:56.033Z → 2026-10-23T16:50:06.178Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-29 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-23T16:48:56.036Z → 2026-10-23T16:50:06.178Z

- tests/specialists/acceptance.ts: PASS; 2026-10-23T16:49:06.077Z → 2026-10-23T16:50:05.313Z

### specialist-gateway — PASS

2026-10-23T16:50:06.181Z → 2026-10-23T16:50:17.232Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-30 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-23T16:50:06.183Z → 2026-10-23T16:50:17.232Z

- tests/specialists/gateway.ts: PASS; 2026-10-23T16:50:15.850Z → 2026-10-23T16:50:16.367Z

### specialist-provenance — PASS

2026-10-23T16:50:17.234Z → 2026-10-23T16:50:27.869Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-31 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-23T16:50:17.236Z → 2026-10-23T16:50:27.869Z

- tests/specialists/provenance.ts: PASS; 2026-10-23T16:50:26.630Z → 2026-10-23T16:50:27.030Z

### specialist-learning-fairness — PASS

2026-10-23T16:50:27.871Z → 2026-10-23T16:50:39.962Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-32 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-23T16:50:27.874Z → 2026-10-23T16:50:39.962Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-23T16:50:37.986Z → 2026-10-23T16:50:39.110Z

### specialist-evaluation — PASS

2026-10-23T16:50:39.965Z → 2026-10-23T16:50:52.227Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-33 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-23T16:50:39.967Z → 2026-10-23T16:50:52.227Z


### evaluation-budget — PASS

2026-10-23T16:50:52.230Z → 2026-10-23T16:52:02.924Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-34 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 --mount type=bind,source=/tmp/sam-obligations-5bfe-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-23T16:50:52.232Z → 2026-10-23T16:52:02.924Z

- tests/evaluation/budgets.ts: PASS; 2026-10-23T16:51:02.356Z → 2026-10-23T16:52:02.083Z

### evaluation-adapter — PASS

2026-10-23T16:52:02.927Z → 2026-10-23T16:52:15.582Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-35 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-23T16:52:02.930Z → 2026-10-23T16:52:15.582Z

- tests/evaluation/adapters.ts: PASS; 2026-10-23T16:52:13.571Z → 2026-10-23T16:52:14.773Z

### evaluation-orchestration — PASS

2026-10-23T16:52:15.586Z → 2026-10-23T16:52:48.736Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-36 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 --mount type=bind,source=/tmp/sam-obligations-5bfe-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T16:52:15.590Z → 2026-10-23T16:52:48.735Z

- tests/evaluation/orchestration.ts: PASS; 2026-10-23T16:52:25.051Z → 2026-10-23T16:52:47.736Z

### evaluation-independent-review — PASS

2026-10-23T16:52:48.742Z → 2026-10-23T16:53:00.749Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-37 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-23T16:52:48.744Z → 2026-10-23T16:53:00.749Z

- tests/evaluation/review.ts: PASS; 2026-10-23T16:52:59.056Z → 2026-10-23T16:52:59.921Z

### evaluation-commercial-market — PASS

2026-10-23T16:53:00.753Z → 2026-10-23T16:53:34.988Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-38 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 --mount type=bind,source=/tmp/sam-obligations-5bfe-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-23T16:53:00.756Z → 2026-10-23T16:53:34.988Z

- tests/evaluation/market.ts: PASS; 2026-10-23T16:53:10.482Z → 2026-10-23T16:53:34.152Z

### evaluation-commercial-profitability — PASS

2026-10-23T16:53:34.993Z → 2026-10-23T16:54:12.066Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-39 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 --mount type=bind,source=/tmp/sam-obligations-5bfe-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-23T16:53:34.996Z → 2026-10-23T16:54:12.066Z

- tests/evaluation/profitability.ts: PASS; 2026-10-23T16:53:45.729Z → 2026-10-23T16:54:11.172Z

### evaluation-commercial-suppliers — PASS

2026-10-23T16:54:12.071Z → 2026-10-23T16:54:47.380Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-40 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 --mount type=bind,source=/tmp/sam-obligations-5bfe-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-23T16:54:12.076Z → 2026-10-23T16:54:47.380Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-23T16:54:22.762Z → 2026-10-23T16:54:46.519Z

### migration-upgrade-rollback — PASS

2026-10-23T16:54:47.389Z → 2026-10-23T16:54:58.115Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-41 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-23T16:54:47.394Z → 2026-10-23T16:54:58.115Z


### specialist-restart-prepare — PASS

2026-10-23T16:54:58.122Z → 2026-10-23T16:55:08.608Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-42 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T16:54:58.129Z → 2026-10-23T16:55:08.608Z


### evaluation-restart-prepare — PASS

2026-10-23T16:55:08.615Z → 2026-10-23T16:55:19.327Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-43 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=5bfe7b8342756623f77f4c3d158a12b7435d32d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T16:55:08.620Z → 2026-10-23T16:55:19.327Z


### postgres-restart — PASS

2026-10-23T16:55:19.334Z → 2026-10-23T16:55:19.749Z

```sh
docker restart --time 10 sam-verify-1792773744208-e54260da-pg
```
Exit: 0; signal: none; 2026-10-23T16:55:19.338Z → 2026-10-23T16:55:19.660Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792773744208-e54260da-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T16:55:19.660Z → 2026-10-23T16:55:19.749Z


### migration-after-restart — PASS

2026-10-23T16:55:19.756Z → 2026-10-23T16:55:32.244Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-44 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-23T16:55:19.762Z → 2026-10-23T16:55:32.244Z


### specialist-restart-check — PASS

2026-10-23T16:55:32.251Z → 2026-10-23T16:55:42.620Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-45 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T16:55:32.256Z → 2026-10-23T16:55:42.620Z


### evaluation-restart-check — PASS

2026-10-23T16:55:42.626Z → 2026-10-23T16:55:52.952Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-46 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T16:55:42.631Z → 2026-10-23T16:55:52.952Z


### phase0-migrations — PASS

2026-10-23T16:55:52.960Z → 2026-10-23T16:55:53.667Z

```sh
docker cp /tmp/sam-verify-XIfpiJ/source/packages/db/migrations sam-verify-1792773744208-e54260da-pg:/migrations
```
Exit: 0; signal: none; 2026-10-23T16:55:52.966Z → 2026-10-23T16:55:52.984Z

```sh
docker exec sam-verify-1792773744208-e54260da-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-23T16:55:52.984Z → 2026-10-23T16:55:53.578Z

```sh
docker exec sam-verify-1792773744208-e54260da-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-23T16:55:53.578Z → 2026-10-23T16:55:53.667Z


### phase0-acceptance — PASS

2026-10-23T16:55:53.675Z → 2026-10-23T16:55:55.764Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-47 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-XIfpiJ/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-23T16:55:53.681Z → 2026-10-23T16:55:55.764Z


### phase0-postgres — PASS

2026-10-23T16:55:55.771Z → 2026-10-23T16:55:57.555Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-48 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-XIfpiJ/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-23T16:55:55.776Z → 2026-10-23T16:55:57.555Z


### tenant-isolation — PASS

2026-10-23T16:55:57.562Z → 2026-10-23T16:55:58.387Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-49 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-XIfpiJ/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-23T16:55:57.567Z → 2026-10-23T16:55:58.387Z


### fail-closed-security — PASS

2026-10-23T16:55:58.393Z → 2026-10-23T16:55:59.198Z

```sh
docker run --rm --name sam-verify-1792773744208-e54260da-job-50 --label sam.verification.run=sam-verify-1792773744208-e54260da --init --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-XIfpiJ/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-23T16:55:58.399Z → 2026-10-23T16:55:59.198Z


### clean-image — PASS

2026-10-23T16:55:59.205Z → 2026-10-23T16:56:06.065Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792773744208-e54260da Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-23T16:55:59.211Z → 2026-10-23T16:56:06.065Z


### image-contract — PASS

2026-10-23T16:56:06.073Z → 2026-10-23T16:56:06.096Z

```sh
docker image inspect sam-verification:sam-verify-1792773744208-e54260da
```
Exit: 0; signal: none; 2026-10-23T16:56:06.080Z → 2026-10-23T16:56:06.095Z


### application-startup-restart — PASS

2026-10-23T16:56:06.102Z → 2026-10-23T16:56:11.544Z

```sh
docker run --rm --init --name sam-verify-1792773744208-e54260da-application --label sam.verification.run=sam-verify-1792773744208-e54260da --network container:sam-verify-1792773744208-e54260da-pg --mount type=bind,src=/tmp/sam-verify-XIfpiJ/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792773744208-e54260da node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-23T16:56:06.107Z → 2026-10-23T16:56:11.544Z


### source-integrity — PASS

2026-10-23T16:56:11.551Z → 2026-10-23T16:56:11.568Z


### cleanup — PASS

2026-10-23T16:56:11.573Z → 2026-10-23T16:56:13.158Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-pg
```
Exit: 0; signal: none; 2026-10-23T16:56:11.578Z → 2026-10-23T16:56:11.593Z

```sh
docker rm --force --volumes sam-verify-1792773744208-e54260da-pg
```
Exit: 0; signal: none; 2026-10-23T16:56:11.593Z → 2026-10-23T16:56:11.978Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-1
```
Exit: 1; signal: none; 2026-10-23T16:56:11.978Z → 2026-10-23T16:56:12.000Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-2
```
Exit: 1; signal: none; 2026-10-23T16:56:12.000Z → 2026-10-23T16:56:12.019Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-3
```
Exit: 1; signal: none; 2026-10-23T16:56:12.019Z → 2026-10-23T16:56:12.039Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-4
```
Exit: 1; signal: none; 2026-10-23T16:56:12.039Z → 2026-10-23T16:56:12.063Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-5
```
Exit: 1; signal: none; 2026-10-23T16:56:12.063Z → 2026-10-23T16:56:12.085Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-6
```
Exit: 1; signal: none; 2026-10-23T16:56:12.085Z → 2026-10-23T16:56:12.107Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-7
```
Exit: 1; signal: none; 2026-10-23T16:56:12.107Z → 2026-10-23T16:56:12.129Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-8
```
Exit: 1; signal: none; 2026-10-23T16:56:12.129Z → 2026-10-23T16:56:12.149Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-9
```
Exit: 1; signal: none; 2026-10-23T16:56:12.150Z → 2026-10-23T16:56:12.171Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-10
```
Exit: 1; signal: none; 2026-10-23T16:56:12.171Z → 2026-10-23T16:56:12.191Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-11
```
Exit: 1; signal: none; 2026-10-23T16:56:12.191Z → 2026-10-23T16:56:12.212Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-12
```
Exit: 1; signal: none; 2026-10-23T16:56:12.213Z → 2026-10-23T16:56:12.234Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-13
```
Exit: 1; signal: none; 2026-10-23T16:56:12.234Z → 2026-10-23T16:56:12.253Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-14
```
Exit: 1; signal: none; 2026-10-23T16:56:12.253Z → 2026-10-23T16:56:12.279Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-15
```
Exit: 1; signal: none; 2026-10-23T16:56:12.279Z → 2026-10-23T16:56:12.299Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-16
```
Exit: 1; signal: none; 2026-10-23T16:56:12.300Z → 2026-10-23T16:56:12.320Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-17
```
Exit: 1; signal: none; 2026-10-23T16:56:12.320Z → 2026-10-23T16:56:12.342Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-18
```
Exit: 1; signal: none; 2026-10-23T16:56:12.342Z → 2026-10-23T16:56:12.363Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-19
```
Exit: 1; signal: none; 2026-10-23T16:56:12.363Z → 2026-10-23T16:56:12.384Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-20
```
Exit: 1; signal: none; 2026-10-23T16:56:12.385Z → 2026-10-23T16:56:12.405Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-21
```
Exit: 1; signal: none; 2026-10-23T16:56:12.405Z → 2026-10-23T16:56:12.425Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-22
```
Exit: 1; signal: none; 2026-10-23T16:56:12.425Z → 2026-10-23T16:56:12.446Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-23
```
Exit: 1; signal: none; 2026-10-23T16:56:12.446Z → 2026-10-23T16:56:12.465Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-24
```
Exit: 1; signal: none; 2026-10-23T16:56:12.465Z → 2026-10-23T16:56:12.487Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-25
```
Exit: 1; signal: none; 2026-10-23T16:56:12.487Z → 2026-10-23T16:56:12.509Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-26
```
Exit: 1; signal: none; 2026-10-23T16:56:12.509Z → 2026-10-23T16:56:12.529Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-27
```
Exit: 1; signal: none; 2026-10-23T16:56:12.529Z → 2026-10-23T16:56:12.556Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-28
```
Exit: 1; signal: none; 2026-10-23T16:56:12.556Z → 2026-10-23T16:56:12.579Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-29
```
Exit: 1; signal: none; 2026-10-23T16:56:12.579Z → 2026-10-23T16:56:12.599Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-30
```
Exit: 1; signal: none; 2026-10-23T16:56:12.599Z → 2026-10-23T16:56:12.619Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-31
```
Exit: 1; signal: none; 2026-10-23T16:56:12.619Z → 2026-10-23T16:56:12.641Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-32
```
Exit: 1; signal: none; 2026-10-23T16:56:12.641Z → 2026-10-23T16:56:12.661Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-33
```
Exit: 1; signal: none; 2026-10-23T16:56:12.661Z → 2026-10-23T16:56:12.683Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-34
```
Exit: 1; signal: none; 2026-10-23T16:56:12.683Z → 2026-10-23T16:56:12.705Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-35
```
Exit: 1; signal: none; 2026-10-23T16:56:12.705Z → 2026-10-23T16:56:12.725Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-36
```
Exit: 1; signal: none; 2026-10-23T16:56:12.725Z → 2026-10-23T16:56:12.748Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-37
```
Exit: 1; signal: none; 2026-10-23T16:56:12.748Z → 2026-10-23T16:56:12.772Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-38
```
Exit: 1; signal: none; 2026-10-23T16:56:12.772Z → 2026-10-23T16:56:12.794Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-39
```
Exit: 1; signal: none; 2026-10-23T16:56:12.794Z → 2026-10-23T16:56:12.817Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-40
```
Exit: 1; signal: none; 2026-10-23T16:56:12.817Z → 2026-10-23T16:56:12.839Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-41
```
Exit: 1; signal: none; 2026-10-23T16:56:12.839Z → 2026-10-23T16:56:12.861Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-42
```
Exit: 1; signal: none; 2026-10-23T16:56:12.861Z → 2026-10-23T16:56:12.883Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-43
```
Exit: 1; signal: none; 2026-10-23T16:56:12.883Z → 2026-10-23T16:56:12.907Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-44
```
Exit: 1; signal: none; 2026-10-23T16:56:12.907Z → 2026-10-23T16:56:12.926Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-45
```
Exit: 1; signal: none; 2026-10-23T16:56:12.926Z → 2026-10-23T16:56:12.946Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-46
```
Exit: 1; signal: none; 2026-10-23T16:56:12.946Z → 2026-10-23T16:56:12.967Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-47
```
Exit: 1; signal: none; 2026-10-23T16:56:12.967Z → 2026-10-23T16:56:12.987Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-48
```
Exit: 1; signal: none; 2026-10-23T16:56:12.987Z → 2026-10-23T16:56:13.009Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-49
```
Exit: 1; signal: none; 2026-10-23T16:56:13.009Z → 2026-10-23T16:56:13.031Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-job-50
```
Exit: 1; signal: none; 2026-10-23T16:56:13.031Z → 2026-10-23T16:56:13.051Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-application
```
Exit: 1; signal: none; 2026-10-23T16:56:13.051Z → 2026-10-23T16:56:13.072Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792773744208-e54260da-net
```
Exit: 0; signal: none; 2026-10-23T16:56:13.072Z → 2026-10-23T16:56:13.085Z

```sh
docker network rm sam-verify-1792773744208-e54260da-net
```
Exit: 0; signal: none; 2026-10-23T16:56:13.085Z → 2026-10-23T16:56:13.132Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
