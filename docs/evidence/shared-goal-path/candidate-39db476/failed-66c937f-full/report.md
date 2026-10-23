# Independent SAM verification

Status: **FAIL**
Source: `66c937fef92e42b7271e67a8f930bf62e9e4ea3c` (clean: true)
Started: 2026-10-23T17:33:53.667Z; completed: 2026-10-23T17:36:42.985Z

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
| core-reliability | FAIL | [log](logs/13-core-reliability.log) |
| provider-auth | NOT_RUN | not executed |
| postgres-tls | NOT_RUN | not executed |
| contracts | NOT_RUN | not executed |
| synthetic-pilot | NOT_RUN | not executed |
| managed-schema | NOT_RUN | not executed |
| local-bundle | NOT_RUN | not executed |
| closed-setup | NOT_RUN | not executed |
| database-contract | NOT_RUN | not executed |
| prelaunch-gate | NOT_RUN | not executed |
| service-provisioning | NOT_RUN | not executed |
| operator-provisioning | NOT_RUN | not executed |
| provisioning-backup-recovery | NOT_RUN | not executed |
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
| shared-goal-path | NOT_RUN | not executed |
| cleanup | PASS | [log](logs/60-cleanup.log) |

## Unresolved defects / blockers

- core-reliability: exit 1 (see logs/13-core-reliability.log)

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

2026-10-23T17:33:53.669Z → 2026-10-23T17:33:53.993Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T17:33:53.679Z → 2026-10-23T17:33:53.698Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T17:33:53.698Z → 2026-10-23T17:33:53.705Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T17:33:53.705Z → 2026-10-23T17:33:53.718Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T17:33:53.718Z → 2026-10-23T17:33:53.734Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T17:33:53.734Z → 2026-10-23T17:33:53.760Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T17:33:53.760Z → 2026-10-23T17:33:53.844Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T17:33:53.844Z → 2026-10-23T17:33:53.920Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T17:33:53.920Z → 2026-10-23T17:33:53.979Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T17:33:53.979Z → 2026-10-23T17:33:53.982Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T17:33:53.982Z → 2026-10-23T17:33:53.991Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T17:33:53.991Z → 2026-10-23T17:33:53.993Z


### snapshot — PASS

2026-10-23T17:33:53.995Z → 2026-10-23T17:33:54.092Z

```sh
git archive --format=tar --output /tmp/sam-verify-k0LeQi/source.tar 66c937fef92e42b7271e67a8f930bf62e9e4ea3c
```
Exit: 0; signal: none; 2026-10-23T17:33:53.996Z → 2026-10-23T17:33:54.039Z

```sh
tar -xf /tmp/sam-verify-k0LeQi/source.tar -C /tmp/sam-verify-k0LeQi/source
```
Exit: 0; signal: none; 2026-10-23T17:33:54.039Z → 2026-10-23T17:33:54.050Z


### images — PASS

2026-10-23T17:33:54.093Z → 2026-10-23T17:33:54.235Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T17:33:54.095Z → 2026-10-23T17:33:54.116Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T17:33:54.116Z → 2026-10-23T17:33:54.136Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T17:33:54.136Z → 2026-10-23T17:33:54.151Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T17:33:54.152Z → 2026-10-23T17:33:54.170Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T17:33:54.170Z → 2026-10-23T17:33:54.185Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T17:33:54.186Z → 2026-10-23T17:33:54.201Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T17:33:54.201Z → 2026-10-23T17:33:54.217Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T17:33:54.217Z → 2026-10-23T17:33:54.235Z


### isolated-postgres — PASS

2026-10-23T17:33:54.238Z → 2026-10-23T17:33:57.668Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792776833667-7423da12 sam-verify-1792776833667-7423da12-net
```
Exit: 0; signal: none; 2026-10-23T17:33:54.239Z → 2026-10-23T17:33:54.274Z

```sh
docker run --detach --name sam-verify-1792776833667-7423da12-pg --label sam.verification.run=sam-verify-1792776833667-7423da12 --network sam-verify-1792776833667-7423da12-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T17:33:54.274Z → 2026-10-23T17:33:55.373Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792776833667-7423da12-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T17:33:55.374Z → 2026-10-23T17:33:55.480Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792776833667-7423da12-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T17:33:55.981Z → 2026-10-23T17:33:56.098Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792776833667-7423da12-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T17:33:56.599Z → 2026-10-23T17:33:56.705Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792776833667-7423da12-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T17:33:57.206Z → 2026-10-23T17:33:57.303Z

