# Independent SAM verification

Status: **FAIL**
Source: `ce4356c697cf96a900e95b65513bd5c8c2af636c` (clean: true)
Started: 2026-10-23T06:28:09.427Z; completed: 2026-10-23T06:36:20.168Z

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
| evaluation-budget | FAIL | [log](logs/36-evaluation-budget.log) |
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
| cleanup | PASS | [log](logs/59-cleanup.log) |

## Unresolved defects / blockers

- evaluation-budget: exit 143 (see logs/36-evaluation-budget.log)
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

2026-10-23T06:28:09.428Z → 2026-10-23T06:28:09.676Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T06:28:09.431Z → 2026-10-23T06:28:09.436Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T06:28:09.436Z → 2026-10-23T06:28:09.439Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T06:28:09.439Z → 2026-10-23T06:28:09.443Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T06:28:09.443Z → 2026-10-23T06:28:09.455Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T06:28:09.455Z → 2026-10-23T06:28:09.474Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T06:28:09.475Z → 2026-10-23T06:28:09.531Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T06:28:09.531Z → 2026-10-23T06:28:09.606Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T06:28:09.606Z → 2026-10-23T06:28:09.663Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T06:28:09.663Z → 2026-10-23T06:28:09.665Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T06:28:09.665Z → 2026-10-23T06:28:09.674Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T06:28:09.674Z → 2026-10-23T06:28:09.676Z


### snapshot — PASS

2026-10-23T06:28:09.677Z → 2026-10-23T06:28:09.746Z

```sh
git archive --format=tar --output /tmp/sam-verify-N5prp3/source.tar ce4356c697cf96a900e95b65513bd5c8c2af636c
```
Exit: 0; signal: none; 2026-10-23T06:28:09.677Z → 2026-10-23T06:28:09.710Z

```sh
tar -xf /tmp/sam-verify-N5prp3/source.tar -C /tmp/sam-verify-N5prp3/source
```
Exit: 0; signal: none; 2026-10-23T06:28:09.710Z → 2026-10-23T06:28:09.719Z


### images — PASS

2026-10-23T06:28:09.746Z → 2026-10-23T06:28:09.863Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T06:28:09.747Z → 2026-10-23T06:28:09.764Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T06:28:09.764Z → 2026-10-23T06:28:09.778Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T06:28:09.778Z → 2026-10-23T06:28:09.792Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T06:28:09.792Z → 2026-10-23T06:28:09.806Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T06:28:09.806Z → 2026-10-23T06:28:09.821Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T06:28:09.821Z → 2026-10-23T06:28:09.836Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T06:28:09.836Z → 2026-10-23T06:28:09.849Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T06:28:09.849Z → 2026-10-23T06:28:09.863Z


### isolated-postgres — PASS

2026-10-23T06:28:09.864Z → 2026-10-23T06:28:15.123Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792736889426-f5c6946f sam-verify-1792736889426-f5c6946f-net
```
Exit: 0; signal: none; 2026-10-23T06:28:09.865Z → 2026-10-23T06:28:09.898Z

```sh
docker run --detach --name sam-verify-1792736889426-f5c6946f-pg --label sam.verification.run=sam-verify-1792736889426-f5c6946f --network sam-verify-1792736889426-f5c6946f-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T06:28:09.898Z → 2026-10-23T06:28:12.599Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792736889426-f5c6946f-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T06:28:12.599Z → 2026-10-23T06:28:12.721Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792736889426-f5c6946f-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T06:28:13.222Z → 2026-10-23T06:28:13.348Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792736889426-f5c6946f-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T06:28:13.849Z → 2026-10-23T06:28:13.959Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792736889426-f5c6946f-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T06:28:14.460Z → 2026-10-23T06:28:14.573Z

```sh
docker exec sam-verify-1792736889426-f5c6946f-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T06:28:14.573Z → 2026-10-23T06:28:14.767Z

```sh
docker exec sam-verify-1792736889426-f5c6946f-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T06:28:14.767Z → 2026-10-23T06:28:14.944Z

