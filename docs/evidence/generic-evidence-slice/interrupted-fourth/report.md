# Independent SAM verification

Status: **FAIL**
Source: `32ae2ac33fc962d45164d60c7c1d037e07ba101f` (clean: true)
Started: 2026-10-23T06:37:04.196Z; completed: 2026-10-23T06:42:13.429Z

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
| provisioning-backup-recovery | FAIL | [log](logs/25-provisioning-backup-recovery.log) |
| render-migration-compatibility | NOT_RUN | not executed |
| render-google-oauth-contracts | NOT_RUN | not executed |
| integration-migrations | NOT_RUN | not executed |
| integration-oauth-mcp | NOT_RUN | not executed |
| integration-orchestration | NOT_RUN | not executed |
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
| cleanup | PASS | [log](logs/59-cleanup.log) |

## Unresolved defects / blockers

- provisioning-backup-recovery: exit null (see logs/25-provisioning-backup-recovery.log)
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

2026-10-23T06:37:04.198Z → 2026-10-23T06:37:04.462Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T06:37:04.202Z → 2026-10-23T06:37:04.208Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T06:37:04.208Z → 2026-10-23T06:37:04.211Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T06:37:04.211Z → 2026-10-23T06:37:04.215Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T06:37:04.215Z → 2026-10-23T06:37:04.227Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T06:37:04.228Z → 2026-10-23T06:37:04.247Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T06:37:04.247Z → 2026-10-23T06:37:04.314Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T06:37:04.314Z → 2026-10-23T06:37:04.388Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T06:37:04.388Z → 2026-10-23T06:37:04.444Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T06:37:04.444Z → 2026-10-23T06:37:04.446Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T06:37:04.446Z → 2026-10-23T06:37:04.460Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T06:37:04.460Z → 2026-10-23T06:37:04.462Z


### snapshot — PASS

2026-10-23T06:37:04.464Z → 2026-10-23T06:37:04.541Z

```sh
git archive --format=tar --output /tmp/sam-verify-yeIVgb/source.tar 32ae2ac33fc962d45164d60c7c1d037e07ba101f
```
Exit: 0; signal: none; 2026-10-23T06:37:04.465Z → 2026-10-23T06:37:04.497Z

```sh
tar -xf /tmp/sam-verify-yeIVgb/source.tar -C /tmp/sam-verify-yeIVgb/source
```
Exit: 0; signal: none; 2026-10-23T06:37:04.497Z → 2026-10-23T06:37:04.507Z


### images — PASS

2026-10-23T06:37:04.542Z → 2026-10-23T06:37:04.672Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T06:37:04.543Z → 2026-10-23T06:37:04.561Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T06:37:04.561Z → 2026-10-23T06:37:04.576Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T06:37:04.576Z → 2026-10-23T06:37:04.592Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T06:37:04.592Z → 2026-10-23T06:37:04.607Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T06:37:04.607Z → 2026-10-23T06:37:04.625Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T06:37:04.625Z → 2026-10-23T06:37:04.642Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T06:37:04.642Z → 2026-10-23T06:37:04.656Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T06:37:04.656Z → 2026-10-23T06:37:04.671Z


### isolated-postgres — PASS

2026-10-23T06:37:04.673Z → 2026-10-23T06:37:09.519Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 sam-verify-1792737424196-df7d5eb2-net
```
Exit: 0; signal: none; 2026-10-23T06:37:04.674Z → 2026-10-23T06:37:04.706Z

```sh
docker run --detach --name sam-verify-1792737424196-df7d5eb2-pg --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --network sam-verify-1792737424196-df7d5eb2-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T06:37:04.706Z → 2026-10-23T06:37:07.757Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792737424196-df7d5eb2-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T06:37:07.757Z → 2026-10-23T06:37:07.862Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792737424196-df7d5eb2-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T06:37:08.363Z → 2026-10-23T06:37:08.450Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792737424196-df7d5eb2-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T06:37:08.951Z → 2026-10-23T06:37:09.035Z

```sh
docker exec sam-verify-1792737424196-df7d5eb2-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T06:37:09.035Z → 2026-10-23T06:37:09.184Z

```sh
docker exec sam-verify-1792737424196-df7d5eb2-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T06:37:09.184Z → 2026-10-23T06:37:09.346Z

