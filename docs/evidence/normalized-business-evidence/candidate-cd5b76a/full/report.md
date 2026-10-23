# Independent SAM verification

Status: **PASS**
Source: `cd5b76aa73dabdf9b64e6a63a4392657cdbb917a` (clean: true)
Started: 2026-10-23T19:36:47.779Z; completed: 2026-10-23T19:51:20.140Z

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
- clean-application: `sam-verification:sam-verify-1792784207779-3e7def24`; ID `sha256:48056043747764c9e2a2d35792c2f76c59a52615a6a69719cfd0c6f1bcd2efe1`

## Commands and suite outcomes

### preflight — PASS

2026-10-23T19:36:47.780Z → 2026-10-23T19:36:48.010Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T19:36:47.784Z → 2026-10-23T19:36:47.789Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T19:36:47.789Z → 2026-10-23T19:36:47.791Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T19:36:47.791Z → 2026-10-23T19:36:47.797Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T19:36:47.797Z → 2026-10-23T19:36:47.813Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T19:36:47.813Z → 2026-10-23T19:36:47.832Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T19:36:47.832Z → 2026-10-23T19:36:47.887Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T19:36:47.887Z → 2026-10-23T19:36:47.948Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T19:36:47.948Z → 2026-10-23T19:36:47.994Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T19:36:47.994Z → 2026-10-23T19:36:47.997Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T19:36:47.997Z → 2026-10-23T19:36:48.009Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T19:36:48.009Z → 2026-10-23T19:36:48.010Z


### snapshot — PASS

2026-10-23T19:36:48.011Z → 2026-10-23T19:36:48.088Z

```sh
git archive --format=tar --output /tmp/sam-verify-XmsYYP/source.tar cd5b76aa73dabdf9b64e6a63a4392657cdbb917a
```
Exit: 0; signal: none; 2026-10-23T19:36:48.013Z → 2026-10-23T19:36:48.046Z

```sh
tar -xf /tmp/sam-verify-XmsYYP/source.tar -C /tmp/sam-verify-XmsYYP/source
```
Exit: 0; signal: none; 2026-10-23T19:36:48.046Z → 2026-10-23T19:36:48.057Z


### images — PASS

2026-10-23T19:36:48.089Z → 2026-10-23T19:36:48.196Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T19:36:48.090Z → 2026-10-23T19:36:48.103Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T19:36:48.103Z → 2026-10-23T19:36:48.117Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T19:36:48.117Z → 2026-10-23T19:36:48.130Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T19:36:48.130Z → 2026-10-23T19:36:48.143Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T19:36:48.144Z → 2026-10-23T19:36:48.156Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T19:36:48.156Z → 2026-10-23T19:36:48.169Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T19:36:48.169Z → 2026-10-23T19:36:48.181Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T19:36:48.181Z → 2026-10-23T19:36:48.196Z


### isolated-postgres — PASS

2026-10-23T19:36:48.197Z → 2026-10-23T19:36:53.453Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792784207779-3e7def24 sam-verify-1792784207779-3e7def24-net
```
Exit: 0; signal: none; 2026-10-23T19:36:48.197Z → 2026-10-23T19:36:48.224Z

```sh
docker run --detach --name sam-verify-1792784207779-3e7def24-pg --label sam.verification.run=sam-verify-1792784207779-3e7def24 --network sam-verify-1792784207779-3e7def24-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T19:36:48.224Z → 2026-10-23T19:36:51.751Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792784207779-3e7def24-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T19:36:51.752Z → 2026-10-23T19:36:51.851Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792784207779-3e7def24-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T19:36:52.352Z → 2026-10-23T19:36:52.457Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792784207779-3e7def24-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T19:36:52.958Z → 2026-10-23T19:36:53.071Z

```sh
docker exec sam-verify-1792784207779-3e7def24-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T19:36:53.071Z → 2026-10-23T19:36:53.206Z

```sh
docker exec sam-verify-1792784207779-3e7def24-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T19:36:53.206Z → 2026-10-23T19:36:53.340Z