```sh
docker exec sam-verify-1792736889426-f5c6946f-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T06:28:14.944Z → 2026-10-23T06:28:15.123Z


### node-dependencies — PASS

2026-10-23T06:28:15.128Z → 2026-10-23T06:28:29.877Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-1 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T06:28:15.129Z → 2026-10-23T06:28:29.877Z


### python-dependencies — PASS

2026-10-23T06:28:29.878Z → 2026-10-23T06:28:34.487Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-2 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-N5prp3/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T06:28:29.879Z → 2026-10-23T06:28:34.487Z


### runtime-versions — PASS

2026-10-23T06:28:34.489Z → 2026-10-23T06:29:04.163Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-3 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T06:28:34.490Z → 2026-10-23T06:28:44.302Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-4 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T06:28:44.302Z → 2026-10-23T06:28:53.521Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-5 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T06:28:53.521Z → 2026-10-23T06:29:03.223Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-6 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T06:29:03.223Z → 2026-10-23T06:29:04.076Z

```sh
docker exec sam-verify-1792736889426-f5c6946f-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T06:29:04.076Z → 2026-10-23T06:29:04.163Z


### workflow-tool — PASS

2026-10-23T06:29:04.165Z → 2026-10-23T06:29:04.722Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-N5prp3/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T06:29:04.166Z → 2026-10-23T06:29:04.678Z

```sh
tar -xzf /tmp/sam-verify-N5prp3/actionlint.tar.gz -C /tmp/sam-verify-N5prp3 actionlint
```
Exit: 0; signal: none; 2026-10-23T06:29:04.680Z → 2026-10-23T06:29:04.718Z

```sh
/tmp/sam-verify-N5prp3/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T06:29:04.718Z → 2026-10-23T06:29:04.722Z


### workflow-validation — PASS

2026-10-23T06:29:04.724Z → 2026-10-23T06:29:04.728Z

```sh
/tmp/sam-verify-N5prp3/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T06:29:04.725Z → 2026-10-23T06:29:04.728Z


### configuration-validation — PASS

2026-10-23T06:29:04.729Z → 2026-10-23T06:29:36.239Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T06:29:04.731Z → 2026-10-23T06:29:04.964Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:29:04.964Z → 2026-10-23T06:29:05.030Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:29:05.030Z → 2026-10-23T06:29:05.104Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:29:05.104Z → 2026-10-23T06:29:05.182Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:29:05.182Z → 2026-10-23T06:29:05.254Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-7 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T06:29:05.254Z → 2026-10-23T06:29:17.058Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-8 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T06:29:17.058Z → 2026-10-23T06:29:27.301Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-9 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T06:29:27.301Z → 2026-10-23T06:29:36.238Z


### typecheck — PASS

2026-10-23T06:29:36.240Z → 2026-10-23T06:29:51.408Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-10 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T06:29:36.241Z → 2026-10-23T06:29:51.408Z


### regression — PASS

