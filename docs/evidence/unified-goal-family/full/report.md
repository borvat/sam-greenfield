# Independent SAM verification

Status: **FAIL**
Source: `9dea66eadcdd0d3c8a080d1f974234f8a82c69d1` (clean: true)
Started: 2026-10-23T16:10:58.862Z; completed: 2026-10-23T16:16:33.544Z

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
| render-google-oauth-contracts | FAIL | [log](logs/27-render-google-oauth-contracts.log) |
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

- render-google-oauth-contracts: exit 1 (see logs/27-render-google-oauth-contracts.log)

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

2026-10-23T16:10:58.863Z → 2026-10-23T16:10:59.135Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T16:10:58.867Z → 2026-10-23T16:10:58.873Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T16:10:58.873Z → 2026-10-23T16:10:58.876Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T16:10:58.876Z → 2026-10-23T16:10:58.881Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T16:10:58.881Z → 2026-10-23T16:10:58.897Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T16:10:58.897Z → 2026-10-23T16:10:58.921Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T16:10:58.921Z → 2026-10-23T16:10:58.988Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T16:10:58.988Z → 2026-10-23T16:10:59.060Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T16:10:59.060Z → 2026-10-23T16:10:59.118Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T16:10:59.118Z → 2026-10-23T16:10:59.121Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T16:10:59.121Z → 2026-10-23T16:10:59.132Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T16:10:59.132Z → 2026-10-23T16:10:59.135Z


### snapshot — PASS

2026-10-23T16:10:59.136Z → 2026-10-23T16:10:59.211Z

```sh
git archive --format=tar --output /tmp/sam-verify-c3XcsV/source.tar 9dea66eadcdd0d3c8a080d1f974234f8a82c69d1
```
Exit: 0; signal: none; 2026-10-23T16:10:59.136Z → 2026-10-23T16:10:59.170Z

```sh
tar -xf /tmp/sam-verify-c3XcsV/source.tar -C /tmp/sam-verify-c3XcsV/source
```
Exit: 0; signal: none; 2026-10-23T16:10:59.170Z → 2026-10-23T16:10:59.180Z


### images — PASS

2026-10-23T16:10:59.212Z → 2026-10-23T16:10:59.343Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T16:10:59.212Z → 2026-10-23T16:10:59.227Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T16:10:59.227Z → 2026-10-23T16:10:59.242Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T16:10:59.242Z → 2026-10-23T16:10:59.258Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T16:10:59.258Z → 2026-10-23T16:10:59.272Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T16:10:59.272Z → 2026-10-23T16:10:59.289Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T16:10:59.289Z → 2026-10-23T16:10:59.304Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T16:10:59.304Z → 2026-10-23T16:10:59.327Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T16:10:59.327Z → 2026-10-23T16:10:59.343Z


### isolated-postgres — PASS

2026-10-23T16:10:59.344Z → 2026-10-23T16:11:02.180Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792771858861-da917323 sam-verify-1792771858861-da917323-net
```
Exit: 0; signal: none; 2026-10-23T16:10:59.345Z → 2026-10-23T16:10:59.373Z

```sh
docker run --detach --name sam-verify-1792771858861-da917323-pg --label sam.verification.run=sam-verify-1792771858861-da917323 --network sam-verify-1792771858861-da917323-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T16:10:59.373Z → 2026-10-23T16:11:00.562Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792771858861-da917323-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T16:11:00.563Z → 2026-10-23T16:11:00.654Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792771858861-da917323-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T16:11:01.155Z → 2026-10-23T16:11:01.263Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792771858861-da917323-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T16:11:01.764Z → 2026-10-23T16:11:01.848Z

```sh
docker exec sam-verify-1792771858861-da917323-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T16:11:01.848Z → 2026-10-23T16:11:01.953Z

```sh
docker exec sam-verify-1792771858861-da917323-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T16:11:01.953Z → 2026-10-23T16:11:02.071Z

