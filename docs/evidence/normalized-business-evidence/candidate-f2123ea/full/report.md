# Independent SAM verification

Status: **FAIL**
Source: `f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8` (clean: true)
Started: 2026-10-23T19:22:34.551Z; completed: 2026-10-23T19:28:22.072Z

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
| integration-orchestration | FAIL | [log](logs/30-integration-orchestration.log) |
| specialist-reasoning | NOT_RUN | not executed |
| specialist-gateway | NOT_RUN | not executed |
| specialist-provenance | NOT_RUN | not executed |
| specialist-learning-fairness | NOT_RUN | not executed |
| specialist-evaluation | NOT_RUN | not executed |
| evaluation-budget | NOT_RUN | not executed |
| evaluation-adapter | NOT_RUN | not executed |
| evaluation-orchestration | NOT_RUN | not executed |
| evaluation-independent-review | NOT_RUN | not executed |
| evaluation-commercial-market | NOT_RUN | not executed |
| evaluation-commercial-profitability | NOT_RUN | not executed |
| evaluation-commercial-suppliers | NOT_RUN | not executed |
| migration-upgrade-rollback | NOT_RUN | not executed |
| specialist-restart-prepare | NOT_RUN | not executed |
| evaluation-restart-prepare | NOT_RUN | not executed |
| postgres-restart | NOT_RUN | not executed |
| migration-after-restart | NOT_RUN | not executed |
| specialist-restart-check | NOT_RUN | not executed |
| evaluation-restart-check | NOT_RUN | not executed |
| phase0-migrations | NOT_RUN | not executed |
| phase0-acceptance | NOT_RUN | not executed |
| phase0-postgres | NOT_RUN | not executed |
| tenant-isolation | NOT_RUN | not executed |
| fail-closed-security | NOT_RUN | not executed |
| clean-image | NOT_RUN | not executed |
| image-contract | NOT_RUN | not executed |
| application-startup-restart | NOT_RUN | not executed |
| source-integrity | NOT_RUN | not executed |
| shared-goal-path | NOT_RUN | not executed |
| cleanup | PASS | [log](logs/60-cleanup.log) |

## Unresolved defects / blockers

- integration-orchestration: exit 143 (see logs/30-integration-orchestration.log)
- INTERRUPTED: partial results are not acceptance

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
  "actionlint": "1.7.7\ninstalled by downloading from release page\nbuilt with go1.23.4 compiler for linux/amd64"
}
```

## Container images

- node: `node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2`; ID `sha256:eefceac94552a7e7e9da532feb53139a8630e3934b862662ce1d7cb877772c86`
- productionBase: `node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc`; ID `sha256:c79227476e31e0f5410cfc4578f1f9a59300510491f2f6f0b5eaf956dbef4986`
- postgres: `pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9`; ID `sha256:4b4956e2ab1f0aec9779dfca20366a9963a3f24c34269c3a115dd838387f0734`
- python: `python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8`; ID `sha256:b4403f3b7acf5e0700a5dd4e7ab01456d62b557a208a04f8a42d3470d93b5730`

## Commands and suite outcomes

### preflight — PASS

2026-10-23T19:22:34.552Z → 2026-10-23T19:22:34.795Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T19:22:34.555Z → 2026-10-23T19:22:34.560Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T19:22:34.560Z → 2026-10-23T19:22:34.562Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T19:22:34.562Z → 2026-10-23T19:22:34.567Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T19:22:34.567Z → 2026-10-23T19:22:34.581Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T19:22:34.581Z → 2026-10-23T19:22:34.599Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T19:22:34.599Z → 2026-10-23T19:22:34.659Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T19:22:34.659Z → 2026-10-23T19:22:34.724Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T19:22:34.724Z → 2026-10-23T19:22:34.780Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T19:22:34.780Z → 2026-10-23T19:22:34.782Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T19:22:34.783Z → 2026-10-23T19:22:34.793Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T19:22:34.793Z → 2026-10-23T19:22:34.795Z


### snapshot — PASS

2026-10-23T19:22:34.796Z → 2026-10-23T19:22:34.876Z

```sh
git archive --format=tar --output /tmp/sam-verify-8osGki/source.tar f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8
```
Exit: 0; signal: none; 2026-10-23T19:22:34.797Z → 2026-10-23T19:22:34.836Z

```sh
tar -xf /tmp/sam-verify-8osGki/source.tar -C /tmp/sam-verify-8osGki/source
```
Exit: 0; signal: none; 2026-10-23T19:22:34.836Z → 2026-10-23T19:22:34.846Z


### images — PASS

2026-10-23T19:22:34.877Z → 2026-10-23T19:22:34.987Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T19:22:34.878Z → 2026-10-23T19:22:34.892Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T19:22:34.892Z → 2026-10-23T19:22:34.905Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T19:22:34.905Z → 2026-10-23T19:22:34.920Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T19:22:34.920Z → 2026-10-23T19:22:34.933Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T19:22:34.933Z → 2026-10-23T19:22:34.947Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T19:22:34.947Z → 2026-10-23T19:22:34.959Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T19:22:34.960Z → 2026-10-23T19:22:34.972Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T19:22:34.972Z → 2026-10-23T19:22:34.986Z


### isolated-postgres — PASS

2026-10-23T19:22:34.988Z → 2026-10-23T19:22:37.560Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792783354550-8ce089e5 sam-verify-1792783354550-8ce089e5-net
```
Exit: 0; signal: none; 2026-10-23T19:22:34.989Z → 2026-10-23T19:22:35.015Z