2026-10-23T06:29:51.410Z → 2026-10-23T06:30:33.165Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-11 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T06:29:51.411Z → 2026-10-23T06:30:33.165Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T06:30:00.845Z → 2026-10-23T06:30:01.495Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T06:30:01.516Z → 2026-10-23T06:30:01.984Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T06:30:02.005Z → 2026-10-23T06:30:02.532Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T06:30:02.553Z → 2026-10-23T06:30:03.165Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T06:30:03.188Z → 2026-10-23T06:30:03.760Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T06:30:03.780Z → 2026-10-23T06:30:04.207Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T06:30:04.228Z → 2026-10-23T06:30:04.899Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T06:30:04.916Z → 2026-10-23T06:30:05.525Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T06:30:05.547Z → 2026-10-23T06:30:06.171Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T06:30:06.200Z → 2026-10-23T06:30:06.723Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T06:30:06.741Z → 2026-10-23T06:30:07.262Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T06:30:07.296Z → 2026-10-23T06:30:07.718Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T06:30:07.737Z → 2026-10-23T06:30:08.354Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T06:30:08.376Z → 2026-10-23T06:30:08.907Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T06:30:08.925Z → 2026-10-23T06:30:09.381Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T06:30:09.402Z → 2026-10-23T06:30:09.956Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T06:30:09.975Z → 2026-10-23T06:30:10.540Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T06:30:10.562Z → 2026-10-23T06:30:11.153Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T06:30:11.176Z → 2026-10-23T06:30:11.760Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T06:30:11.779Z → 2026-10-23T06:30:12.250Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T06:30:12.267Z → 2026-10-23T06:30:12.744Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T06:30:12.949Z → 2026-10-23T06:30:13.386Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T06:30:13.406Z → 2026-10-23T06:30:13.975Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T06:30:14.003Z → 2026-10-23T06:30:15.461Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T06:30:15.480Z → 2026-10-23T06:30:16.059Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T06:30:16.080Z → 2026-10-23T06:30:16.552Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T06:30:16.570Z → 2026-10-23T06:30:17.276Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T06:30:17.293Z → 2026-10-23T06:30:18.304Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T06:30:18.325Z → 2026-10-23T06:30:18.857Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T06:30:18.876Z → 2026-10-23T06:30:19.388Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T06:30:19.407Z → 2026-10-23T06:30:20.224Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T06:30:20.242Z → 2026-10-23T06:30:20.715Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T06:30:20.732Z → 2026-10-23T06:30:21.221Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T06:30:21.242Z → 2026-10-23T06:30:21.775Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T06:30:21.804Z → 2026-10-23T06:30:22.317Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T06:30:22.336Z → 2026-10-23T06:30:22.975Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T06:30:22.993Z → 2026-10-23T06:30:23.459Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T06:30:23.477Z → 2026-10-23T06:30:23.983Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T06:30:24.001Z → 2026-10-23T06:30:24.507Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T06:30:24.525Z → 2026-10-23T06:30:25.023Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T06:30:25.041Z → 2026-10-23T06:30:26.114Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T06:30:26.135Z → 2026-10-23T06:30:26.512Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T06:30:26.534Z → 2026-10-23T06:30:28.012Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T06:30:28.033Z → 2026-10-23T06:30:28.559Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T06:30:28.578Z → 2026-10-23T06:30:29.215Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T06:30:29.237Z → 2026-10-23T06:30:29.802Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T06:30:29.820Z → 2026-10-23T06:30:30.671Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T06:30:30.690Z → 2026-10-23T06:30:31.422Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T06:30:31.456Z → 2026-10-23T06:30:32.275Z

### core-reliability — PASS

2026-10-23T06:30:33.168Z → 2026-10-23T06:31:00.311Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-12 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T06:30:33.170Z → 2026-10-23T06:31:00.310Z

- tests/core/reliability.ts: PASS; 2026-10-23T06:30:43.106Z → 2026-10-23T06:30:48.752Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T06:30:48.794Z → 2026-10-23T06:30:49.461Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T06:30:49.479Z → 2026-10-23T06:30:50.053Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T06:30:50.073Z → 2026-10-23T06:30:50.729Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T06:30:50.748Z → 2026-10-23T06:30:52.887Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T06:30:52.921Z → 2026-10-23T06:30:53.446Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T06:30:53.469Z → 2026-10-23T06:30:55.274Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T06:30:55.308Z → 2026-10-23T06:30:56.052Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T06:30:56.072Z → 2026-10-23T06:30:57.586Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T06:30:57.606Z → 2026-10-23T06:30:58.724Z
- tests/core/evidenceTransforms.ts: PASS; 2026-10-23T06:30:58.745Z → 2026-10-23T06:30:59.416Z

### provider-auth — PASS

2026-10-23T06:31:00.312Z → 2026-10-23T06:31:09.980Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-13 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T06:31:00.313Z → 2026-10-23T06:31:09.980Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T06:31:08.810Z → 2026-10-23T06:31:09.215Z

### postgres-tls — PASS

2026-10-23T06:31:09.982Z → 2026-10-23T06:31:21.904Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-14 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T06:31:09.983Z → 2026-10-23T06:31:21.904Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T06:31:20.328Z → 2026-10-23T06:31:20.979Z