```sh
docker exec sam-verify-1792784207779-3e7def24-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T19:36:53.340Z → 2026-10-23T19:36:53.453Z


### node-dependencies — PASS

2026-10-23T19:36:53.458Z → 2026-10-23T19:37:07.044Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-1 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T19:36:53.459Z → 2026-10-23T19:37:07.044Z


### python-dependencies — PASS

2026-10-23T19:37:07.045Z → 2026-10-23T19:37:11.242Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-2 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-XmsYYP/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T19:37:07.046Z → 2026-10-23T19:37:11.242Z


### runtime-versions — PASS

2026-10-23T19:37:11.243Z → 2026-10-23T19:37:42.090Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-3 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T19:37:11.244Z → 2026-10-23T19:37:21.288Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-4 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T19:37:21.288Z → 2026-10-23T19:37:31.336Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-5 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T19:37:31.336Z → 2026-10-23T19:37:41.287Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-6 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T19:37:41.287Z → 2026-10-23T19:37:42.006Z

```sh
docker exec sam-verify-1792784207779-3e7def24-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T19:37:42.006Z → 2026-10-23T19:37:42.090Z


### workflow-tool — PASS

2026-10-23T19:37:42.092Z → 2026-10-23T19:37:42.661Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-XmsYYP/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T19:37:42.093Z → 2026-10-23T19:37:42.614Z

```sh
tar -xzf /tmp/sam-verify-XmsYYP/actionlint.tar.gz -C /tmp/sam-verify-XmsYYP actionlint
```
Exit: 0; signal: none; 2026-10-23T19:37:42.617Z → 2026-10-23T19:37:42.657Z

```sh
/tmp/sam-verify-XmsYYP/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T19:37:42.657Z → 2026-10-23T19:37:42.661Z


### workflow-validation — PASS

2026-10-23T19:37:42.662Z → 2026-10-23T19:37:42.665Z

```sh
/tmp/sam-verify-XmsYYP/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T19:37:42.663Z → 2026-10-23T19:37:42.665Z


### configuration-validation — PASS

2026-10-23T19:37:42.666Z → 2026-10-23T19:38:16.092Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T19:37:42.667Z → 2026-10-23T19:37:42.883Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T19:37:42.883Z → 2026-10-23T19:37:42.965Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T19:37:42.965Z → 2026-10-23T19:37:43.041Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T19:37:43.041Z → 2026-10-23T19:37:43.113Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T19:37:43.113Z → 2026-10-23T19:37:43.179Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-7 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T19:37:43.179Z → 2026-10-23T19:37:54.775Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-8 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T19:37:54.775Z → 2026-10-23T19:38:05.175Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-9 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T19:38:05.175Z → 2026-10-23T19:38:16.092Z


### typecheck — PASS

2026-10-23T19:38:16.093Z → 2026-10-23T19:38:32.639Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-10 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T19:38:16.098Z → 2026-10-23T19:38:32.639Z


### regression — PASS

