# Independent SAM verification

Status: **PASS**
Source: `f8b570ac80158303993c3156872c76401ff965f9` (clean: true)
Started: 2026-10-23T18:19:55.462Z; completed: 2026-10-23T18:34:24.229Z

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
- clean-application: `sam-verification:sam-verify-1792779595462-fe382964`; ID `sha256:cddb81ec3b0ac5012fa3eb89fc1461e624a537a38a0e546cf37c59f9d4eec76e`

## Commands and suite outcomes

### preflight — PASS

2026-10-23T18:19:55.464Z → 2026-10-23T18:19:55.752Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T18:19:55.468Z → 2026-10-23T18:19:55.482Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T18:19:55.482Z → 2026-10-23T18:19:55.485Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T18:19:55.485Z → 2026-10-23T18:19:55.491Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T18:19:55.491Z → 2026-10-23T18:19:55.506Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T18:19:55.506Z → 2026-10-23T18:19:55.528Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T18:19:55.528Z → 2026-10-23T18:19:55.594Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T18:19:55.594Z → 2026-10-23T18:19:55.673Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T18:19:55.673Z → 2026-10-23T18:19:55.734Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T18:19:55.734Z → 2026-10-23T18:19:55.736Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T18:19:55.736Z → 2026-10-23T18:19:55.750Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T18:19:55.750Z → 2026-10-23T18:19:55.752Z


### snapshot — PASS

2026-10-23T18:19:55.753Z → 2026-10-23T18:19:55.831Z

```sh
git archive --format=tar --output /tmp/sam-verify-l9PNj4/source.tar f8b570ac80158303993c3156872c76401ff965f9
```
Exit: 0; signal: none; 2026-10-23T18:19:55.754Z → 2026-10-23T18:19:55.789Z

```sh
tar -xf /tmp/sam-verify-l9PNj4/source.tar -C /tmp/sam-verify-l9PNj4/source
```
Exit: 0; signal: none; 2026-10-23T18:19:55.789Z → 2026-10-23T18:19:55.799Z


### images — PASS

2026-10-23T18:19:55.832Z → 2026-10-23T18:19:55.973Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T18:19:55.833Z → 2026-10-23T18:19:55.848Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T18:19:55.848Z → 2026-10-23T18:19:55.861Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T18:19:55.862Z → 2026-10-23T18:19:55.878Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T18:19:55.878Z → 2026-10-23T18:19:55.895Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T18:19:55.895Z → 2026-10-23T18:19:55.915Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T18:19:55.915Z → 2026-10-23T18:19:55.939Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T18:19:55.939Z → 2026-10-23T18:19:55.957Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T18:19:55.957Z → 2026-10-23T18:19:55.973Z


### isolated-postgres — PASS

2026-10-23T18:19:55.974Z → 2026-10-23T18:20:00.681Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792779595462-fe382964 sam-verify-1792779595462-fe382964-net
```
Exit: 0; signal: none; 2026-10-23T18:19:55.975Z → 2026-10-23T18:19:56.007Z

```sh
docker run --detach --name sam-verify-1792779595462-fe382964-pg --label sam.verification.run=sam-verify-1792779595462-fe382964 --network sam-verify-1792779595462-fe382964-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T18:19:56.007Z → 2026-10-23T18:19:58.229Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792779595462-fe382964-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T18:19:58.229Z → 2026-10-23T18:19:58.350Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792779595462-fe382964-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T18:19:58.851Z → 2026-10-23T18:19:58.937Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792779595462-fe382964-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T18:19:59.437Z → 2026-10-23T18:19:59.537Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792779595462-fe382964-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T18:20:00.038Z → 2026-10-23T18:20:00.168Z

```sh
docker exec sam-verify-1792779595462-fe382964-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T18:20:00.169Z → 2026-10-23T18:20:00.337Z

```sh
docker exec sam-verify-1792779595462-fe382964-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T18:20:00.337Z → 2026-10-23T18:20:00.535Z