```sh
docker run --detach --name sam-verify-1792783354550-8ce089e5-pg --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --network sam-verify-1792783354550-8ce089e5-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T19:22:35.016Z → 2026-10-23T19:22:35.965Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792783354550-8ce089e5-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T19:22:35.965Z → 2026-10-23T19:22:36.061Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792783354550-8ce089e5-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T19:22:36.562Z → 2026-10-23T19:22:36.655Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792783354550-8ce089e5-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T19:22:37.155Z → 2026-10-23T19:22:37.241Z

```sh
docker exec sam-verify-1792783354550-8ce089e5-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T19:22:37.241Z → 2026-10-23T19:22:37.344Z

```sh
docker exec sam-verify-1792783354550-8ce089e5-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T19:22:37.344Z → 2026-10-23T19:22:37.455Z

```sh
docker exec sam-verify-1792783354550-8ce089e5-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T19:22:37.455Z → 2026-10-23T19:22:37.560Z


### node-dependencies — PASS

2026-10-23T19:22:37.566Z → 2026-10-23T19:22:44.448Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-1 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T19:22:37.567Z → 2026-10-23T19:22:44.448Z


### python-dependencies — PASS

2026-10-23T19:22:44.449Z → 2026-10-23T19:22:47.267Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-2 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-8osGki/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T19:22:44.450Z → 2026-10-23T19:22:47.267Z


### runtime-versions — PASS

2026-10-23T19:22:47.269Z → 2026-10-23T19:23:17.177Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-3 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T19:22:47.270Z → 2026-10-23T19:22:54.160Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-4 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T19:22:54.160Z → 2026-10-23T19:23:05.148Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-5 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T19:23:05.148Z → 2026-10-23T19:23:14.953Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-6 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T19:23:14.953Z → 2026-10-23T19:23:17.097Z

```sh
docker exec sam-verify-1792783354550-8ce089e5-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T19:23:17.097Z → 2026-10-23T19:23:17.177Z


### workflow-tool — PASS

2026-10-23T19:23:17.179Z → 2026-10-23T19:23:17.728Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-8osGki/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T19:23:17.179Z → 2026-10-23T19:23:17.676Z

```sh
tar -xzf /tmp/sam-verify-8osGki/actionlint.tar.gz -C /tmp/sam-verify-8osGki actionlint
```
Exit: 0; signal: none; 2026-10-23T19:23:17.680Z → 2026-10-23T19:23:17.725Z

```sh
/tmp/sam-verify-8osGki/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T19:23:17.725Z → 2026-10-23T19:23:17.728Z


### workflow-validation — PASS

2026-10-23T19:23:17.730Z → 2026-10-23T19:23:17.735Z