```sh
docker exec sam-verify-1792737424196-df7d5eb2-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T06:37:09.346Z → 2026-10-23T06:37:09.519Z


### node-dependencies — PASS

2026-10-23T06:37:09.525Z → 2026-10-23T06:37:22.333Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-1 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T06:37:09.526Z → 2026-10-23T06:37:22.333Z


### python-dependencies — PASS

2026-10-23T06:37:22.334Z → 2026-10-23T06:37:25.614Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-2 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-yeIVgb/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T06:37:22.335Z → 2026-10-23T06:37:25.613Z


### runtime-versions — PASS

2026-10-23T06:37:25.615Z → 2026-10-23T06:38:02.806Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-3 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T06:37:25.616Z → 2026-10-23T06:37:36.873Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-4 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T06:37:36.873Z → 2026-10-23T06:37:49.034Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-5 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T06:37:49.034Z → 2026-10-23T06:38:00.828Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-6 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T06:38:00.829Z → 2026-10-23T06:38:02.715Z

```sh
docker exec sam-verify-1792737424196-df7d5eb2-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T06:38:02.715Z → 2026-10-23T06:38:02.806Z


### workflow-tool — PASS

2026-10-23T06:38:02.808Z → 2026-10-23T06:38:03.387Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-yeIVgb/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T06:38:02.809Z → 2026-10-23T06:38:03.340Z

```sh
tar -xzf /tmp/sam-verify-yeIVgb/actionlint.tar.gz -C /tmp/sam-verify-yeIVgb actionlint
```
Exit: 0; signal: none; 2026-10-23T06:38:03.343Z → 2026-10-23T06:38:03.384Z

```sh
/tmp/sam-verify-yeIVgb/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T06:38:03.384Z → 2026-10-23T06:38:03.387Z


### workflow-validation — PASS

2026-10-23T06:38:03.389Z → 2026-10-23T06:38:03.393Z

```sh
/tmp/sam-verify-yeIVgb/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T06:38:03.390Z → 2026-10-23T06:38:03.393Z


### configuration-validation — PASS

2026-10-23T06:38:03.394Z → 2026-10-23T06:38:39.624Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T06:38:03.395Z → 2026-10-23T06:38:03.637Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:38:03.637Z → 2026-10-23T06:38:03.708Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:38:03.708Z → 2026-10-23T06:38:03.792Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:38:03.792Z → 2026-10-23T06:38:03.868Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:38:03.868Z → 2026-10-23T06:38:03.935Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-7 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T06:38:03.935Z → 2026-10-23T06:38:15.861Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-8 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T06:38:15.861Z → 2026-10-23T06:38:27.929Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-9 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T06:38:27.929Z → 2026-10-23T06:38:39.624Z


### typecheck — PASS

2026-10-23T06:38:39.626Z → 2026-10-23T06:38:56.031Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-10 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T06:38:39.627Z → 2026-10-23T06:38:56.031Z


### regression — PASS