```sh
docker exec sam-verify-1792779595462-fe382964-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T18:20:00.535Z → 2026-10-23T18:20:00.681Z


### node-dependencies — PASS

2026-10-23T18:20:00.687Z → 2026-10-23T18:20:11.361Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-1 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T18:20:00.689Z → 2026-10-23T18:20:11.361Z


### python-dependencies — PASS

2026-10-23T18:20:11.362Z → 2026-10-23T18:20:15.128Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-2 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-l9PNj4/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T18:20:11.363Z → 2026-10-23T18:20:15.127Z


### runtime-versions — PASS

2026-10-23T18:20:15.144Z → 2026-10-23T18:20:44.536Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-3 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T18:20:15.149Z → 2026-10-23T18:20:25.161Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-4 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T18:20:25.161Z → 2026-10-23T18:20:36.311Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-5 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T18:20:36.311Z → 2026-10-23T18:20:43.043Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-6 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T18:20:43.044Z → 2026-10-23T18:20:44.443Z

```sh
docker exec sam-verify-1792779595462-fe382964-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T18:20:44.443Z → 2026-10-23T18:20:44.536Z


### workflow-tool — PASS

2026-10-23T18:20:44.537Z → 2026-10-23T18:20:45.045Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-l9PNj4/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T18:20:44.538Z → 2026-10-23T18:20:45.003Z

```sh
tar -xzf /tmp/sam-verify-l9PNj4/actionlint.tar.gz -C /tmp/sam-verify-l9PNj4 actionlint
```
Exit: 0; signal: none; 2026-10-23T18:20:45.006Z → 2026-10-23T18:20:45.042Z

```sh
/tmp/sam-verify-l9PNj4/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T18:20:45.042Z → 2026-10-23T18:20:45.045Z


### workflow-validation — PASS

2026-10-23T18:20:45.047Z → 2026-10-23T18:20:45.051Z

```sh
/tmp/sam-verify-l9PNj4/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T18:20:45.048Z → 2026-10-23T18:20:45.051Z


### configuration-validation — PASS

2026-10-23T18:20:45.053Z → 2026-10-23T18:21:09.318Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T18:20:45.054Z → 2026-10-23T18:20:45.282Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T18:20:45.282Z → 2026-10-23T18:20:45.357Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T18:20:45.357Z → 2026-10-23T18:20:45.441Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T18:20:45.441Z → 2026-10-23T18:20:45.513Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T18:20:45.513Z → 2026-10-23T18:20:45.587Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-7 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T18:20:45.587Z → 2026-10-23T18:20:52.863Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-8 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T18:20:52.863Z → 2026-10-23T18:21:00.364Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-9 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T18:21:00.365Z → 2026-10-23T18:21:09.318Z


### typecheck — PASS

2026-10-23T18:21:09.319Z → 2026-10-23T18:21:25.647Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-10 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T18:21:09.320Z → 2026-10-23T18:21:25.647Z


### regression — PASS