2026-10-23T19:38:32.640Z → 2026-10-23T19:39:10.938Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-11 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T19:38:32.641Z → 2026-10-23T19:39:10.937Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T19:38:42.573Z → 2026-10-23T19:38:43.176Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T19:38:43.199Z → 2026-10-23T19:38:43.677Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T19:38:43.693Z → 2026-10-23T19:38:44.112Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T19:38:44.131Z → 2026-10-23T19:38:44.604Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T19:38:44.620Z → 2026-10-23T19:38:45.042Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T19:38:45.062Z → 2026-10-23T19:38:45.431Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T19:38:45.456Z → 2026-10-23T19:38:46.025Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T19:38:46.047Z → 2026-10-23T19:38:46.544Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T19:38:46.562Z → 2026-10-23T19:38:47.015Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T19:38:47.032Z → 2026-10-23T19:38:47.488Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T19:38:47.515Z → 2026-10-23T19:38:48.005Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T19:38:48.023Z → 2026-10-23T19:38:48.370Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T19:38:48.386Z → 2026-10-23T19:38:48.899Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T19:38:48.915Z → 2026-10-23T19:38:49.320Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T19:38:49.337Z → 2026-10-23T19:38:49.731Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T19:38:49.747Z → 2026-10-23T19:38:50.217Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T19:38:50.235Z → 2026-10-23T19:38:50.687Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T19:38:50.707Z → 2026-10-23T19:38:51.157Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T19:38:51.174Z → 2026-10-23T19:38:51.634Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T19:38:51.651Z → 2026-10-23T19:38:52.011Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T19:38:52.028Z → 2026-10-23T19:38:52.389Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T19:38:52.405Z → 2026-10-23T19:38:52.712Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T19:38:52.729Z → 2026-10-23T19:38:53.180Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T19:38:53.197Z → 2026-10-23T19:38:54.575Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T19:38:54.594Z → 2026-10-23T19:38:55.151Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T19:38:55.168Z → 2026-10-23T19:38:55.580Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T19:38:55.599Z → 2026-10-23T19:38:56.219Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T19:38:56.237Z → 2026-10-23T19:38:57.123Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T19:38:57.141Z → 2026-10-23T19:38:57.599Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T19:38:57.616Z → 2026-10-23T19:38:58.042Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T19:38:58.059Z → 2026-10-23T19:38:58.733Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T19:38:58.750Z → 2026-10-23T19:38:59.472Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T19:38:59.489Z → 2026-10-23T19:38:59.913Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T19:38:59.930Z → 2026-10-23T19:39:00.411Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T19:39:00.427Z → 2026-10-23T19:39:00.958Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T19:39:00.974Z → 2026-10-23T19:39:01.588Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T19:39:01.605Z → 2026-10-23T19:39:02.074Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T19:39:02.090Z → 2026-10-23T19:39:02.573Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T19:39:02.591Z → 2026-10-23T19:39:03.060Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T19:39:03.078Z → 2026-10-23T19:39:03.529Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T19:39:03.547Z → 2026-10-23T19:39:04.541Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T19:39:04.559Z → 2026-10-23T19:39:04.904Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T19:39:04.921Z → 2026-10-23T19:39:06.343Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T19:39:06.362Z → 2026-10-23T19:39:06.819Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T19:39:06.835Z → 2026-10-23T19:39:07.396Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T19:39:07.415Z → 2026-10-23T19:39:07.823Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T19:39:07.840Z → 2026-10-23T19:39:08.626Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T19:39:08.646Z → 2026-10-23T19:39:09.333Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T19:39:09.366Z → 2026-10-23T19:39:10.146Z

### core-reliability — PASS

2026-10-23T19:39:10.939Z → 2026-10-23T19:39:53.514Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-12 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T19:39:10.940Z → 2026-10-23T19:39:53.513Z

- tests/core/reliability.ts: PASS; 2026-10-23T19:39:20.887Z → 2026-10-23T19:39:26.239Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T19:39:26.259Z → 2026-10-23T19:39:26.861Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T19:39:26.879Z → 2026-10-23T19:39:27.346Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T19:39:27.363Z → 2026-10-23T19:39:27.909Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T19:39:27.926Z → 2026-10-23T19:39:29.509Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T19:39:29.526Z → 2026-10-23T19:39:29.979Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T19:39:29.998Z → 2026-10-23T19:39:31.585Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T19:39:31.603Z → 2026-10-23T19:39:32.204Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T19:39:32.220Z → 2026-10-23T19:39:33.610Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T19:39:33.626Z → 2026-10-23T19:39:37.664Z
- tests/core/evidenceTransforms.ts: PASS; 2026-10-23T19:39:37.685Z → 2026-10-23T19:39:38.291Z
- tests/core/evidenceIntegration.ts: PASS; 2026-10-23T19:39:38.309Z → 2026-10-23T19:39:51.496Z
- tests/core/sourceContracts.ts: PASS; 2026-10-23T19:39:51.525Z → 2026-10-23T19:39:52.186Z
- tests/core/evidenceChaining.ts: PASS; 2026-10-23T19:39:52.204Z → 2026-10-23T19:39:52.681Z

### provider-auth — PASS

2026-10-23T19:39:53.515Z → 2026-10-23T19:40:03.393Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-13 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T19:39:53.517Z → 2026-10-23T19:40:03.392Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T19:40:02.275Z → 2026-10-23T19:40:02.682Z

### postgres-tls — PASS

2026-10-23T19:40:03.395Z → 2026-10-23T19:40:13.673Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-14 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T19:40:03.396Z → 2026-10-23T19:40:13.673Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T19:40:12.076Z → 2026-10-23T19:40:12.800Z

### contracts — PASS

2026-10-23T19:40:13.675Z → 2026-10-23T19:40:24.849Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-15 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T19:40:13.677Z → 2026-10-23T19:40:24.849Z

- tests/release/contracts.ts: PASS; 2026-10-23T19:40:23.351Z → 2026-10-23T19:40:24.072Z

