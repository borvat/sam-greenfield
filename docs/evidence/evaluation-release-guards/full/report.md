# Independent SAM verification

Status: **PASS**
Source: `f9c74cc7d76c5b0888259a09343ca064ddc4a68f` (clean: true)
Started: 2026-10-23T09:05:30.132Z; completed: 2026-10-23T09:18:17.212Z

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
- clean-application: `sam-verification:sam-verify-1792746330132-460b60ae`; ID `sha256:ae47fc0335cc377fd0254685700f9ed5ea81854438a4c47d4d0201c09ee0b85d`

## Commands and suite outcomes

### preflight — PASS

2026-10-23T09:05:30.133Z → 2026-10-23T09:05:30.383Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T09:05:30.137Z → 2026-10-23T09:05:30.142Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T09:05:30.142Z → 2026-10-23T09:05:30.146Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T09:05:30.146Z → 2026-10-23T09:05:30.152Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T09:05:30.152Z → 2026-10-23T09:05:30.165Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T09:05:30.165Z → 2026-10-23T09:05:30.186Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T09:05:30.186Z → 2026-10-23T09:05:30.251Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T09:05:30.251Z → 2026-10-23T09:05:30.321Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T09:05:30.321Z → 2026-10-23T09:05:30.369Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T09:05:30.369Z → 2026-10-23T09:05:30.372Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T09:05:30.372Z → 2026-10-23T09:05:30.381Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T09:05:30.381Z → 2026-10-23T09:05:30.383Z


### snapshot — PASS

2026-10-23T09:05:30.384Z → 2026-10-23T09:05:30.461Z

```sh
git archive --format=tar --output /tmp/sam-verify-ePHJx7/source.tar f9c74cc7d76c5b0888259a09343ca064ddc4a68f
```
Exit: 0; signal: none; 2026-10-23T09:05:30.385Z → 2026-10-23T09:05:30.416Z

```sh
tar -xf /tmp/sam-verify-ePHJx7/source.tar -C /tmp/sam-verify-ePHJx7/source
```
Exit: 0; signal: none; 2026-10-23T09:05:30.416Z → 2026-10-23T09:05:30.429Z


### images — PASS

2026-10-23T09:05:30.462Z → 2026-10-23T09:05:30.580Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T09:05:30.463Z → 2026-10-23T09:05:30.477Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T09:05:30.477Z → 2026-10-23T09:05:30.492Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T09:05:30.492Z → 2026-10-23T09:05:30.505Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T09:05:30.506Z → 2026-10-23T09:05:30.520Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T09:05:30.521Z → 2026-10-23T09:05:30.535Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T09:05:30.536Z → 2026-10-23T09:05:30.553Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T09:05:30.553Z → 2026-10-23T09:05:30.567Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T09:05:30.567Z → 2026-10-23T09:05:30.580Z


### isolated-postgres — PASS

2026-10-23T09:05:30.581Z → 2026-10-23T09:05:33.292Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792746330132-460b60ae sam-verify-1792746330132-460b60ae-net
```
Exit: 0; signal: none; 2026-10-23T09:05:30.581Z → 2026-10-23T09:05:30.611Z

```sh
docker run --detach --name sam-verify-1792746330132-460b60ae-pg --label sam.verification.run=sam-verify-1792746330132-460b60ae --network sam-verify-1792746330132-460b60ae-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T09:05:30.611Z → 2026-10-23T09:05:31.678Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792746330132-460b60ae-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T09:05:31.678Z → 2026-10-23T09:05:31.780Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792746330132-460b60ae-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T09:05:32.282Z → 2026-10-23T09:05:32.377Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792746330132-460b60ae-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T09:05:32.879Z → 2026-10-23T09:05:32.962Z

```sh
docker exec sam-verify-1792746330132-460b60ae-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T09:05:32.962Z → 2026-10-23T09:05:33.073Z

```sh
docker exec sam-verify-1792746330132-460b60ae-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T09:05:33.073Z → 2026-10-23T09:05:33.186Z

