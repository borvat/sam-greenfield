# Independent SAM verification

Status: **PASS**
Source: `4ef0b1d682a032f47c46d5f8bef9a547824379e0` (clean: true)
Started: 2026-10-23T06:15:32.506Z; completed: 2026-10-23T06:28:31.989Z

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
- clean-application: `sam-verification:sam-verify-1792736132505-b9feda43`; ID `sha256:5d6aa5a2528b9addb692577127edbdad362ddb3f19a00ec854aa4ff080ead4b9`

## Commands and suite outcomes

### preflight — PASS

2026-10-23T06:15:32.512Z → 2026-10-23T06:15:32.796Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T06:15:32.516Z → 2026-10-23T06:15:32.524Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T06:15:32.524Z → 2026-10-23T06:15:32.526Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T06:15:32.526Z → 2026-10-23T06:15:32.532Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T06:15:32.532Z → 2026-10-23T06:15:32.546Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T06:15:32.546Z → 2026-10-23T06:15:32.577Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T06:15:32.578Z → 2026-10-23T06:15:32.646Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T06:15:32.646Z → 2026-10-23T06:15:32.720Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T06:15:32.720Z → 2026-10-23T06:15:32.781Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T06:15:32.781Z → 2026-10-23T06:15:32.784Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T06:15:32.784Z → 2026-10-23T06:15:32.794Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T06:15:32.794Z → 2026-10-23T06:15:32.796Z


### snapshot — PASS

2026-10-23T06:15:32.797Z → 2026-10-23T06:15:32.867Z

```sh
git archive --format=tar --output /tmp/sam-verify-hChKaA/source.tar 4ef0b1d682a032f47c46d5f8bef9a547824379e0
```
Exit: 0; signal: none; 2026-10-23T06:15:32.798Z → 2026-10-23T06:15:32.828Z

```sh
tar -xf /tmp/sam-verify-hChKaA/source.tar -C /tmp/sam-verify-hChKaA/source
```
Exit: 0; signal: none; 2026-10-23T06:15:32.828Z → 2026-10-23T06:15:32.838Z


### images — PASS

2026-10-23T06:15:32.868Z → 2026-10-23T06:15:32.986Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T06:15:32.869Z → 2026-10-23T06:15:32.883Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T06:15:32.883Z → 2026-10-23T06:15:32.897Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T06:15:32.897Z → 2026-10-23T06:15:32.913Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T06:15:32.913Z → 2026-10-23T06:15:32.934Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T06:15:32.934Z → 2026-10-23T06:15:32.947Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T06:15:32.947Z → 2026-10-23T06:15:32.961Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T06:15:32.961Z → 2026-10-23T06:15:32.974Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T06:15:32.974Z → 2026-10-23T06:15:32.986Z


### isolated-postgres — PASS

2026-10-23T06:15:32.987Z → 2026-10-23T06:15:35.836Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792736132505-b9feda43 sam-verify-1792736132505-b9feda43-net
```
Exit: 0; signal: none; 2026-10-23T06:15:32.988Z → 2026-10-23T06:15:33.021Z

```sh
docker run --detach --name sam-verify-1792736132505-b9feda43-pg --label sam.verification.run=sam-verify-1792736132505-b9feda43 --network sam-verify-1792736132505-b9feda43-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T06:15:33.021Z → 2026-10-23T06:15:34.182Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792736132505-b9feda43-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T06:15:34.183Z → 2026-10-23T06:15:34.273Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792736132505-b9feda43-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T06:15:34.774Z → 2026-10-23T06:15:34.867Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792736132505-b9feda43-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T06:15:35.368Z → 2026-10-23T06:15:35.467Z

```sh
docker exec sam-verify-1792736132505-b9feda43-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T06:15:35.467Z → 2026-10-23T06:15:35.597Z

```sh
docker exec sam-verify-1792736132505-b9feda43-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T06:15:35.597Z → 2026-10-23T06:15:35.713Z