```sh
docker exec sam-verify-1792776833667-7423da12-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T17:33:57.303Z → 2026-10-23T17:33:57.423Z

```sh
docker exec sam-verify-1792776833667-7423da12-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T17:33:57.423Z → 2026-10-23T17:33:57.551Z

```sh
docker exec sam-verify-1792776833667-7423da12-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T17:33:57.551Z → 2026-10-23T17:33:57.668Z


### node-dependencies — PASS

2026-10-23T17:33:57.675Z → 2026-10-23T17:34:05.286Z

```sh
docker run --rm --name sam-verify-1792776833667-7423da12-job-1 --label sam.verification.run=sam-verify-1792776833667-7423da12 --init --mount type=bind,src=/tmp/sam-verify-k0LeQi/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T17:33:57.676Z → 2026-10-23T17:34:05.286Z


### python-dependencies — PASS

2026-10-23T17:34:05.287Z → 2026-10-23T17:34:09.817Z

```sh
docker run --rm --name sam-verify-1792776833667-7423da12-job-2 --label sam.verification.run=sam-verify-1792776833667-7423da12 --init --mount type=bind,src=/tmp/sam-verify-k0LeQi/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-k0LeQi/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T17:34:05.288Z → 2026-10-23T17:34:09.817Z


### runtime-versions — PASS

2026-10-23T17:34:09.818Z → 2026-10-23T17:34:39.252Z

```sh
docker run --rm --name sam-verify-1792776833667-7423da12-job-3 --label sam.verification.run=sam-verify-1792776833667-7423da12 --init --network container:sam-verify-1792776833667-7423da12-pg --mount type=bind,src=/tmp/sam-verify-k0LeQi/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T17:34:09.819Z → 2026-10-23T17:34:17.192Z

```sh
docker run --rm --name sam-verify-1792776833667-7423da12-job-4 --label sam.verification.run=sam-verify-1792776833667-7423da12 --init --network container:sam-verify-1792776833667-7423da12-pg --mount type=bind,src=/tmp/sam-verify-k0LeQi/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T17:34:17.192Z → 2026-10-23T17:34:28.123Z

```sh
docker run --rm --name sam-verify-1792776833667-7423da12-job-5 --label sam.verification.run=sam-verify-1792776833667-7423da12 --init --network container:sam-verify-1792776833667-7423da12-pg --mount type=bind,src=/tmp/sam-verify-k0LeQi/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T17:34:28.123Z → 2026-10-23T17:34:38.483Z

```sh
docker run --rm --name sam-verify-1792776833667-7423da12-job-6 --label sam.verification.run=sam-verify-1792776833667-7423da12 --init --network container:sam-verify-1792776833667-7423da12-pg --mount type=bind,src=/tmp/sam-verify-k0LeQi/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T17:34:38.484Z → 2026-10-23T17:34:39.157Z

```sh
docker exec sam-verify-1792776833667-7423da12-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T17:34:39.157Z → 2026-10-23T17:34:39.252Z


### workflow-tool — PASS

2026-10-23T17:34:39.253Z → 2026-10-23T17:34:39.826Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-k0LeQi/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T17:34:39.254Z → 2026-10-23T17:34:39.778Z

```sh
tar -xzf /tmp/sam-verify-k0LeQi/actionlint.tar.gz -C /tmp/sam-verify-k0LeQi actionlint
```
Exit: 0; signal: none; 2026-10-23T17:34:39.781Z → 2026-10-23T17:34:39.822Z

```sh
/tmp/sam-verify-k0LeQi/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T17:34:39.822Z → 2026-10-23T17:34:39.826Z


### workflow-validation — PASS

2026-10-23T17:34:39.827Z → 2026-10-23T17:34:39.831Z

```sh
/tmp/sam-verify-k0LeQi/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T17:34:39.828Z → 2026-10-23T17:34:39.831Z


### configuration-validation — PASS

2026-10-23T17:34:39.832Z → 2026-10-23T17:35:13.572Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T17:34:39.833Z → 2026-10-23T17:34:40.052Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T17:34:40.052Z → 2026-10-23T17:34:40.119Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T17:34:40.119Z → 2026-10-23T17:34:40.201Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T17:34:40.201Z → 2026-10-23T17:34:40.277Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T17:34:40.277Z → 2026-10-23T17:34:40.342Z

```sh
docker run --rm --name sam-verify-1792776833667-7423da12-job-7 --label sam.verification.run=sam-verify-1792776833667-7423da12 --init --network container:sam-verify-1792776833667-7423da12-pg --mount type=bind,src=/tmp/sam-verify-k0LeQi/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T17:34:40.342Z → 2026-10-23T17:34:51.841Z

```sh
docker run --rm --name sam-verify-1792776833667-7423da12-job-8 --label sam.verification.run=sam-verify-1792776833667-7423da12 --init --network container:sam-verify-1792776833667-7423da12-pg --mount type=bind,src=/tmp/sam-verify-k0LeQi/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T17:34:51.841Z → 2026-10-23T17:35:02.883Z