```sh
docker exec sam-verify-1792746330132-460b60ae-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T09:05:33.186Z → 2026-10-23T09:05:33.292Z


### node-dependencies — PASS

2026-10-23T09:05:33.297Z → 2026-10-23T09:05:40.675Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-1 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T09:05:33.298Z → 2026-10-23T09:05:40.675Z


### python-dependencies — PASS

2026-10-23T09:05:40.676Z → 2026-10-23T09:05:44.196Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-2 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-ePHJx7/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T09:05:40.677Z → 2026-10-23T09:05:44.196Z


### runtime-versions — PASS

2026-10-23T09:05:44.197Z → 2026-10-23T09:06:12.299Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-3 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T09:05:44.201Z → 2026-10-23T09:05:53.376Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-4 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T09:05:53.376Z → 2026-10-23T09:06:02.086Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-5 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T09:06:02.086Z → 2026-10-23T09:06:10.142Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-6 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T09:06:10.142Z → 2026-10-23T09:06:12.210Z

```sh
docker exec sam-verify-1792746330132-460b60ae-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T09:06:12.210Z → 2026-10-23T09:06:12.299Z


### workflow-tool — PASS

2026-10-23T09:06:12.300Z → 2026-10-23T09:06:12.940Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-ePHJx7/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T09:06:12.302Z → 2026-10-23T09:06:12.892Z

```sh
tar -xzf /tmp/sam-verify-ePHJx7/actionlint.tar.gz -C /tmp/sam-verify-ePHJx7 actionlint
```
Exit: 0; signal: none; 2026-10-23T09:06:12.895Z → 2026-10-23T09:06:12.934Z

```sh
/tmp/sam-verify-ePHJx7/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T09:06:12.934Z → 2026-10-23T09:06:12.940Z


### workflow-validation — PASS

2026-10-23T09:06:12.941Z → 2026-10-23T09:06:12.945Z

```sh
/tmp/sam-verify-ePHJx7/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T09:06:12.942Z → 2026-10-23T09:06:12.945Z


### configuration-validation — PASS

2026-10-23T09:06:12.946Z → 2026-10-23T09:06:44.235Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T09:06:12.947Z → 2026-10-23T09:06:13.167Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T09:06:13.167Z → 2026-10-23T09:06:13.232Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T09:06:13.232Z → 2026-10-23T09:06:13.301Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T09:06:13.301Z → 2026-10-23T09:06:13.372Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T09:06:13.372Z → 2026-10-23T09:06:13.440Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-7 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T09:06:13.441Z → 2026-10-23T09:06:22.033Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-8 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T09:06:22.033Z → 2026-10-23T09:06:33.069Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-9 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T09:06:33.069Z → 2026-10-23T09:06:44.235Z


### typecheck — PASS

2026-10-23T09:06:44.236Z → 2026-10-23T09:06:59.734Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-10 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T09:06:44.237Z → 2026-10-23T09:06:59.734Z


### regression — PASS

