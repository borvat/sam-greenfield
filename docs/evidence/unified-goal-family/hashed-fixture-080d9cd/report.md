# Independent SAM verification

Status: **PASS**
Source: `080d9cd4104f7b149bfeab9b885eb1139a828aa3` (clean: true)
Started: 2026-10-23T16:24:40.824Z; completed: 2026-10-23T16:38:32.867Z

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
- clean-application: `sam-verification:sam-verify-1792772680823-c799c007`; ID `sha256:a050f1ccf1237a787f37ce8913d3e107c1b29ac470ebf25eafd879dd8ed56c23`

## Commands and suite outcomes

### preflight — PASS

2026-10-23T16:24:40.825Z → 2026-10-23T16:24:41.089Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T16:24:40.829Z → 2026-10-23T16:24:40.839Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T16:24:40.839Z → 2026-10-23T16:24:40.844Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T16:24:40.844Z → 2026-10-23T16:24:40.849Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T16:24:40.849Z → 2026-10-23T16:24:40.864Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T16:24:40.864Z → 2026-10-23T16:24:40.889Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T16:24:40.889Z → 2026-10-23T16:24:40.949Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T16:24:40.949Z → 2026-10-23T16:24:41.021Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T16:24:41.021Z → 2026-10-23T16:24:41.076Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T16:24:41.076Z → 2026-10-23T16:24:41.078Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T16:24:41.078Z → 2026-10-23T16:24:41.087Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T16:24:41.088Z → 2026-10-23T16:24:41.089Z


### snapshot — PASS

2026-10-23T16:24:41.090Z → 2026-10-23T16:24:41.164Z

```sh
git archive --format=tar --output /tmp/sam-verify-C40ots/source.tar 080d9cd4104f7b149bfeab9b885eb1139a828aa3
```
Exit: 0; signal: none; 2026-10-23T16:24:41.091Z → 2026-10-23T16:24:41.124Z

```sh
tar -xf /tmp/sam-verify-C40ots/source.tar -C /tmp/sam-verify-C40ots/source
```
Exit: 0; signal: none; 2026-10-23T16:24:41.125Z → 2026-10-23T16:24:41.133Z


### images — PASS

2026-10-23T16:24:41.165Z → 2026-10-23T16:24:41.279Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T16:24:41.165Z → 2026-10-23T16:24:41.182Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T16:24:41.182Z → 2026-10-23T16:24:41.195Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T16:24:41.195Z → 2026-10-23T16:24:41.209Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T16:24:41.209Z → 2026-10-23T16:24:41.223Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T16:24:41.223Z → 2026-10-23T16:24:41.237Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T16:24:41.237Z → 2026-10-23T16:24:41.251Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T16:24:41.251Z → 2026-10-23T16:24:41.266Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T16:24:41.266Z → 2026-10-23T16:24:41.279Z


### isolated-postgres — PASS

2026-10-23T16:24:41.280Z → 2026-10-23T16:24:43.886Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792772680823-c799c007 sam-verify-1792772680823-c799c007-net
```
Exit: 0; signal: none; 2026-10-23T16:24:41.281Z → 2026-10-23T16:24:41.315Z

```sh
docker run --detach --name sam-verify-1792772680823-c799c007-pg --label sam.verification.run=sam-verify-1792772680823-c799c007 --network sam-verify-1792772680823-c799c007-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T16:24:41.315Z → 2026-10-23T16:24:42.266Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792772680823-c799c007-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T16:24:42.267Z → 2026-10-23T16:24:42.358Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792772680823-c799c007-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T16:24:42.859Z → 2026-10-23T16:24:42.966Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792772680823-c799c007-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T16:24:43.467Z → 2026-10-23T16:24:43.559Z

```sh
docker exec sam-verify-1792772680823-c799c007-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T16:24:43.559Z → 2026-10-23T16:24:43.666Z

```sh
docker exec sam-verify-1792772680823-c799c007-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T16:24:43.666Z → 2026-10-23T16:24:43.777Z