```sh
docker exec sam-verify-1792771858861-da917323-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T16:11:02.071Z → 2026-10-23T16:11:02.180Z


### node-dependencies — PASS

2026-10-23T16:11:02.185Z → 2026-10-23T16:11:09.825Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-1 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T16:11:02.186Z → 2026-10-23T16:11:09.825Z


### python-dependencies — PASS

2026-10-23T16:11:09.827Z → 2026-10-23T16:11:13.739Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-2 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-c3XcsV/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T16:11:09.828Z → 2026-10-23T16:11:13.739Z


### runtime-versions — PASS

2026-10-23T16:11:13.740Z → 2026-10-23T16:11:43.238Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-3 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T16:11:13.741Z → 2026-10-23T16:11:22.381Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-4 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T16:11:22.381Z → 2026-10-23T16:11:30.838Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-5 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T16:11:30.838Z → 2026-10-23T16:11:41.048Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-6 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T16:11:41.048Z → 2026-10-23T16:11:43.153Z

```sh
docker exec sam-verify-1792771858861-da917323-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T16:11:43.153Z → 2026-10-23T16:11:43.237Z


### workflow-tool — PASS

2026-10-23T16:11:43.239Z → 2026-10-23T16:11:43.804Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-c3XcsV/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T16:11:43.239Z → 2026-10-23T16:11:43.760Z

```sh
tar -xzf /tmp/sam-verify-c3XcsV/actionlint.tar.gz -C /tmp/sam-verify-c3XcsV actionlint
```
Exit: 0; signal: none; 2026-10-23T16:11:43.762Z → 2026-10-23T16:11:43.801Z

```sh
/tmp/sam-verify-c3XcsV/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T16:11:43.801Z → 2026-10-23T16:11:43.804Z


### workflow-validation — PASS

2026-10-23T16:11:43.805Z → 2026-10-23T16:11:43.809Z

```sh
/tmp/sam-verify-c3XcsV/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T16:11:43.806Z → 2026-10-23T16:11:43.809Z


### configuration-validation — PASS

2026-10-23T16:11:43.810Z → 2026-10-23T16:12:17.225Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T16:11:43.811Z → 2026-10-23T16:11:44.035Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T16:11:44.035Z → 2026-10-23T16:11:44.101Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T16:11:44.101Z → 2026-10-23T16:11:44.175Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T16:11:44.175Z → 2026-10-23T16:11:44.246Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T16:11:44.246Z → 2026-10-23T16:11:44.315Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-7 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T16:11:44.315Z → 2026-10-23T16:11:56.190Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-8 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T16:11:56.191Z → 2026-10-23T16:12:05.956Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-9 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T16:12:05.956Z → 2026-10-23T16:12:17.225Z


### typecheck — PASS

2026-10-23T16:12:17.227Z → 2026-10-23T16:12:32.975Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-10 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T16:12:17.228Z → 2026-10-23T16:12:32.975Z


### regression — PASS