2026-10-23T18:21:25.649Z → 2026-10-23T18:22:02.693Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-11 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T18:21:25.652Z → 2026-10-23T18:22:02.692Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T18:21:30.933Z → 2026-10-23T18:21:31.569Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T18:21:31.592Z → 2026-10-23T18:21:32.099Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T18:21:32.117Z → 2026-10-23T18:21:32.577Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T18:21:32.596Z → 2026-10-23T18:21:33.131Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T18:21:33.151Z → 2026-10-23T18:21:33.672Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T18:21:33.692Z → 2026-10-23T18:21:34.132Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T18:21:34.149Z → 2026-10-23T18:21:35.082Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T18:21:35.112Z → 2026-10-23T18:21:35.740Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T18:21:35.761Z → 2026-10-23T18:21:36.281Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T18:21:36.301Z → 2026-10-23T18:21:36.789Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T18:21:36.808Z → 2026-10-23T18:21:37.325Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T18:21:37.344Z → 2026-10-23T18:21:37.737Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T18:21:37.761Z → 2026-10-23T18:21:38.343Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T18:21:38.366Z → 2026-10-23T18:21:38.854Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T18:21:38.874Z → 2026-10-23T18:21:39.290Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T18:21:39.308Z → 2026-10-23T18:21:39.838Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T18:21:39.869Z → 2026-10-23T18:21:40.373Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T18:21:40.397Z → 2026-10-23T18:21:40.937Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T18:21:40.958Z → 2026-10-23T18:21:41.454Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T18:21:41.472Z → 2026-10-23T18:21:41.909Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T18:21:41.934Z → 2026-10-23T18:21:42.405Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T18:21:42.425Z → 2026-10-23T18:21:42.760Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T18:21:42.778Z → 2026-10-23T18:21:43.273Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T18:21:43.294Z → 2026-10-23T18:21:44.839Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T18:21:44.858Z → 2026-10-23T18:21:45.452Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T18:21:45.471Z → 2026-10-23T18:21:45.926Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T18:21:45.944Z → 2026-10-23T18:21:46.604Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T18:21:46.622Z → 2026-10-23T18:21:47.662Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T18:21:47.686Z → 2026-10-23T18:21:48.177Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T18:21:48.194Z → 2026-10-23T18:21:48.678Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T18:21:48.701Z → 2026-10-23T18:21:49.489Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T18:21:49.508Z → 2026-10-23T18:21:50.063Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T18:21:50.082Z → 2026-10-23T18:21:50.540Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T18:21:50.557Z → 2026-10-23T18:21:51.009Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T18:21:51.026Z → 2026-10-23T18:21:51.459Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T18:21:51.476Z → 2026-10-23T18:21:52.093Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T18:21:52.112Z → 2026-10-23T18:21:52.583Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T18:21:52.605Z → 2026-10-23T18:21:53.109Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T18:21:53.127Z → 2026-10-23T18:21:53.638Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T18:21:53.657Z → 2026-10-23T18:21:54.136Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T18:21:54.161Z → 2026-10-23T18:21:55.276Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T18:21:55.298Z → 2026-10-23T18:21:55.724Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T18:21:55.744Z → 2026-10-23T18:21:57.163Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T18:21:57.185Z → 2026-10-23T18:21:57.673Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T18:21:57.691Z → 2026-10-23T18:21:58.307Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T18:21:58.324Z → 2026-10-23T18:21:58.762Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T18:21:58.779Z → 2026-10-23T18:21:59.803Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T18:21:59.830Z → 2026-10-23T18:22:00.822Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T18:22:00.855Z → 2026-10-23T18:22:01.755Z

### core-reliability — PASS

2026-10-23T18:22:02.695Z → 2026-10-23T18:22:37.199Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-12 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T18:22:02.696Z → 2026-10-23T18:22:37.198Z

- tests/core/reliability.ts: PASS; 2026-10-23T18:22:07.870Z → 2026-10-23T18:22:13.323Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T18:22:13.351Z → 2026-10-23T18:22:13.987Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T18:22:14.017Z → 2026-10-23T18:22:14.510Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T18:22:14.528Z → 2026-10-23T18:22:15.162Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T18:22:15.180Z → 2026-10-23T18:22:17.142Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T18:22:17.160Z → 2026-10-23T18:22:17.778Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T18:22:17.800Z → 2026-10-23T18:22:19.669Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T18:22:19.687Z → 2026-10-23T18:22:20.357Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T18:22:20.386Z → 2026-10-23T18:22:21.905Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T18:22:21.923Z → 2026-10-23T18:22:26.231Z
- tests/core/evidenceTransforms.ts: PASS; 2026-10-23T18:22:26.254Z → 2026-10-23T18:22:27.259Z
- tests/core/evidenceIntegration.ts: PASS; 2026-10-23T18:22:27.282Z → 2026-10-23T18:22:34.723Z
- tests/core/sourceContracts.ts: PASS; 2026-10-23T18:22:34.758Z → 2026-10-23T18:22:35.697Z
- tests/core/evidenceChaining.ts: PASS; 2026-10-23T18:22:35.720Z → 2026-10-23T18:22:36.282Z

### provider-auth — PASS

2026-10-23T18:22:37.200Z → 2026-10-23T18:22:45.767Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-13 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T18:22:37.202Z → 2026-10-23T18:22:45.767Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T18:22:44.489Z → 2026-10-23T18:22:44.921Z

### postgres-tls — PASS

2026-10-23T18:22:45.769Z → 2026-10-23T18:22:57.230Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-14 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T18:22:45.771Z → 2026-10-23T18:22:57.230Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T18:22:55.599Z → 2026-10-23T18:22:56.395Z

### contracts — PASS

2026-10-23T18:22:57.234Z → 2026-10-23T18:23:08.302Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-15 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T18:22:57.237Z → 2026-10-23T18:23:08.301Z

- tests/release/contracts.ts: PASS; 2026-10-23T18:23:06.701Z → 2026-10-23T18:23:07.452Z