2026-10-23T06:38:56.033Z → 2026-10-23T06:39:37.385Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-11 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=32ae2ac33fc962d45164d60c7c1d037e07ba101f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T06:38:56.034Z → 2026-10-23T06:39:37.384Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T06:39:07.780Z → 2026-10-23T06:39:08.345Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T06:39:08.365Z → 2026-10-23T06:39:08.851Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T06:39:08.871Z → 2026-10-23T06:39:09.339Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T06:39:09.360Z → 2026-10-23T06:39:09.827Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T06:39:09.846Z → 2026-10-23T06:39:10.340Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T06:39:10.359Z → 2026-10-23T06:39:10.781Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T06:39:10.803Z → 2026-10-23T06:39:11.354Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T06:39:11.373Z → 2026-10-23T06:39:11.871Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T06:39:11.891Z → 2026-10-23T06:39:12.386Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T06:39:12.405Z → 2026-10-23T06:39:12.834Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T06:39:12.852Z → 2026-10-23T06:39:13.275Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T06:39:13.293Z → 2026-10-23T06:39:13.620Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T06:39:13.640Z → 2026-10-23T06:39:14.160Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T06:39:14.180Z → 2026-10-23T06:39:14.611Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T06:39:14.628Z → 2026-10-23T06:39:15.041Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T06:39:15.058Z → 2026-10-23T06:39:15.553Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T06:39:15.571Z → 2026-10-23T06:39:16.072Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T06:39:16.091Z → 2026-10-23T06:39:16.549Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T06:39:16.568Z → 2026-10-23T06:39:17.036Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T06:39:17.055Z → 2026-10-23T06:39:17.473Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T06:39:17.495Z → 2026-10-23T06:39:17.959Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T06:39:17.982Z → 2026-10-23T06:39:18.300Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T06:39:18.320Z → 2026-10-23T06:39:18.816Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T06:39:18.839Z → 2026-10-23T06:39:20.311Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T06:39:20.334Z → 2026-10-23T06:39:20.931Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T06:39:20.952Z → 2026-10-23T06:39:21.383Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T06:39:21.403Z → 2026-10-23T06:39:22.035Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T06:39:22.053Z → 2026-10-23T06:39:22.937Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T06:39:22.955Z → 2026-10-23T06:39:23.450Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T06:39:23.472Z → 2026-10-23T06:39:23.936Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T06:39:23.953Z → 2026-10-23T06:39:24.652Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T06:39:24.673Z → 2026-10-23T06:39:25.161Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T06:39:25.185Z → 2026-10-23T06:39:25.660Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T06:39:25.683Z → 2026-10-23T06:39:26.121Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T06:39:26.139Z → 2026-10-23T06:39:26.576Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T06:39:26.600Z → 2026-10-23T06:39:27.298Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T06:39:27.316Z → 2026-10-23T06:39:27.921Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T06:39:27.940Z → 2026-10-23T06:39:28.432Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T06:39:28.449Z → 2026-10-23T06:39:28.935Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T06:39:28.953Z → 2026-10-23T06:39:29.424Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T06:39:29.443Z → 2026-10-23T06:39:30.505Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T06:39:30.525Z → 2026-10-23T06:39:30.878Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T06:39:30.896Z → 2026-10-23T06:39:32.303Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T06:39:32.322Z → 2026-10-23T06:39:32.787Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T06:39:32.805Z → 2026-10-23T06:39:33.386Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T06:39:33.403Z → 2026-10-23T06:39:33.854Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T06:39:33.872Z → 2026-10-23T06:39:34.757Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T06:39:34.774Z → 2026-10-23T06:39:35.542Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T06:39:35.574Z → 2026-10-23T06:39:36.448Z

### core-reliability — PASS

2026-10-23T06:39:37.387Z → 2026-10-23T06:40:02.678Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-12 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=32ae2ac33fc962d45164d60c7c1d037e07ba101f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T06:39:37.388Z → 2026-10-23T06:40:02.677Z

- tests/core/reliability.ts: PASS; 2026-10-23T06:39:46.768Z → 2026-10-23T06:39:52.255Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T06:39:52.277Z → 2026-10-23T06:39:52.990Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T06:39:53.016Z → 2026-10-23T06:39:53.540Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T06:39:53.558Z → 2026-10-23T06:39:54.116Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T06:39:54.136Z → 2026-10-23T06:39:55.862Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T06:39:55.885Z → 2026-10-23T06:39:56.357Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T06:39:56.376Z → 2026-10-23T06:39:58.058Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T06:39:58.076Z → 2026-10-23T06:39:58.678Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T06:39:58.696Z → 2026-10-23T06:40:00.137Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T06:40:00.158Z → 2026-10-23T06:40:01.062Z
- tests/core/evidenceTransforms.ts: PASS; 2026-10-23T06:40:01.084Z → 2026-10-23T06:40:01.750Z

### provider-auth — PASS

2026-10-23T06:40:02.680Z → 2026-10-23T06:40:14.029Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-13 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=32ae2ac33fc962d45164d60c7c1d037e07ba101f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T06:40:02.681Z → 2026-10-23T06:40:14.029Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T06:40:12.740Z → 2026-10-23T06:40:13.180Z

### postgres-tls — PASS