2026-10-23T09:06:59.736Z → 2026-10-23T09:07:39.743Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-11 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T09:06:59.737Z → 2026-10-23T09:07:39.742Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T09:07:09.966Z → 2026-10-23T09:07:10.483Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T09:07:10.502Z → 2026-10-23T09:07:10.974Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T09:07:10.991Z → 2026-10-23T09:07:11.470Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T09:07:11.490Z → 2026-10-23T09:07:11.940Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T09:07:11.959Z → 2026-10-23T09:07:12.441Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T09:07:12.464Z → 2026-10-23T09:07:12.833Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T09:07:12.851Z → 2026-10-23T09:07:13.362Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T09:07:13.380Z → 2026-10-23T09:07:13.859Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T09:07:13.878Z → 2026-10-23T09:07:14.392Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T09:07:14.411Z → 2026-10-23T09:07:14.859Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T09:07:14.877Z → 2026-10-23T09:07:15.306Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T09:07:15.324Z → 2026-10-23T09:07:15.685Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T09:07:15.704Z → 2026-10-23T09:07:16.238Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T09:07:16.259Z → 2026-10-23T09:07:16.702Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T09:07:16.721Z → 2026-10-23T09:07:17.138Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T09:07:17.156Z → 2026-10-23T09:07:17.714Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T09:07:17.737Z → 2026-10-23T09:07:18.253Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T09:07:18.276Z → 2026-10-23T09:07:18.747Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T09:07:18.768Z → 2026-10-23T09:07:19.249Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T09:07:19.269Z → 2026-10-23T09:07:19.723Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T09:07:19.743Z → 2026-10-23T09:07:20.187Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T09:07:20.210Z → 2026-10-23T09:07:20.546Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T09:07:20.567Z → 2026-10-23T09:07:21.069Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T09:07:21.088Z → 2026-10-23T09:07:22.738Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T09:07:22.760Z → 2026-10-23T09:07:23.393Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T09:07:23.414Z → 2026-10-23T09:07:23.830Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T09:07:23.848Z → 2026-10-23T09:07:24.470Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T09:07:24.492Z → 2026-10-23T09:07:25.396Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T09:07:25.417Z → 2026-10-23T09:07:25.932Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T09:07:25.955Z → 2026-10-23T09:07:26.411Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T09:07:26.432Z → 2026-10-23T09:07:27.201Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T09:07:27.220Z → 2026-10-23T09:07:27.692Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T09:07:27.711Z → 2026-10-23T09:07:28.144Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T09:07:28.163Z → 2026-10-23T09:07:28.620Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T09:07:28.637Z → 2026-10-23T09:07:29.081Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T09:07:29.108Z → 2026-10-23T09:07:29.708Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T09:07:29.729Z → 2026-10-23T09:07:30.179Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T09:07:30.199Z → 2026-10-23T09:07:30.682Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T09:07:30.702Z → 2026-10-23T09:07:31.192Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T09:07:31.213Z → 2026-10-23T09:07:31.683Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T09:07:31.702Z → 2026-10-23T09:07:32.749Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T09:07:32.768Z → 2026-10-23T09:07:33.138Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T09:07:33.159Z → 2026-10-23T09:07:34.665Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T09:07:34.685Z → 2026-10-23T09:07:35.164Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T09:07:35.188Z → 2026-10-23T09:07:35.795Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T09:07:35.814Z → 2026-10-23T09:07:36.299Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T09:07:36.319Z → 2026-10-23T09:07:37.169Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T09:07:37.193Z → 2026-10-23T09:07:37.939Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T09:07:37.968Z → 2026-10-23T09:07:38.839Z

### core-reliability — PASS

2026-10-23T09:07:39.746Z → 2026-10-23T09:08:15.807Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-12 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T09:07:39.747Z → 2026-10-23T09:08:15.807Z

- tests/core/reliability.ts: PASS; 2026-10-23T09:07:50.093Z → 2026-10-23T09:07:55.476Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T09:07:55.498Z → 2026-10-23T09:07:56.091Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T09:07:56.112Z → 2026-10-23T09:07:56.595Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T09:07:56.614Z → 2026-10-23T09:07:57.122Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T09:07:57.139Z → 2026-10-23T09:07:58.776Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T09:07:58.795Z → 2026-10-23T09:07:59.245Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T09:07:59.264Z → 2026-10-23T09:08:00.881Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T09:08:00.900Z → 2026-10-23T09:08:01.496Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T09:08:01.516Z → 2026-10-23T09:08:02.926Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T09:08:02.944Z → 2026-10-23T09:08:06.825Z
- tests/core/evidenceTransforms.ts: PASS; 2026-10-23T09:08:06.844Z → 2026-10-23T09:08:07.449Z
- tests/core/evidenceIntegration.ts: PASS; 2026-10-23T09:08:07.466Z → 2026-10-23T09:08:14.225Z
- tests/core/sourceContracts.ts: PASS; 2026-10-23T09:08:14.256Z → 2026-10-23T09:08:14.985Z

### provider-auth — PASS

2026-10-23T09:08:15.809Z → 2026-10-23T09:08:26.599Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-13 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T09:08:15.810Z → 2026-10-23T09:08:26.599Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T09:08:25.369Z → 2026-10-23T09:08:25.773Z

### postgres-tls — PASS

2026-10-23T09:08:26.601Z → 2026-10-23T09:08:36.535Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-14 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T09:08:26.602Z → 2026-10-23T09:08:36.535Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T09:08:35.159Z → 2026-10-23T09:08:35.797Z

### contracts — PASS