2026-10-23T16:12:32.977Z → 2026-10-23T16:13:13.986Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-11 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9dea66eadcdd0d3c8a080d1f974234f8a82c69d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T16:12:32.978Z → 2026-10-23T16:13:13.985Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T16:12:44.176Z → 2026-10-23T16:12:44.696Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T16:12:44.725Z → 2026-10-23T16:12:45.256Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T16:12:45.275Z → 2026-10-23T16:12:45.852Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T16:12:45.879Z → 2026-10-23T16:12:46.447Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T16:12:46.466Z → 2026-10-23T16:12:47.034Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T16:12:47.061Z → 2026-10-23T16:12:47.541Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T16:12:47.559Z → 2026-10-23T16:12:48.228Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T16:12:48.251Z → 2026-10-23T16:12:48.890Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T16:12:48.909Z → 2026-10-23T16:12:49.520Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T16:12:49.544Z → 2026-10-23T16:12:49.988Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T16:12:50.008Z → 2026-10-23T16:12:50.583Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T16:12:50.604Z → 2026-10-23T16:12:51.033Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T16:12:51.056Z → 2026-10-23T16:12:51.598Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T16:12:51.617Z → 2026-10-23T16:12:52.028Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T16:12:52.048Z → 2026-10-23T16:12:52.603Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T16:12:52.623Z → 2026-10-23T16:12:53.206Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T16:12:53.230Z → 2026-10-23T16:12:53.737Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T16:12:53.753Z → 2026-10-23T16:12:54.187Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T16:12:54.205Z → 2026-10-23T16:12:54.661Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T16:12:54.679Z → 2026-10-23T16:12:55.074Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T16:12:55.090Z → 2026-10-23T16:12:55.493Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T16:12:55.512Z → 2026-10-23T16:12:55.923Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T16:12:55.944Z → 2026-10-23T16:12:56.418Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T16:12:56.438Z → 2026-10-23T16:12:57.909Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T16:12:57.931Z → 2026-10-23T16:12:58.508Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T16:12:58.525Z → 2026-10-23T16:12:58.918Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T16:12:58.936Z → 2026-10-23T16:12:59.551Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T16:12:59.572Z → 2026-10-23T16:13:00.384Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T16:13:00.403Z → 2026-10-23T16:13:00.859Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T16:13:00.879Z → 2026-10-23T16:13:01.319Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T16:13:01.336Z → 2026-10-23T16:13:02.030Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T16:13:02.049Z → 2026-10-23T16:13:02.495Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T16:13:02.513Z → 2026-10-23T16:13:02.959Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T16:13:02.977Z → 2026-10-23T16:13:03.390Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T16:13:03.408Z → 2026-10-23T16:13:03.849Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T16:13:03.868Z → 2026-10-23T16:13:04.479Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T16:13:04.501Z → 2026-10-23T16:13:04.936Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T16:13:04.955Z → 2026-10-23T16:13:05.467Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T16:13:05.484Z → 2026-10-23T16:13:06.008Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T16:13:06.026Z → 2026-10-23T16:13:06.466Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T16:13:06.483Z → 2026-10-23T16:13:07.471Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T16:13:07.491Z → 2026-10-23T16:13:07.845Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T16:13:07.862Z → 2026-10-23T16:13:09.231Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T16:13:09.249Z → 2026-10-23T16:13:09.695Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T16:13:09.712Z → 2026-10-23T16:13:10.308Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T16:13:10.326Z → 2026-10-23T16:13:10.748Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T16:13:10.765Z → 2026-10-23T16:13:11.560Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T16:13:11.578Z → 2026-10-23T16:13:12.242Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T16:13:12.279Z → 2026-10-23T16:13:13.111Z

### core-reliability — PASS

2026-10-23T16:13:13.988Z → 2026-10-23T16:13:51.210Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-12 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9dea66eadcdd0d3c8a080d1f974234f8a82c69d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T16:13:13.989Z → 2026-10-23T16:13:51.209Z

- tests/core/reliability.ts: PASS; 2026-10-23T16:13:24.684Z → 2026-10-23T16:13:29.809Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T16:13:29.828Z → 2026-10-23T16:13:30.412Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T16:13:30.430Z → 2026-10-23T16:13:30.898Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T16:13:30.918Z → 2026-10-23T16:13:31.521Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T16:13:31.540Z → 2026-10-23T16:13:33.233Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T16:13:33.252Z → 2026-10-23T16:13:33.738Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T16:13:33.756Z → 2026-10-23T16:13:35.355Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T16:13:35.374Z → 2026-10-23T16:13:36.065Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T16:13:36.087Z → 2026-10-23T16:13:37.640Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T16:13:37.660Z → 2026-10-23T16:13:41.856Z
- tests/core/evidenceTransforms.ts: PASS; 2026-10-23T16:13:41.875Z → 2026-10-23T16:13:42.503Z
- tests/core/evidenceIntegration.ts: PASS; 2026-10-23T16:13:42.521Z → 2026-10-23T16:13:49.346Z
- tests/core/sourceContracts.ts: PASS; 2026-10-23T16:13:49.377Z → 2026-10-23T16:13:50.227Z

### provider-auth — PASS

2026-10-23T16:13:51.211Z → 2026-10-23T16:14:02.209Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-13 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9dea66eadcdd0d3c8a080d1f974234f8a82c69d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T16:13:51.213Z → 2026-10-23T16:14:02.209Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T16:14:01.005Z → 2026-10-23T16:14:01.416Z

### postgres-tls — PASS

2026-10-23T16:14:02.211Z → 2026-10-23T16:14:13.358Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-14 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9dea66eadcdd0d3c8a080d1f974234f8a82c69d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T16:14:02.213Z → 2026-10-23T16:14:13.357Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T16:14:11.832Z → 2026-10-23T16:14:12.553Z

### contracts — PASS