### contracts — PASS

2026-10-23T06:31:21.907Z → 2026-10-23T06:31:33.884Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-15 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T06:31:21.909Z → 2026-10-23T06:31:33.884Z

- tests/release/contracts.ts: PASS; 2026-10-23T06:31:32.354Z → 2026-10-23T06:31:33.035Z

### synthetic-pilot — PASS

2026-10-23T06:31:33.886Z → 2026-10-23T06:31:44.914Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-16 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T06:31:33.887Z → 2026-10-23T06:31:44.914Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T06:31:43.393Z → 2026-10-23T06:31:44.103Z

### managed-schema — PASS

2026-10-23T06:31:44.917Z → 2026-10-23T06:31:55.605Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-17 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T06:31:44.918Z → 2026-10-23T06:31:55.605Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T06:31:54.599Z → 2026-10-23T06:31:54.850Z

### local-bundle — PASS

2026-10-23T06:31:55.607Z → 2026-10-23T06:32:05.592Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-18 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T06:31:55.608Z → 2026-10-23T06:32:05.592Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T06:32:04.428Z → 2026-10-23T06:32:04.868Z

### closed-setup — PASS

2026-10-23T06:32:05.594Z → 2026-10-23T06:32:15.943Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-19 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T06:32:05.595Z → 2026-10-23T06:32:15.943Z

- tests/release/setup.ts: PASS; 2026-10-23T06:32:14.592Z → 2026-10-23T06:32:15.160Z

### database-contract — PASS

2026-10-23T06:32:15.946Z → 2026-10-23T06:32:27.204Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-20 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T06:32:15.947Z → 2026-10-23T06:32:27.204Z

- tests/release/database_check.ts: PASS; 2026-10-23T06:32:25.940Z → 2026-10-23T06:32:26.304Z

### prelaunch-gate — PASS

2026-10-23T06:32:27.207Z → 2026-10-23T06:32:37.452Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-21 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T06:32:27.209Z → 2026-10-23T06:32:37.452Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T06:32:36.353Z → 2026-10-23T06:32:36.689Z

### service-provisioning — PASS

2026-10-23T06:32:37.454Z → 2026-10-23T06:32:50.474Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-22 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T06:32:37.455Z → 2026-10-23T06:32:50.473Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T06:32:45.890Z → 2026-10-23T06:32:49.640Z

### operator-provisioning — PASS

2026-10-23T06:32:50.476Z → 2026-10-23T06:33:03.654Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-23 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T06:32:50.479Z → 2026-10-23T06:33:03.654Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T06:32:59.326Z → 2026-10-23T06:33:02.861Z

### provisioning-backup-recovery — PASS