```sh
docker exec sam-verify-1792772680823-c799c007-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T16:24:43.777Z → 2026-10-23T16:24:43.886Z


### node-dependencies — PASS

2026-10-23T16:24:43.891Z → 2026-10-23T16:24:52.284Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-1 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T16:24:43.892Z → 2026-10-23T16:24:52.284Z


### python-dependencies — PASS

2026-10-23T16:24:52.285Z → 2026-10-23T16:24:55.389Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-2 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-C40ots/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T16:24:52.286Z → 2026-10-23T16:24:55.389Z


### runtime-versions — PASS

2026-10-23T16:24:55.390Z → 2026-10-23T16:25:29.956Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-3 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T16:24:55.392Z → 2026-10-23T16:25:05.764Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-4 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T16:25:05.764Z → 2026-10-23T16:25:17.117Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-5 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T16:25:17.117Z → 2026-10-23T16:25:28.035Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-6 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T16:25:28.036Z → 2026-10-23T16:25:29.876Z

```sh
docker exec sam-verify-1792772680823-c799c007-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T16:25:29.876Z → 2026-10-23T16:25:29.956Z


### workflow-tool — PASS

2026-10-23T16:25:29.957Z → 2026-10-23T16:25:30.559Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-C40ots/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T16:25:29.958Z → 2026-10-23T16:25:30.515Z

```sh
tar -xzf /tmp/sam-verify-C40ots/actionlint.tar.gz -C /tmp/sam-verify-C40ots actionlint
```
Exit: 0; signal: none; 2026-10-23T16:25:30.518Z → 2026-10-23T16:25:30.556Z

```sh
/tmp/sam-verify-C40ots/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T16:25:30.556Z → 2026-10-23T16:25:30.559Z


### workflow-validation — PASS

2026-10-23T16:25:30.561Z → 2026-10-23T16:25:30.565Z

```sh
/tmp/sam-verify-C40ots/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T16:25:30.562Z → 2026-10-23T16:25:30.565Z


### configuration-validation — PASS

2026-10-23T16:25:30.566Z → 2026-10-23T16:26:04.830Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T16:25:30.567Z → 2026-10-23T16:25:30.793Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T16:25:30.794Z → 2026-10-23T16:25:30.859Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T16:25:30.859Z → 2026-10-23T16:25:30.930Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T16:25:30.930Z → 2026-10-23T16:25:31.003Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T16:25:31.003Z → 2026-10-23T16:25:31.074Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-7 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T16:25:31.074Z → 2026-10-23T16:25:42.993Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-8 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T16:25:42.993Z → 2026-10-23T16:25:53.812Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-9 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T16:25:53.812Z → 2026-10-23T16:26:04.830Z


### typecheck — PASS

2026-10-23T16:26:04.832Z → 2026-10-23T16:26:21.434Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-10 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T16:26:04.833Z → 2026-10-23T16:26:21.433Z


### regression — PASS

