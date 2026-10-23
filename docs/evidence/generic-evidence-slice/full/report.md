# Independent SAM verification

Status: **PASS**
Source: `9da55fc3d075a1776acf3162397c8b1f17e602b2` (clean: true)
Started: 2026-10-23T06:42:28.610Z; completed: 2026-10-23T06:55:32.671Z

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
- clean-application: `sam-verification:sam-verify-1792737748609-78c3055d`; ID `sha256:c79e72f50b171d0bcd35c85d3838db89289e5ca9c9a98fe3ca484b3977f5e94c`

## Commands and suite outcomes

### preflight — PASS

2026-10-23T06:42:28.611Z → 2026-10-23T06:42:28.930Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-23T06:42:28.615Z → 2026-10-23T06:42:28.620Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-23T06:42:28.620Z → 2026-10-23T06:42:28.623Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-23T06:42:28.623Z → 2026-10-23T06:42:28.628Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-23T06:42:28.628Z → 2026-10-23T06:42:28.640Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-23T06:42:28.640Z → 2026-10-23T06:42:28.660Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-23T06:42:28.660Z → 2026-10-23T06:42:28.725Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-23T06:42:28.726Z → 2026-10-23T06:42:28.800Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-23T06:42:28.800Z → 2026-10-23T06:42:28.910Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-23T06:42:28.910Z → 2026-10-23T06:42:28.913Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-23T06:42:28.913Z → 2026-10-23T06:42:28.927Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-23T06:42:28.927Z → 2026-10-23T06:42:28.930Z


### snapshot — PASS

2026-10-23T06:42:28.932Z → 2026-10-23T06:42:29.006Z

```sh
git archive --format=tar --output /tmp/sam-verify-VYZnlZ/source.tar 9da55fc3d075a1776acf3162397c8b1f17e602b2
```
Exit: 0; signal: none; 2026-10-23T06:42:28.933Z → 2026-10-23T06:42:28.965Z

```sh
tar -xf /tmp/sam-verify-VYZnlZ/source.tar -C /tmp/sam-verify-VYZnlZ/source
```
Exit: 0; signal: none; 2026-10-23T06:42:28.965Z → 2026-10-23T06:42:28.974Z


### images — PASS

2026-10-23T06:42:29.007Z → 2026-10-23T06:42:29.141Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T06:42:29.008Z → 2026-10-23T06:42:29.025Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-23T06:42:29.025Z → 2026-10-23T06:42:29.045Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T06:42:29.046Z → 2026-10-23T06:42:29.063Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-23T06:42:29.063Z → 2026-10-23T06:42:29.078Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T06:42:29.078Z → 2026-10-23T06:42:29.092Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T06:42:29.092Z → 2026-10-23T06:42:29.109Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T06:42:29.109Z → 2026-10-23T06:42:29.125Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-23T06:42:29.125Z → 2026-10-23T06:42:29.141Z


### isolated-postgres — PASS

2026-10-23T06:42:29.142Z → 2026-10-23T06:42:34.614Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792737748609-78c3055d sam-verify-1792737748609-78c3055d-net
```
Exit: 0; signal: none; 2026-10-23T06:42:29.143Z → 2026-10-23T06:42:29.177Z

```sh
docker run --detach --name sam-verify-1792737748609-78c3055d-pg --label sam.verification.run=sam-verify-1792737748609-78c3055d --network sam-verify-1792737748609-78c3055d-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-23T06:42:29.177Z → 2026-10-23T06:42:32.110Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792737748609-78c3055d-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T06:42:32.110Z → 2026-10-23T06:42:32.201Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792737748609-78c3055d-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T06:42:32.702Z → 2026-10-23T06:42:32.820Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792737748609-78c3055d-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 2; signal: none; 2026-10-23T06:42:33.322Z → 2026-10-23T06:42:33.416Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792737748609-78c3055d-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T06:42:33.917Z → 2026-10-23T06:42:34.011Z

```sh
docker exec sam-verify-1792737748609-78c3055d-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-23T06:42:34.011Z → 2026-10-23T06:42:34.171Z

```sh
docker exec sam-verify-1792737748609-78c3055d-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-23T06:42:34.171Z → 2026-10-23T06:42:34.451Z