2026-10-23T09:08:36.537Z → 2026-10-23T09:08:47.336Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-15 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T09:08:36.538Z → 2026-10-23T09:08:47.336Z

- tests/release/contracts.ts: PASS; 2026-10-23T09:08:45.692Z → 2026-10-23T09:08:46.438Z

### synthetic-pilot — PASS

2026-10-23T09:08:47.339Z → 2026-10-23T09:08:58.347Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-16 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T09:08:47.341Z → 2026-10-23T09:08:58.347Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T09:08:56.820Z → 2026-10-23T09:08:57.547Z

### managed-schema — PASS

2026-10-23T09:08:58.350Z → 2026-10-23T09:09:08.317Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-17 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T09:08:58.352Z → 2026-10-23T09:09:08.317Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T09:09:07.317Z → 2026-10-23T09:09:07.565Z

### local-bundle — PASS

2026-10-23T09:09:08.320Z → 2026-10-23T09:09:19.442Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-18 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T09:09:08.322Z → 2026-10-23T09:09:19.442Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T09:09:18.033Z → 2026-10-23T09:09:18.504Z

### closed-setup — PASS

2026-10-23T09:09:19.445Z → 2026-10-23T09:09:31.385Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-19 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T09:09:19.446Z → 2026-10-23T09:09:31.385Z

- tests/release/setup.ts: PASS; 2026-10-23T09:09:29.872Z → 2026-10-23T09:09:30.507Z

### database-contract — PASS

2026-10-23T09:09:31.388Z → 2026-10-23T09:09:42.020Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-20 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T09:09:31.389Z → 2026-10-23T09:09:42.020Z

- tests/release/database_check.ts: PASS; 2026-10-23T09:09:40.860Z → 2026-10-23T09:09:41.218Z

### prelaunch-gate — PASS

2026-10-23T09:09:42.023Z → 2026-10-23T09:09:53.968Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-21 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T09:09:42.024Z → 2026-10-23T09:09:53.968Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T09:09:52.807Z → 2026-10-23T09:09:53.140Z

### service-provisioning — PASS

2026-10-23T09:09:53.970Z → 2026-10-23T09:10:07.737Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-22 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T09:09:53.972Z → 2026-10-23T09:10:07.737Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T09:10:04.168Z → 2026-10-23T09:10:06.937Z

### operator-provisioning — PASS

2026-10-23T09:10:07.739Z → 2026-10-23T09:10:22.474Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-23 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T09:10:07.741Z → 2026-10-23T09:10:22.474Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T09:10:17.818Z → 2026-10-23T09:10:21.613Z

### provisioning-backup-recovery — PASS