### synthetic-pilot — PASS

2026-10-23T18:23:08.305Z → 2026-10-23T18:23:19.413Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-16 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T18:23:08.307Z → 2026-10-23T18:23:19.413Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T18:23:17.590Z → 2026-10-23T18:23:18.543Z

### managed-schema — PASS

2026-10-23T18:23:19.417Z → 2026-10-23T18:23:29.931Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-17 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T18:23:19.419Z → 2026-10-23T18:23:29.931Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T18:23:28.850Z → 2026-10-23T18:23:29.098Z

### local-bundle — PASS

2026-10-23T18:23:29.936Z → 2026-10-23T18:23:41.953Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-18 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T18:23:29.937Z → 2026-10-23T18:23:41.953Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T18:23:40.674Z → 2026-10-23T18:23:41.094Z

### closed-setup — PASS

2026-10-23T18:23:41.955Z → 2026-10-23T18:23:54.482Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-19 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T18:23:41.957Z → 2026-10-23T18:23:54.482Z

- tests/release/setup.ts: PASS; 2026-10-23T18:23:53.085Z → 2026-10-23T18:23:53.685Z

### database-contract — PASS

2026-10-23T18:23:54.485Z → 2026-10-23T18:24:06.815Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-20 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T18:23:54.487Z → 2026-10-23T18:24:06.814Z

- tests/release/database_check.ts: PASS; 2026-10-23T18:24:05.519Z → 2026-10-23T18:24:05.959Z

### prelaunch-gate — PASS

2026-10-23T18:24:06.817Z → 2026-10-23T18:24:16.375Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-21 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T18:24:06.819Z → 2026-10-23T18:24:16.375Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T18:24:15.135Z → 2026-10-23T18:24:15.476Z

### service-provisioning — PASS

2026-10-23T18:24:16.378Z → 2026-10-23T18:24:31.945Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-22 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T18:24:16.382Z → 2026-10-23T18:24:31.945Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T18:24:27.658Z → 2026-10-23T18:24:30.978Z

### operator-provisioning — PASS

2026-10-23T18:24:31.948Z → 2026-10-23T18:24:48.729Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-23 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T18:24:31.950Z → 2026-10-23T18:24:48.728Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T18:24:42.637Z → 2026-10-23T18:24:47.833Z

### provisioning-backup-recovery — PASS