```sh
docker exec sam-verify-1792737748609-78c3055d-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-23T06:42:34.451Z → 2026-10-23T06:42:34.614Z


### node-dependencies — PASS

2026-10-23T06:42:34.619Z → 2026-10-23T06:42:50.522Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-1 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-23T06:42:34.620Z → 2026-10-23T06:42:50.522Z


### python-dependencies — PASS

2026-10-23T06:42:50.524Z → 2026-10-23T06:42:53.662Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-2 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.12.109 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-VYZnlZ/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-23T06:42:50.525Z → 2026-10-23T06:42:53.662Z


### runtime-versions — PASS

2026-10-23T06:42:53.664Z → 2026-10-23T06:43:27.646Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-3 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-23T06:42:53.665Z → 2026-10-23T06:43:04.586Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-4 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-23T06:43:04.586Z → 2026-10-23T06:43:15.573Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-5 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-23T06:43:15.573Z → 2026-10-23T06:43:25.823Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-6 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-23T06:43:25.823Z → 2026-10-23T06:43:27.556Z

```sh
docker exec sam-verify-1792737748609-78c3055d-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-23T06:43:27.556Z → 2026-10-23T06:43:27.646Z


### workflow-tool — PASS

2026-10-23T06:43:27.648Z → 2026-10-23T06:43:28.293Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-VYZnlZ/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-23T06:43:27.650Z → 2026-10-23T06:43:28.250Z

```sh
tar -xzf /tmp/sam-verify-VYZnlZ/actionlint.tar.gz -C /tmp/sam-verify-VYZnlZ actionlint
```
Exit: 0; signal: none; 2026-10-23T06:43:28.253Z → 2026-10-23T06:43:28.290Z

```sh
/tmp/sam-verify-VYZnlZ/actionlint --version
```
Exit: 0; signal: none; 2026-10-23T06:43:28.291Z → 2026-10-23T06:43:28.293Z


### workflow-validation — PASS

2026-10-23T06:43:28.295Z → 2026-10-23T06:43:28.298Z