```sh
docker exec sam-verify-1792736132505-b9feda43-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T06:15:35.713Z → 2026-10-23T06:15:35.836Z


### node-dependencies — PASS

2026-10-23T06:15:35.843Z → 2026-10-23T06:15:43.489Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-1 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T06:15:35.844Z → 2026-10-23T06:15:43.489Z


### python-dependencies — PASS

2026-10-23T06:15:43.491Z → 2026-10-23T06:15:46.880Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-2 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-hChKaA/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T06:15:43.492Z → 2026-10-23T06:15:46.880Z


### runtime-versions — PASS

2026-10-23T06:15:46.884Z → 2026-10-23T06:16:20.514Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-3 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T06:15:46.885Z → 2026-10-23T06:15:58.265Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-4 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T06:15:58.265Z → 2026-10-23T06:16:08.636Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-5 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T06:16:08.636Z → 2026-10-23T06:16:18.792Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-6 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T06:16:18.792Z → 2026-10-23T06:16:20.416Z

```sh
docker exec sam-verify-1792736132505-b9feda43-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T06:16:20.416Z → 2026-10-23T06:16:20.514Z


### workflow-tool — PASS

2026-10-23T06:16:20.516Z → 2026-10-23T06:16:21.105Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-hChKaA/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T06:16:20.518Z → 2026-10-23T06:16:21.057Z

```sh
tar -xzf /tmp/sam-verify-hChKaA/actionlint.tar.gz -C /tmp/sam-verify-hChKaA actionlint
```
Exit: 0; signal: none; 2026-10-23T06:16:21.059Z → 2026-10-23T06:16:21.101Z

```sh
/tmp/sam-verify-hChKaA/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T06:16:21.101Z → 2026-10-23T06:16:21.105Z


### workflow-validation — PASS

2026-10-23T06:16:21.107Z → 2026-10-23T06:16:21.113Z

```sh
/tmp/sam-verify-hChKaA/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T06:16:21.109Z → 2026-10-23T06:16:21.113Z


### configuration-validation — PASS

2026-10-23T06:16:21.114Z → 2026-10-23T06:16:58.735Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T06:16:21.116Z → 2026-10-23T06:16:21.365Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:16:21.365Z → 2026-10-23T06:16:21.445Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:16:21.445Z → 2026-10-23T06:16:21.536Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:16:21.536Z → 2026-10-23T06:16:21.613Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:16:21.613Z → 2026-10-23T06:16:21.681Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-7 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T06:16:21.681Z → 2026-10-23T06:16:34.778Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-8 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T06:16:34.778Z → 2026-10-23T06:16:45.160Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-9 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T06:16:45.160Z → 2026-10-23T06:16:58.735Z


### typecheck — PASS

2026-10-23T06:16:58.737Z → 2026-10-23T06:17:15.977Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-10 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T06:16:58.738Z → 2026-10-23T06:17:15.977Z


### regression — PASS