### synthetic-pilot — PASS

2026-10-23T19:40:24.854Z → 2026-10-23T19:40:36.133Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-16 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T19:40:24.856Z → 2026-10-23T19:40:36.133Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T19:40:34.604Z → 2026-10-23T19:40:35.356Z

### managed-schema — PASS

2026-10-23T19:40:36.136Z → 2026-10-23T19:40:46.905Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-17 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T19:40:36.137Z → 2026-10-23T19:40:46.905Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T19:40:45.850Z → 2026-10-23T19:40:46.104Z

### local-bundle — PASS

2026-10-23T19:40:46.912Z → 2026-10-23T19:40:58.038Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-18 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T19:40:46.914Z → 2026-10-23T19:40:58.038Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T19:40:56.870Z → 2026-10-23T19:40:57.269Z

### closed-setup — PASS

2026-10-23T19:40:58.041Z → 2026-10-23T19:41:09.419Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-19 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T19:40:58.043Z → 2026-10-23T19:41:09.418Z

- tests/release/setup.ts: PASS; 2026-10-23T19:41:08.113Z → 2026-10-23T19:41:08.667Z

### database-contract — PASS

2026-10-23T19:41:09.421Z → 2026-10-23T19:41:18.963Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-20 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T19:41:09.423Z → 2026-10-23T19:41:18.962Z

- tests/release/database_check.ts: PASS; 2026-10-23T19:41:17.747Z → 2026-10-23T19:41:18.151Z

### prelaunch-gate — PASS

2026-10-23T19:41:18.964Z → 2026-10-23T19:41:30.310Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-21 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T19:41:18.966Z → 2026-10-23T19:41:30.310Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T19:41:29.178Z → 2026-10-23T19:41:29.506Z

### service-provisioning — PASS

2026-10-23T19:41:30.312Z → 2026-10-23T19:41:43.689Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-22 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T19:41:30.315Z → 2026-10-23T19:41:43.689Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T19:41:39.279Z → 2026-10-23T19:41:42.869Z

### operator-provisioning — PASS

2026-10-23T19:41:43.692Z → 2026-10-23T19:41:57.599Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-23 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T19:41:43.694Z → 2026-10-23T19:41:57.599Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T19:41:53.238Z → 2026-10-23T19:41:56.790Z

### provisioning-backup-recovery — PASS