```sh
/tmp/sam-verify-VYZnlZ/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-23T06:43:28.295Z → 2026-10-23T06:43:28.298Z


### configuration-validation — PASS

2026-10-23T06:43:28.299Z → 2026-10-23T06:44:03.288Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-23T06:43:28.300Z → 2026-10-23T06:43:28.517Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:43:28.517Z → 2026-10-23T06:43:28.584Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:43:28.584Z → 2026-10-23T06:43:28.657Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:43:28.657Z → 2026-10-23T06:43:28.729Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-23T06:43:28.729Z → 2026-10-23T06:43:28.797Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-7 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-23T06:43:28.797Z → 2026-10-23T06:43:40.478Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-8 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-23T06:43:40.478Z → 2026-10-23T06:43:50.995Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-9 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-23T06:43:50.995Z → 2026-10-23T06:44:03.288Z


### typecheck — PASS

2026-10-23T06:44:03.290Z → 2026-10-23T06:44:19.971Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-10 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-23T06:44:03.291Z → 2026-10-23T06:44:19.971Z


### regression — PASS

2026-10-23T06:44:19.973Z → 2026-10-23T06:44:59.595Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-11 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-23T06:44:19.974Z → 2026-10-23T06:44:59.594Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-23T06:44:30.794Z → 2026-10-23T06:44:31.333Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-23T06:44:31.356Z → 2026-10-23T06:44:31.785Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-23T06:44:31.802Z → 2026-10-23T06:44:32.229Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-23T06:44:32.251Z → 2026-10-23T06:44:32.721Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-23T06:44:32.739Z → 2026-10-23T06:44:33.179Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-23T06:44:33.198Z → 2026-10-23T06:44:33.595Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-23T06:44:33.612Z → 2026-10-23T06:44:34.150Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-23T06:44:34.170Z → 2026-10-23T06:44:34.645Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-23T06:44:34.661Z → 2026-10-23T06:44:35.143Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-23T06:44:35.166Z → 2026-10-23T06:44:35.583Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-23T06:44:35.604Z → 2026-10-23T06:44:36.029Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-23T06:44:36.047Z → 2026-10-23T06:44:36.374Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-23T06:44:36.392Z → 2026-10-23T06:44:36.895Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-23T06:44:36.912Z → 2026-10-23T06:44:37.314Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-23T06:44:37.331Z → 2026-10-23T06:44:37.725Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-23T06:44:37.743Z → 2026-10-23T06:44:38.217Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-23T06:44:38.234Z → 2026-10-23T06:44:38.727Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-23T06:44:38.748Z → 2026-10-23T06:44:39.222Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-23T06:44:39.240Z → 2026-10-23T06:44:39.709Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-23T06:44:39.726Z → 2026-10-23T06:44:40.101Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-23T06:44:40.120Z → 2026-10-23T06:44:40.494Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-23T06:44:40.510Z → 2026-10-23T06:44:40.826Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-23T06:44:40.843Z → 2026-10-23T06:44:41.299Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-23T06:44:41.316Z → 2026-10-23T06:44:42.796Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-23T06:44:42.815Z → 2026-10-23T06:44:43.418Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-23T06:44:43.447Z → 2026-10-23T06:44:43.870Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-23T06:44:43.890Z → 2026-10-23T06:44:44.536Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-23T06:44:44.555Z → 2026-10-23T06:44:45.406Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-23T06:44:45.426Z → 2026-10-23T06:44:45.952Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-23T06:44:45.973Z → 2026-10-23T06:44:46.427Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-23T06:44:46.446Z → 2026-10-23T06:44:47.254Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-23T06:44:47.275Z → 2026-10-23T06:44:47.862Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-23T06:44:47.883Z → 2026-10-23T06:44:48.321Z
- tests/phase15/bol_read.ts: PASS; 2026-10-23T06:44:48.338Z → 2026-10-23T06:44:48.795Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-23T06:44:48.813Z → 2026-10-23T06:44:49.259Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-23T06:44:49.278Z → 2026-10-23T06:44:49.860Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-23T06:44:49.878Z → 2026-10-23T06:44:50.323Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-23T06:44:50.341Z → 2026-10-23T06:44:50.849Z
- tests/phase19/command_center.ts: PASS; 2026-10-23T06:44:50.871Z → 2026-10-23T06:44:51.398Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-23T06:44:51.418Z → 2026-10-23T06:44:51.901Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-23T06:44:51.921Z → 2026-10-23T06:44:52.988Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-23T06:44:53.005Z → 2026-10-23T06:44:53.380Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-23T06:44:53.400Z → 2026-10-23T06:44:54.681Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-23T06:44:54.699Z → 2026-10-23T06:44:55.179Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-23T06:44:55.199Z → 2026-10-23T06:44:55.794Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-23T06:44:55.813Z → 2026-10-23T06:44:56.256Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-23T06:44:56.283Z → 2026-10-23T06:44:57.111Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-23T06:44:57.129Z → 2026-10-23T06:44:57.864Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-23T06:44:57.894Z → 2026-10-23T06:44:58.714Z

### core-reliability — PASS

2026-10-23T06:44:59.597Z → 2026-10-23T06:45:27.395Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-12 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-23T06:44:59.598Z → 2026-10-23T06:45:27.395Z

- tests/core/reliability.ts: PASS; 2026-10-23T06:45:09.109Z → 2026-10-23T06:45:14.246Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-23T06:45:14.266Z → 2026-10-23T06:45:14.854Z
- tests/core/reservationRace.ts: PASS; 2026-10-23T06:45:14.873Z → 2026-10-23T06:45:15.356Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-23T06:45:15.376Z → 2026-10-23T06:45:15.924Z
- tests/core/eventBacklog.ts: PASS; 2026-10-23T06:45:15.941Z → 2026-10-23T06:45:17.694Z
- tests/core/learningScheduling.ts: PASS; 2026-10-23T06:45:17.716Z → 2026-10-23T06:45:18.237Z
- tests/core/startupAdmission.ts: PASS; 2026-10-23T06:45:18.255Z → 2026-10-23T06:45:20.047Z
- tests/core/planningDeadline.ts: PASS; 2026-10-23T06:45:20.067Z → 2026-10-23T06:45:20.713Z
- tests/core/planningRepair.ts: PASS; 2026-10-23T06:45:20.733Z → 2026-10-23T06:45:22.165Z
- tests/core/reviewReliability.ts: PASS; 2026-10-23T06:45:22.184Z → 2026-10-23T06:45:25.921Z
- tests/core/evidenceTransforms.ts: PASS; 2026-10-23T06:45:25.939Z → 2026-10-23T06:45:26.536Z

### provider-auth — PASS

2026-10-23T06:45:27.397Z → 2026-10-23T06:45:37.172Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-13 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-23T06:45:27.399Z → 2026-10-23T06:45:37.172Z

- tests/release/provider_auth.ts: PASS; 2026-10-23T06:45:35.964Z → 2026-10-23T06:45:36.359Z

### postgres-tls — PASS

2026-10-23T06:45:37.174Z → 2026-10-23T06:45:49.061Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-14 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-23T06:45:37.175Z → 2026-10-23T06:45:49.061Z

- tests/release/postgres_tls.ts: PASS; 2026-10-23T06:45:47.408Z → 2026-10-23T06:45:48.234Z

### contracts — PASS

2026-10-23T06:45:49.063Z → 2026-10-23T06:46:00.200Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-15 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-23T06:45:49.064Z → 2026-10-23T06:46:00.200Z

- tests/release/contracts.ts: PASS; 2026-10-23T06:45:58.794Z → 2026-10-23T06:45:59.451Z

### synthetic-pilot — PASS

2026-10-23T06:46:00.202Z → 2026-10-23T06:46:10.713Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-16 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-23T06:46:00.204Z → 2026-10-23T06:46:10.713Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-23T06:46:09.239Z → 2026-10-23T06:46:09.935Z

### managed-schema — PASS

2026-10-23T06:46:10.715Z → 2026-10-23T06:46:21.834Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-17 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-23T06:46:10.716Z → 2026-10-23T06:46:21.833Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-23T06:46:20.692Z → 2026-10-23T06:46:20.967Z

### local-bundle — PASS

2026-10-23T06:46:21.836Z → 2026-10-23T06:46:33.420Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-18 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-23T06:46:21.837Z → 2026-10-23T06:46:33.420Z

- tests/release/local_bundle.ts: PASS; 2026-10-23T06:46:32.168Z → 2026-10-23T06:46:32.568Z

### closed-setup — PASS

2026-10-23T06:46:33.422Z → 2026-10-23T06:46:44.030Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-19 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-23T06:46:33.423Z → 2026-10-23T06:46:44.030Z

- tests/release/setup.ts: PASS; 2026-10-23T06:46:42.677Z → 2026-10-23T06:46:43.238Z

### database-contract — PASS

2026-10-23T06:46:44.032Z → 2026-10-23T06:46:55.505Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-20 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-23T06:46:44.034Z → 2026-10-23T06:46:55.505Z

- tests/release/database_check.ts: PASS; 2026-10-23T06:46:54.270Z → 2026-10-23T06:46:54.665Z

### prelaunch-gate — PASS

2026-10-23T06:46:55.507Z → 2026-10-23T06:47:05.927Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-21 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-23T06:46:55.509Z → 2026-10-23T06:47:05.927Z

- tests/release/prelaunch.ts: PASS; 2026-10-23T06:47:04.668Z → 2026-10-23T06:47:05.002Z

### service-provisioning — PASS

2026-10-23T06:47:05.930Z → 2026-10-23T06:47:22.824Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-22 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T06:47:05.932Z → 2026-10-23T06:47:22.823Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-23T06:47:16.475Z → 2026-10-23T06:47:21.926Z

### operator-provisioning — PASS

2026-10-23T06:47:22.831Z → 2026-10-23T06:47:39.126Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-23 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/operatorProvisioning.ts
```
Exit: 0; signal: none; 2026-10-23T06:47:22.837Z → 2026-10-23T06:47:39.126Z