```sh
/tmp/sam-verify-8osGki/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T19:23:17.731Z → 2026-10-23T19:23:17.735Z


### configuration-validation — PASS

2026-10-23T19:23:17.736Z → 2026-10-23T19:23:49.471Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T19:23:17.737Z → 2026-10-23T19:23:17.991Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T19:23:17.991Z → 2026-10-23T19:23:18.058Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T19:23:18.058Z → 2026-10-23T19:23:18.129Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T19:23:18.129Z → 2026-10-23T19:23:18.196Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T19:23:18.196Z → 2026-10-23T19:23:18.264Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-7 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T19:23:18.264Z → 2026-10-23T19:23:29.778Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-8 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T19:23:29.778Z → 2026-10-23T19:23:39.602Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-9 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T19:23:39.602Z → 2026-10-23T19:23:49.471Z


### typecheck — PASS

2026-10-23T19:23:49.472Z → 2026-10-23T19:24:06.333Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-10 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T19:23:49.474Z → 2026-10-23T19:24:06.333Z


### regression — PASS

2026-10-23T19:24:06.339Z → 2026-10-23T19:24:44.042Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-11 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T19:24:06.340Z → 2026-10-23T19:24:44.041Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T19:24:15.558Z → 2026-10-23T19:24:16.090Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T19:24:16.108Z → 2026-10-23T19:24:16.589Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T19:24:16.608Z → 2026-10-23T19:24:17.030Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T19:24:17.049Z → 2026-10-23T19:24:17.519Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T19:24:17.545Z → 2026-10-23T19:24:18.050Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T19:24:18.069Z → 2026-10-23T19:24:18.435Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T19:24:18.451Z → 2026-10-23T19:24:18.964Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T19:24:18.982Z → 2026-10-23T19:24:19.445Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T19:24:19.465Z → 2026-10-23T19:24:19.979Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T19:24:19.995Z → 2026-10-23T19:24:20.428Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T19:24:20.446Z → 2026-10-23T19:24:20.862Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T19:24:20.879Z → 2026-10-23T19:24:21.215Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T19:24:21.234Z → 2026-10-23T19:24:21.739Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T19:24:21.756Z → 2026-10-23T19:24:22.171Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T19:24:22.192Z → 2026-10-23T19:24:22.615Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T19:24:22.632Z → 2026-10-23T19:24:23.141Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T19:24:23.160Z → 2026-10-23T19:24:23.655Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T19:24:23.676Z → 2026-10-23T19:24:24.142Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T19:24:24.159Z → 2026-10-23T19:24:24.627Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T19:24:24.644Z → 2026-10-23T19:24:25.009Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T19:24:25.029Z → 2026-10-23T19:24:25.404Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T19:24:25.421Z → 2026-10-23T19:24:25.760Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T19:24:25.783Z → 2026-10-23T19:24:26.239Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T19:24:26.259Z → 2026-10-23T19:24:27.699Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T19:24:27.716Z → 2026-10-23T19:24:28.286Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T19:24:28.307Z → 2026-10-23T19:24:28.693Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T19:24:28.711Z → 2026-10-23T19:24:29.309Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T19:24:29.326Z → 2026-10-23T19:24:30.152Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T19:24:30.170Z → 2026-10-23T19:24:30.623Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T19:24:30.640Z → 2026-10-23T19:24:31.103Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T19:24:31.119Z → 2026-10-23T19:24:31.845Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T19:24:31.861Z → 2026-10-23T19:24:32.329Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T19:24:32.348Z → 2026-10-23T19:24:32.785Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T19:24:32.802Z → 2026-10-23T19:24:33.238Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T19:24:33.255Z → 2026-10-23T19:24:33.675Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T19:24:33.692Z → 2026-10-23T19:24:34.283Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T19:24:34.299Z → 2026-10-23T19:24:34.734Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T19:24:34.751Z → 2026-10-23T19:24:35.249Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T19:24:35.267Z → 2026-10-23T19:24:35.749Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T19:24:35.773Z → 2026-10-23T19:24:36.229Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T19:24:36.246Z → 2026-10-23T19:24:37.274Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T19:24:37.293Z → 2026-10-23T19:24:37.644Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T19:24:37.667Z → 2026-10-23T19:24:39.040Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T19:24:39.060Z → 2026-10-23T19:24:39.536Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T19:24:39.552Z → 2026-10-23T19:24:40.133Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T19:24:40.151Z → 2026-10-23T19:24:40.604Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T19:24:40.623Z → 2026-10-23T19:24:41.486Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T19:24:41.504Z → 2026-10-23T19:24:42.325Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T19:24:42.357Z → 2026-10-23T19:24:43.207Z

### core-reliability — PASS

2026-10-23T19:24:44.044Z → 2026-10-23T19:25:27.221Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-12 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T19:24:44.046Z → 2026-10-23T19:25:27.220Z

- tests/core/reliability.ts: PASS; 2026-10-23T19:24:54.223Z → 2026-10-23T19:24:59.494Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T19:24:59.514Z → 2026-10-23T19:25:00.128Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T19:25:00.147Z → 2026-10-23T19:25:00.640Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T19:25:00.658Z → 2026-10-23T19:25:01.268Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T19:25:01.287Z → 2026-10-23T19:25:03.040Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T19:25:03.063Z → 2026-10-23T19:25:03.531Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T19:25:03.548Z → 2026-10-23T19:25:05.240Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T19:25:05.260Z → 2026-10-23T19:25:05.889Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T19:25:05.907Z → 2026-10-23T19:25:07.369Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T19:25:07.392Z → 2026-10-23T19:25:11.537Z
- tests/core/evidenceTransforms.ts: PASS; 2026-10-23T19:25:11.555Z → 2026-10-23T19:25:12.240Z
- tests/core/evidenceIntegration.ts: PASS; 2026-10-23T19:25:12.259Z → 2026-10-23T19:25:24.984Z
- tests/core/sourceContracts.ts: PASS; 2026-10-23T19:25:25.017Z → 2026-10-23T19:25:25.814Z
- tests/core/evidenceChaining.ts: PASS; 2026-10-23T19:25:25.833Z → 2026-10-23T19:25:26.351Z

### provider-auth — PASS

2026-10-23T19:25:27.223Z → 2026-10-23T19:25:36.235Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-13 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T19:25:27.225Z → 2026-10-23T19:25:36.234Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T19:25:35.086Z → 2026-10-23T19:25:35.477Z

### postgres-tls — PASS

2026-10-23T19:25:36.237Z → 2026-10-23T19:25:45.653Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-14 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T19:25:36.239Z → 2026-10-23T19:25:45.653Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T19:25:44.218Z → 2026-10-23T19:25:44.896Z

### contracts — PASS

2026-10-23T19:25:45.656Z → 2026-10-23T19:25:56.232Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-15 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T19:25:45.657Z → 2026-10-23T19:25:56.232Z

- tests/release/contracts.ts: PASS; 2026-10-23T19:25:54.682Z → 2026-10-23T19:25:55.371Z

### synthetic-pilot — PASS

2026-10-23T19:25:56.235Z → 2026-10-23T19:26:06.074Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-16 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T19:25:56.236Z → 2026-10-23T19:26:06.073Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T19:26:04.430Z → 2026-10-23T19:26:05.265Z

### managed-schema — PASS

2026-10-23T19:26:06.076Z → 2026-10-23T19:26:17.181Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-17 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T19:26:06.077Z → 2026-10-23T19:26:17.181Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T19:26:16.094Z → 2026-10-23T19:26:16.410Z

### local-bundle — PASS

2026-10-23T19:26:17.184Z → 2026-10-23T19:26:27.801Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-18 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T19:26:17.185Z → 2026-10-23T19:26:27.801Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T19:26:26.608Z → 2026-10-23T19:26:27.031Z

### closed-setup — PASS

2026-10-23T19:26:27.804Z → 2026-10-23T19:26:37.945Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-19 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T19:26:27.805Z → 2026-10-23T19:26:37.945Z

- tests/release/setup.ts: PASS; 2026-10-23T19:26:36.580Z → 2026-10-23T19:26:37.149Z

### database-contract — PASS

2026-10-23T19:26:37.948Z → 2026-10-23T19:26:48.667Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-20 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T19:26:37.949Z → 2026-10-23T19:26:48.667Z

- tests/release/database_check.ts: PASS; 2026-10-23T19:26:47.378Z → 2026-10-23T19:26:47.831Z

### prelaunch-gate — PASS

2026-10-23T19:26:48.670Z → 2026-10-23T19:26:59.046Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-21 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T19:26:48.673Z → 2026-10-23T19:26:59.046Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T19:26:57.886Z → 2026-10-23T19:26:58.222Z

### service-provisioning — PASS

2026-10-23T19:26:59.048Z → 2026-10-23T19:27:12.600Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-22 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T19:26:59.050Z → 2026-10-23T19:27:12.600Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T19:27:08.819Z → 2026-10-23T19:27:11.776Z

### operator-provisioning — PASS

2026-10-23T19:27:12.603Z → 2026-10-23T19:27:25.500Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-23 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T19:27:12.605Z → 2026-10-23T19:27:25.500Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T19:27:21.217Z → 2026-10-23T19:27:24.644Z

### provisioning-backup-recovery — PASS

2026-10-23T19:27:25.502Z → 2026-10-23T19:27:29.274Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792783354550-8ce089e5-pg sam-verify-1792783354550-8ce089e5
```
Exit: 0; signal: none; 2026-10-23T19:27:25.505Z → 2026-10-23T19:27:29.274Z