2026-10-23T16:26:21.435Z → 2026-10-23T16:27:00.915Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-11 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T16:26:21.436Z → 2026-10-23T16:27:00.915Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T16:26:30.880Z → 2026-10-23T16:26:31.383Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T16:26:31.401Z → 2026-10-23T16:26:31.840Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T16:26:31.857Z → 2026-10-23T16:26:32.286Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T16:26:32.303Z → 2026-10-23T16:26:32.738Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T16:26:32.757Z → 2026-10-23T16:26:33.183Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T16:26:33.203Z → 2026-10-23T16:26:33.581Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T16:26:33.598Z → 2026-10-23T16:26:34.125Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T16:26:34.149Z → 2026-10-23T16:26:34.696Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T16:26:34.718Z → 2026-10-23T16:26:35.421Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T16:26:35.452Z → 2026-10-23T16:26:36.087Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T16:26:36.119Z → 2026-10-23T16:26:36.668Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T16:26:36.688Z → 2026-10-23T16:26:37.094Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T16:26:37.123Z → 2026-10-23T16:26:37.817Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T16:26:37.848Z → 2026-10-23T16:26:38.392Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T16:26:38.419Z → 2026-10-23T16:26:38.918Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T16:26:38.945Z → 2026-10-23T16:26:39.528Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T16:26:39.567Z → 2026-10-23T16:26:40.144Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T16:26:40.167Z → 2026-10-23T16:26:40.626Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T16:26:40.644Z → 2026-10-23T16:26:41.087Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T16:26:41.104Z → 2026-10-23T16:26:41.481Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T16:26:41.503Z → 2026-10-23T16:26:41.863Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T16:26:41.879Z → 2026-10-23T16:26:42.159Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T16:26:42.176Z → 2026-10-23T16:26:42.627Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T16:26:42.646Z → 2026-10-23T16:26:44.001Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T16:26:44.020Z → 2026-10-23T16:26:44.565Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T16:26:44.584Z → 2026-10-23T16:26:44.968Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T16:26:44.985Z → 2026-10-23T16:26:45.605Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T16:26:45.622Z → 2026-10-23T16:26:46.466Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T16:26:46.484Z → 2026-10-23T16:26:46.917Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T16:26:46.934Z → 2026-10-23T16:26:47.377Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T16:26:47.396Z → 2026-10-23T16:26:48.239Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T16:26:48.257Z → 2026-10-23T16:26:48.724Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T16:26:48.746Z → 2026-10-23T16:26:49.206Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T16:26:49.222Z → 2026-10-23T16:26:49.703Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T16:26:49.721Z → 2026-10-23T16:26:50.221Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T16:26:50.241Z → 2026-10-23T16:26:50.918Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T16:26:50.935Z → 2026-10-23T16:26:51.403Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T16:26:51.425Z → 2026-10-23T16:26:51.912Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T16:26:51.929Z → 2026-10-23T16:26:52.428Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T16:26:52.447Z → 2026-10-23T16:26:52.914Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T16:26:52.931Z → 2026-10-23T16:26:53.918Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T16:26:53.936Z → 2026-10-23T16:26:54.294Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T16:26:54.312Z → 2026-10-23T16:26:55.699Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T16:26:55.718Z → 2026-10-23T16:26:56.185Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T16:26:56.205Z → 2026-10-23T16:26:56.813Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T16:26:56.832Z → 2026-10-23T16:26:57.308Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T16:26:57.326Z → 2026-10-23T16:26:58.256Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T16:26:58.275Z → 2026-10-23T16:26:59.062Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T16:26:59.091Z → 2026-10-23T16:26:59.933Z

### core-reliability — PASS

2026-10-23T16:27:00.917Z → 2026-10-23T16:27:38.071Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-12 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T16:27:00.919Z → 2026-10-23T16:27:38.070Z

- tests/core/reliability.ts: PASS; 2026-10-23T16:27:11.055Z → 2026-10-23T16:27:16.389Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T16:27:16.409Z → 2026-10-23T16:27:17.248Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T16:27:17.273Z → 2026-10-23T16:27:17.876Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T16:27:17.894Z → 2026-10-23T16:27:18.441Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T16:27:18.461Z → 2026-10-23T16:27:20.359Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T16:27:20.377Z → 2026-10-23T16:27:20.862Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T16:27:20.883Z → 2026-10-23T16:27:22.547Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T16:27:22.568Z → 2026-10-23T16:27:23.192Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T16:27:23.211Z → 2026-10-23T16:27:24.644Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T16:27:24.666Z → 2026-10-23T16:27:28.854Z
- tests/core/evidenceTransforms.ts: PASS; 2026-10-23T16:27:28.872Z → 2026-10-23T16:27:29.469Z
- tests/core/evidenceIntegration.ts: PASS; 2026-10-23T16:27:29.486Z → 2026-10-23T16:27:36.355Z
- tests/core/sourceContracts.ts: PASS; 2026-10-23T16:27:36.389Z → 2026-10-23T16:27:37.188Z

### provider-auth — PASS

2026-10-23T16:27:38.073Z → 2026-10-23T16:27:49.923Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-13 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T16:27:38.075Z → 2026-10-23T16:27:49.923Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T16:27:48.590Z → 2026-10-23T16:27:49.045Z

### postgres-tls — PASS

2026-10-23T16:27:49.926Z → 2026-10-23T16:28:01.923Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-14 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T16:27:49.927Z → 2026-10-23T16:28:01.923Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T16:28:00.089Z → 2026-10-23T16:28:01.026Z

### contracts — PASS