- tests/compatibility/operatorProvisioning.ts: PASS; 2026-10-23T06:47:33.623Z → 2026-10-23T06:47:38.309Z

### provisioning-backup-recovery — PASS

2026-10-23T06:47:39.129Z → 2026-10-23T06:47:43.346Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792737748609-78c3055d-pg sam-verify-1792737748609-78c3055d
```
Exit: 0; signal: none; 2026-10-23T06:47:39.131Z → 2026-10-23T06:47:43.346Z


### render-migration-compatibility — PASS

2026-10-23T06:47:43.349Z → 2026-10-23T06:47:56.977Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-24 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-23T06:47:43.351Z → 2026-10-23T06:47:56.977Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-23T06:47:54.691Z → 2026-10-23T06:47:56.104Z

### render-google-oauth-contracts — PASS

2026-10-23T06:47:56.980Z → 2026-10-23T06:48:17.093Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-25 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-23T06:47:56.982Z → 2026-10-23T06:48:17.093Z


### integration-migrations — PASS

2026-10-23T06:48:17.102Z → 2026-10-23T06:48:31.722Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-26 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-23T06:48:17.104Z → 2026-10-23T06:48:31.722Z

- tests/integration/migrations.ts: PASS; 2026-10-23T06:48:29.464Z → 2026-10-23T06:48:30.882Z

### integration-oauth-mcp — PASS

2026-10-23T06:48:31.725Z → 2026-10-23T06:48:43.701Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-27 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-23T06:48:31.728Z → 2026-10-23T06:48:43.701Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-23T06:48:42.188Z → 2026-10-23T06:48:42.806Z

### integration-orchestration — PASS

2026-10-23T06:48:43.705Z → 2026-10-23T06:49:02.792Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-28 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T06:48:43.706Z → 2026-10-23T06:49:02.792Z

- tests/integration/orchestration.ts: PASS; 2026-10-23T06:48:54.483Z → 2026-10-23T06:49:01.959Z

### specialist-reasoning — PASS

2026-10-23T06:49:02.795Z → 2026-10-23T06:50:12.612Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-29 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-23T06:49:02.798Z → 2026-10-23T06:50:12.612Z

- tests/specialists/acceptance.ts: PASS; 2026-10-23T06:49:12.482Z → 2026-10-23T06:50:11.751Z

### specialist-gateway — PASS

2026-10-23T06:50:12.616Z → 2026-10-23T06:50:23.837Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-30 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-23T06:50:12.618Z → 2026-10-23T06:50:23.837Z

- tests/specialists/gateway.ts: PASS; 2026-10-23T06:50:22.489Z → 2026-10-23T06:50:23.024Z

### specialist-provenance — PASS

2026-10-23T06:50:23.839Z → 2026-10-23T06:50:35.573Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-31 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-23T06:50:23.842Z → 2026-10-23T06:50:35.573Z

- tests/specialists/provenance.ts: PASS; 2026-10-23T06:50:34.345Z → 2026-10-23T06:50:34.757Z

### specialist-learning-fairness — PASS

2026-10-23T06:50:35.576Z → 2026-10-23T06:50:47.018Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-32 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-23T06:50:35.579Z → 2026-10-23T06:50:47.017Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-23T06:50:45.156Z → 2026-10-23T06:50:46.242Z

### specialist-evaluation — PASS

2026-10-23T06:50:47.021Z → 2026-10-23T06:50:59.620Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-33 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-23T06:50:47.023Z → 2026-10-23T06:50:59.620Z


### evaluation-budget — PASS

2026-10-23T06:50:59.622Z → 2026-10-23T06:51:13.532Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-34 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 --mount type=bind,source=/tmp/sam-generic-full-v5/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-23T06:50:59.624Z → 2026-10-23T06:51:13.532Z

- tests/evaluation/budgets.ts: PASS; 2026-10-23T06:51:09.128Z → 2026-10-23T06:51:12.692Z

### evaluation-adapter — PASS

2026-10-23T06:51:13.536Z → 2026-10-23T06:51:24.239Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-35 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-23T06:51:13.540Z → 2026-10-23T06:51:24.238Z

- tests/evaluation/adapters.ts: PASS; 2026-10-23T06:51:22.948Z → 2026-10-23T06:51:23.468Z

### evaluation-orchestration — PASS

2026-10-23T06:51:24.242Z → 2026-10-23T06:51:58.096Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-36 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 --mount type=bind,source=/tmp/sam-generic-full-v5/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-23T06:51:24.244Z → 2026-10-23T06:51:58.096Z

- tests/evaluation/orchestration.ts: PASS; 2026-10-23T06:51:33.966Z → 2026-10-23T06:51:57.218Z

### evaluation-independent-review — PASS

2026-10-23T06:51:58.099Z → 2026-10-23T06:52:10.478Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-37 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-23T06:51:58.102Z → 2026-10-23T06:52:10.478Z

- tests/evaluation/review.ts: PASS; 2026-10-23T06:52:08.779Z → 2026-10-23T06:52:09.589Z

### evaluation-commercial-market — PASS

2026-10-23T06:52:10.481Z → 2026-10-23T06:52:44.762Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-38 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 --mount type=bind,source=/tmp/sam-generic-full-v5/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-23T06:52:10.484Z → 2026-10-23T06:52:44.762Z

- tests/evaluation/market.ts: PASS; 2026-10-23T06:52:19.986Z → 2026-10-23T06:52:43.850Z

### evaluation-commercial-profitability — PASS

2026-10-23T06:52:44.768Z → 2026-10-23T06:53:20.050Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-39 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 --mount type=bind,source=/tmp/sam-generic-full-v5/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-23T06:52:44.771Z → 2026-10-23T06:53:20.050Z

- tests/evaluation/profitability.ts: PASS; 2026-10-23T06:52:54.961Z → 2026-10-23T06:53:19.240Z

### evaluation-commercial-suppliers — PASS

2026-10-23T06:53:20.057Z → 2026-10-23T06:53:56.000Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-40 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 --mount type=bind,source=/tmp/sam-generic-full-v5/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-23T06:53:20.061Z → 2026-10-23T06:53:55.999Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-23T06:53:30.676Z → 2026-10-23T06:53:55.077Z

### migration-upgrade-rollback — PASS

2026-10-23T06:53:56.009Z → 2026-10-23T06:54:08.040Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-41 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-23T06:53:56.015Z → 2026-10-23T06:54:08.040Z


### specialist-restart-prepare — PASS

2026-10-23T06:54:08.047Z → 2026-10-23T06:54:20.426Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-42 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T06:54:08.052Z → 2026-10-23T06:54:20.426Z


### evaluation-restart-prepare — PASS

2026-10-23T06:54:20.433Z → 2026-10-23T06:54:32.400Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-43 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=9da55fc3d075a1776acf3162397c8b1f17e602b2 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-23T06:54:20.440Z → 2026-10-23T06:54:32.400Z


### postgres-restart — PASS

2026-10-23T06:54:32.407Z → 2026-10-23T06:54:32.821Z

```sh
docker restart --time 10 sam-verify-1792737748609-78c3055d-pg
```
Exit: 0; signal: none; 2026-10-23T06:54:32.412Z → 2026-10-23T06:54:32.713Z

```sh
docker exec --env PGPASSWORD=verification-fixture sam-verify-1792737748609-78c3055d-pg psql -h 127.0.0.1 -U postgres -d sam_core_test -Atqc 'SELECT 1'
```
Exit: 0; signal: none; 2026-10-23T06:54:32.713Z → 2026-10-23T06:54:32.821Z


### migration-after-restart — PASS

2026-10-23T06:54:32.830Z → 2026-10-23T06:54:44.031Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-44 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-23T06:54:32.837Z → 2026-10-23T06:54:44.031Z


### specialist-restart-check — PASS

2026-10-23T06:54:44.039Z → 2026-10-23T06:54:56.000Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-45 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T06:54:44.049Z → 2026-10-23T06:54:55.999Z


### evaluation-restart-check — PASS

2026-10-23T06:54:56.006Z → 2026-10-23T06:55:08.323Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-46 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-23T06:54:56.011Z → 2026-10-23T06:55:08.323Z


### phase0-migrations — PASS

2026-10-23T06:55:08.328Z → 2026-10-23T06:55:09.020Z

```sh
docker cp /tmp/sam-verify-VYZnlZ/source/packages/db/migrations sam-verify-1792737748609-78c3055d-pg:/migrations
```
Exit: 0; signal: none; 2026-10-23T06:55:08.340Z → 2026-10-23T06:55:08.356Z

```sh
docker exec sam-verify-1792737748609-78c3055d-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-23T06:55:08.356Z → 2026-10-23T06:55:08.933Z