2026-10-23T06:17:15.979Z → 2026-10-23T06:18:03.104Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-11 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T06:17:15.980Z → 2026-10-23T06:18:03.103Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T06:17:31.065Z → 2026-10-23T06:17:31.648Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T06:17:31.669Z → 2026-10-23T06:17:32.129Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T06:17:32.146Z → 2026-10-23T06:17:32.629Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T06:17:32.652Z → 2026-10-23T06:17:33.150Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T06:17:33.167Z → 2026-10-23T06:17:33.617Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T06:17:33.639Z → 2026-10-23T06:17:34.100Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T06:17:34.117Z → 2026-10-23T06:17:34.787Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T06:17:34.809Z → 2026-10-23T06:17:35.466Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T06:17:35.483Z → 2026-10-23T06:17:36.072Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T06:17:36.093Z → 2026-10-23T06:17:36.593Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T06:17:36.610Z → 2026-10-23T06:17:37.096Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T06:17:37.113Z → 2026-10-23T06:17:37.447Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T06:17:37.467Z → 2026-10-23T06:17:38.090Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T06:17:38.110Z → 2026-10-23T06:17:38.593Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T06:17:38.613Z → 2026-10-23T06:17:39.006Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T06:17:39.023Z → 2026-10-23T06:17:39.548Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T06:17:39.567Z → 2026-10-23T06:17:40.049Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T06:17:40.067Z → 2026-10-23T06:17:40.529Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T06:17:40.547Z → 2026-10-23T06:17:41.025Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T06:17:41.044Z → 2026-10-23T06:17:41.473Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T06:17:41.503Z → 2026-10-23T06:17:41.936Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T06:17:41.956Z → 2026-10-23T06:17:42.305Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T06:17:42.329Z → 2026-10-23T06:17:42.868Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T06:17:42.888Z → 2026-10-23T06:17:44.464Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T06:17:44.488Z → 2026-10-23T06:17:45.130Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T06:17:45.151Z → 2026-10-23T06:17:45.606Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T06:17:45.628Z → 2026-10-23T06:17:46.340Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T06:17:46.363Z → 2026-10-23T06:17:47.317Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T06:17:47.339Z → 2026-10-23T06:17:47.997Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T06:17:48.021Z → 2026-10-23T06:17:48.526Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T06:17:48.551Z → 2026-10-23T06:17:49.417Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T06:17:49.437Z → 2026-10-23T06:17:49.983Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T06:17:50.003Z → 2026-10-23T06:17:50.488Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T06:17:50.507Z → 2026-10-23T06:17:51.018Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T06:17:51.038Z → 2026-10-23T06:17:51.560Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T06:17:51.578Z → 2026-10-23T06:17:52.299Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T06:17:52.321Z → 2026-10-23T06:17:52.862Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T06:17:52.881Z → 2026-10-23T06:17:53.427Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T06:17:53.447Z → 2026-10-23T06:17:53.973Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T06:17:53.992Z → 2026-10-23T06:17:54.510Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T06:17:54.531Z → 2026-10-23T06:17:55.607Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T06:17:55.627Z → 2026-10-23T06:17:56.054Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T06:17:56.074Z → 2026-10-23T06:17:57.593Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T06:17:57.611Z → 2026-10-23T06:17:58.144Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T06:17:58.165Z → 2026-10-23T06:17:58.811Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T06:17:58.830Z → 2026-10-23T06:17:59.308Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T06:17:59.332Z → 2026-10-23T06:18:00.484Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T06:18:00.503Z → 2026-10-23T06:18:01.294Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T06:18:01.328Z → 2026-10-23T06:18:02.223Z

### core-reliability — PASS

2026-10-23T06:18:03.106Z → 2026-10-23T06:18:34.998Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-12 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T06:18:03.108Z → 2026-10-23T06:18:34.998Z

- tests/core/reliability.ts: PASS; 2026-10-23T06:18:14.659Z → 2026-10-23T06:18:20.001Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T06:18:20.027Z → 2026-10-23T06:18:20.670Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T06:18:20.688Z → 2026-10-23T06:18:21.213Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T06:18:21.232Z → 2026-10-23T06:18:21.837Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T06:18:21.857Z → 2026-10-23T06:18:23.701Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T06:18:23.724Z → 2026-10-23T06:18:24.241Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T06:18:24.263Z → 2026-10-23T06:18:26.238Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T06:18:26.272Z → 2026-10-23T06:18:27.002Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T06:18:27.027Z → 2026-10-23T06:18:28.903Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T06:18:28.931Z → 2026-10-23T06:18:33.994Z

### provider-auth — PASS

2026-10-23T06:18:35.000Z → 2026-10-23T06:18:47.793Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-13 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T06:18:35.002Z → 2026-10-23T06:18:47.792Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T06:18:46.484Z → 2026-10-23T06:18:46.919Z

### postgres-tls — PASS

2026-10-23T06:18:47.795Z → 2026-10-23T06:19:00.545Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-14 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T06:18:47.796Z → 2026-10-23T06:19:00.544Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T06:18:58.979Z → 2026-10-23T06:18:59.732Z

### contracts — PASS

2026-10-23T06:19:00.547Z → 2026-10-23T06:19:11.524Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-15 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T06:19:00.548Z → 2026-10-23T06:19:11.524Z

- tests/release/contracts.ts: PASS; 2026-10-23T06:19:10.056Z → 2026-10-23T06:19:10.729Z

### synthetic-pilot — PASS