2026-10-23T06:40:14.031Z → 2026-10-23T06:40:26.867Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-14 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=32ae2ac33fc962d45164d60c7c1d037e07ba101f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T06:40:14.033Z → 2026-10-23T06:40:26.867Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T06:40:25.052Z → 2026-10-23T06:40:25.992Z

### contracts — PASS

2026-10-23T06:40:26.869Z → 2026-10-23T06:40:38.620Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-15 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=32ae2ac33fc962d45164d60c7c1d037e07ba101f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T06:40:26.871Z → 2026-10-23T06:40:38.619Z

- tests/release/contracts.ts: PASS; 2026-10-23T06:40:37.067Z → 2026-10-23T06:40:37.746Z

### synthetic-pilot — PASS

2026-10-23T06:40:38.622Z → 2026-10-23T06:40:49.689Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-16 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=32ae2ac33fc962d45164d60c7c1d037e07ba101f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T06:40:38.624Z → 2026-10-23T06:40:49.689Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T06:40:48.143Z → 2026-10-23T06:40:48.906Z

### managed-schema — PASS

2026-10-23T06:40:49.691Z → 2026-10-23T06:41:00.571Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-17 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=32ae2ac33fc962d45164d60c7c1d037e07ba101f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T06:40:49.693Z → 2026-10-23T06:41:00.571Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T06:40:59.484Z → 2026-10-23T06:40:59.735Z

### local-bundle — PASS

2026-10-23T06:41:00.574Z → 2026-10-23T06:41:11.407Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-18 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=32ae2ac33fc962d45164d60c7c1d037e07ba101f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T06:41:00.575Z → 2026-10-23T06:41:11.406Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T06:41:10.167Z → 2026-10-23T06:41:10.568Z

### closed-setup — PASS

2026-10-23T06:41:11.409Z → 2026-10-23T06:41:22.530Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-19 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=32ae2ac33fc962d45164d60c7c1d037e07ba101f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T06:41:11.410Z → 2026-10-23T06:41:22.530Z

- tests/release/setup.ts: PASS; 2026-10-23T06:41:20.918Z → 2026-10-23T06:41:21.629Z

### database-contract — PASS

2026-10-23T06:41:22.532Z → 2026-10-23T06:41:33.264Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-20 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=32ae2ac33fc962d45164d60c7c1d037e07ba101f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T06:41:22.534Z → 2026-10-23T06:41:33.264Z

- tests/release/database_check.ts: PASS; 2026-10-23T06:41:32.122Z → 2026-10-23T06:41:32.468Z

### prelaunch-gate — PASS

2026-10-23T06:41:33.266Z → 2026-10-23T06:41:43.438Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-21 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=32ae2ac33fc962d45164d60c7c1d037e07ba101f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T06:41:33.268Z → 2026-10-23T06:41:43.438Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T06:41:42.282Z → 2026-10-23T06:41:42.604Z

### service-provisioning — PASS

2026-10-23T06:41:43.440Z → 2026-10-23T06:41:57.342Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-22 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=32ae2ac33fc962d45164d60c7c1d037e07ba101f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T06:41:43.442Z → 2026-10-23T06:41:57.342Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T06:41:52.923Z → 2026-10-23T06:41:56.546Z

### operator-provisioning — PASS

2026-10-23T06:41:57.344Z → 2026-10-23T06:42:10.602Z

```sh
docker run --rm --name sam-verify-1792737424196-df7d5eb2-job-23 --label sam.verification.run=sam-verify-1792737424196-df7d5eb2 --init --network container:sam-verify-1792737424196-df7d5eb2-pg --mount type=bind,src=/tmp/sam-verify-yeIVgb/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=32ae2ac33fc962d45164d60c7c1d037e07ba101f node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T06:41:57.346Z → 2026-10-23T06:42:10.602Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T06:42:06.224Z → 2026-10-23T06:42:09.790Z

### provisioning-backup-recovery — FAIL

2026-10-23T06:42:10.605Z → 2026-10-23T06:42:12.319Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792737424196-df7d5eb2-pg sam-verify-1792737424196-df7d5eb2
```
Exit: unavailable; signal: SIGTERM; 2026-10-23T06:42:10.608Z → 2026-10-23T06:42:12.318Z