```sh
docker exec sam-verify-1792737748609-78c3055d-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-23T06:55:08.933Z → 2026-10-23T06:55:09.020Z


### phase0-acceptance — PASS

2026-10-23T06:55:09.027Z → 2026-10-23T06:55:11.276Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-47 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-VYZnlZ/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-23T06:55:09.032Z → 2026-10-23T06:55:11.276Z


### phase0-postgres — PASS

2026-10-23T06:55:11.283Z → 2026-10-23T06:55:12.898Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-48 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-VYZnlZ/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-23T06:55:11.288Z → 2026-10-23T06:55:12.898Z


### tenant-isolation — PASS

2026-10-23T06:55:12.905Z → 2026-10-23T06:55:15.052Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-49 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-VYZnlZ/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-23T06:55:12.910Z → 2026-10-23T06:55:15.052Z


### fail-closed-security — PASS

2026-10-23T06:55:15.060Z → 2026-10-23T06:55:17.059Z

```sh
docker run --rm --name sam-verify-1792737748609-78c3055d-job-50 --label sam.verification.run=sam-verify-1792737748609-78c3055d --init --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-VYZnlZ/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-23T06:55:15.064Z → 2026-10-23T06:55:17.059Z


### clean-image — PASS

2026-10-23T06:55:17.069Z → 2026-10-23T06:55:25.051Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792737748609-78c3055d Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-23T06:55:17.080Z → 2026-10-23T06:55:25.051Z