2026-10-23T16:28:01.925Z → 2026-10-23T16:28:14.635Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-15 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T16:28:01.926Z → 2026-10-23T16:28:14.635Z

- tests/release/contracts.ts: PASS; 2026-10-23T16:28:12.991Z → 2026-10-23T16:28:13.716Z

### synthetic-pilot — PASS

2026-10-23T16:28:14.637Z → 2026-10-23T16:28:26.134Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-16 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T16:28:14.639Z → 2026-10-23T16:28:26.134Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T16:28:24.473Z → 2026-10-23T16:28:25.305Z

### managed-schema — PASS

2026-10-23T16:28:26.136Z → 2026-10-23T16:28:37.186Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-17 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T16:28:26.137Z → 2026-10-23T16:28:37.186Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T16:28:35.947Z → 2026-10-23T16:28:36.279Z

### local-bundle — PASS

2026-10-23T16:28:37.188Z → 2026-10-23T16:28:48.950Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-18 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T16:28:37.189Z → 2026-10-23T16:28:48.950Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T16:28:47.607Z → 2026-10-23T16:28:48.149Z

### closed-setup — PASS

2026-10-23T16:28:48.952Z → 2026-10-23T16:29:00.443Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-19 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T16:28:48.954Z → 2026-10-23T16:29:00.443Z

- tests/release/setup.ts: PASS; 2026-10-23T16:28:59.072Z → 2026-10-23T16:28:59.655Z

### database-contract — PASS

2026-10-23T16:29:00.445Z → 2026-10-23T16:29:10.443Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-20 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T16:29:00.447Z → 2026-10-23T16:29:10.442Z

- tests/release/database_check.ts: PASS; 2026-10-23T16:29:09.351Z → 2026-10-23T16:29:09.697Z

### prelaunch-gate — PASS

2026-10-23T16:29:10.444Z → 2026-10-23T16:29:20.485Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-21 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T16:29:10.446Z → 2026-10-23T16:29:20.484Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T16:29:19.389Z → 2026-10-23T16:29:19.693Z

### service-provisioning — PASS

2026-10-23T16:29:20.491Z → 2026-10-23T16:29:33.800Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-22 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T16:29:20.493Z → 2026-10-23T16:29:33.800Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T16:29:29.510Z → 2026-10-23T16:29:33.021Z

### operator-provisioning — PASS

2026-10-23T16:29:33.802Z → 2026-10-23T16:29:47.648Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-23 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T16:29:33.804Z → 2026-10-23T16:29:47.648Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T16:29:43.401Z → 2026-10-23T16:29:46.828Z

### provisioning-backup-recovery — PASS