2026-10-23T09:10:22.476Z → 2026-10-23T09:10:26.207Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792746330132-460b60ae-pg sam-verify-1792746330132-460b60ae
```
Exit: 0; signal: none; 2026-10-23T09:10:22.479Z → 2026-10-23T09:10:26.207Z


### render-migration-compatibility — PASS

2026-10-23T09:10:26.210Z → 2026-10-23T09:10:38.799Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-24 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T09:10:26.212Z → 2026-10-23T09:10:38.799Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T09:10:36.593Z → 2026-10-23T09:10:37.982Z

### render-google-oauth-contracts — PASS

2026-10-23T09:10:38.802Z → 2026-10-23T09:10:59.577Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-25 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-23T09:10:38.804Z → 2026-10-23T09:10:59.577Z


### integration-migrations — PASS

2026-10-23T09:10:59.579Z → 2026-10-23T09:11:11.064Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-26 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-23T09:10:59.581Z → 2026-10-23T09:11:11.064Z

- tests/integration/migrations.ts: PASS; 2026-10-23T09:11:09.133Z → 2026-10-23T09:11:10.228Z

### integration-oauth-mcp — PASS

2026-10-23T09:11:11.067Z → 2026-10-23T09:11:22.324Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-27 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-23T09:11:11.068Z → 2026-10-23T09:11:22.324Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-23T09:11:20.981Z → 2026-10-23T09:11:21.482Z

### integration-orchestration — PASS

2026-10-23T09:11:22.327Z → 2026-10-23T09:11:39.433Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-28 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T09:11:22.329Z → 2026-10-23T09:11:39.433Z

- tests/integration/orchestration.ts: PASS; 2026-10-23T09:11:31.122Z → 2026-10-23T09:11:38.624Z

### specialist-reasoning — PASS

2026-10-23T09:11:39.436Z → 2026-10-23T09:12:49.446Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-29 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-23T09:11:39.438Z → 2026-10-23T09:12:49.446Z

- tests/specialists/acceptance.ts: PASS; 2026-10-23T09:11:48.786Z → 2026-10-23T09:12:48.515Z

### specialist-gateway — PASS

2026-10-23T09:12:49.449Z → 2026-10-23T09:13:00.049Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-30 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-23T09:12:49.451Z → 2026-10-23T09:13:00.048Z

- tests/specialists/gateway.ts: PASS; 2026-10-23T09:12:58.613Z → 2026-10-23T09:12:59.176Z

### specialist-provenance — PASS

2026-10-23T09:13:00.052Z → 2026-10-23T09:13:11.277Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-31 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-23T09:13:00.054Z → 2026-10-23T09:13:11.276Z

- tests/specialists/provenance.ts: PASS; 2026-10-23T09:13:10.168Z → 2026-10-23T09:13:10.571Z

### specialist-learning-fairness — PASS

2026-10-23T09:13:11.279Z → 2026-10-23T09:13:21.793Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-32 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-23T09:13:11.282Z → 2026-10-23T09:13:21.793Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-23T09:13:20.001Z → 2026-10-23T09:13:20.988Z

### specialist-evaluation — PASS

2026-10-23T09:13:21.796Z → 2026-10-23T09:13:33.365Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-33 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-23T09:13:21.798Z → 2026-10-23T09:13:33.365Z


### evaluation-budget — PASS

2026-10-23T09:13:33.368Z → 2026-10-23T09:14:09.408Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-34 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f --mount type=bind,source=/tmp/sam-evaluation-release-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-23T09:13:33.370Z → 2026-10-23T09:14:09.408Z

- tests/evaluation/budgets.ts: PASS; 2026-10-23T09:13:42.325Z → 2026-10-23T09:14:08.500Z

### evaluation-adapter — PASS

2026-10-23T09:14:09.411Z → 2026-10-23T09:14:20.507Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-35 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-23T09:14:09.413Z → 2026-10-23T09:14:20.506Z

- tests/evaluation/adapters.ts: PASS; 2026-10-23T09:14:19.152Z → 2026-10-23T09:14:19.680Z

### evaluation-orchestration — PASS

2026-10-23T09:14:20.510Z → 2026-10-23T09:14:52.242Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-36 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f --mount type=bind,source=/tmp/sam-evaluation-release-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T09:14:20.511Z → 2026-10-23T09:14:52.242Z

- tests/evaluation/orchestration.ts: PASS; 2026-10-23T09:14:29.311Z → 2026-10-23T09:14:51.383Z

### evaluation-independent-review — PASS

2026-10-23T09:14:52.246Z → 2026-10-23T09:15:02.803Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-37 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-23T09:14:52.250Z → 2026-10-23T09:15:02.803Z

- tests/evaluation/review.ts: PASS; 2026-10-23T09:15:01.298Z → 2026-10-23T09:15:02.022Z

### evaluation-commercial-market — PASS

2026-10-23T09:15:02.807Z → 2026-10-23T09:15:36.490Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-38 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f --mount type=bind,source=/tmp/sam-evaluation-release-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-23T09:15:02.809Z → 2026-10-23T09:15:36.490Z

- tests/evaluation/market.ts: PASS; 2026-10-23T09:15:12.216Z → 2026-10-23T09:15:35.556Z

### evaluation-commercial-profitability — PASS

2026-10-23T09:15:36.496Z → 2026-10-23T09:16:10.981Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-39 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f --mount type=bind,source=/tmp/sam-evaluation-release-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-23T09:15:36.499Z → 2026-10-23T09:16:10.981Z

- tests/evaluation/profitability.ts: PASS; 2026-10-23T09:15:45.616Z → 2026-10-23T09:16:10.086Z

### evaluation-commercial-suppliers — PASS

2026-10-23T09:16:10.987Z → 2026-10-23T09:16:46.972Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-40 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f --mount type=bind,source=/tmp/sam-evaluation-release-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-23T09:16:10.992Z → 2026-10-23T09:16:46.971Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-23T09:16:21.811Z → 2026-10-23T09:16:46.099Z

### migration-upgrade-rollback — PASS

2026-10-23T09:16:46.979Z → 2026-10-23T09:16:58.919Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-41 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-23T09:16:46.984Z → 2026-10-23T09:16:58.919Z


### specialist-restart-prepare — PASS

2026-10-23T09:16:58.925Z → 2026-10-23T09:17:10.304Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-42 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T09:16:58.930Z → 2026-10-23T09:17:10.304Z


### evaluation-restart-prepare — PASS

2026-10-23T09:17:10.312Z → 2026-10-23T09:17:21.000Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-43 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=f9c74cc7d76c5b0888259a09343ca064ddc4a68f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T09:17:10.317Z → 2026-10-23T09:17:21.000Z


### postgres-restart — PASS

2026-10-23T09:17:21.006Z → 2026-10-23T09:17:21.438Z

```sh
docker restart --time 10 sam-verify-1792746330132-460b60ae-pg
```
Exit: 0; signal: none; 2026-10-23T09:17:21.011Z → 2026-10-23T09:17:21.339Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792746330132-460b60ae-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T09:17:21.339Z → 2026-10-23T09:17:21.438Z


### migration-after-restart — PASS

2026-10-23T09:17:21.445Z → 2026-10-23T09:17:33.230Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-44 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-23T09:17:21.450Z → 2026-10-23T09:17:33.230Z


### specialist-restart-check — PASS

2026-10-23T09:17:33.237Z → 2026-10-23T09:17:43.915Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-45 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T09:17:33.243Z → 2026-10-23T09:17:43.915Z


### evaluation-restart-check — PASS

2026-10-23T09:17:43.922Z → 2026-10-23T09:17:55.693Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-46 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T09:17:43.927Z → 2026-10-23T09:17:55.693Z


### phase0-migrations — PASS

2026-10-23T09:17:55.699Z → 2026-10-23T09:17:56.515Z

```sh
docker cp /tmp/sam-verify-ePHJx7/source/packages/db/migrations sam-verify-1792746330132-460b60ae-pg:/migrations
```
Exit: 0; signal: none; 2026-10-23T09:17:55.706Z → 2026-10-23T09:17:55.726Z

```sh
docker exec sam-verify-1792746330132-460b60ae-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-23T09:17:55.726Z → 2026-10-23T09:17:56.431Z