2026-10-23T19:41:57.601Z → 2026-10-23T19:42:00.897Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792784207779-3e7def24-pg sam-verify-1792784207779-3e7def24
```
Exit: 0; signal: none; 2026-10-23T19:41:57.603Z → 2026-10-23T19:42:00.897Z


### render-migration-compatibility — PASS

2026-10-23T19:42:00.900Z → 2026-10-23T19:42:12.398Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-24 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T19:42:00.902Z → 2026-10-23T19:42:12.398Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T19:42:10.532Z → 2026-10-23T19:42:11.633Z

### render-google-oauth-contracts — PASS

2026-10-23T19:42:12.401Z → 2026-10-23T19:42:28.091Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-25 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/isolated/normalized_connectors.ts tests/isolated/goal_obligations.ts tests/isolated/collection_receipts.ts tests/isolated/shared_goal_contract.ts tests/isolated/delegation_scope.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-23T19:42:12.403Z → 2026-10-23T19:42:28.091Z


### integration-migrations — PASS

2026-10-23T19:42:28.107Z → 2026-10-23T19:42:40.620Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-26 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-23T19:42:28.109Z → 2026-10-23T19:42:40.620Z

- tests/integration/migrations.ts: PASS; 2026-10-23T19:42:38.783Z → 2026-10-23T19:42:39.884Z

### integration-oauth-mcp — PASS

2026-10-23T19:42:40.625Z → 2026-10-23T19:42:51.489Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-27 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-23T19:42:40.627Z → 2026-10-23T19:42:51.489Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-23T19:42:50.154Z → 2026-10-23T19:42:50.678Z

### integration-orchestration — PASS

2026-10-23T19:42:51.492Z → 2026-10-23T19:43:08.071Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-28 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T19:42:51.494Z → 2026-10-23T19:43:08.071Z

- tests/integration/orchestration.ts: PASS; 2026-10-23T19:43:00.261Z → 2026-10-23T19:43:07.309Z

### specialist-reasoning — PASS

2026-10-23T19:43:08.073Z → 2026-10-23T19:44:16.845Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-29 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-23T19:43:08.076Z → 2026-10-23T19:44:16.844Z

- tests/specialists/acceptance.ts: PASS; 2026-10-23T19:43:17.927Z → 2026-10-23T19:44:15.910Z

### specialist-gateway — PASS

2026-10-23T19:44:16.849Z → 2026-10-23T19:44:28.263Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-30 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-23T19:44:16.851Z → 2026-10-23T19:44:28.263Z

- tests/specialists/gateway.ts: PASS; 2026-10-23T19:44:26.986Z → 2026-10-23T19:44:27.465Z

### specialist-provenance — PASS

2026-10-23T19:44:28.266Z → 2026-10-23T19:44:38.209Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-31 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-23T19:44:28.268Z → 2026-10-23T19:44:38.209Z

- tests/specialists/provenance.ts: PASS; 2026-10-23T19:44:36.991Z → 2026-10-23T19:44:37.388Z

### specialist-learning-fairness — PASS

2026-10-23T19:44:38.212Z → 2026-10-23T19:44:49.641Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-32 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-23T19:44:38.214Z → 2026-10-23T19:44:49.641Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-23T19:44:47.728Z → 2026-10-23T19:44:48.838Z

### specialist-evaluation — PASS

2026-10-23T19:44:49.645Z → 2026-10-23T19:45:00.356Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-33 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-23T19:44:49.646Z → 2026-10-23T19:45:00.356Z


### evaluation-budget — PASS

2026-10-23T19:45:00.358Z → 2026-10-23T19:46:07.062Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-34 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a --mount type=bind,source=/tmp/sam-business-normalized-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-23T19:45:00.360Z → 2026-10-23T19:46:07.061Z

- tests/evaluation/budgets.ts: PASS; 2026-10-23T19:45:09.210Z → 2026-10-23T19:46:06.229Z

### evaluation-adapter — PASS

2026-10-23T19:46:07.067Z → 2026-10-23T19:46:18.668Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-35 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-23T19:46:07.069Z → 2026-10-23T19:46:18.668Z

- tests/evaluation/adapters.ts: PASS; 2026-10-23T19:46:16.726Z → 2026-10-23T19:46:17.887Z

### evaluation-orchestration — PASS

2026-10-23T19:46:18.672Z → 2026-10-23T19:46:49.293Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-36 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a --mount type=bind,source=/tmp/sam-business-normalized-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T19:46:18.674Z → 2026-10-23T19:46:49.293Z

- tests/evaluation/orchestration.ts: PASS; 2026-10-23T19:46:28.013Z → 2026-10-23T19:46:48.485Z

### evaluation-independent-review — PASS

2026-10-23T19:46:49.297Z → 2026-10-23T19:46:59.557Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-37 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-23T19:46:49.300Z → 2026-10-23T19:46:59.557Z

- tests/evaluation/review.ts: PASS; 2026-10-23T19:46:57.985Z → 2026-10-23T19:46:58.799Z

### evaluation-commercial-market — PASS

2026-10-23T19:46:59.561Z → 2026-10-23T19:47:32.284Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-38 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a --mount type=bind,source=/tmp/sam-business-normalized-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-23T19:46:59.563Z → 2026-10-23T19:47:32.284Z

- tests/evaluation/market.ts: PASS; 2026-10-23T19:47:08.617Z → 2026-10-23T19:47:31.437Z

### evaluation-commercial-profitability — PASS

2026-10-23T19:47:32.288Z → 2026-10-23T19:48:03.772Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-39 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a --mount type=bind,source=/tmp/sam-business-normalized-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-23T19:47:32.292Z → 2026-10-23T19:48:03.772Z

- tests/evaluation/profitability.ts: PASS; 2026-10-23T19:47:40.879Z → 2026-10-23T19:48:02.931Z

### evaluation-commercial-suppliers — PASS

2026-10-23T19:48:03.779Z → 2026-10-23T19:48:37.083Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-40 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a --mount type=bind,source=/tmp/sam-business-normalized-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-23T19:48:03.783Z → 2026-10-23T19:48:37.083Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-23T19:48:13.073Z → 2026-10-23T19:48:36.221Z

### migration-upgrade-rollback — PASS

2026-10-23T19:48:37.089Z → 2026-10-23T19:48:48.502Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-41 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-23T19:48:37.094Z → 2026-10-23T19:48:48.502Z


### specialist-restart-prepare — PASS

2026-10-23T19:48:48.508Z → 2026-10-23T19:48:58.178Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-42 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T19:48:48.513Z → 2026-10-23T19:48:58.178Z


### evaluation-restart-prepare — PASS

2026-10-23T19:48:58.188Z → 2026-10-23T19:49:09.133Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-43 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T19:48:58.192Z → 2026-10-23T19:49:09.133Z


### postgres-restart — PASS

2026-10-23T19:49:09.141Z → 2026-10-23T19:49:09.541Z

```sh
docker restart --time 10 sam-verify-1792784207779-3e7def24-pg
```
Exit: 0; signal: none; 2026-10-23T19:49:09.147Z → 2026-10-23T19:49:09.440Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792784207779-3e7def24-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T19:49:09.440Z → 2026-10-23T19:49:09.541Z


### migration-after-restart — PASS

2026-10-23T19:49:09.548Z → 2026-10-23T19:49:19.953Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-44 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-23T19:49:09.552Z → 2026-10-23T19:49:19.953Z


### specialist-restart-check — PASS

2026-10-23T19:49:19.959Z → 2026-10-23T19:49:30.999Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-45 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T19:49:19.965Z → 2026-10-23T19:49:30.999Z


### evaluation-restart-check — PASS

2026-10-23T19:49:31.006Z → 2026-10-23T19:49:42.712Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-46 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T19:49:31.010Z → 2026-10-23T19:49:42.712Z


### phase0-migrations — PASS

2026-10-23T19:49:42.718Z → 2026-10-23T19:49:43.405Z

```sh
docker cp /tmp/sam-verify-XmsYYP/source/packages/db/migrations sam-verify-1792784207779-3e7def24-pg:/migrations
```
Exit: 0; signal: none; 2026-10-23T19:49:42.723Z → 2026-10-23T19:49:42.737Z

```sh
docker exec sam-verify-1792784207779-3e7def24-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-23T19:49:42.737Z → 2026-10-23T19:49:43.316Z