2026-10-23T16:29:47.651Z → 2026-10-23T16:29:52.086Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792772680823-c799c007-pg sam-verify-1792772680823-c799c007
```
Exit: 0; signal: none; 2026-10-23T16:29:47.654Z → 2026-10-23T16:29:52.086Z


### render-migration-compatibility — PASS

2026-10-23T16:29:52.090Z → 2026-10-23T16:30:06.947Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-24 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T16:29:52.093Z → 2026-10-23T16:30:06.947Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T16:30:04.234Z → 2026-10-23T16:30:05.999Z

### render-google-oauth-contracts — PASS

2026-10-23T16:30:06.950Z → 2026-10-23T16:30:26.001Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-25 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-23T16:30:06.953Z → 2026-10-23T16:30:26.001Z


### integration-migrations — PASS

2026-10-23T16:30:26.004Z → 2026-10-23T16:30:40.346Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-26 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-23T16:30:26.006Z → 2026-10-23T16:30:40.346Z

- tests/integration/migrations.ts: PASS; 2026-10-23T16:30:37.761Z → 2026-10-23T16:30:39.361Z

### integration-oauth-mcp — PASS

2026-10-23T16:30:40.350Z → 2026-10-23T16:30:51.717Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-27 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-23T16:30:40.352Z → 2026-10-23T16:30:51.717Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-23T16:30:50.273Z → 2026-10-23T16:30:50.835Z

### integration-orchestration — PASS

2026-10-23T16:30:51.720Z → 2026-10-23T16:31:09.371Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-28 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T16:30:51.723Z → 2026-10-23T16:31:09.370Z

- tests/integration/orchestration.ts: PASS; 2026-10-23T16:31:01.640Z → 2026-10-23T16:31:08.408Z

### specialist-reasoning — PASS

2026-10-23T16:31:09.373Z → 2026-10-23T16:32:20.463Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-29 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-23T16:31:09.376Z → 2026-10-23T16:32:20.463Z

- tests/specialists/acceptance.ts: PASS; 2026-10-23T16:31:18.661Z → 2026-10-23T16:32:19.579Z

### specialist-gateway — PASS

2026-10-23T16:32:20.466Z → 2026-10-23T16:32:31.686Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-30 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-23T16:32:20.468Z → 2026-10-23T16:32:31.686Z

- tests/specialists/gateway.ts: PASS; 2026-10-23T16:32:30.110Z → 2026-10-23T16:32:30.745Z

### specialist-provenance — PASS

2026-10-23T16:32:31.690Z → 2026-10-23T16:32:44.122Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-31 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-23T16:32:31.693Z → 2026-10-23T16:32:44.122Z

- tests/specialists/provenance.ts: PASS; 2026-10-23T16:32:42.526Z → 2026-10-23T16:32:43.081Z

### specialist-learning-fairness — PASS

2026-10-23T16:32:44.125Z → 2026-10-23T16:32:57.200Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-32 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-23T16:32:44.127Z → 2026-10-23T16:32:57.200Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-23T16:32:55.013Z → 2026-10-23T16:32:56.253Z

### specialist-evaluation — PASS

2026-10-23T16:32:57.204Z → 2026-10-23T16:33:09.897Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-33 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-23T16:32:57.207Z → 2026-10-23T16:33:09.897Z


### evaluation-budget — PASS

2026-10-23T16:33:09.903Z → 2026-10-23T16:34:16.558Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-34 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 --mount type=bind,source=/tmp/sam-unified-hashed-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-23T16:33:09.909Z → 2026-10-23T16:34:16.557Z

- tests/evaluation/budgets.ts: PASS; 2026-10-23T16:33:20.480Z → 2026-10-23T16:34:15.557Z

### evaluation-adapter — PASS

2026-10-23T16:34:16.568Z → 2026-10-23T16:34:29.421Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-35 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-23T16:34:16.571Z → 2026-10-23T16:34:29.421Z

- tests/evaluation/adapters.ts: PASS; 2026-10-23T16:34:27.275Z → 2026-10-23T16:34:28.497Z

### evaluation-orchestration — PASS

2026-10-23T16:34:29.425Z → 2026-10-23T16:35:02.098Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-36 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 --mount type=bind,source=/tmp/sam-unified-hashed-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T16:34:29.428Z → 2026-10-23T16:35:02.098Z

- tests/evaluation/orchestration.ts: PASS; 2026-10-23T16:34:38.667Z → 2026-10-23T16:35:01.226Z

### evaluation-independent-review — PASS

2026-10-23T16:35:02.102Z → 2026-10-23T16:35:12.945Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-37 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-23T16:35:02.105Z → 2026-10-23T16:35:12.945Z

- tests/evaluation/review.ts: PASS; 2026-10-23T16:35:11.369Z → 2026-10-23T16:35:12.158Z

### evaluation-commercial-market — PASS

2026-10-23T16:35:12.948Z → 2026-10-23T16:35:49.017Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-38 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 --mount type=bind,source=/tmp/sam-unified-hashed-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-23T16:35:12.951Z → 2026-10-23T16:35:49.017Z

- tests/evaluation/market.ts: PASS; 2026-10-23T16:35:23.469Z → 2026-10-23T16:35:48.165Z

### evaluation-commercial-profitability — PASS

2026-10-23T16:35:49.022Z → 2026-10-23T16:36:24.665Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-39 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 --mount type=bind,source=/tmp/sam-unified-hashed-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-23T16:35:49.025Z → 2026-10-23T16:36:24.664Z

- tests/evaluation/profitability.ts: PASS; 2026-10-23T16:35:59.528Z → 2026-10-23T16:36:23.806Z

### evaluation-commercial-suppliers — PASS

2026-10-23T16:36:24.670Z → 2026-10-23T16:37:00.837Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-40 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 --mount type=bind,source=/tmp/sam-unified-hashed-full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-23T16:36:24.675Z → 2026-10-23T16:37:00.837Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-23T16:36:33.964Z → 2026-10-23T16:37:00.007Z

### migration-upgrade-rollback — PASS

2026-10-23T16:37:00.853Z → 2026-10-23T16:37:12.619Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-41 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-23T16:37:00.858Z → 2026-10-23T16:37:12.619Z


### specialist-restart-prepare — PASS

2026-10-23T16:37:12.626Z → 2026-10-23T16:37:23.388Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-42 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T16:37:12.632Z → 2026-10-23T16:37:23.388Z


### evaluation-restart-prepare — PASS

2026-10-23T16:37:23.394Z → 2026-10-23T16:37:35.952Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-43 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=080d9cd4104f7b149bfeab9b885eb1139a828aa3 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T16:37:23.398Z → 2026-10-23T16:37:35.952Z


### postgres-restart — PASS

2026-10-23T16:37:35.958Z → 2026-10-23T16:37:36.475Z

```sh
docker restart --time 10 sam-verify-1792772680823-c799c007-pg
```
Exit: 0; signal: none; 2026-10-23T16:37:35.964Z → 2026-10-23T16:37:36.378Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792772680823-c799c007-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T16:37:36.378Z → 2026-10-23T16:37:36.475Z


### migration-after-restart — PASS

2026-10-23T16:37:36.483Z → 2026-10-23T16:37:49.191Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-44 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-23T16:37:36.487Z → 2026-10-23T16:37:49.191Z


### specialist-restart-check — PASS

2026-10-23T16:37:49.197Z → 2026-10-23T16:37:59.522Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-45 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T16:37:49.202Z → 2026-10-23T16:37:59.522Z


### evaluation-restart-check — PASS

2026-10-23T16:37:59.529Z → 2026-10-23T16:38:09.583Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-46 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T16:37:59.535Z → 2026-10-23T16:38:09.583Z


### phase0-migrations — PASS

2026-10-23T16:38:09.589Z → 2026-10-23T16:38:10.273Z

```sh
docker cp /tmp/sam-verify-C40ots/source/packages/db/migrations sam-verify-1792772680823-c799c007-pg:/migrations
```
Exit: 0; signal: none; 2026-10-23T16:38:09.594Z → 2026-10-23T16:38:09.609Z

```sh
docker exec sam-verify-1792772680823-c799c007-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-23T16:38:09.609Z → 2026-10-23T16:38:10.190Z