2026-10-23T06:19:11.526Z → 2026-10-23T06:19:22.338Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-16 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T06:19:11.528Z → 2026-10-23T06:19:22.337Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T06:19:20.852Z → 2026-10-23T06:19:21.565Z

### managed-schema — PASS

2026-10-23T06:19:22.340Z → 2026-10-23T06:19:33.268Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-17 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T06:19:22.343Z → 2026-10-23T06:19:33.268Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T06:19:32.225Z → 2026-10-23T06:19:32.480Z

### local-bundle — PASS

2026-10-23T06:19:33.271Z → 2026-10-23T06:19:43.943Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-18 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T06:19:33.272Z → 2026-10-23T06:19:43.942Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T06:19:42.713Z → 2026-10-23T06:19:43.124Z

### closed-setup — PASS

2026-10-23T06:19:43.945Z → 2026-10-23T06:19:56.731Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-19 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T06:19:43.946Z → 2026-10-23T06:19:56.731Z

- tests/release/setup.ts: PASS; 2026-10-23T06:19:54.893Z → 2026-10-23T06:19:55.755Z

### database-contract — PASS

2026-10-23T06:19:56.735Z → 2026-10-23T06:20:07.750Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-20 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T06:19:56.740Z → 2026-10-23T06:20:07.750Z

- tests/release/database_check.ts: PASS; 2026-10-23T06:20:06.626Z → 2026-10-23T06:20:06.963Z

### prelaunch-gate — PASS

2026-10-23T06:20:07.752Z → 2026-10-23T06:20:18.420Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-21 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T06:20:07.754Z → 2026-10-23T06:20:18.420Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T06:20:17.226Z → 2026-10-23T06:20:17.563Z

### service-provisioning — PASS

2026-10-23T06:20:18.423Z → 2026-10-23T06:20:30.832Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-22 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T06:20:18.424Z → 2026-10-23T06:20:30.832Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T06:20:27.239Z → 2026-10-23T06:20:29.997Z

### operator-provisioning — PASS

2026-10-23T06:20:30.834Z → 2026-10-23T06:20:47.315Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-23 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T06:20:30.836Z → 2026-10-23T06:20:47.315Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T06:20:40.873Z → 2026-10-23T06:20:46.514Z

### provisioning-backup-recovery — PASS