```sh
docker exec sam-verify-1792746330132-460b60ae-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-23T09:17:56.431Z → 2026-10-23T09:17:56.515Z


### phase0-acceptance — PASS

2026-10-23T09:17:56.521Z → 2026-10-23T09:17:58.712Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-47 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-ePHJx7/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-23T09:17:56.526Z → 2026-10-23T09:17:58.712Z


### phase0-postgres — PASS

2026-10-23T09:17:58.719Z → 2026-10-23T09:18:00.474Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-48 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-ePHJx7/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-23T09:17:58.724Z → 2026-10-23T09:18:00.474Z


### tenant-isolation — PASS

2026-10-23T09:18:00.481Z → 2026-10-23T09:18:01.701Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-49 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-ePHJx7/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-23T09:18:00.486Z → 2026-10-23T09:18:01.701Z


### fail-closed-security — PASS

2026-10-23T09:18:01.707Z → 2026-10-23T09:18:03.186Z

```sh
docker run --rm --name sam-verify-1792746330132-460b60ae-job-50 --label sam.verification.run=sam-verify-1792746330132-460b60ae --init --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-ePHJx7/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-23T09:18:01.713Z → 2026-10-23T09:18:03.186Z


### clean-image — PASS

2026-10-23T09:18:03.192Z → 2026-10-23T09:18:10.052Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792746330132-460b60ae Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-23T09:18:03.198Z → 2026-10-23T09:18:10.052Z


### image-contract — PASS

2026-10-23T09:18:10.058Z → 2026-10-23T09:18:10.077Z