```sh
docker run --rm --name sam-verify-1792776833667-7423da12-job-9 --label sam.verification.run=sam-verify-1792776833667-7423da12 --init --network container:sam-verify-1792776833667-7423da12-pg --mount type=bind,src=/tmp/sam-verify-k0LeQi/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T17:35:02.883Z → 2026-10-23T17:35:13.572Z


### typecheck — PASS

2026-10-23T17:35:13.574Z → 2026-10-23T17:35:29.723Z

```sh
docker run --rm --name sam-verify-1792776833667-7423da12-job-10 --label sam.verification.run=sam-verify-1792776833667-7423da12 --init --network container:sam-verify-1792776833667-7423da12-pg --mount type=bind,src=/tmp/sam-verify-k0LeQi/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T17:35:13.576Z → 2026-10-23T17:35:29.723Z


### regression — PASS

2026-10-23T17:35:29.725Z → 2026-10-23T17:36:08.408Z

```sh
docker run --rm --name sam-verify-1792776833667-7423da12-job-11 --label sam.verification.run=sam-verify-1792776833667-7423da12 --init --network container:sam-verify-1792776833667-7423da12-pg --mount type=bind,src=/tmp/sam-verify-k0LeQi/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=66c937fef92e42b7271e67a8f930bf62e9e4ea3c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T17:35:29.726Z → 2026-10-23T17:36:08.408Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T17:35:39.410Z → 2026-10-23T17:35:39.966Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T17:35:39.987Z → 2026-10-23T17:35:40.476Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T17:35:40.498Z → 2026-10-23T17:35:40.898Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T17:35:40.916Z → 2026-10-23T17:35:41.372Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T17:35:41.391Z → 2026-10-23T17:35:41.892Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T17:35:41.912Z → 2026-10-23T17:35:42.307Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T17:35:42.326Z → 2026-10-23T17:35:42.849Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T17:35:42.867Z → 2026-10-23T17:35:43.358Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T17:35:43.375Z → 2026-10-23T17:35:43.858Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T17:35:43.877Z → 2026-10-23T17:35:44.303Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T17:35:44.320Z → 2026-10-23T17:35:44.772Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T17:35:44.789Z → 2026-10-23T17:35:45.109Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T17:35:45.128Z → 2026-10-23T17:35:45.710Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T17:35:45.731Z → 2026-10-23T17:35:46.160Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T17:35:46.179Z → 2026-10-23T17:35:46.587Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T17:35:46.608Z → 2026-10-23T17:35:47.117Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T17:35:47.136Z → 2026-10-23T17:35:47.642Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T17:35:47.662Z → 2026-10-23T17:35:48.150Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T17:35:48.169Z → 2026-10-23T17:35:48.605Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T17:35:48.622Z → 2026-10-23T17:35:49.011Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T17:35:49.029Z → 2026-10-23T17:35:49.403Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T17:35:49.420Z → 2026-10-23T17:35:49.719Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T17:35:49.736Z → 2026-10-23T17:35:50.184Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T17:35:50.203Z → 2026-10-23T17:35:51.617Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T17:35:51.636Z → 2026-10-23T17:35:52.188Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T17:35:52.206Z → 2026-10-23T17:35:52.572Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T17:35:52.589Z → 2026-10-23T17:35:53.171Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T17:35:53.188Z → 2026-10-23T17:35:54.021Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T17:35:54.039Z → 2026-10-23T17:35:54.600Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T17:35:54.620Z → 2026-10-23T17:35:55.047Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T17:35:55.066Z → 2026-10-23T17:35:55.820Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T17:35:55.838Z → 2026-10-23T17:35:56.279Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T17:35:56.296Z → 2026-10-23T17:35:56.754Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T17:35:56.778Z → 2026-10-23T17:35:57.236Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T17:35:57.253Z → 2026-10-23T17:35:57.733Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T17:35:57.753Z → 2026-10-23T17:35:58.344Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T17:35:58.362Z → 2026-10-23T17:35:58.818Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T17:35:58.836Z → 2026-10-23T17:35:59.309Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T17:35:59.325Z → 2026-10-23T17:35:59.779Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T17:35:59.796Z → 2026-10-23T17:36:00.258Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T17:36:00.277Z → 2026-10-23T17:36:01.319Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T17:36:01.338Z → 2026-10-23T17:36:01.718Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T17:36:01.739Z → 2026-10-23T17:36:03.133Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T17:36:03.152Z → 2026-10-23T17:36:03.662Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T17:36:03.681Z → 2026-10-23T17:36:04.308Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T17:36:04.325Z → 2026-10-23T17:36:04.802Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T17:36:04.826Z → 2026-10-23T17:36:05.826Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T17:36:05.845Z → 2026-10-23T17:36:06.624Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T17:36:06.655Z → 2026-10-23T17:36:07.488Z

### core-reliability — FAIL

2026-10-23T17:36:08.410Z → 2026-10-23T17:36:42.119Z

```sh
docker run --rm --name sam-verify-1792776833667-7423da12-job-12 --label sam.verification.run=sam-verify-1792776833667-7423da12 --init --network container:sam-verify-1792776833667-7423da12-pg --mount type=bind,src=/tmp/sam-verify-k0LeQi/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=66c937fef92e42b7271e67a8f930bf62e9e4ea3c node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 1; signal: none; 2026-10-23T17:36:08.412Z → 2026-10-23T17:36:42.119Z