### image-contract — PASS

2026-10-23T06:55:25.058Z → 2026-10-23T06:55:25.078Z

```sh
docker image inspect sam-verification:sam-verify-1792737748609-78c3055d
```
Exit: 0; signal: none; 2026-10-23T06:55:25.063Z → 2026-10-23T06:55:25.078Z


### application-startup-restart — PASS

2026-10-23T06:55:25.085Z → 2026-10-23T06:55:30.964Z

```sh
docker run --rm --init --name sam-verify-1792737748609-78c3055d-application --label sam.verification.run=sam-verify-1792737748609-78c3055d --network container:sam-verify-1792737748609-78c3055d-pg --mount type=bind,src=/tmp/sam-verify-VYZnlZ/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792737748609-78c3055d node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-23T06:55:25.090Z → 2026-10-23T06:55:30.964Z


### source-integrity — PASS

2026-10-23T06:55:30.971Z → 2026-10-23T06:55:30.989Z


### cleanup — PASS

2026-10-23T06:55:30.995Z → 2026-10-23T06:55:32.663Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-pg
```
Exit: 0; signal: none; 2026-10-23T06:55:31.001Z → 2026-10-23T06:55:31.016Z

```sh
docker rm --force --volumes sam-verify-1792737748609-78c3055d-pg
```
Exit: 0; signal: none; 2026-10-23T06:55:31.016Z → 2026-10-23T06:55:31.451Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-1
```
Exit: 1; signal: none; 2026-10-23T06:55:31.451Z → 2026-10-23T06:55:31.473Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-2
```
Exit: 1; signal: none; 2026-10-23T06:55:31.473Z → 2026-10-23T06:55:31.497Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-3
```
Exit: 1; signal: none; 2026-10-23T06:55:31.497Z → 2026-10-23T06:55:31.518Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-4
```
Exit: 1; signal: none; 2026-10-23T06:55:31.518Z → 2026-10-23T06:55:31.539Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-5
```
Exit: 1; signal: none; 2026-10-23T06:55:31.540Z → 2026-10-23T06:55:31.566Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-6
```
Exit: 1; signal: none; 2026-10-23T06:55:31.566Z → 2026-10-23T06:55:31.588Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-7
```
Exit: 1; signal: none; 2026-10-23T06:55:31.588Z → 2026-10-23T06:55:31.610Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-8
```
Exit: 1; signal: none; 2026-10-23T06:55:31.610Z → 2026-10-23T06:55:31.634Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-9
```
Exit: 1; signal: none; 2026-10-23T06:55:31.634Z → 2026-10-23T06:55:31.655Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-10
```
Exit: 1; signal: none; 2026-10-23T06:55:31.655Z → 2026-10-23T06:55:31.675Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-11
```
Exit: 1; signal: none; 2026-10-23T06:55:31.675Z → 2026-10-23T06:55:31.704Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-12
```
Exit: 1; signal: none; 2026-10-23T06:55:31.704Z → 2026-10-23T06:55:31.725Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-13
```
Exit: 1; signal: none; 2026-10-23T06:55:31.725Z → 2026-10-23T06:55:31.750Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-14
```
Exit: 1; signal: none; 2026-10-23T06:55:31.750Z → 2026-10-23T06:55:31.772Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-15
```
Exit: 1; signal: none; 2026-10-23T06:55:31.772Z → 2026-10-23T06:55:31.794Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-16
```
Exit: 1; signal: none; 2026-10-23T06:55:31.794Z → 2026-10-23T06:55:31.815Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-17
```
Exit: 1; signal: none; 2026-10-23T06:55:31.815Z → 2026-10-23T06:55:31.839Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-18
```
Exit: 1; signal: none; 2026-10-23T06:55:31.839Z → 2026-10-23T06:55:31.861Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-19
```
Exit: 1; signal: none; 2026-10-23T06:55:31.861Z → 2026-10-23T06:55:31.883Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-20
```
Exit: 1; signal: none; 2026-10-23T06:55:31.883Z → 2026-10-23T06:55:31.905Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-21
```
Exit: 1; signal: none; 2026-10-23T06:55:31.905Z → 2026-10-23T06:55:31.927Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-22
```
Exit: 1; signal: none; 2026-10-23T06:55:31.927Z → 2026-10-23T06:55:31.950Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-23
```
Exit: 1; signal: none; 2026-10-23T06:55:31.950Z → 2026-10-23T06:55:31.971Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-24
```
Exit: 1; signal: none; 2026-10-23T06:55:31.971Z → 2026-10-23T06:55:31.993Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-25
```
Exit: 1; signal: none; 2026-10-23T06:55:31.993Z → 2026-10-23T06:55:32.013Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-26
```
Exit: 1; signal: none; 2026-10-23T06:55:32.013Z → 2026-10-23T06:55:32.034Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-27
```
Exit: 1; signal: none; 2026-10-23T06:55:32.034Z → 2026-10-23T06:55:32.055Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-28
```
Exit: 1; signal: none; 2026-10-23T06:55:32.055Z → 2026-10-23T06:55:32.077Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-29
```
Exit: 1; signal: none; 2026-10-23T06:55:32.077Z → 2026-10-23T06:55:32.099Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-30
```
Exit: 1; signal: none; 2026-10-23T06:55:32.099Z → 2026-10-23T06:55:32.120Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-31
```
Exit: 1; signal: none; 2026-10-23T06:55:32.120Z → 2026-10-23T06:55:32.141Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-32
```
Exit: 1; signal: none; 2026-10-23T06:55:32.141Z → 2026-10-23T06:55:32.162Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-33
```
Exit: 1; signal: none; 2026-10-23T06:55:32.162Z → 2026-10-23T06:55:32.188Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-34
```
Exit: 1; signal: none; 2026-10-23T06:55:32.188Z → 2026-10-23T06:55:32.212Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-35
```
Exit: 1; signal: none; 2026-10-23T06:55:32.212Z → 2026-10-23T06:55:32.236Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-36
```
Exit: 1; signal: none; 2026-10-23T06:55:32.236Z → 2026-10-23T06:55:32.260Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-37
```
Exit: 1; signal: none; 2026-10-23T06:55:32.260Z → 2026-10-23T06:55:32.282Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-38
```
Exit: 1; signal: none; 2026-10-23T06:55:32.282Z → 2026-10-23T06:55:32.302Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-39
```
Exit: 1; signal: none; 2026-10-23T06:55:32.302Z → 2026-10-23T06:55:32.324Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-40
```
Exit: 1; signal: none; 2026-10-23T06:55:32.324Z → 2026-10-23T06:55:32.345Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-41
```
Exit: 1; signal: none; 2026-10-23T06:55:32.345Z → 2026-10-23T06:55:32.367Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-42
```
Exit: 1; signal: none; 2026-10-23T06:55:32.367Z → 2026-10-23T06:55:32.390Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-43
```
Exit: 1; signal: none; 2026-10-23T06:55:32.390Z → 2026-10-23T06:55:32.414Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-44
```
Exit: 1; signal: none; 2026-10-23T06:55:32.414Z → 2026-10-23T06:55:32.437Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-45
```
Exit: 1; signal: none; 2026-10-23T06:55:32.437Z → 2026-10-23T06:55:32.458Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-46
```
Exit: 1; signal: none; 2026-10-23T06:55:32.458Z → 2026-10-23T06:55:32.478Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-47
```
Exit: 1; signal: none; 2026-10-23T06:55:32.478Z → 2026-10-23T06:55:32.500Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-48
```
Exit: 1; signal: none; 2026-10-23T06:55:32.500Z → 2026-10-23T06:55:32.523Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-49
```
Exit: 1; signal: none; 2026-10-23T06:55:32.523Z → 2026-10-23T06:55:32.541Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-job-50
```
Exit: 1; signal: none; 2026-10-23T06:55:32.541Z → 2026-10-23T06:55:32.562Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-application
```
Exit: 1; signal: none; 2026-10-23T06:55:32.562Z → 2026-10-23T06:55:32.582Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792737748609-78c3055d-net
```
Exit: 0; signal: none; 2026-10-23T06:55:32.582Z → 2026-10-23T06:55:32.594Z

```sh
docker network rm sam-verify-1792737748609-78c3055d-net
```
Exit: 0; signal: none; 2026-10-23T06:55:32.594Z → 2026-10-23T06:55:32.640Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