2026-10-23T06:20:47.317Z → 2026-10-23T06:20:51.016Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792736132505-b9feda43-pg sam-verify-1792736132505-b9feda43
```
Exit: 0; signal: none; 2026-10-23T06:20:47.319Z → 2026-10-23T06:20:51.016Z


### render-migration-compatibility — PASS

2026-10-23T06:20:51.018Z → 2026-10-23T06:21:03.319Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-24 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T06:20:51.020Z → 2026-10-23T06:21:03.319Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T06:21:01.427Z → 2026-10-23T06:21:02.632Z

### render-google-oauth-contracts — PASS

2026-10-23T06:21:03.321Z → 2026-10-23T06:21:21.180Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-25 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-23T06:21:03.324Z → 2026-10-23T06:21:21.180Z


### integration-migrations — PASS

2026-10-23T06:21:21.184Z → 2026-10-23T06:21:34.796Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-26 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-23T06:21:21.185Z → 2026-10-23T06:21:34.796Z

- tests/integration/migrations.ts: PASS; 2026-10-23T06:21:32.658Z → 2026-10-23T06:21:34.038Z

### integration-oauth-mcp — PASS

2026-10-23T06:21:34.800Z → 2026-10-23T06:21:45.793Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-27 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-23T06:21:34.801Z → 2026-10-23T06:21:45.793Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-23T06:21:44.352Z → 2026-10-23T06:21:44.977Z

### integration-orchestration — PASS

2026-10-23T06:21:45.796Z → 2026-10-23T06:22:03.707Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-28 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T06:21:45.799Z → 2026-10-23T06:22:03.706Z

- tests/integration/orchestration.ts: PASS; 2026-10-23T06:21:55.833Z → 2026-10-23T06:22:02.889Z

### specialist-reasoning — PASS

2026-10-23T06:22:03.709Z → 2026-10-23T06:23:25.304Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-29 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-23T06:22:03.712Z → 2026-10-23T06:23:25.304Z

- tests/specialists/acceptance.ts: PASS; 2026-10-23T06:22:14.003Z → 2026-10-23T06:23:24.323Z

### specialist-gateway — PASS

2026-10-23T06:23:25.311Z → 2026-10-23T06:23:34.554Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-30 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-23T06:23:25.313Z → 2026-10-23T06:23:34.554Z

- tests/specialists/gateway.ts: PASS; 2026-10-23T06:23:33.124Z → 2026-10-23T06:23:33.707Z

### specialist-provenance — PASS

2026-10-23T06:23:34.558Z → 2026-10-23T06:23:42.785Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-31 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-23T06:23:34.561Z → 2026-10-23T06:23:42.785Z

- tests/specialists/provenance.ts: PASS; 2026-10-23T06:23:41.494Z → 2026-10-23T06:23:41.939Z

### specialist-learning-fairness — PASS

2026-10-23T06:23:42.787Z → 2026-10-23T06:23:54.466Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-32 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-23T06:23:42.790Z → 2026-10-23T06:23:54.465Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-23T06:23:52.487Z → 2026-10-23T06:23:53.625Z

### specialist-evaluation — PASS

2026-10-23T06:23:54.469Z → 2026-10-23T06:24:00.970Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-33 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-23T06:23:54.472Z → 2026-10-23T06:24:00.970Z


### evaluation-budget — PASS

2026-10-23T06:24:00.973Z → 2026-10-23T06:24:14.681Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-34 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 --mount type=bind,source=/tmp/sam-citation-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-23T06:24:00.975Z → 2026-10-23T06:24:14.681Z

- tests/evaluation/budgets.ts: PASS; 2026-10-23T06:24:09.719Z → 2026-10-23T06:24:13.749Z

### evaluation-adapter — PASS

2026-10-23T06:24:14.684Z → 2026-10-23T06:24:24.852Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-35 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-23T06:24:14.687Z → 2026-10-23T06:24:24.852Z

- tests/evaluation/adapters.ts: PASS; 2026-10-23T06:24:23.380Z → 2026-10-23T06:24:24.003Z

### evaluation-orchestration — PASS

2026-10-23T06:24:24.855Z → 2026-10-23T06:24:58.583Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-36 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 --mount type=bind,source=/tmp/sam-citation-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T06:24:24.858Z → 2026-10-23T06:24:58.583Z

- tests/evaluation/orchestration.ts: PASS; 2026-10-23T06:24:32.874Z → 2026-10-23T06:24:57.573Z

### evaluation-independent-review — PASS

2026-10-23T06:24:58.587Z → 2026-10-23T06:25:06.904Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-37 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-23T06:24:58.589Z → 2026-10-23T06:25:06.904Z

- tests/evaluation/review.ts: PASS; 2026-10-23T06:25:04.832Z → 2026-10-23T06:25:05.864Z

### evaluation-commercial-market — PASS

2026-10-23T06:25:06.908Z → 2026-10-23T06:25:41.664Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-38 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 --mount type=bind,source=/tmp/sam-citation-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-23T06:25:06.912Z → 2026-10-23T06:25:41.663Z

- tests/evaluation/market.ts: PASS; 2026-10-23T06:25:14.529Z → 2026-10-23T06:25:40.728Z

### evaluation-commercial-profitability — PASS

2026-10-23T06:25:41.669Z → 2026-10-23T06:26:18.917Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-39 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 --mount type=bind,source=/tmp/sam-citation-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-23T06:25:41.672Z → 2026-10-23T06:26:18.917Z

- tests/evaluation/profitability.ts: PASS; 2026-10-23T06:25:49.144Z → 2026-10-23T06:26:18.011Z

### evaluation-commercial-suppliers — PASS

2026-10-23T06:26:18.923Z → 2026-10-23T06:26:58.223Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-40 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 --mount type=bind,source=/tmp/sam-citation-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-23T06:26:18.929Z → 2026-10-23T06:26:58.222Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-23T06:26:26.985Z → 2026-10-23T06:26:57.171Z

### migration-upgrade-rollback — PASS

2026-10-23T06:26:58.230Z → 2026-10-23T06:27:09.923Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-41 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-23T06:26:58.234Z → 2026-10-23T06:27:09.923Z


### specialist-restart-prepare — PASS

2026-10-23T06:27:09.929Z → 2026-10-23T06:27:21.772Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-42 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T06:27:09.934Z → 2026-10-23T06:27:21.772Z


### evaluation-restart-prepare — PASS

2026-10-23T06:27:21.779Z → 2026-10-23T06:27:32.760Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-43 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=4ef0b1d682a032f47c46d5f8bef9a547824379e0 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T06:27:21.785Z → 2026-10-23T06:27:32.760Z


### postgres-restart — PASS

2026-10-23T06:27:32.767Z → 2026-10-23T06:27:33.183Z

```sh
docker restart --time 10 sam-verify-1792736132505-b9feda43-pg
```
Exit: 0; signal: none; 2026-10-23T06:27:32.772Z → 2026-10-23T06:27:33.075Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792736132505-b9feda43-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T06:27:33.075Z → 2026-10-23T06:27:33.183Z


### migration-after-restart — PASS

2026-10-23T06:27:33.189Z → 2026-10-23T06:27:43.919Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-44 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-23T06:27:33.194Z → 2026-10-23T06:27:43.919Z


### specialist-restart-check — PASS

2026-10-23T06:27:43.926Z → 2026-10-23T06:27:54.009Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-45 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T06:27:43.932Z → 2026-10-23T06:27:54.009Z


### evaluation-restart-check — PASS

2026-10-23T06:27:54.015Z → 2026-10-23T06:28:05.581Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-46 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T06:27:54.022Z → 2026-10-23T06:28:05.581Z


### phase0-migrations — PASS

2026-10-23T06:28:05.587Z → 2026-10-23T06:28:06.606Z

```sh
docker cp /tmp/sam-verify-hChKaA/source/packages/db/migrations sam-verify-1792736132505-b9feda43-pg:/migrations
```
Exit: 0; signal: none; 2026-10-23T06:28:05.595Z → 2026-10-23T06:28:05.622Z

```sh
docker exec sam-verify-1792736132505-b9feda43-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-23T06:28:05.622Z → 2026-10-23T06:28:06.504Z