2026-10-23T16:14:13.361Z → 2026-10-23T16:14:24.230Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-15 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9dea66eadcdd0d3c8a080d1f974234f8a82c69d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T16:14:13.362Z → 2026-10-23T16:14:24.230Z

- tests/release/contracts.ts: PASS; 2026-10-23T16:14:22.668Z → 2026-10-23T16:14:23.382Z

### synthetic-pilot — PASS

2026-10-23T16:14:24.233Z → 2026-10-23T16:14:35.742Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-16 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9dea66eadcdd0d3c8a080d1f974234f8a82c69d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T16:14:24.235Z → 2026-10-23T16:14:35.742Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T16:14:34.079Z → 2026-10-23T16:14:34.879Z

### managed-schema — PASS

2026-10-23T16:14:35.744Z → 2026-10-23T16:14:47.336Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-17 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9dea66eadcdd0d3c8a080d1f974234f8a82c69d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T16:14:35.746Z → 2026-10-23T16:14:47.335Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T16:14:46.282Z → 2026-10-23T16:14:46.550Z

### local-bundle — PASS

2026-10-23T16:14:47.337Z → 2026-10-23T16:14:58.719Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-18 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9dea66eadcdd0d3c8a080d1f974234f8a82c69d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T16:14:47.339Z → 2026-10-23T16:14:58.718Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T16:14:57.410Z → 2026-10-23T16:14:57.867Z

### closed-setup — PASS

2026-10-23T16:14:58.720Z → 2026-10-23T16:15:10.231Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-19 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9dea66eadcdd0d3c8a080d1f974234f8a82c69d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T16:14:58.722Z → 2026-10-23T16:15:10.230Z

- tests/release/setup.ts: PASS; 2026-10-23T16:15:08.684Z → 2026-10-23T16:15:09.306Z

### database-contract — PASS

2026-10-23T16:15:10.233Z → 2026-10-23T16:15:21.345Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-20 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9dea66eadcdd0d3c8a080d1f974234f8a82c69d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T16:15:10.234Z → 2026-10-23T16:15:21.345Z

- tests/release/database_check.ts: PASS; 2026-10-23T16:15:20.250Z → 2026-10-23T16:15:20.599Z

### prelaunch-gate — PASS

2026-10-23T16:15:21.347Z → 2026-10-23T16:15:30.998Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-21 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9dea66eadcdd0d3c8a080d1f974234f8a82c69d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T16:15:21.351Z → 2026-10-23T16:15:30.998Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T16:15:29.865Z → 2026-10-23T16:15:30.187Z

### service-provisioning — PASS

2026-10-23T16:15:31.000Z → 2026-10-23T16:15:45.609Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-22 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9dea66eadcdd0d3c8a080d1f974234f8a82c69d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T16:15:31.003Z → 2026-10-23T16:15:45.609Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T16:15:41.913Z → 2026-10-23T16:15:44.807Z

### operator-provisioning — PASS

2026-10-23T16:15:45.612Z → 2026-10-23T16:16:00.107Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-23 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9dea66eadcdd0d3c8a080d1f974234f8a82c69d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T16:15:45.614Z → 2026-10-23T16:16:00.107Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T16:15:54.979Z → 2026-10-23T16:15:59.305Z

### provisioning-backup-recovery — PASS

2026-10-23T16:16:00.109Z → 2026-10-23T16:16:03.610Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792771858861-da917323-pg sam-verify-1792771858861-da917323
```
Exit: 0; signal: none; 2026-10-23T16:16:00.111Z → 2026-10-23T16:16:03.610Z


### render-migration-compatibility — PASS

2026-10-23T16:16:03.612Z → 2026-10-23T16:16:16.234Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-24 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9dea66eadcdd0d3c8a080d1f974234f8a82c69d1 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T16:16:03.614Z → 2026-10-23T16:16:16.234Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T16:16:14.152Z → 2026-10-23T16:16:15.428Z

### render-google-oauth-contracts — FAIL

2026-10-23T16:16:16.236Z → 2026-10-23T16:16:32.162Z

```sh
docker run --rm --name sam-verify-1792771858861-da917323-job-25 --label sam.verification.run=sam-verify-1792771858861-da917323 --init --network container:sam-verify-1792771858861-da917323-pg --mount type=bind,src=/tmp/sam-verify-c3XcsV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 1; signal: none; 2026-10-23T16:16:16.239Z → 2026-10-23T16:16:32.161Z


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