```sh
docker exec sam-verify-1792772680823-c799c007-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-23T16:38:10.190Z → 2026-10-23T16:38:10.273Z


### phase0-acceptance — PASS

2026-10-23T16:38:10.280Z → 2026-10-23T16:38:12.401Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-47 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-C40ots/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-23T16:38:10.285Z → 2026-10-23T16:38:12.401Z


### phase0-postgres — PASS

2026-10-23T16:38:12.409Z → 2026-10-23T16:38:13.684Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-48 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-C40ots/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-23T16:38:12.416Z → 2026-10-23T16:38:13.684Z


### tenant-isolation — PASS

2026-10-23T16:38:13.695Z → 2026-10-23T16:38:14.832Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-49 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-C40ots/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-23T16:38:13.701Z → 2026-10-23T16:38:14.832Z


### fail-closed-security — PASS

2026-10-23T16:38:14.839Z → 2026-10-23T16:38:16.664Z

```sh
docker run --rm --name sam-verify-1792772680823-c799c007-job-50 --label sam.verification.run=sam-verify-1792772680823-c799c007 --init --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-C40ots/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-23T16:38:14.847Z → 2026-10-23T16:38:16.664Z


### clean-image — PASS

2026-10-23T16:38:16.672Z → 2026-10-23T16:38:25.052Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792772680823-c799c007 Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-23T16:38:16.677Z → 2026-10-23T16:38:25.052Z


### image-contract — PASS

2026-10-23T16:38:25.059Z → 2026-10-23T16:38:25.085Z