2026-10-23T18:24:48.731Z → 2026-10-23T18:24:52.547Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792779595462-fe382964-pg sam-verify-1792779595462-fe382964
```
Exit: 0; signal: none; 2026-10-23T18:24:48.733Z → 2026-10-23T18:24:52.547Z


### render-migration-compatibility — PASS

2026-10-23T18:24:52.549Z → 2026-10-23T18:25:04.894Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-24 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T18:24:52.551Z → 2026-10-23T18:25:04.894Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T18:25:02.619Z → 2026-10-23T18:25:03.976Z

### render-google-oauth-contracts — PASS

2026-10-23T18:25:04.896Z → 2026-10-23T18:25:23.646Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-25 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/isolated/goal_obligations.ts tests/isolated/collection_receipts.ts tests/isolated/shared_goal_contract.ts tests/isolated/delegation_scope.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-23T18:25:04.899Z → 2026-10-23T18:25:23.646Z


### integration-migrations — PASS

2026-10-23T18:25:23.649Z → 2026-10-23T18:25:35.648Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-26 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-23T18:25:23.651Z → 2026-10-23T18:25:35.648Z

- tests/integration/migrations.ts: PASS; 2026-10-23T18:25:33.493Z → 2026-10-23T18:25:34.748Z

### integration-oauth-mcp — PASS

2026-10-23T18:25:35.654Z → 2026-10-23T18:25:46.572Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-27 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-23T18:25:35.660Z → 2026-10-23T18:25:46.572Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-23T18:25:45.015Z → 2026-10-23T18:25:45.602Z

### integration-orchestration — PASS

2026-10-23T18:25:46.576Z → 2026-10-23T18:26:05.400Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-28 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T18:25:46.579Z → 2026-10-23T18:26:05.400Z

- tests/integration/orchestration.ts: PASS; 2026-10-23T18:25:57.159Z → 2026-10-23T18:26:04.530Z

### specialist-reasoning — PASS

2026-10-23T18:26:05.402Z → 2026-10-23T18:27:15.438Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-29 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-23T18:26:05.406Z → 2026-10-23T18:27:15.438Z

- tests/specialists/acceptance.ts: PASS; 2026-10-23T18:26:14.375Z → 2026-10-23T18:27:14.605Z

### specialist-gateway — PASS

2026-10-23T18:27:15.441Z → 2026-10-23T18:27:25.930Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-30 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-23T18:27:15.442Z → 2026-10-23T18:27:25.930Z

- tests/specialists/gateway.ts: PASS; 2026-10-23T18:27:24.606Z → 2026-10-23T18:27:25.091Z

### specialist-provenance — PASS

2026-10-23T18:27:25.933Z → 2026-10-23T18:27:37.311Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-31 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-23T18:27:25.935Z → 2026-10-23T18:27:37.311Z

- tests/specialists/provenance.ts: PASS; 2026-10-23T18:27:36.106Z → 2026-10-23T18:27:36.522Z

### specialist-learning-fairness — PASS

2026-10-23T18:27:37.314Z → 2026-10-23T18:27:48.484Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-32 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-23T18:27:37.316Z → 2026-10-23T18:27:48.483Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-23T18:27:46.482Z → 2026-10-23T18:27:47.607Z

### specialist-evaluation — PASS

2026-10-23T18:27:48.486Z → 2026-10-23T18:27:59.645Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-33 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-23T18:27:48.488Z → 2026-10-23T18:27:59.645Z


### evaluation-budget — PASS

2026-10-23T18:27:59.648Z → 2026-10-23T18:29:07.638Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-34 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 --mount type=bind,source=/tmp/sam-shared-f8b570a-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-23T18:27:59.652Z → 2026-10-23T18:29:07.637Z

- tests/evaluation/budgets.ts: PASS; 2026-10-23T18:28:09.189Z → 2026-10-23T18:29:06.619Z

### evaluation-adapter — PASS

2026-10-23T18:29:07.641Z → 2026-10-23T18:29:19.052Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-35 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-23T18:29:07.645Z → 2026-10-23T18:29:19.052Z

- tests/evaluation/adapters.ts: PASS; 2026-10-23T18:29:17.119Z → 2026-10-23T18:29:18.266Z

### evaluation-orchestration — PASS

2026-10-23T18:29:19.056Z → 2026-10-23T18:29:52.545Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-36 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 --mount type=bind,source=/tmp/sam-shared-f8b570a-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T18:29:19.058Z → 2026-10-23T18:29:52.545Z

- tests/evaluation/orchestration.ts: PASS; 2026-10-23T18:29:29.335Z → 2026-10-23T18:29:51.732Z

### evaluation-independent-review — PASS

2026-10-23T18:29:52.548Z → 2026-10-23T18:30:03.182Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-37 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-23T18:29:52.551Z → 2026-10-23T18:30:03.182Z

- tests/evaluation/review.ts: PASS; 2026-10-23T18:30:01.649Z → 2026-10-23T18:30:02.411Z

### evaluation-commercial-market — PASS

2026-10-23T18:30:03.186Z → 2026-10-23T18:30:38.025Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-38 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 --mount type=bind,source=/tmp/sam-shared-f8b570a-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-23T18:30:03.188Z → 2026-10-23T18:30:38.025Z

- tests/evaluation/market.ts: PASS; 2026-10-23T18:30:13.362Z → 2026-10-23T18:30:37.229Z

### evaluation-commercial-profitability — PASS

2026-10-23T18:30:38.030Z → 2026-10-23T18:31:12.800Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-39 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 --mount type=bind,source=/tmp/sam-shared-f8b570a-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-23T18:30:38.036Z → 2026-10-23T18:31:12.800Z

- tests/evaluation/profitability.ts: PASS; 2026-10-23T18:30:48.329Z → 2026-10-23T18:31:11.978Z

### evaluation-commercial-suppliers — PASS

2026-10-23T18:31:12.808Z → 2026-10-23T18:31:48.520Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-40 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 --mount type=bind,source=/tmp/sam-shared-f8b570a-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-23T18:31:12.812Z → 2026-10-23T18:31:48.520Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-23T18:31:22.699Z → 2026-10-23T18:31:47.592Z

### migration-upgrade-rollback — PASS

2026-10-23T18:31:48.528Z → 2026-10-23T18:31:59.073Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-41 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-23T18:31:48.535Z → 2026-10-23T18:31:59.073Z


### specialist-restart-prepare — PASS

2026-10-23T18:31:59.081Z → 2026-10-23T18:32:11.628Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-42 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T18:31:59.087Z → 2026-10-23T18:32:11.628Z


### evaluation-restart-prepare — PASS

2026-10-23T18:32:11.636Z → 2026-10-23T18:32:23.387Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-43 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T18:32:11.641Z → 2026-10-23T18:32:23.387Z


### postgres-restart — PASS

2026-10-23T18:32:23.393Z → 2026-10-23T18:32:23.819Z

```sh
docker restart --time 10 sam-verify-1792779595462-fe382964-pg
```
Exit: 0; signal: none; 2026-10-23T18:32:23.398Z → 2026-10-23T18:32:23.719Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792779595462-fe382964-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T18:32:23.719Z → 2026-10-23T18:32:23.819Z


### migration-after-restart — PASS

2026-10-23T18:32:23.825Z → 2026-10-23T18:32:35.095Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-44 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-23T18:32:23.830Z → 2026-10-23T18:32:35.095Z


### specialist-restart-check — PASS

2026-10-23T18:32:35.102Z → 2026-10-23T18:32:46.190Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-45 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T18:32:35.109Z → 2026-10-23T18:32:46.190Z


### evaluation-restart-check — PASS

2026-10-23T18:32:46.198Z → 2026-10-23T18:32:57.177Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-46 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T18:32:46.202Z → 2026-10-23T18:32:57.177Z


### phase0-migrations — PASS

2026-10-23T18:32:57.184Z → 2026-10-23T18:32:57.903Z

```sh
docker cp /tmp/sam-verify-l9PNj4/source/packages/db/migrations sam-verify-1792779595462-fe382964-pg:/migrations
```
Exit: 0; signal: none; 2026-10-23T18:32:57.192Z → 2026-10-23T18:32:57.208Z

```sh
docker exec sam-verify-1792779595462-fe382964-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-23T18:32:57.208Z → 2026-10-23T18:32:57.815Z