### render-migration-compatibility — PASS

2026-10-23T19:27:29.277Z → 2026-10-23T19:27:41.802Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-24 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T19:27:29.279Z → 2026-10-23T19:27:41.801Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T19:27:39.761Z → 2026-10-23T19:27:41.026Z

### render-google-oauth-contracts — PASS

2026-10-23T19:27:41.805Z → 2026-10-23T19:27:58.413Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-25 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/isolated/normalized_connectors.ts tests/isolated/goal_obligations.ts tests/isolated/collection_receipts.ts tests/isolated/shared_goal_contract.ts tests/isolated/delegation_scope.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-23T19:27:41.807Z → 2026-10-23T19:27:58.413Z


### integration-migrations — PASS

2026-10-23T19:27:58.417Z → 2026-10-23T19:28:09.649Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-26 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-23T19:27:58.418Z → 2026-10-23T19:28:09.649Z

- tests/integration/migrations.ts: PASS; 2026-10-23T19:28:07.311Z → 2026-10-23T19:28:08.781Z

### integration-oauth-mcp — PASS

2026-10-23T19:28:09.651Z → 2026-10-23T19:28:19.845Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-27 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-23T19:28:09.653Z → 2026-10-23T19:28:19.845Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-23T19:28:18.510Z → 2026-10-23T19:28:19.017Z