```sh
docker exec sam-verify-1792736132505-b9feda43-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-23T06:28:06.504Z → 2026-10-23T06:28:06.606Z


### phase0-acceptance — PASS

2026-10-23T06:28:06.627Z → 2026-10-23T06:28:08.938Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-47 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-hChKaA/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-23T06:28:06.637Z → 2026-10-23T06:28:08.938Z


### phase0-postgres — PASS

2026-10-23T06:28:08.944Z → 2026-10-23T06:28:11.547Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-48 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-hChKaA/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-23T06:28:08.949Z → 2026-10-23T06:28:11.547Z


### tenant-isolation — PASS

2026-10-23T06:28:11.553Z → 2026-10-23T06:28:13.460Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-49 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-hChKaA/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-23T06:28:11.560Z → 2026-10-23T06:28:13.460Z


### fail-closed-security — PASS

2026-10-23T06:28:13.469Z → 2026-10-23T06:28:15.227Z

```sh
docker run --rm --name sam-verify-1792736132505-b9feda43-job-50 --label sam.verification.run=sam-verify-1792736132505-b9feda43 --init --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-hChKaA/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-23T06:28:13.477Z → 2026-10-23T06:28:15.227Z


### clean-image — PASS

2026-10-23T06:28:15.234Z → 2026-10-23T06:28:24.056Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792736132505-b9feda43 Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-23T06:28:15.238Z → 2026-10-23T06:28:24.056Z


### image-contract — PASS

2026-10-23T06:28:24.063Z → 2026-10-23T06:28:24.088Z

```sh
docker image inspect sam-verification:sam-verify-1792736132505-b9feda43
```
Exit: 0; signal: none; 2026-10-23T06:28:24.072Z → 2026-10-23T06:28:24.088Z