```sh
docker exec sam-verify-1792784207779-3e7def24-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-23T19:49:43.316Z → 2026-10-23T19:49:43.405Z


### phase0-acceptance — PASS

2026-10-23T19:49:43.412Z → 2026-10-23T19:49:45.837Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-47 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-XmsYYP/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-23T19:49:43.417Z → 2026-10-23T19:49:45.837Z


### phase0-postgres — PASS

2026-10-23T19:49:45.844Z → 2026-10-23T19:49:47.815Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-48 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-XmsYYP/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-23T19:49:45.849Z → 2026-10-23T19:49:47.815Z


### tenant-isolation — PASS

2026-10-23T19:49:47.822Z → 2026-10-23T19:49:49.541Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-49 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-XmsYYP/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-23T19:49:47.826Z → 2026-10-23T19:49:49.541Z


### fail-closed-security — PASS

2026-10-23T19:49:49.548Z → 2026-10-23T19:49:50.824Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-50 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-XmsYYP/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-23T19:49:49.553Z → 2026-10-23T19:49:50.824Z


### clean-image — PASS

2026-10-23T19:49:50.831Z → 2026-10-23T19:49:58.229Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792784207779-3e7def24 Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-23T19:49:50.837Z → 2026-10-23T19:49:58.229Z


### image-contract — PASS

2026-10-23T19:49:58.235Z → 2026-10-23T19:49:58.252Z

```sh
docker image inspect sam-verification:sam-verify-1792784207779-3e7def24
```
Exit: 0; signal: none; 2026-10-23T19:49:58.239Z → 2026-10-23T19:49:58.252Z


### application-startup-restart — PASS

2026-10-23T19:49:58.258Z → 2026-10-23T19:50:03.446Z

```sh
docker run --rm --init --name sam-verify-1792784207779-3e7def24-application --label sam.verification.run=sam-verify-1792784207779-3e7def24 --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792784207779-3e7def24 node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-23T19:49:58.262Z → 2026-10-23T19:50:03.446Z