```sh
docker image inspect sam-verification:sam-verify-1792772680823-c799c007
```
Exit: 0; signal: none; 2026-10-23T16:38:25.064Z → 2026-10-23T16:38:25.085Z


### application-startup-restart — PASS

2026-10-23T16:38:25.092Z → 2026-10-23T16:38:31.079Z

```sh
docker run --rm --init --name sam-verify-1792772680823-c799c007-application --label sam.verification.run=sam-verify-1792772680823-c799c007 --network container:sam-verify-1792772680823-c799c007-pg --mount type=bind,src=/tmp/sam-verify-C40ots/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792772680823-c799c007 node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-23T16:38:25.097Z → 2026-10-23T16:38:31.079Z


### source-integrity — PASS

2026-10-23T16:38:31.085Z → 2026-10-23T16:38:31.101Z


### cleanup — PASS

2026-10-23T16:38:31.106Z → 2026-10-23T16:38:32.859Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-pg
```
Exit: 0; signal: none; 2026-10-23T16:38:31.111Z → 2026-10-23T16:38:31.127Z

```sh
docker rm --force --volumes sam-verify-1792772680823-c799c007-pg
```
Exit: 0; signal: none; 2026-10-23T16:38:31.127Z → 2026-10-23T16:38:31.562Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-1
```
Exit: 1; signal: none; 2026-10-23T16:38:31.562Z → 2026-10-23T16:38:31.587Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-2
```
Exit: 1; signal: none; 2026-10-23T16:38:31.587Z → 2026-10-23T16:38:31.613Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-3
```
Exit: 1; signal: none; 2026-10-23T16:38:31.613Z → 2026-10-23T16:38:31.636Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-4
```
Exit: 1; signal: none; 2026-10-23T16:38:31.636Z → 2026-10-23T16:38:31.661Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-5
```
Exit: 1; signal: none; 2026-10-23T16:38:31.661Z → 2026-10-23T16:38:31.686Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-6
```
Exit: 1; signal: none; 2026-10-23T16:38:31.686Z → 2026-10-23T16:38:31.716Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-7
```
Exit: 1; signal: none; 2026-10-23T16:38:31.716Z → 2026-10-23T16:38:31.737Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-8
```
Exit: 1; signal: none; 2026-10-23T16:38:31.737Z → 2026-10-23T16:38:31.765Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-9
```
Exit: 1; signal: none; 2026-10-23T16:38:31.765Z → 2026-10-23T16:38:31.788Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-10
```
Exit: 1; signal: none; 2026-10-23T16:38:31.788Z → 2026-10-23T16:38:31.810Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-11
```
Exit: 1; signal: none; 2026-10-23T16:38:31.810Z → 2026-10-23T16:38:31.833Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-12
```
Exit: 1; signal: none; 2026-10-23T16:38:31.833Z → 2026-10-23T16:38:31.856Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-13
```
Exit: 1; signal: none; 2026-10-23T16:38:31.856Z → 2026-10-23T16:38:31.877Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-14
```
Exit: 1; signal: none; 2026-10-23T16:38:31.877Z → 2026-10-23T16:38:31.898Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-15
```
Exit: 1; signal: none; 2026-10-23T16:38:31.899Z → 2026-10-23T16:38:31.919Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-16
```
Exit: 1; signal: none; 2026-10-23T16:38:31.919Z → 2026-10-23T16:38:31.942Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-17
```
Exit: 1; signal: none; 2026-10-23T16:38:31.942Z → 2026-10-23T16:38:31.968Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-18
```
Exit: 1; signal: none; 2026-10-23T16:38:31.968Z → 2026-10-23T16:38:31.991Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-19
```
Exit: 1; signal: none; 2026-10-23T16:38:31.991Z → 2026-10-23T16:38:32.014Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-20
```
Exit: 1; signal: none; 2026-10-23T16:38:32.014Z → 2026-10-23T16:38:32.034Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-21
```
Exit: 1; signal: none; 2026-10-23T16:38:32.034Z → 2026-10-23T16:38:32.055Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-22
```
Exit: 1; signal: none; 2026-10-23T16:38:32.055Z → 2026-10-23T16:38:32.077Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-23
```
Exit: 1; signal: none; 2026-10-23T16:38:32.077Z → 2026-10-23T16:38:32.098Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-24
```
Exit: 1; signal: none; 2026-10-23T16:38:32.099Z → 2026-10-23T16:38:32.121Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-25
```
Exit: 1; signal: none; 2026-10-23T16:38:32.121Z → 2026-10-23T16:38:32.145Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-26
```
Exit: 1; signal: none; 2026-10-23T16:38:32.145Z → 2026-10-23T16:38:32.167Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-27
```
Exit: 1; signal: none; 2026-10-23T16:38:32.167Z → 2026-10-23T16:38:32.187Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-28
```
Exit: 1; signal: none; 2026-10-23T16:38:32.187Z → 2026-10-23T16:38:32.211Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-29
```
Exit: 1; signal: none; 2026-10-23T16:38:32.211Z → 2026-10-23T16:38:32.235Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-30
```
Exit: 1; signal: none; 2026-10-23T16:38:32.235Z → 2026-10-23T16:38:32.260Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-31
```
Exit: 1; signal: none; 2026-10-23T16:38:32.260Z → 2026-10-23T16:38:32.283Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-32
```
Exit: 1; signal: none; 2026-10-23T16:38:32.283Z → 2026-10-23T16:38:32.311Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-33
```
Exit: 1; signal: none; 2026-10-23T16:38:32.311Z → 2026-10-23T16:38:32.333Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-34
```
Exit: 1; signal: none; 2026-10-23T16:38:32.333Z → 2026-10-23T16:38:32.355Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-35
```
Exit: 1; signal: none; 2026-10-23T16:38:32.355Z → 2026-10-23T16:38:32.380Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-36
```
Exit: 1; signal: none; 2026-10-23T16:38:32.380Z → 2026-10-23T16:38:32.407Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-37
```
Exit: 1; signal: none; 2026-10-23T16:38:32.407Z → 2026-10-23T16:38:32.433Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-38
```
Exit: 1; signal: none; 2026-10-23T16:38:32.433Z → 2026-10-23T16:38:32.460Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-39
```
Exit: 1; signal: none; 2026-10-23T16:38:32.460Z → 2026-10-23T16:38:32.486Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-40
```
Exit: 1; signal: none; 2026-10-23T16:38:32.486Z → 2026-10-23T16:38:32.509Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-41
```
Exit: 1; signal: none; 2026-10-23T16:38:32.509Z → 2026-10-23T16:38:32.534Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-42
```
Exit: 1; signal: none; 2026-10-23T16:38:32.534Z → 2026-10-23T16:38:32.559Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-43
```
Exit: 1; signal: none; 2026-10-23T16:38:32.559Z → 2026-10-23T16:38:32.581Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-44
```
Exit: 1; signal: none; 2026-10-23T16:38:32.581Z → 2026-10-23T16:38:32.602Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-45
```
Exit: 1; signal: none; 2026-10-23T16:38:32.602Z → 2026-10-23T16:38:32.625Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-46
```
Exit: 1; signal: none; 2026-10-23T16:38:32.625Z → 2026-10-23T16:38:32.648Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-47
```
Exit: 1; signal: none; 2026-10-23T16:38:32.648Z → 2026-10-23T16:38:32.672Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-48
```
Exit: 1; signal: none; 2026-10-23T16:38:32.672Z → 2026-10-23T16:38:32.702Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-49
```
Exit: 1; signal: none; 2026-10-23T16:38:32.702Z → 2026-10-23T16:38:32.726Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-job-50
```
Exit: 1; signal: none; 2026-10-23T16:38:32.726Z → 2026-10-23T16:38:32.748Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-application
```
Exit: 1; signal: none; 2026-10-23T16:38:32.748Z → 2026-10-23T16:38:32.771Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792772680823-c799c007-net
```
Exit: 0; signal: none; 2026-10-23T16:38:32.771Z → 2026-10-23T16:38:32.785Z

```sh
docker network rm sam-verify-1792772680823-c799c007-net
```
Exit: 0; signal: none; 2026-10-23T16:38:32.785Z → 2026-10-23T16:38:32.829Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