### render-migration-compatibility — NOT_RUN

not started → not completed


### render-google-oauth-contracts — NOT_RUN

not started → not completed


### integration-migrations — NOT_RUN

not started → not completed


### integration-oauth-mcp — NOT_RUN

not started → not completed


### integration-orchestration — NOT_RUN

not started → not completed


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


### cleanup — PASS

2026-10-23T06:42:12.321Z → 2026-10-23T06:42:13.426Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-pg
```
Exit: 0; signal: none; 2026-10-23T06:42:12.324Z → 2026-10-23T06:42:12.344Z

```sh
docker rm --force --volumes sam-verify-1792737424196-df7d5eb2-pg
```
Exit: 0; signal: none; 2026-10-23T06:42:12.344Z → 2026-10-23T06:42:12.779Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-1
```
Exit: 1; signal: none; 2026-10-23T06:42:12.779Z → 2026-10-23T06:42:12.805Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-2
```
Exit: 1; signal: none; 2026-10-23T06:42:12.805Z → 2026-10-23T06:42:12.827Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-3
```
Exit: 1; signal: none; 2026-10-23T06:42:12.827Z → 2026-10-23T06:42:12.850Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-4
```
Exit: 1; signal: none; 2026-10-23T06:42:12.850Z → 2026-10-23T06:42:12.875Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-5
```
Exit: 1; signal: none; 2026-10-23T06:42:12.875Z → 2026-10-23T06:42:12.898Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-6
```
Exit: 1; signal: none; 2026-10-23T06:42:12.898Z → 2026-10-23T06:42:12.922Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-7
```
Exit: 1; signal: none; 2026-10-23T06:42:12.922Z → 2026-10-23T06:42:12.944Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-8
```
Exit: 1; signal: none; 2026-10-23T06:42:12.944Z → 2026-10-23T06:42:12.967Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-9
```
Exit: 1; signal: none; 2026-10-23T06:42:12.967Z → 2026-10-23T06:42:12.990Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-10
```
Exit: 1; signal: none; 2026-10-23T06:42:12.990Z → 2026-10-23T06:42:13.015Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-11
```
Exit: 1; signal: none; 2026-10-23T06:42:13.015Z → 2026-10-23T06:42:13.035Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-12
```
Exit: 1; signal: none; 2026-10-23T06:42:13.035Z → 2026-10-23T06:42:13.060Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-13
```
Exit: 1; signal: none; 2026-10-23T06:42:13.060Z → 2026-10-23T06:42:13.085Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-14
```
Exit: 1; signal: none; 2026-10-23T06:42:13.085Z → 2026-10-23T06:42:13.107Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-15
```
Exit: 1; signal: none; 2026-10-23T06:42:13.108Z → 2026-10-23T06:42:13.134Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-16
```
Exit: 1; signal: none; 2026-10-23T06:42:13.134Z → 2026-10-23T06:42:13.156Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-17
```
Exit: 1; signal: none; 2026-10-23T06:42:13.156Z → 2026-10-23T06:42:13.180Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-18
```
Exit: 1; signal: none; 2026-10-23T06:42:13.180Z → 2026-10-23T06:42:13.207Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-19
```
Exit: 1; signal: none; 2026-10-23T06:42:13.207Z → 2026-10-23T06:42:13.229Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-20
```
Exit: 1; signal: none; 2026-10-23T06:42:13.229Z → 2026-10-23T06:42:13.252Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-21
```
Exit: 1; signal: none; 2026-10-23T06:42:13.252Z → 2026-10-23T06:42:13.283Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-22
```
Exit: 1; signal: none; 2026-10-23T06:42:13.283Z → 2026-10-23T06:42:13.307Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-job-23
```
Exit: 1; signal: none; 2026-10-23T06:42:13.307Z → 2026-10-23T06:42:13.328Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792737424196-df7d5eb2-net
```
Exit: 0; signal: none; 2026-10-23T06:42:13.328Z → 2026-10-23T06:42:13.341Z

```sh
docker network rm sam-verify-1792737424196-df7d5eb2-net
```
Exit: 0; signal: none; 2026-10-23T06:42:13.341Z → 2026-10-23T06:42:13.395Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