```sh
docker image inspect sam-verification:sam-verify-1792746330132-460b60ae
```
Exit: 0; signal: none; 2026-10-23T09:18:10.062Z → 2026-10-23T09:18:10.076Z


### application-startup-restart — PASS

2026-10-23T09:18:10.082Z → 2026-10-23T09:18:15.449Z

```sh
docker run --rm --init --name sam-verify-1792746330132-460b60ae-application --label sam.verification.run=sam-verify-1792746330132-460b60ae --network container:sam-verify-1792746330132-460b60ae-pg --mount type=bind,src=/tmp/sam-verify-ePHJx7/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792746330132-460b60ae node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-23T09:18:10.087Z → 2026-10-23T09:18:15.449Z


### source-integrity — PASS

2026-10-23T09:18:15.457Z → 2026-10-23T09:18:15.472Z


### cleanup — PASS

2026-10-23T09:18:15.477Z → 2026-10-23T09:18:17.206Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-pg
```
Exit: 0; signal: none; 2026-10-23T09:18:15.482Z → 2026-10-23T09:18:15.496Z

```sh
docker rm --force --volumes sam-verify-1792746330132-460b60ae-pg
```
Exit: 0; signal: none; 2026-10-23T09:18:15.496Z → 2026-10-23T09:18:15.940Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-1
```
Exit: 1; signal: none; 2026-10-23T09:18:15.941Z → 2026-10-23T09:18:15.966Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-2
```
Exit: 1; signal: none; 2026-10-23T09:18:15.966Z → 2026-10-23T09:18:15.988Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-3
```
Exit: 1; signal: none; 2026-10-23T09:18:15.988Z → 2026-10-23T09:18:16.007Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-4
```
Exit: 1; signal: none; 2026-10-23T09:18:16.007Z → 2026-10-23T09:18:16.026Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-5
```
Exit: 1; signal: none; 2026-10-23T09:18:16.027Z → 2026-10-23T09:18:16.047Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-6
```
Exit: 1; signal: none; 2026-10-23T09:18:16.047Z → 2026-10-23T09:18:16.069Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-7
```
Exit: 1; signal: none; 2026-10-23T09:18:16.069Z → 2026-10-23T09:18:16.088Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-8
```
Exit: 1; signal: none; 2026-10-23T09:18:16.088Z → 2026-10-23T09:18:16.107Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-9
```
Exit: 1; signal: none; 2026-10-23T09:18:16.107Z → 2026-10-23T09:18:16.130Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-10
```
Exit: 1; signal: none; 2026-10-23T09:18:16.130Z → 2026-10-23T09:18:16.151Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-11
```
Exit: 1; signal: none; 2026-10-23T09:18:16.151Z → 2026-10-23T09:18:16.171Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-12
```
Exit: 1; signal: none; 2026-10-23T09:18:16.171Z → 2026-10-23T09:18:16.189Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-13
```
Exit: 1; signal: none; 2026-10-23T09:18:16.189Z → 2026-10-23T09:18:16.209Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-14
```
Exit: 1; signal: none; 2026-10-23T09:18:16.209Z → 2026-10-23T09:18:16.229Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-15
```
Exit: 1; signal: none; 2026-10-23T09:18:16.229Z → 2026-10-23T09:18:16.250Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-16
```
Exit: 1; signal: none; 2026-10-23T09:18:16.250Z → 2026-10-23T09:18:16.270Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-17
```
Exit: 1; signal: none; 2026-10-23T09:18:16.270Z → 2026-10-23T09:18:16.290Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-18
```
Exit: 1; signal: none; 2026-10-23T09:18:16.290Z → 2026-10-23T09:18:16.316Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-19
```
Exit: 1; signal: none; 2026-10-23T09:18:16.316Z → 2026-10-23T09:18:16.335Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-20
```
Exit: 1; signal: none; 2026-10-23T09:18:16.336Z → 2026-10-23T09:18:16.354Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-21
```
Exit: 1; signal: none; 2026-10-23T09:18:16.355Z → 2026-10-23T09:18:16.374Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-22
```
Exit: 1; signal: none; 2026-10-23T09:18:16.374Z → 2026-10-23T09:18:16.394Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-23
```
Exit: 1; signal: none; 2026-10-23T09:18:16.395Z → 2026-10-23T09:18:16.416Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-24
```
Exit: 1; signal: none; 2026-10-23T09:18:16.416Z → 2026-10-23T09:18:16.442Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-25
```
Exit: 1; signal: none; 2026-10-23T09:18:16.442Z → 2026-10-23T09:18:16.466Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-26
```
Exit: 1; signal: none; 2026-10-23T09:18:16.466Z → 2026-10-23T09:18:16.490Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-27
```
Exit: 1; signal: none; 2026-10-23T09:18:16.490Z → 2026-10-23T09:18:16.517Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-28
```
Exit: 1; signal: none; 2026-10-23T09:18:16.517Z → 2026-10-23T09:18:16.542Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-29
```
Exit: 1; signal: none; 2026-10-23T09:18:16.543Z → 2026-10-23T09:18:16.570Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-30
```
Exit: 1; signal: none; 2026-10-23T09:18:16.570Z → 2026-10-23T09:18:16.594Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-31
```
Exit: 1; signal: none; 2026-10-23T09:18:16.594Z → 2026-10-23T09:18:16.620Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-32
```
Exit: 1; signal: none; 2026-10-23T09:18:16.620Z → 2026-10-23T09:18:16.645Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-33
```
Exit: 1; signal: none; 2026-10-23T09:18:16.645Z → 2026-10-23T09:18:16.667Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-34
```
Exit: 1; signal: none; 2026-10-23T09:18:16.668Z → 2026-10-23T09:18:16.689Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-35
```
Exit: 1; signal: none; 2026-10-23T09:18:16.689Z → 2026-10-23T09:18:16.711Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-36
```
Exit: 1; signal: none; 2026-10-23T09:18:16.711Z → 2026-10-23T09:18:16.741Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-37
```
Exit: 1; signal: none; 2026-10-23T09:18:16.741Z → 2026-10-23T09:18:16.765Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-38
```
Exit: 1; signal: none; 2026-10-23T09:18:16.765Z → 2026-10-23T09:18:16.791Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-39
```
Exit: 1; signal: none; 2026-10-23T09:18:16.791Z → 2026-10-23T09:18:16.815Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-40
```
Exit: 1; signal: none; 2026-10-23T09:18:16.815Z → 2026-10-23T09:18:16.838Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-41
```
Exit: 1; signal: none; 2026-10-23T09:18:16.838Z → 2026-10-23T09:18:16.866Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-42
```
Exit: 1; signal: none; 2026-10-23T09:18:16.866Z → 2026-10-23T09:18:16.892Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-43
```
Exit: 1; signal: none; 2026-10-23T09:18:16.892Z → 2026-10-23T09:18:16.920Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-44
```
Exit: 1; signal: none; 2026-10-23T09:18:16.920Z → 2026-10-23T09:18:16.944Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-45
```
Exit: 1; signal: none; 2026-10-23T09:18:16.944Z → 2026-10-23T09:18:16.967Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-46
```
Exit: 1; signal: none; 2026-10-23T09:18:16.967Z → 2026-10-23T09:18:16.989Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-47
```
Exit: 1; signal: none; 2026-10-23T09:18:16.989Z → 2026-10-23T09:18:17.014Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-48
```
Exit: 1; signal: none; 2026-10-23T09:18:17.014Z → 2026-10-23T09:18:17.037Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-49
```
Exit: 1; signal: none; 2026-10-23T09:18:17.037Z → 2026-10-23T09:18:17.062Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-job-50
```
Exit: 1; signal: none; 2026-10-23T09:18:17.062Z → 2026-10-23T09:18:17.085Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-application
```
Exit: 1; signal: none; 2026-10-23T09:18:17.085Z → 2026-10-23T09:18:17.112Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792746330132-460b60ae-net
```
Exit: 0; signal: none; 2026-10-23T09:18:17.112Z → 2026-10-23T09:18:17.126Z

```sh
docker network rm sam-verify-1792746330132-460b60ae-net
```
Exit: 0; signal: none; 2026-10-23T09:18:17.126Z → 2026-10-23T09:18:17.180Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