```sh
docker exec sam-verify-1792779595462-fe382964-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-23T18:32:57.816Z → 2026-10-23T18:32:57.903Z


### phase0-acceptance — PASS

2026-10-23T18:32:57.910Z → 2026-10-23T18:32:59.986Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-47 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-l9PNj4/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-23T18:32:57.915Z → 2026-10-23T18:32:59.986Z


### phase0-postgres — PASS

2026-10-23T18:32:59.993Z → 2026-10-23T18:33:02.560Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-48 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-l9PNj4/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-23T18:32:59.997Z → 2026-10-23T18:33:02.560Z


### tenant-isolation — PASS

2026-10-23T18:33:02.567Z → 2026-10-23T18:33:04.016Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-49 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-l9PNj4/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-23T18:33:02.572Z → 2026-10-23T18:33:04.016Z


### fail-closed-security — PASS

2026-10-23T18:33:04.022Z → 2026-10-23T18:33:06.376Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-50 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-l9PNj4/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-23T18:33:04.030Z → 2026-10-23T18:33:06.376Z


### clean-image — PASS

2026-10-23T18:33:06.384Z → 2026-10-23T18:33:13.048Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792779595462-fe382964 Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-23T18:33:06.391Z → 2026-10-23T18:33:13.048Z


### image-contract — PASS

2026-10-23T18:33:13.054Z → 2026-10-23T18:33:13.075Z

```sh
docker image inspect sam-verification:sam-verify-1792779595462-fe382964
```
Exit: 0; signal: none; 2026-10-23T18:33:13.060Z → 2026-10-23T18:33:13.075Z


### application-startup-restart — PASS

2026-10-23T18:33:13.082Z → 2026-10-23T18:33:18.150Z

```sh
docker run --rm --init --name sam-verify-1792779595462-fe382964-application --label sam.verification.run=sam-verify-1792779595462-fe382964 --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792779595462-fe382964 node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-23T18:33:13.087Z → 2026-10-23T18:33:18.150Z