2026-10-23T16:16:32.164Z → 2026-10-23T16:16:33.524Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-pg
```
Exit: 0; signal: none; 2026-10-23T16:16:32.166Z → 2026-10-23T16:16:32.179Z

```sh
docker rm --force --volumes sam-verify-1792771858861-da917323-pg
```
Exit: 0; signal: none; 2026-10-23T16:16:32.180Z → 2026-10-23T16:16:32.580Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-1
```
Exit: 1; signal: none; 2026-10-23T16:16:32.580Z → 2026-10-23T16:16:32.603Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-2
```
Exit: 1; signal: none; 2026-10-23T16:16:32.603Z → 2026-10-23T16:16:32.622Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-3
```
Exit: 1; signal: none; 2026-10-23T16:16:32.622Z → 2026-10-23T16:16:32.641Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-4
```
Exit: 1; signal: none; 2026-10-23T16:16:32.641Z → 2026-10-23T16:16:32.662Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-5
```
Exit: 1; signal: none; 2026-10-23T16:16:32.662Z → 2026-10-23T16:16:32.684Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-6
```
Exit: 1; signal: none; 2026-10-23T16:16:32.684Z → 2026-10-23T16:16:32.705Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-7
```
Exit: 1; signal: none; 2026-10-23T16:16:32.705Z → 2026-10-23T16:16:32.726Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-8
```
Exit: 1; signal: none; 2026-10-23T16:16:32.726Z → 2026-10-23T16:16:32.747Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-9
```
Exit: 1; signal: none; 2026-10-23T16:16:32.747Z → 2026-10-23T16:16:32.768Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-10
```
Exit: 1; signal: none; 2026-10-23T16:16:32.768Z → 2026-10-23T16:16:32.792Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-11
```
Exit: 1; signal: none; 2026-10-23T16:16:32.792Z → 2026-10-23T16:16:32.818Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-12
```
Exit: 1; signal: none; 2026-10-23T16:16:32.818Z → 2026-10-23T16:16:32.840Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-13
```
Exit: 1; signal: none; 2026-10-23T16:16:32.840Z → 2026-10-23T16:16:32.861Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-14
```
Exit: 1; signal: none; 2026-10-23T16:16:32.861Z → 2026-10-23T16:16:32.989Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-15
```
Exit: 1; signal: none; 2026-10-23T16:16:32.993Z → 2026-10-23T16:16:33.088Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-16
```
Exit: 1; signal: none; 2026-10-23T16:16:33.088Z → 2026-10-23T16:16:33.154Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-17
```
Exit: 1; signal: none; 2026-10-23T16:16:33.154Z → 2026-10-23T16:16:33.193Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-18
```
Exit: 1; signal: none; 2026-10-23T16:16:33.193Z → 2026-10-23T16:16:33.229Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-19
```
Exit: 1; signal: none; 2026-10-23T16:16:33.229Z → 2026-10-23T16:16:33.275Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-20
```
Exit: 1; signal: none; 2026-10-23T16:16:33.275Z → 2026-10-23T16:16:33.296Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-21
```
Exit: 1; signal: none; 2026-10-23T16:16:33.296Z → 2026-10-23T16:16:33.330Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-22
```
Exit: 1; signal: none; 2026-10-23T16:16:33.330Z → 2026-10-23T16:16:33.349Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-23
```
Exit: 1; signal: none; 2026-10-23T16:16:33.349Z → 2026-10-23T16:16:33.379Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-24
```
Exit: 1; signal: none; 2026-10-23T16:16:33.379Z → 2026-10-23T16:16:33.404Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-job-25
```
Exit: 1; signal: none; 2026-10-23T16:16:33.404Z → 2026-10-23T16:16:33.427Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792771858861-da917323-net
```
Exit: 0; signal: none; 2026-10-23T16:16:33.427Z → 2026-10-23T16:16:33.440Z

```sh
docker network rm sam-verify-1792771858861-da917323-net
```
Exit: 0; signal: none; 2026-10-23T16:16:33.440Z → 2026-10-23T16:16:33.497Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