### integration-orchestration — FAIL

2026-10-23T19:28:19.848Z → 2026-10-23T19:28:20.495Z

```sh
docker run --rm --name sam-verify-1792783354550-8ce089e5-job-28 --label sam.verification.run=sam-verify-1792783354550-8ce089e5 --init --network container:sam-verify-1792783354550-8ce089e5-pg --mount type=bind,src=/tmp/sam-verify-8osGki/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=f2123ea9cdd1d1b80cb35ae5000f4e148b6ce6c8 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 143; signal: none; 2026-10-23T19:28:19.852Z → 2026-10-23T19:28:20.495Z


### specialist-reasoning — NOT_RUN

not started → not completed


### specialist-gateway — NOT_RUN

not started → not completed


### specialist-provenance — NOT_RUN

not started → not completed


### specialist-learning-fairness — NOT_RUN

not started → not completed


### specialist-evaluation — NOT_RUN

not started → not completed


### evaluation-budget — NOT_RUN

not started → not completed


### evaluation-adapter — NOT_RUN

not started → not completed


### evaluation-orchestration — NOT_RUN

not started → not completed


### evaluation-independent-review — NOT_RUN

not started → not completed


### evaluation-commercial-market — NOT_RUN

not started → not completed


### evaluation-commercial-profitability — NOT_RUN

not started → not completed


### evaluation-commercial-suppliers — NOT_RUN

not started → not completed


### migration-upgrade-rollback — NOT_RUN

not started → not completed


### specialist-restart-prepare — NOT_RUN

not started → not completed


### evaluation-restart-prepare — NOT_RUN

not started → not completed


### postgres-restart — NOT_RUN

not started → not completed


### migration-after-restart — NOT_RUN

not started → not completed


### specialist-restart-check — NOT_RUN

not started → not completed


### evaluation-restart-check — NOT_RUN

not started → not completed


### phase0-migrations — NOT_RUN

not started → not completed


### phase0-acceptance — NOT_RUN

not started → not completed


### phase0-postgres — NOT_RUN

not started → not completed


### tenant-isolation — NOT_RUN

not started → not completed


### fail-closed-security — NOT_RUN

not started → not completed


### clean-image — NOT_RUN

not started → not completed


### image-contract — NOT_RUN

not started → not completed


### application-startup-restart — NOT_RUN

not started → not completed


### source-integrity — NOT_RUN

not started → not completed


### shared-goal-path — NOT_RUN

not started → not completed


### cleanup — PASS

2026-10-23T19:28:20.497Z → 2026-10-23T19:28:22.068Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-pg
```
Exit: 0; signal: none; 2026-10-23T19:28:20.500Z → 2026-10-23T19:28:20.513Z