### provider-auth — NOT_RUN

not started → not completed


### postgres-tls — NOT_RUN

not started → not completed


### contracts — NOT_RUN

not started → not completed


### synthetic-pilot — NOT_RUN

not started → not completed


### managed-schema — NOT_RUN

not started → not completed


### local-bundle — NOT_RUN

not started → not completed


### closed-setup — NOT_RUN

not started → not completed


### database-contract — NOT_RUN

not started → not completed


### prelaunch-gate — NOT_RUN

not started → not completed


### service-provisioning — NOT_RUN

not started → not completed


### operator-provisioning — NOT_RUN

not started → not completed


### provisioning-backup-recovery — NOT_RUN

not started → not completed


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


### shared-goal-path — NOT_RUN

not started → not completed


### cleanup — PASS

2026-10-23T17:36:42.121Z → 2026-10-23T17:36:42.982Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792776833667-7423da12-pg
```
Exit: 0; signal: none; 2026-10-23T17:36:42.122Z → 2026-10-23T17:36:42.139Z

```sh
docker rm --force --volumes sam-verify-1792776833667-7423da12-pg
```
Exit: 0; signal: none; 2026-10-23T17:36:42.139Z → 2026-10-23T17:36:42.587Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792776833667-7423da12-job-1
```
Exit: 1; signal: none; 2026-10-23T17:36:42.587Z → 2026-10-23T17:36:42.612Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792776833667-7423da12-job-2
```
Exit: 1; signal: none; 2026-10-23T17:36:42.612Z → 2026-10-23T17:36:42.634Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792776833667-7423da12-job-3
```
Exit: 1; signal: none; 2026-10-23T17:36:42.634Z → 2026-10-23T17:36:42.662Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792776833667-7423da12-job-4
```
Exit: 1; signal: none; 2026-10-23T17:36:42.662Z → 2026-10-23T17:36:42.693Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792776833667-7423da12-job-5
```
Exit: 1; signal: none; 2026-10-23T17:36:42.693Z → 2026-10-23T17:36:42.717Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792776833667-7423da12-job-6
```
Exit: 1; signal: none; 2026-10-23T17:36:42.717Z → 2026-10-23T17:36:42.740Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792776833667-7423da12-job-7
```
Exit: 1; signal: none; 2026-10-23T17:36:42.740Z → 2026-10-23T17:36:42.765Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792776833667-7423da12-job-8
```
Exit: 1; signal: none; 2026-10-23T17:36:42.765Z → 2026-10-23T17:36:42.789Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792776833667-7423da12-job-9
```
Exit: 1; signal: none; 2026-10-23T17:36:42.789Z → 2026-10-23T17:36:42.816Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792776833667-7423da12-job-10
```
Exit: 1; signal: none; 2026-10-23T17:36:42.816Z → 2026-10-23T17:36:42.839Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792776833667-7423da12-job-11
```
Exit: 1; signal: none; 2026-10-23T17:36:42.839Z → 2026-10-23T17:36:42.870Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792776833667-7423da12-job-12
```
Exit: 1; signal: none; 2026-10-23T17:36:42.870Z → 2026-10-23T17:36:42.893Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792776833667-7423da12-net
```
Exit: 0; signal: none; 2026-10-23T17:36:42.894Z → 2026-10-23T17:36:42.908Z

```sh
docker network rm sam-verify-1792776833667-7423da12-net
```
Exit: 0; signal: none; 2026-10-23T17:36:42.908Z → 2026-10-23T17:36:42.952Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