2026-10-23T06:33:03.660Z → 2026-10-23T06:33:07.305Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792736889426-f5c6946f-pg sam-verify-1792736889426-f5c6946f
```
Exit: 0; signal: none; 2026-10-23T06:33:03.668Z → 2026-10-23T06:33:07.305Z


### render-migration-compatibility — PASS

2026-10-23T06:33:07.308Z → 2026-10-23T06:33:20.290Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-24 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T06:33:07.310Z → 2026-10-23T06:33:20.290Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T06:33:18.130Z → 2026-10-23T06:33:19.454Z

### render-google-oauth-contracts — PASS

2026-10-23T06:33:20.292Z → 2026-10-23T06:33:36.470Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-25 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-23T06:33:20.295Z → 2026-10-23T06:33:36.470Z


### integration-migrations — PASS

2026-10-23T06:33:36.473Z → 2026-10-23T06:33:48.448Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-26 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-23T06:33:36.475Z → 2026-10-23T06:33:48.447Z

- tests/integration/migrations.ts: PASS; 2026-10-23T06:33:46.236Z → 2026-10-23T06:33:47.606Z

### integration-oauth-mcp — PASS

2026-10-23T06:33:48.451Z → 2026-10-23T06:33:58.955Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-27 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-23T06:33:48.453Z → 2026-10-23T06:33:58.954Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-23T06:33:57.499Z → 2026-10-23T06:33:58.066Z

### integration-orchestration — PASS

2026-10-23T06:33:58.957Z → 2026-10-23T06:34:16.644Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-28 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T06:33:58.959Z → 2026-10-23T06:34:16.643Z

- tests/integration/orchestration.ts: PASS; 2026-10-23T06:34:09.220Z → 2026-10-23T06:34:15.799Z

### specialist-reasoning — PASS

2026-10-23T06:34:16.646Z → 2026-10-23T06:35:28.632Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-29 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-23T06:34:16.649Z → 2026-10-23T06:35:28.631Z

- tests/specialists/acceptance.ts: PASS; 2026-10-23T06:34:26.075Z → 2026-10-23T06:35:27.656Z

### specialist-gateway — PASS

2026-10-23T06:35:28.635Z → 2026-10-23T06:35:41.043Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-30 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-23T06:35:28.638Z → 2026-10-23T06:35:41.043Z

- tests/specialists/gateway.ts: PASS; 2026-10-23T06:35:39.541Z → 2026-10-23T06:35:40.133Z

### specialist-provenance — PASS

2026-10-23T06:35:41.046Z → 2026-10-23T06:35:53.374Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-31 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-23T06:35:41.048Z → 2026-10-23T06:35:53.373Z

- tests/specialists/provenance.ts: PASS; 2026-10-23T06:35:51.944Z → 2026-10-23T06:35:52.430Z

### specialist-learning-fairness — PASS

2026-10-23T06:35:53.377Z → 2026-10-23T06:36:04.832Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-32 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-23T06:35:53.380Z → 2026-10-23T06:36:04.832Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-23T06:36:02.902Z → 2026-10-23T06:36:03.976Z

### specialist-evaluation — PASS

2026-10-23T06:36:04.836Z → 2026-10-23T06:36:16.534Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-33 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-23T06:36:04.837Z → 2026-10-23T06:36:16.534Z


### evaluation-budget — FAIL

2026-10-23T06:36:16.538Z → 2026-10-23T06:36:18.324Z

```sh
docker run --rm --name sam-verify-1792736889426-f5c6946f-job-34 --label sam.verification.run=sam-verify-1792736889426-f5c6946f --init --network container:sam-verify-1792736889426-f5c6946f-pg --mount type=bind,src=/tmp/sam-verify-N5prp3/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=ce4356c697cf96a900e95b65513bd5c8c2af636c --mount type=bind,source=/tmp/sam-generic-full-v3/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 143; signal: none; 2026-10-23T06:36:16.540Z → 2026-10-23T06:36:18.324Z


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


### cleanup — PASS