### source-integrity — PASS

2026-10-23T18:33:18.157Z → 2026-10-23T18:33:18.174Z


### shared-goal-path — PASS

2026-10-23T18:33:18.179Z → 2026-10-23T18:34:22.631Z

```sh
docker run --rm --name sam-verify-1792779595462-fe382964-job-52 --label sam.verification.run=sam-verify-1792779595462-fe382964 --init --network container:sam-verify-1792779595462-fe382964-pg --mount type=bind,src=/tmp/sam-verify-l9PNj4/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f8b570ac80158303993c3156872c76401ff965f9 --mount type=bind,source=/tmp/sam-shared-f8b570a-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/sharedPath.ts
```
Exit: 0; signal: none; 2026-10-23T18:33:18.184Z → 2026-10-23T18:34:22.631Z

- tests/evaluation/sharedPath.ts: PASS; 2026-10-23T18:33:24.492Z → 2026-10-23T18:34:21.819Z

### cleanup — PASS

2026-10-23T18:34:22.640Z → 2026-10-23T18:34:24.221Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-pg
```
Exit: 0; signal: none; 2026-10-23T18:34:22.647Z → 2026-10-23T18:34:22.662Z

```sh
docker rm --force --volumes sam-verify-1792779595462-fe382964-pg
```
Exit: 0; signal: none; 2026-10-23T18:34:22.662Z → 2026-10-23T18:34:23.072Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-1
```
Exit: 1; signal: none; 2026-10-23T18:34:23.072Z → 2026-10-23T18:34:23.095Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-2
```
Exit: 1; signal: none; 2026-10-23T18:34:23.095Z → 2026-10-23T18:34:23.113Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-3
```
Exit: 1; signal: none; 2026-10-23T18:34:23.113Z → 2026-10-23T18:34:23.133Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-4
```
Exit: 1; signal: none; 2026-10-23T18:34:23.133Z → 2026-10-23T18:34:23.153Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-5
```
Exit: 1; signal: none; 2026-10-23T18:34:23.154Z → 2026-10-23T18:34:23.174Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-6
```
Exit: 1; signal: none; 2026-10-23T18:34:23.174Z → 2026-10-23T18:34:23.193Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-7
```
Exit: 1; signal: none; 2026-10-23T18:34:23.193Z → 2026-10-23T18:34:23.213Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-8
```
Exit: 1; signal: none; 2026-10-23T18:34:23.213Z → 2026-10-23T18:34:23.235Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-9
```
Exit: 1; signal: none; 2026-10-23T18:34:23.235Z → 2026-10-23T18:34:23.255Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-10
```
Exit: 1; signal: none; 2026-10-23T18:34:23.255Z → 2026-10-23T18:34:23.276Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-11
```
Exit: 1; signal: none; 2026-10-23T18:34:23.276Z → 2026-10-23T18:34:23.297Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-12
```
Exit: 1; signal: none; 2026-10-23T18:34:23.297Z → 2026-10-23T18:34:23.317Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-13
```
Exit: 1; signal: none; 2026-10-23T18:34:23.317Z → 2026-10-23T18:34:23.338Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-14
```
Exit: 1; signal: none; 2026-10-23T18:34:23.338Z → 2026-10-23T18:34:23.359Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-15
```
Exit: 1; signal: none; 2026-10-23T18:34:23.359Z → 2026-10-23T18:34:23.380Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-16
```
Exit: 1; signal: none; 2026-10-23T18:34:23.380Z → 2026-10-23T18:34:23.398Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-17
```
Exit: 1; signal: none; 2026-10-23T18:34:23.398Z → 2026-10-23T18:34:23.419Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-18
```
Exit: 1; signal: none; 2026-10-23T18:34:23.419Z → 2026-10-23T18:34:23.440Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-19
```
Exit: 1; signal: none; 2026-10-23T18:34:23.440Z → 2026-10-23T18:34:23.463Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-20
```
Exit: 1; signal: none; 2026-10-23T18:34:23.463Z → 2026-10-23T18:34:23.483Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-21
```
Exit: 1; signal: none; 2026-10-23T18:34:23.483Z → 2026-10-23T18:34:23.504Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-22
```
Exit: 1; signal: none; 2026-10-23T18:34:23.504Z → 2026-10-23T18:34:23.524Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-23
```
Exit: 1; signal: none; 2026-10-23T18:34:23.524Z → 2026-10-23T18:34:23.544Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-24
```
Exit: 1; signal: none; 2026-10-23T18:34:23.545Z → 2026-10-23T18:34:23.565Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-25
```
Exit: 1; signal: none; 2026-10-23T18:34:23.565Z → 2026-10-23T18:34:23.584Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-26
```
Exit: 1; signal: none; 2026-10-23T18:34:23.584Z → 2026-10-23T18:34:23.603Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-27
```
Exit: 1; signal: none; 2026-10-23T18:34:23.603Z → 2026-10-23T18:34:23.624Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-28
```
Exit: 1; signal: none; 2026-10-23T18:34:23.624Z → 2026-10-23T18:34:23.645Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-29
```
Exit: 1; signal: none; 2026-10-23T18:34:23.645Z → 2026-10-23T18:34:23.664Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-30
```
Exit: 1; signal: none; 2026-10-23T18:34:23.664Z → 2026-10-23T18:34:23.684Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-31
```
Exit: 1; signal: none; 2026-10-23T18:34:23.684Z → 2026-10-23T18:34:23.706Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-32
```
Exit: 1; signal: none; 2026-10-23T18:34:23.706Z → 2026-10-23T18:34:23.726Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-33
```
Exit: 1; signal: none; 2026-10-23T18:34:23.726Z → 2026-10-23T18:34:23.746Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-34
```
Exit: 1; signal: none; 2026-10-23T18:34:23.746Z → 2026-10-23T18:34:23.766Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-35
```
Exit: 1; signal: none; 2026-10-23T18:34:23.766Z → 2026-10-23T18:34:23.786Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-36
```
Exit: 1; signal: none; 2026-10-23T18:34:23.786Z → 2026-10-23T18:34:23.805Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-37
```
Exit: 1; signal: none; 2026-10-23T18:34:23.805Z → 2026-10-23T18:34:23.826Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-38
```
Exit: 1; signal: none; 2026-10-23T18:34:23.826Z → 2026-10-23T18:34:23.847Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-39
```
Exit: 1; signal: none; 2026-10-23T18:34:23.847Z → 2026-10-23T18:34:23.866Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-40
```
Exit: 1; signal: none; 2026-10-23T18:34:23.866Z → 2026-10-23T18:34:23.887Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-41
```
Exit: 1; signal: none; 2026-10-23T18:34:23.887Z → 2026-10-23T18:34:23.907Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-42
```
Exit: 1; signal: none; 2026-10-23T18:34:23.907Z → 2026-10-23T18:34:23.927Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-43
```
Exit: 1; signal: none; 2026-10-23T18:34:23.927Z → 2026-10-23T18:34:23.948Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-44
```
Exit: 1; signal: none; 2026-10-23T18:34:23.948Z → 2026-10-23T18:34:23.967Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-45
```
Exit: 1; signal: none; 2026-10-23T18:34:23.967Z → 2026-10-23T18:34:23.987Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-46
```
Exit: 1; signal: none; 2026-10-23T18:34:23.987Z → 2026-10-23T18:34:24.006Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-47
```
Exit: 1; signal: none; 2026-10-23T18:34:24.006Z → 2026-10-23T18:34:24.025Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-48
```
Exit: 1; signal: none; 2026-10-23T18:34:24.025Z → 2026-10-23T18:34:24.045Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-49
```
Exit: 1; signal: none; 2026-10-23T18:34:24.045Z → 2026-10-23T18:34:24.067Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-50
```
Exit: 1; signal: none; 2026-10-23T18:34:24.067Z → 2026-10-23T18:34:24.090Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-application
```
Exit: 1; signal: none; 2026-10-23T18:34:24.090Z → 2026-10-23T18:34:24.113Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-job-52
```
Exit: 1; signal: none; 2026-10-23T18:34:24.113Z → 2026-10-23T18:34:24.139Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792779595462-fe382964-net
```
Exit: 0; signal: none; 2026-10-23T18:34:24.139Z → 2026-10-23T18:34:24.152Z

```sh
docker network rm sam-verify-1792779595462-fe382964-net
```
Exit: 0; signal: none; 2026-10-23T18:34:24.152Z → 2026-10-23T18:34:24.196Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