```sh
docker rm --force --volumes sam-verify-1792783354550-8ce089e5-pg
```
Exit: 0; signal: none; 2026-10-23T19:28:20.513Z → 2026-10-23T19:28:21.259Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-1
```
Exit: 1; signal: none; 2026-10-23T19:28:21.259Z → 2026-10-23T19:28:21.282Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-2
```
Exit: 1; signal: none; 2026-10-23T19:28:21.282Z → 2026-10-23T19:28:21.323Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-3
```
Exit: 1; signal: none; 2026-10-23T19:28:21.323Z → 2026-10-23T19:28:21.356Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-4
```
Exit: 1; signal: none; 2026-10-23T19:28:21.356Z → 2026-10-23T19:28:21.382Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-5
```
Exit: 1; signal: none; 2026-10-23T19:28:21.382Z → 2026-10-23T19:28:21.404Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-6
```
Exit: 1; signal: none; 2026-10-23T19:28:21.404Z → 2026-10-23T19:28:21.429Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-7
```
Exit: 1; signal: none; 2026-10-23T19:28:21.429Z → 2026-10-23T19:28:21.451Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-8
```
Exit: 1; signal: none; 2026-10-23T19:28:21.451Z → 2026-10-23T19:28:21.474Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-9
```
Exit: 1; signal: none; 2026-10-23T19:28:21.474Z → 2026-10-23T19:28:21.498Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-10
```
Exit: 1; signal: none; 2026-10-23T19:28:21.498Z → 2026-10-23T19:28:21.520Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-11
```
Exit: 1; signal: none; 2026-10-23T19:28:21.520Z → 2026-10-23T19:28:21.548Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-12
```
Exit: 1; signal: none; 2026-10-23T19:28:21.548Z → 2026-10-23T19:28:21.571Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-13
```
Exit: 1; signal: none; 2026-10-23T19:28:21.571Z → 2026-10-23T19:28:21.592Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-14
```
Exit: 1; signal: none; 2026-10-23T19:28:21.592Z → 2026-10-23T19:28:21.615Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-15
```
Exit: 1; signal: none; 2026-10-23T19:28:21.615Z → 2026-10-23T19:28:21.640Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-16
```
Exit: 1; signal: none; 2026-10-23T19:28:21.640Z → 2026-10-23T19:28:21.667Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-17
```
Exit: 1; signal: none; 2026-10-23T19:28:21.667Z → 2026-10-23T19:28:21.689Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-18
```
Exit: 1; signal: none; 2026-10-23T19:28:21.689Z → 2026-10-23T19:28:21.714Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-19
```
Exit: 1; signal: none; 2026-10-23T19:28:21.714Z → 2026-10-23T19:28:21.735Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-20
```
Exit: 1; signal: none; 2026-10-23T19:28:21.736Z → 2026-10-23T19:28:21.758Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-21
```
Exit: 1; signal: none; 2026-10-23T19:28:21.758Z → 2026-10-23T19:28:21.778Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-22
```
Exit: 1; signal: none; 2026-10-23T19:28:21.778Z → 2026-10-23T19:28:21.807Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-23
```
Exit: 1; signal: none; 2026-10-23T19:28:21.807Z → 2026-10-23T19:28:21.835Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-24
```
Exit: 1; signal: none; 2026-10-23T19:28:21.835Z → 2026-10-23T19:28:21.862Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-25
```
Exit: 1; signal: none; 2026-10-23T19:28:21.862Z → 2026-10-23T19:28:21.886Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-26
```
Exit: 1; signal: none; 2026-10-23T19:28:21.886Z → 2026-10-23T19:28:21.907Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-27
```
Exit: 1; signal: none; 2026-10-23T19:28:21.907Z → 2026-10-23T19:28:21.928Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-job-28
```
Exit: 1; signal: none; 2026-10-23T19:28:21.928Z → 2026-10-23T19:28:21.947Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792783354550-8ce089e5-net
```
Exit: 0; signal: none; 2026-10-23T19:28:21.947Z → 2026-10-23T19:28:21.960Z

```sh
docker network rm sam-verify-1792783354550-8ce089e5-net
```
Exit: 0; signal: none; 2026-10-23T19:28:21.960Z → 2026-10-23T19:28:22.042Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