### source-integrity — PASS

2026-10-23T19:50:03.454Z → 2026-10-23T19:50:03.472Z


### shared-goal-path — PASS

2026-10-23T19:50:03.482Z → 2026-10-23T19:51:18.390Z

```sh
docker run --rm --name sam-verify-1792784207779-3e7def24-job-52 --label sam.verification.run=sam-verify-1792784207779-3e7def24 --init --network container:sam-verify-1792784207779-3e7def24-pg --mount type=bind,src=/tmp/sam-verify-XmsYYP/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=cd5b76aa73dabdf9b64e6a63a4392657cdbb917a --mount type=bind,source=/tmp/sam-business-normalized-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/sharedPath.ts
```
Exit: 0; signal: none; 2026-10-23T19:50:03.488Z → 2026-10-23T19:51:18.390Z

- tests/evaluation/sharedPath.ts: PASS; 2026-10-23T19:50:09.777Z → 2026-10-23T19:51:17.427Z

### cleanup — PASS

2026-10-23T19:51:18.399Z → 2026-10-23T19:51:20.132Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-pg
```
Exit: 0; signal: none; 2026-10-23T19:51:18.407Z → 2026-10-23T19:51:18.424Z

```sh
docker rm --force --volumes sam-verify-1792784207779-3e7def24-pg
```
Exit: 0; signal: none; 2026-10-23T19:51:18.424Z → 2026-10-23T19:51:18.862Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-1
```
Exit: 1; signal: none; 2026-10-23T19:51:18.862Z → 2026-10-23T19:51:18.889Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-2
```
Exit: 1; signal: none; 2026-10-23T19:51:18.889Z → 2026-10-23T19:51:18.912Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-3
```
Exit: 1; signal: none; 2026-10-23T19:51:18.912Z → 2026-10-23T19:51:18.937Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-4
```
Exit: 1; signal: none; 2026-10-23T19:51:18.937Z → 2026-10-23T19:51:18.961Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-5
```
Exit: 1; signal: none; 2026-10-23T19:51:18.961Z → 2026-10-23T19:51:18.984Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-6
```
Exit: 1; signal: none; 2026-10-23T19:51:18.984Z → 2026-10-23T19:51:19.006Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-7
```
Exit: 1; signal: none; 2026-10-23T19:51:19.006Z → 2026-10-23T19:51:19.028Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-8
```
Exit: 1; signal: none; 2026-10-23T19:51:19.028Z → 2026-10-23T19:51:19.051Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-9
```
Exit: 1; signal: none; 2026-10-23T19:51:19.051Z → 2026-10-23T19:51:19.073Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-10
```
Exit: 1; signal: none; 2026-10-23T19:51:19.073Z → 2026-10-23T19:51:19.093Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-11
```
Exit: 1; signal: none; 2026-10-23T19:51:19.093Z → 2026-10-23T19:51:19.117Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-12
```
Exit: 1; signal: none; 2026-10-23T19:51:19.117Z → 2026-10-23T19:51:19.141Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-13
```
Exit: 1; signal: none; 2026-10-23T19:51:19.141Z → 2026-10-23T19:51:19.161Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-14
```
Exit: 1; signal: none; 2026-10-23T19:51:19.161Z → 2026-10-23T19:51:19.182Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-15
```
Exit: 1; signal: none; 2026-10-23T19:51:19.182Z → 2026-10-23T19:51:19.203Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-16
```
Exit: 1; signal: none; 2026-10-23T19:51:19.203Z → 2026-10-23T19:51:19.225Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-17
```
Exit: 1; signal: none; 2026-10-23T19:51:19.225Z → 2026-10-23T19:51:19.246Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-18
```
Exit: 1; signal: none; 2026-10-23T19:51:19.246Z → 2026-10-23T19:51:19.267Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-19
```
Exit: 1; signal: none; 2026-10-23T19:51:19.267Z → 2026-10-23T19:51:19.295Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-20
```
Exit: 1; signal: none; 2026-10-23T19:51:19.296Z → 2026-10-23T19:51:19.319Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-21
```
Exit: 1; signal: none; 2026-10-23T19:51:19.319Z → 2026-10-23T19:51:19.342Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-22
```
Exit: 1; signal: none; 2026-10-23T19:51:19.342Z → 2026-10-23T19:51:19.362Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-23
```
Exit: 1; signal: none; 2026-10-23T19:51:19.362Z → 2026-10-23T19:51:19.383Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-24
```
Exit: 1; signal: none; 2026-10-23T19:51:19.384Z → 2026-10-23T19:51:19.404Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-25
```
Exit: 1; signal: none; 2026-10-23T19:51:19.404Z → 2026-10-23T19:51:19.426Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-26
```
Exit: 1; signal: none; 2026-10-23T19:51:19.426Z → 2026-10-23T19:51:19.452Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-27
```
Exit: 1; signal: none; 2026-10-23T19:51:19.452Z → 2026-10-23T19:51:19.477Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-28
```
Exit: 1; signal: none; 2026-10-23T19:51:19.477Z → 2026-10-23T19:51:19.501Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-29
```
Exit: 1; signal: none; 2026-10-23T19:51:19.501Z → 2026-10-23T19:51:19.522Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-30
```
Exit: 1; signal: none; 2026-10-23T19:51:19.522Z → 2026-10-23T19:51:19.546Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-31
```
Exit: 1; signal: none; 2026-10-23T19:51:19.546Z → 2026-10-23T19:51:19.569Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-32
```
Exit: 1; signal: none; 2026-10-23T19:51:19.569Z → 2026-10-23T19:51:19.591Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-33
```
Exit: 1; signal: none; 2026-10-23T19:51:19.591Z → 2026-10-23T19:51:19.611Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-34
```
Exit: 1; signal: none; 2026-10-23T19:51:19.612Z → 2026-10-23T19:51:19.634Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-35
```
Exit: 1; signal: none; 2026-10-23T19:51:19.634Z → 2026-10-23T19:51:19.656Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-36
```
Exit: 1; signal: none; 2026-10-23T19:51:19.656Z → 2026-10-23T19:51:19.677Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-37
```
Exit: 1; signal: none; 2026-10-23T19:51:19.677Z → 2026-10-23T19:51:19.702Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-38
```
Exit: 1; signal: none; 2026-10-23T19:51:19.702Z → 2026-10-23T19:51:19.723Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-39
```
Exit: 1; signal: none; 2026-10-23T19:51:19.723Z → 2026-10-23T19:51:19.747Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-40
```
Exit: 1; signal: none; 2026-10-23T19:51:19.747Z → 2026-10-23T19:51:19.769Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-41
```
Exit: 1; signal: none; 2026-10-23T19:51:19.769Z → 2026-10-23T19:51:19.791Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-42
```
Exit: 1; signal: none; 2026-10-23T19:51:19.791Z → 2026-10-23T19:51:19.810Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-43
```
Exit: 1; signal: none; 2026-10-23T19:51:19.810Z → 2026-10-23T19:51:19.836Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-44
```
Exit: 1; signal: none; 2026-10-23T19:51:19.836Z → 2026-10-23T19:51:19.862Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-45
```
Exit: 1; signal: none; 2026-10-23T19:51:19.862Z → 2026-10-23T19:51:19.884Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-46
```
Exit: 1; signal: none; 2026-10-23T19:51:19.884Z → 2026-10-23T19:51:19.908Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-47
```
Exit: 1; signal: none; 2026-10-23T19:51:19.908Z → 2026-10-23T19:51:19.932Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-48
```
Exit: 1; signal: none; 2026-10-23T19:51:19.932Z → 2026-10-23T19:51:19.954Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-49
```
Exit: 1; signal: none; 2026-10-23T19:51:19.954Z → 2026-10-23T19:51:19.974Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-50
```
Exit: 1; signal: none; 2026-10-23T19:51:19.974Z → 2026-10-23T19:51:19.998Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-application
```
Exit: 1; signal: none; 2026-10-23T19:51:19.998Z → 2026-10-23T19:51:20.021Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-job-52
```
Exit: 1; signal: none; 2026-10-23T19:51:20.021Z → 2026-10-23T19:51:20.042Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792784207779-3e7def24-net
```
Exit: 0; signal: none; 2026-10-23T19:51:20.042Z → 2026-10-23T19:51:20.055Z

```sh
docker network rm sam-verify-1792784207779-3e7def24-net
```
Exit: 0; signal: none; 2026-10-23T19:51:20.055Z → 2026-10-23T19:51:20.101Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