### application-startup-restart — PASS

2026-10-23T06:28:24.094Z → 2026-10-23T06:28:30.074Z

```sh
docker run --rm --init --name sam-verify-1792736132505-b9feda43-application --label sam.verification.run=sam-verify-1792736132505-b9feda43 --network container:sam-verify-1792736132505-b9feda43-pg --mount type=bind,src=/tmp/sam-verify-hChKaA/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792736132505-b9feda43 node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-23T06:28:24.098Z → 2026-10-23T06:28:30.074Z


### source-integrity — PASS

2026-10-23T06:28:30.088Z → 2026-10-23T06:28:30.105Z


### cleanup — PASS

2026-10-23T06:28:30.110Z → 2026-10-23T06:28:31.982Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-pg
```
Exit: 0; signal: none; 2026-10-23T06:28:30.115Z → 2026-10-23T06:28:30.132Z

```sh
docker rm --force --volumes sam-verify-1792736132505-b9feda43-pg
```
Exit: 0; signal: none; 2026-10-23T06:28:30.132Z → 2026-10-23T06:28:30.690Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-1
```
Exit: 1; signal: none; 2026-10-23T06:28:30.690Z → 2026-10-23T06:28:30.715Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-2
```
Exit: 1; signal: none; 2026-10-23T06:28:30.715Z → 2026-10-23T06:28:30.739Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-3
```
Exit: 1; signal: none; 2026-10-23T06:28:30.739Z → 2026-10-23T06:28:30.762Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-4
```
Exit: 1; signal: none; 2026-10-23T06:28:30.763Z → 2026-10-23T06:28:30.785Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-5
```
Exit: 1; signal: none; 2026-10-23T06:28:30.785Z → 2026-10-23T06:28:30.810Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-6
```
Exit: 1; signal: none; 2026-10-23T06:28:30.810Z → 2026-10-23T06:28:30.837Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-7
```
Exit: 1; signal: none; 2026-10-23T06:28:30.837Z → 2026-10-23T06:28:30.861Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-8
```
Exit: 1; signal: none; 2026-10-23T06:28:30.861Z → 2026-10-23T06:28:30.882Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-9
```
Exit: 1; signal: none; 2026-10-23T06:28:30.882Z → 2026-10-23T06:28:30.902Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-10
```
Exit: 1; signal: none; 2026-10-23T06:28:30.902Z → 2026-10-23T06:28:30.930Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-11
```
Exit: 1; signal: none; 2026-10-23T06:28:30.930Z → 2026-10-23T06:28:30.951Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-12
```
Exit: 1; signal: none; 2026-10-23T06:28:30.951Z → 2026-10-23T06:28:30.980Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-13
```
Exit: 1; signal: none; 2026-10-23T06:28:30.980Z → 2026-10-23T06:28:31.026Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-14
```
Exit: 1; signal: none; 2026-10-23T06:28:31.026Z → 2026-10-23T06:28:31.049Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-15
```
Exit: 1; signal: none; 2026-10-23T06:28:31.049Z → 2026-10-23T06:28:31.078Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-16
```
Exit: 1; signal: none; 2026-10-23T06:28:31.078Z → 2026-10-23T06:28:31.102Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-17
```
Exit: 1; signal: none; 2026-10-23T06:28:31.102Z → 2026-10-23T06:28:31.123Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-18
```
Exit: 1; signal: none; 2026-10-23T06:28:31.123Z → 2026-10-23T06:28:31.144Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-19
```
Exit: 1; signal: none; 2026-10-23T06:28:31.144Z → 2026-10-23T06:28:31.168Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-20
```
Exit: 1; signal: none; 2026-10-23T06:28:31.169Z → 2026-10-23T06:28:31.190Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-21
```
Exit: 1; signal: none; 2026-10-23T06:28:31.190Z → 2026-10-23T06:28:31.211Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-22
```
Exit: 1; signal: none; 2026-10-23T06:28:31.212Z → 2026-10-23T06:28:31.238Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-23
```
Exit: 1; signal: none; 2026-10-23T06:28:31.238Z → 2026-10-23T06:28:31.261Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-24
```
Exit: 1; signal: none; 2026-10-23T06:28:31.261Z → 2026-10-23T06:28:31.283Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-25
```
Exit: 1; signal: none; 2026-10-23T06:28:31.283Z → 2026-10-23T06:28:31.305Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-26
```
Exit: 1; signal: none; 2026-10-23T06:28:31.305Z → 2026-10-23T06:28:31.329Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-27
```
Exit: 1; signal: none; 2026-10-23T06:28:31.329Z → 2026-10-23T06:28:31.350Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-28
```
Exit: 1; signal: none; 2026-10-23T06:28:31.350Z → 2026-10-23T06:28:31.371Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-29
```
Exit: 1; signal: none; 2026-10-23T06:28:31.371Z → 2026-10-23T06:28:31.395Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-30
```
Exit: 1; signal: none; 2026-10-23T06:28:31.395Z → 2026-10-23T06:28:31.419Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-31
```
Exit: 1; signal: none; 2026-10-23T06:28:31.419Z → 2026-10-23T06:28:31.441Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-32
```
Exit: 1; signal: none; 2026-10-23T06:28:31.441Z → 2026-10-23T06:28:31.466Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-33
```
Exit: 1; signal: none; 2026-10-23T06:28:31.466Z → 2026-10-23T06:28:31.489Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-34
```
Exit: 1; signal: none; 2026-10-23T06:28:31.489Z → 2026-10-23T06:28:31.514Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-35
```
Exit: 1; signal: none; 2026-10-23T06:28:31.514Z → 2026-10-23T06:28:31.540Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-36
```
Exit: 1; signal: none; 2026-10-23T06:28:31.540Z → 2026-10-23T06:28:31.565Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-37
```
Exit: 1; signal: none; 2026-10-23T06:28:31.565Z → 2026-10-23T06:28:31.587Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-38
```
Exit: 1; signal: none; 2026-10-23T06:28:31.587Z → 2026-10-23T06:28:31.611Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-39
```
Exit: 1; signal: none; 2026-10-23T06:28:31.611Z → 2026-10-23T06:28:31.633Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-40
```
Exit: 1; signal: none; 2026-10-23T06:28:31.633Z → 2026-10-23T06:28:31.653Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-41
```
Exit: 1; signal: none; 2026-10-23T06:28:31.653Z → 2026-10-23T06:28:31.678Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-42
```
Exit: 1; signal: none; 2026-10-23T06:28:31.678Z → 2026-10-23T06:28:31.700Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-43
```
Exit: 1; signal: none; 2026-10-23T06:28:31.700Z → 2026-10-23T06:28:31.723Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-44
```
Exit: 1; signal: none; 2026-10-23T06:28:31.723Z → 2026-10-23T06:28:31.746Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-45
```
Exit: 1; signal: none; 2026-10-23T06:28:31.746Z → 2026-10-23T06:28:31.771Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-46
```
Exit: 1; signal: none; 2026-10-23T06:28:31.771Z → 2026-10-23T06:28:31.794Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-47
```
Exit: 1; signal: none; 2026-10-23T06:28:31.794Z → 2026-10-23T06:28:31.817Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-48
```
Exit: 1; signal: none; 2026-10-23T06:28:31.817Z → 2026-10-23T06:28:31.838Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-49
```
Exit: 1; signal: none; 2026-10-23T06:28:31.838Z → 2026-10-23T06:28:31.858Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-job-50
```
Exit: 1; signal: none; 2026-10-23T06:28:31.858Z → 2026-10-23T06:28:31.879Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-application
```
Exit: 1; signal: none; 2026-10-23T06:28:31.879Z → 2026-10-23T06:28:31.902Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792736132505-b9feda43-net
```
Exit: 0; signal: none; 2026-10-23T06:28:31.902Z → 2026-10-23T06:28:31.914Z

```sh
docker network rm sam-verify-1792736132505-b9feda43-net
```
Exit: 0; signal: none; 2026-10-23T06:28:31.914Z → 2026-10-23T06:28:31.956Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