2026-10-23T06:36:18.327Z → 2026-10-23T06:36:20.163Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-pg
```
Exit: 0; signal: none; 2026-10-23T06:36:18.329Z → 2026-10-23T06:36:18.350Z

```sh
docker rm --force --volumes sam-verify-1792736889426-f5c6946f-pg
```
Exit: 0; signal: none; 2026-10-23T06:36:18.350Z → 2026-10-23T06:36:18.923Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-1
```
Exit: 1; signal: none; 2026-10-23T06:36:18.923Z → 2026-10-23T06:36:18.950Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-2
```
Exit: 1; signal: none; 2026-10-23T06:36:18.950Z → 2026-10-23T06:36:18.973Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-3
```
Exit: 1; signal: none; 2026-10-23T06:36:18.973Z → 2026-10-23T06:36:19.010Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-4
```
Exit: 1; signal: none; 2026-10-23T06:36:19.010Z → 2026-10-23T06:36:19.039Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-5
```
Exit: 1; signal: none; 2026-10-23T06:36:19.039Z → 2026-10-23T06:36:19.065Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-6
```
Exit: 1; signal: none; 2026-10-23T06:36:19.066Z → 2026-10-23T06:36:19.094Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-7
```
Exit: 1; signal: none; 2026-10-23T06:36:19.094Z → 2026-10-23T06:36:19.123Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-8
```
Exit: 1; signal: none; 2026-10-23T06:36:19.123Z → 2026-10-23T06:36:19.152Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-9
```
Exit: 1; signal: none; 2026-10-23T06:36:19.152Z → 2026-10-23T06:36:19.182Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-10
```
Exit: 1; signal: none; 2026-10-23T06:36:19.183Z → 2026-10-23T06:36:19.207Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-11
```
Exit: 1; signal: none; 2026-10-23T06:36:19.207Z → 2026-10-23T06:36:19.232Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-12
```
Exit: 1; signal: none; 2026-10-23T06:36:19.232Z → 2026-10-23T06:36:19.258Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-13
```
Exit: 1; signal: none; 2026-10-23T06:36:19.258Z → 2026-10-23T06:36:19.298Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-14
```
Exit: 1; signal: none; 2026-10-23T06:36:19.298Z → 2026-10-23T06:36:19.325Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-15
```
Exit: 1; signal: none; 2026-10-23T06:36:19.325Z → 2026-10-23T06:36:19.347Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-16
```
Exit: 1; signal: none; 2026-10-23T06:36:19.347Z → 2026-10-23T06:36:19.378Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-17
```
Exit: 1; signal: none; 2026-10-23T06:36:19.378Z → 2026-10-23T06:36:19.409Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-18
```
Exit: 1; signal: none; 2026-10-23T06:36:19.409Z → 2026-10-23T06:36:19.436Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-19
```
Exit: 1; signal: none; 2026-10-23T06:36:19.436Z → 2026-10-23T06:36:19.460Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-20
```
Exit: 1; signal: none; 2026-10-23T06:36:19.460Z → 2026-10-23T06:36:19.484Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-21
```
Exit: 1; signal: none; 2026-10-23T06:36:19.484Z → 2026-10-23T06:36:19.511Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-22
```
Exit: 1; signal: none; 2026-10-23T06:36:19.511Z → 2026-10-23T06:36:19.534Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-23
```
Exit: 1; signal: none; 2026-10-23T06:36:19.534Z → 2026-10-23T06:36:19.575Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-24
```
Exit: 1; signal: none; 2026-10-23T06:36:19.575Z → 2026-10-23T06:36:19.608Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-25
```
Exit: 1; signal: none; 2026-10-23T06:36:19.608Z → 2026-10-23T06:36:19.634Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-26
```
Exit: 1; signal: none; 2026-10-23T06:36:19.634Z → 2026-10-23T06:36:19.664Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-27
```
Exit: 1; signal: none; 2026-10-23T06:36:19.664Z → 2026-10-23T06:36:19.697Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-28
```
Exit: 1; signal: none; 2026-10-23T06:36:19.697Z → 2026-10-23T06:36:19.748Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-29
```
Exit: 1; signal: none; 2026-10-23T06:36:19.748Z → 2026-10-23T06:36:19.800Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-30
```
Exit: 1; signal: none; 2026-10-23T06:36:19.800Z → 2026-10-23T06:36:19.839Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-31
```
Exit: 1; signal: none; 2026-10-23T06:36:19.839Z → 2026-10-23T06:36:19.901Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-32
```
Exit: 1; signal: none; 2026-10-23T06:36:19.901Z → 2026-10-23T06:36:19.951Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-33
```
Exit: 1; signal: none; 2026-10-23T06:36:19.951Z → 2026-10-23T06:36:19.981Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-job-34
```
Exit: 1; signal: none; 2026-10-23T06:36:19.981Z → 2026-10-23T06:36:20.018Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792736889426-f5c6946f-net
```
Exit: 0; signal: none; 2026-10-23T06:36:20.018Z → 2026-10-23T06:36:20.058Z

```sh
docker network rm sam-verify-1792736889426-f5c6946f-net
```
Exit: 0; signal: none; 2026-10-23T06:36:20.058Z → 2026-10-23T06:36:20.119Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
