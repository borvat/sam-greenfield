# Independent SAM verification

Status: **PASS**
Source: `c50b50198b75ff4f3828519f2ac459b83bf3dd41` (clean: true)
Started: 2026-10-22T20:03:44.077Z; completed: 2026-10-22T20:19:13.439Z

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
| provisioning-backup-recovery | PASS | [log](logs/24-provisioning-backup-recovery.log) |
| render-migration-compatibility | PASS | [log](logs/25-render-migration-compatibility.log) |
| render-google-oauth-contracts | PASS | [log](logs/26-render-google-oauth-contracts.log) |
| integration-migrations | PASS | [log](logs/27-integration-migrations.log) |
| integration-oauth-mcp | PASS | [log](logs/28-integration-oauth-mcp.log) |
| integration-orchestration | PASS | [log](logs/29-integration-orchestration.log) |
| specialist-reasoning | PASS | [log](logs/30-specialist-reasoning.log) |
| specialist-gateway | PASS | [log](logs/31-specialist-gateway.log) |
| specialist-provenance | PASS | [log](logs/32-specialist-provenance.log) |
| specialist-learning-fairness | PASS | [log](logs/33-specialist-learning-fairness.log) |
| specialist-evaluation | PASS | [log](logs/34-specialist-evaluation.log) |
| evaluation-budget | PASS | [log](logs/35-evaluation-budget.log) |
| evaluation-adapter | PASS | [log](logs/36-evaluation-adapter.log) |
| evaluation-orchestration | PASS | [log](logs/37-evaluation-orchestration.log) |
| evaluation-independent-review | PASS | [log](logs/38-evaluation-independent-review.log) |
| evaluation-commercial-market | PASS | [log](logs/39-evaluation-commercial-market.log) |
| evaluation-commercial-profitability | PASS | [log](logs/40-evaluation-commercial-profitability.log) |
| evaluation-commercial-suppliers | PASS | [log](logs/41-evaluation-commercial-suppliers.log) |
| migration-upgrade-rollback | PASS | [log](logs/42-migration-upgrade-rollback.log) |
| specialist-restart-prepare | PASS | [log](logs/43-specialist-restart-prepare.log) |
| evaluation-restart-prepare | PASS | [log](logs/44-evaluation-restart-prepare.log) |
| postgres-restart | PASS | [log](logs/45-postgres-restart.log) |
| migration-after-restart | PASS | [log](logs/46-migration-after-restart.log) |
| specialist-restart-check | PASS | [log](logs/47-specialist-restart-check.log) |
| evaluation-restart-check | PASS | [log](logs/48-evaluation-restart-check.log) |
| phase0-migrations | PASS | [log](logs/49-phase0-migrations.log) |
| phase0-acceptance | PASS | [log](logs/50-phase0-acceptance.log) |
| phase0-postgres | PASS | [log](logs/51-phase0-postgres.log) |
| tenant-isolation | PASS | [log](logs/52-tenant-isolation.log) |
| fail-closed-security | PASS | [log](logs/53-fail-closed-security.log) |
| clean-image | PASS | [log](logs/54-clean-image.log) |
| image-contract | PASS | [log](logs/55-image-contract.log) |
| application-startup-restart | PASS | [log](logs/56-application-startup-restart.log) |
| source-integrity | PASS | [log](logs/57-source-integrity.log) |
| cleanup | PASS | [log](logs/58-cleanup.log) |

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
- clean-application: `sam-verification:sam-verify-1792699424076-a57f2303`; ID `sha256:db4f7e1d3e0ca5209ea87fa30c77f8ae2dda69705c57d929cff2d541244313cd`

## Commands and suite outcomes

### preflight — PASS

2026-10-22T20:03:44.078Z → 2026-10-22T20:03:44.422Z

```sh
git rev-parse HEAD
```
Exit: 0; signal: none; 2026-10-22T20:03:44.085Z → 2026-10-22T20:03:44.090Z

```sh
git rev-parse 'HEAD^{tree}'
```
Exit: 0; signal: none; 2026-10-22T20:03:44.090Z → 2026-10-22T20:03:44.093Z

```sh
git status --porcelain=v1 --untracked-files=normal
```
Exit: 0; signal: none; 2026-10-22T20:03:44.093Z → 2026-10-22T20:03:44.099Z

```sh
docker context inspect
```
Exit: 0; signal: none; 2026-10-22T20:03:44.099Z → 2026-10-22T20:03:44.114Z

```sh
docker version --format '{{json .}}'
```
Exit: 0; signal: none; 2026-10-22T20:03:44.114Z → 2026-10-22T20:03:44.135Z

```sh
docker compose version --short
```
Exit: 0; signal: none; 2026-10-22T20:03:44.135Z → 2026-10-22T20:03:44.241Z

```sh
docker buildx version
```
Exit: 0; signal: none; 2026-10-22T20:03:44.241Z → 2026-10-22T20:03:44.357Z

```sh
docker info --format '{{.OSType}}/{{.Architecture}}'
```
Exit: 0; signal: none; 2026-10-22T20:03:44.357Z → 2026-10-22T20:03:44.407Z

```sh
git --version
```
Exit: 0; signal: none; 2026-10-22T20:03:44.407Z → 2026-10-22T20:03:44.409Z

```sh
curl --version
```
Exit: 0; signal: none; 2026-10-22T20:03:44.409Z → 2026-10-22T20:03:44.420Z

```sh
tar --version
```
Exit: 0; signal: none; 2026-10-22T20:03:44.420Z → 2026-10-22T20:03:44.422Z


### snapshot — PASS

2026-10-22T20:03:44.424Z → 2026-10-22T20:03:44.493Z

```sh
git archive --format=tar --output /tmp/sam-verify-O7t5DV/source.tar c50b50198b75ff4f3828519f2ac459b83bf3dd41
```
Exit: 0; signal: none; 2026-10-22T20:03:44.426Z → 2026-10-22T20:03:44.456Z

```sh
tar -xf /tmp/sam-verify-O7t5DV/source.tar -C /tmp/sam-verify-O7t5DV/source
```
Exit: 0; signal: none; 2026-10-22T20:03:44.456Z → 2026-10-22T20:03:44.465Z


### images — PASS

2026-10-22T20:03:44.495Z → 2026-10-22T20:03:44.618Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-22T20:03:44.496Z → 2026-10-22T20:03:44.510Z

```sh
docker image inspect node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2
```
Exit: 0; signal: none; 2026-10-22T20:03:44.510Z → 2026-10-22T20:03:44.524Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-22T20:03:44.524Z → 2026-10-22T20:03:44.537Z

```sh
docker image inspect node:22-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc
```
Exit: 0; signal: none; 2026-10-22T20:03:44.537Z → 2026-10-22T20:03:44.551Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-22T20:03:44.551Z → 2026-10-22T20:03:44.564Z

```sh
docker image inspect pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-22T20:03:44.564Z → 2026-10-22T20:03:44.581Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-22T20:03:44.581Z → 2026-10-22T20:03:44.599Z

```sh
docker image inspect python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8
```
Exit: 0; signal: none; 2026-10-22T20:03:44.599Z → 2026-10-22T20:03:44.618Z


### isolated-postgres — PASS

2026-10-22T20:03:44.619Z → 2026-10-22T20:03:50.538Z

```sh
docker network create --internal --label sam.verification.run=sam-verify-1792699424076-a57f2303 sam-verify-1792699424076-a57f2303-net
```
Exit: 0; signal: none; 2026-10-22T20:03:44.620Z → 2026-10-22T20:03:44.655Z

```sh
docker run --detach --name sam-verify-1792699424076-a57f2303-pg --label sam.verification.run=sam-verify-1792699424076-a57f2303 --network sam-verify-1792699424076-a57f2303-net --env POSTGRES_DB=sam_core_test --env POSTGRES_PASSWORD=verification-fixture pgvector/pgvector:pg15@sha256:47af0b65960b14f1c6945aa4ccae37836c632e9a6fe0eea9160936e616e5b2e9
```
Exit: 0; signal: none; 2026-10-22T20:03:44.655Z → 2026-10-22T20:03:48.849Z

```sh
docker exec sam-verify-1792699424076-a57f2303-pg pg_isready -U postgres -d sam_core_test
```
Exit: 2; signal: none; 2026-10-22T20:03:48.849Z → 2026-10-22T20:03:48.939Z

```sh
docker exec sam-verify-1792699424076-a57f2303-pg pg_isready -U postgres -d sam_core_test
```
Exit: 2; signal: none; 2026-10-22T20:03:49.440Z → 2026-10-22T20:03:49.532Z

```sh
docker exec sam-verify-1792699424076-a57f2303-pg pg_isready -U postgres -d sam_core_test
```
Exit: 0; signal: none; 2026-10-22T20:03:50.033Z → 2026-10-22T20:03:50.124Z

```sh
docker exec sam-verify-1792699424076-a57f2303-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_lifecycle'
```
Exit: 0; signal: none; 2026-10-22T20:03:50.124Z → 2026-10-22T20:03:50.230Z

```sh
docker exec sam-verify-1792699424076-a57f2303-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_core_test_application'
```
Exit: 0; signal: none; 2026-10-22T20:03:50.230Z → 2026-10-22T20:03:50.425Z

```sh
docker exec sam-verify-1792699424076-a57f2303-pg psql -U postgres -d sam_core_test -v ON_ERROR_STOP=1 -c 'CREATE DATABASE sam_greenfield'
```
Exit: 0; signal: none; 2026-10-22T20:03:50.425Z → 2026-10-22T20:03:50.538Z


### node-dependencies — PASS

2026-10-22T20:03:50.545Z → 2026-10-22T20:04:07.445Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-1 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.3.13 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm ci --include=dev --cache /tmp/npm-cache --fetch-retries=1 --fetch-timeout=20000
```
Exit: 0; signal: none; 2026-10-22T20:03:50.547Z → 2026-10-22T20:04:07.445Z


### python-dependencies — PASS

2026-10-22T20:04:07.448Z → 2026-10-22T20:04:11.521Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-2 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env HTTP_PROXY --env HTTPS_PROXY --env NO_PROXY --env http_proxy --env https_proxy --env no_proxy --add-host proxy:172.31.3.13 --mount type=bind,src=/usr/local/share/ca-certificates/environment-proxy-ca.crt,dst=/tmp/verification-ca.pem,readonly --env NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem --env PIP_CERT=/tmp/verification-ca.pem --mount type=bind,src=/tmp/sam-verify-O7t5DV/python,dst=/fixtures python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python -m pip install --target /fixtures/site --cache-dir /tmp/pip-cache --retries 1 --timeout 20 --only-binary=:all: --require-hashes --requirement scripts/testing/requirements-verification.txt
```
Exit: 0; signal: none; 2026-10-22T20:04:07.454Z → 2026-10-22T20:04:11.521Z


### runtime-versions — PASS

2026-10-22T20:04:11.523Z → 2026-10-22T20:04:56.928Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-3 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --version
```
Exit: 0; signal: none; 2026-10-22T20:04:11.525Z → 2026-10-22T20:04:24.309Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-4 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm --version
```
Exit: 0; signal: none; 2026-10-22T20:04:24.310Z → 2026-10-22T20:04:38.022Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-5 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 openssl version
```
Exit: 0; signal: none; 2026-10-22T20:04:38.022Z → 2026-10-22T20:04:53.273Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-6 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python --version
```
Exit: 0; signal: none; 2026-10-22T20:04:53.273Z → 2026-10-22T20:04:56.817Z

```sh
docker exec sam-verify-1792699424076-a57f2303-pg psql -U postgres -d sam_core_test -Atc 'SELECT version()'
```
Exit: 0; signal: none; 2026-10-22T20:04:56.818Z → 2026-10-22T20:04:56.928Z


### workflow-tool — PASS

2026-10-22T20:04:56.931Z → 2026-10-22T20:04:57.347Z

```sh
curl --fail --location --silent --show-error --max-time 60 --output /tmp/sam-verify-O7t5DV/actionlint.tar.gz https://github.com/rhysd/actionlint/releases/download/v1.7.7/actionlint_1.7.7_linux_amd64.tar.gz
```
Exit: 0; signal: none; 2026-10-22T20:04:56.937Z → 2026-10-22T20:04:57.280Z

```sh
tar -xzf /tmp/sam-verify-O7t5DV/actionlint.tar.gz -C /tmp/sam-verify-O7t5DV actionlint
```
Exit: 0; signal: none; 2026-10-22T20:04:57.289Z → 2026-10-22T20:04:57.340Z

```sh
/tmp/sam-verify-O7t5DV/actionlint --version
```
Exit: 0; signal: none; 2026-10-22T20:04:57.340Z → 2026-10-22T20:04:57.347Z


### workflow-validation — PASS

2026-10-22T20:04:57.354Z → 2026-10-22T20:04:57.365Z

```sh
/tmp/sam-verify-O7t5DV/actionlint -no-color -shellcheck= -pyflakes= .github/workflows/phase0-postgres-verification.yml
```
Exit: 0; signal: none; 2026-10-22T20:04:57.359Z → 2026-10-22T20:04:57.365Z


### configuration-validation — PASS

2026-10-22T20:04:57.367Z → 2026-10-22T20:05:47.970Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node tests/testing/runner-contract.cjs
```
Exit: 0; signal: none; 2026-10-22T20:04:57.372Z → 2026-10-22T20:04:57.728Z

```sh
docker compose --file docker-compose.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-22T20:04:57.729Z → 2026-10-22T20:04:57.844Z

```sh
docker compose --file docker-compose.production.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-22T20:04:57.844Z → 2026-10-22T20:04:57.917Z

```sh
docker compose --file deploy/production/docker-compose.live.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-22T20:04:57.917Z → 2026-10-22T20:04:57.985Z

```sh
docker compose --file deploy/staging/docker-compose.integration.yml config --quiet --no-interpolate --no-env-resolution
```
Exit: 0; signal: none; 2026-10-22T20:04:57.985Z → 2026-10-22T20:04:58.058Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-7 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/build_configuration.cjs
```
Exit: 0; signal: none; 2026-10-22T20:04:58.058Z → 2026-10-22T20:05:15.196Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-8 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/release/preparation.cjs
```
Exit: 0; signal: none; 2026-10-22T20:05:15.196Z → 2026-10-22T20:05:31.898Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-9 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node packages/db/src/migrate.js --check-deterministic
```
Exit: 0; signal: none; 2026-10-22T20:05:31.898Z → 2026-10-22T20:05:47.970Z


### typecheck — PASS

2026-10-22T20:05:47.974Z → 2026-10-22T20:06:09.648Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-10 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run typecheck
```
Exit: 0; signal: none; 2026-10-22T20:05:47.978Z → 2026-10-22T20:06:09.647Z


### regression — PASS

2026-10-22T20:06:09.653Z → 2026-10-22T20:06:55.538Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-11 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-regression
```
Exit: 0; signal: none; 2026-10-22T20:06:09.658Z → 2026-10-22T20:06:55.535Z

- tests/phase1/final_acceptance.ts: PASS; 2026-10-22T20:06:24.963Z → 2026-10-22T20:06:25.505Z
- tests/phase1/full_vertical_slice.ts: PASS; 2026-10-22T20:06:25.527Z → 2026-10-22T20:06:25.946Z
- tests/phase1/kernel_smoke.ts: PASS; 2026-10-22T20:06:25.964Z → 2026-10-22T20:06:26.389Z
- tests/phase1/replan_recovery.ts: PASS; 2026-10-22T20:06:26.406Z → 2026-10-22T20:06:26.841Z
- tests/phase1/runtime_loop.ts: PASS; 2026-10-22T20:06:26.857Z → 2026-10-22T20:06:27.275Z
- tests/phase2/authority_guard.ts: PASS; 2026-10-22T20:06:27.292Z → 2026-10-22T20:06:27.673Z
- tests/phase2/brain_kernel_handoff.ts: PASS; 2026-10-22T20:06:27.693Z → 2026-10-22T20:06:28.215Z
- tests/phase2/brain_replanning.ts: PASS; 2026-10-22T20:06:28.231Z → 2026-10-22T20:06:28.864Z
- tests/phase2/final_acceptance.ts: PASS; 2026-10-22T20:06:28.881Z → 2026-10-22T20:06:29.681Z
- tests/phase2/gateway_resilience.ts: PASS; 2026-10-22T20:06:29.796Z → 2026-10-22T20:06:30.509Z
- tests/phase2/model_gateway.ts: PASS; 2026-10-22T20:06:30.526Z → 2026-10-22T20:06:30.943Z
- tests/phase3/capability_catalog.ts: PASS; 2026-10-22T20:06:30.963Z → 2026-10-22T20:06:31.277Z
- tests/phase3/final_acceptance.ts: PASS; 2026-10-22T20:06:31.293Z → 2026-10-22T20:06:31.792Z
- tests/phase3/specialist_delegation.ts: PASS; 2026-10-22T20:06:31.808Z → 2026-10-22T20:06:32.218Z
- tests/phase3/specialist_supervisor.ts: PASS; 2026-10-22T20:06:32.234Z → 2026-10-22T20:06:32.618Z
- tests/phase4/reconciliation.ts: PASS; 2026-10-22T20:06:32.652Z → 2026-10-22T20:06:33.139Z
- tests/phase4/tool_gateway.ts: PASS; 2026-10-22T20:06:33.155Z → 2026-10-22T20:06:33.628Z
- tests/phase5/final_acceptance.ts: PASS; 2026-10-22T20:06:33.649Z → 2026-10-22T20:06:34.116Z
- tests/phase5/verified_learning.ts: PASS; 2026-10-22T20:06:34.132Z → 2026-10-22T20:06:34.565Z
- tests/phase6/final_acceptance.ts: PASS; 2026-10-22T20:06:34.581Z → 2026-10-22T20:06:34.985Z
- tests/phase6/operational_supervision.ts: PASS; 2026-10-22T20:06:35.002Z → 2026-10-22T20:06:35.381Z
- tests/phase6/policy_evaluation.ts: PASS; 2026-10-22T20:06:35.399Z → 2026-10-22T20:06:35.719Z
- tests/phase7/production_readiness.ts: PASS; 2026-10-22T20:06:35.736Z → 2026-10-22T20:06:36.170Z
- tests/phase7/runtime_module_loading.ts: PASS; 2026-10-22T20:06:36.187Z → 2026-10-22T20:06:37.577Z
- tests/phase7/runtime_service.ts: PASS; 2026-10-22T20:06:37.596Z → 2026-10-22T20:06:38.149Z
- tests/phase8/chatgpt_tool_surface.ts: PASS; 2026-10-22T20:06:38.165Z → 2026-10-22T20:06:38.554Z
- tests/phase9/production_wiring.ts: PASS; 2026-10-22T20:06:38.570Z → 2026-10-22T20:06:39.159Z
- tests/phase10/mcp_transport.ts: PASS; 2026-10-22T20:06:39.176Z → 2026-10-22T20:06:40.009Z
- tests/phase11/model_adapters.ts: PASS; 2026-10-22T20:06:40.026Z → 2026-10-22T20:06:40.465Z
- tests/phase12/gmail_adapter.ts: PASS; 2026-10-22T20:06:40.481Z → 2026-10-22T20:06:41.191Z
- tests/phase12/gmail_read_trial.ts: PASS; 2026-10-22T20:06:41.250Z → 2026-10-22T20:06:42.503Z
- tests/phase13/drive_adapters.ts: PASS; 2026-10-22T20:06:42.563Z → 2026-10-22T20:06:43.141Z
- tests/phase14/eboekhouden_read.ts: PASS; 2026-10-22T20:06:43.158Z → 2026-10-22T20:06:43.623Z
- tests/phase15/bol_read.ts: PASS; 2026-10-22T20:06:43.641Z → 2026-10-22T20:06:44.074Z
- tests/phase16/bol_operational_intelligence.ts: PASS; 2026-10-22T20:06:44.091Z → 2026-10-22T20:06:44.595Z
- tests/phase17/bol_sam_surface.ts: PASS; 2026-10-22T20:06:44.612Z → 2026-10-22T20:06:45.241Z
- tests/phase17/finance_reconciliation.ts: PASS; 2026-10-22T20:06:45.257Z → 2026-10-22T20:06:45.733Z
- tests/phase18/operational_finance_loop.ts: PASS; 2026-10-22T20:06:45.751Z → 2026-10-22T20:06:46.254Z
- tests/phase19/command_center.ts: PASS; 2026-10-22T20:06:46.271Z → 2026-10-22T20:06:46.750Z
- tests/phase20/live_golden_chain_gate.ts: PASS; 2026-10-22T20:06:46.767Z → 2026-10-22T20:06:47.223Z
- tests/phase21/mcp_internal_oauth.ts: PASS; 2026-10-22T20:06:47.239Z → 2026-10-22T20:06:48.214Z
- tests/phase21/production_deployment.ts: PASS; 2026-10-22T20:06:48.232Z → 2026-10-22T20:06:48.572Z
- tests/phase22/acceptance_recovery.ts: PASS; 2026-10-22T20:06:48.592Z → 2026-10-22T20:06:49.804Z
- tests/phase22/bol_analysis.ts: PASS; 2026-10-22T20:06:49.821Z → 2026-10-22T20:06:50.286Z
- tests/phase22/bol_analysis_bridge.ts: PASS; 2026-10-22T20:06:50.303Z → 2026-10-22T20:06:50.885Z
- tests/phase22/planner_scope.ts: PASS; 2026-10-22T20:06:50.903Z → 2026-10-22T20:06:51.362Z
- tests/phase22/runtime_recovery.ts: PASS; 2026-10-22T20:06:51.380Z → 2026-10-22T20:06:52.155Z
- tests/phase22/submit_goal_planner.ts: PASS; 2026-10-22T20:06:52.172Z → 2026-10-22T20:06:53.436Z
- tests/phase22/submit_goal_surface.ts: PASS; 2026-10-22T20:06:53.468Z → 2026-10-22T20:06:54.610Z

### core-reliability — PASS

2026-10-22T20:06:55.546Z → 2026-10-22T20:07:22.947Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-12 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 npm run test:core-reliability
```
Exit: 0; signal: none; 2026-10-22T20:06:55.550Z → 2026-10-22T20:07:22.946Z

- tests/core/reliability.ts: PASS; 2026-10-22T20:07:10.068Z → 2026-10-22T20:07:15.848Z
- tests/core/planningConcurrency.ts: PASS; 2026-10-22T20:07:15.882Z → 2026-10-22T20:07:16.445Z
- tests/core/reservationRace.ts: PASS; 2026-10-22T20:07:16.465Z → 2026-10-22T20:07:16.921Z
- tests/core/tenantWorkload.ts: PASS; 2026-10-22T20:07:16.938Z → 2026-10-22T20:07:17.461Z
- tests/core/eventBacklog.ts: PASS; 2026-10-22T20:07:17.479Z → 2026-10-22T20:07:19.121Z
- tests/core/learningScheduling.ts: PASS; 2026-10-22T20:07:19.141Z → 2026-10-22T20:07:19.610Z
- tests/core/startupAdmission.ts: PASS; 2026-10-22T20:07:19.627Z → 2026-10-22T20:07:21.489Z
- tests/core/planningDeadline.ts: PASS; 2026-10-22T20:07:21.514Z → 2026-10-22T20:07:22.116Z

### provider-auth — PASS

2026-10-22T20:07:22.951Z → 2026-10-22T20:07:37.310Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-13 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/provider_auth.ts
```
Exit: 0; signal: none; 2026-10-22T20:07:22.956Z → 2026-10-22T20:07:37.309Z

- tests/release/provider_auth.ts: PASS; 2026-10-22T20:07:36.229Z → 2026-10-22T20:07:36.647Z

### postgres-tls — PASS

2026-10-22T20:07:37.313Z → 2026-10-22T20:07:50.844Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-14 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/postgres_tls.ts
```
Exit: 0; signal: none; 2026-10-22T20:07:37.318Z → 2026-10-22T20:07:50.842Z

- tests/release/postgres_tls.ts: PASS; 2026-10-22T20:07:49.419Z → 2026-10-22T20:07:50.021Z

### contracts — PASS

2026-10-22T20:07:50.852Z → 2026-10-22T20:08:06.498Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-15 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/contracts.ts
```
Exit: 0; signal: none; 2026-10-22T20:07:50.859Z → 2026-10-22T20:08:06.498Z

- tests/release/contracts.ts: PASS; 2026-10-22T20:08:05.152Z → 2026-10-22T20:08:05.809Z

### synthetic-pilot — PASS

2026-10-22T20:08:06.502Z → 2026-10-22T20:08:19.844Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-16 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/synthetic_pilot.ts
```
Exit: 0; signal: none; 2026-10-22T20:08:06.505Z → 2026-10-22T20:08:19.844Z

- tests/release/synthetic_pilot.ts: PASS; 2026-10-22T20:08:18.420Z → 2026-10-22T20:08:19.169Z

### managed-schema — PASS

2026-10-22T20:08:19.847Z → 2026-10-22T20:08:34.146Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-17 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/managed_schema_source.cjs
```
Exit: 0; signal: none; 2026-10-22T20:08:19.851Z → 2026-10-22T20:08:34.145Z

- tests/release/managed_schema_source.cjs: PASS; 2026-10-22T20:08:33.204Z → 2026-10-22T20:08:33.448Z

### local-bundle — PASS

2026-10-22T20:08:34.151Z → 2026-10-22T20:08:49.001Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-18 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/local_bundle.ts
```
Exit: 0; signal: none; 2026-10-22T20:08:34.154Z → 2026-10-22T20:08:49.001Z

- tests/release/local_bundle.ts: PASS; 2026-10-22T20:08:47.931Z → 2026-10-22T20:08:48.287Z

### closed-setup — PASS

2026-10-22T20:08:49.004Z → 2026-10-22T20:09:04.119Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-19 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/setup.ts
```
Exit: 0; signal: none; 2026-10-22T20:08:49.006Z → 2026-10-22T20:09:04.118Z

- tests/release/setup.ts: PASS; 2026-10-22T20:09:02.863Z → 2026-10-22T20:09:03.435Z

### database-contract — PASS

2026-10-22T20:09:04.123Z → 2026-10-22T20:09:19.696Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-20 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/database_check.ts
```
Exit: 0; signal: none; 2026-10-22T20:09:04.128Z → 2026-10-22T20:09:19.695Z

- tests/release/database_check.ts: PASS; 2026-10-22T20:09:18.553Z → 2026-10-22T20:09:18.919Z

### prelaunch-gate — PASS

2026-10-22T20:09:19.707Z → 2026-10-22T20:09:35.537Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-21 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/release/prelaunch.ts
```
Exit: 0; signal: none; 2026-10-22T20:09:19.713Z → 2026-10-22T20:09:35.537Z

- tests/release/prelaunch.ts: PASS; 2026-10-22T20:09:34.481Z → 2026-10-22T20:09:34.824Z

### service-provisioning — PASS

2026-10-22T20:09:35.542Z → 2026-10-22T20:09:53.664Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-22 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/serviceProvisioning.ts
```
Exit: 0; signal: none; 2026-10-22T20:09:35.546Z → 2026-10-22T20:09:53.663Z

- tests/compatibility/serviceProvisioning.ts: PASS; 2026-10-22T20:09:49.327Z → 2026-10-22T20:09:52.417Z

### provisioning-backup-recovery — PASS

2026-10-22T20:09:53.669Z → 2026-10-22T20:09:58.172Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/testing/provisioning-backup.cjs sam-verify-1792699424076-a57f2303-pg sam-verify-1792699424076-a57f2303
```
Exit: 0; signal: none; 2026-10-22T20:09:53.673Z → 2026-10-22T20:09:58.172Z


### render-migration-compatibility — PASS

2026-10-22T20:09:58.176Z → 2026-10-22T20:10:15.325Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-23 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/compatibility/renderMigrations.ts
```
Exit: 0; signal: none; 2026-10-22T20:09:58.179Z → 2026-10-22T20:10:15.324Z

- tests/compatibility/renderMigrations.ts: PASS; 2026-10-22T20:10:13.357Z → 2026-10-22T20:10:14.592Z

### render-google-oauth-contracts — PASS

2026-10-22T20:10:15.332Z → 2026-10-22T20:10:34.545Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-24 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env NODE_ENV=test --env DATABASE_URL=postgres://fixture:fixture@127.0.0.1:9/sam_core_test node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx --test tests/isolated/sam_google_bundle.ts tests/isolated/sam_google_evidence.ts tests/isolated/sam_google_http.ts tests/isolated/sam_google_mcp_bridge.ts tests/isolated/sam_google_oauth_flow.ts tests/isolated/sam_google_oauth_pkce.ts tests/isolated/sam_google_oauth_state.ts tests/isolated/sam_google_postgres.ts tests/isolated/sam_google_recovery.ts tests/isolated/sam_google_review.ts tests/isolated/sam_google_token_crypto.ts tests/isolated/sam_google_verifier_claim.ts tests/phase21/mcp_internal_oauth.ts tests/phase22/submit_goal_surface.ts
```
Exit: 0; signal: none; 2026-10-22T20:10:15.335Z → 2026-10-22T20:10:34.545Z


### integration-migrations — PASS

2026-10-22T20:10:34.551Z → 2026-10-22T20:10:49.174Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-25 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/migrations.ts
```
Exit: 0; signal: none; 2026-10-22T20:10:34.556Z → 2026-10-22T20:10:49.173Z

- tests/integration/migrations.ts: PASS; 2026-10-22T20:10:47.211Z → 2026-10-22T20:10:48.418Z

### integration-oauth-mcp — PASS

2026-10-22T20:10:49.178Z → 2026-10-22T20:11:04.885Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-26 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/oauth-mcp.ts
```
Exit: 0; signal: none; 2026-10-22T20:10:49.182Z → 2026-10-22T20:11:04.885Z

- tests/integration/oauth-mcp.ts: PASS; 2026-10-22T20:11:03.597Z → 2026-10-22T20:11:04.127Z

### integration-orchestration — PASS

2026-10-22T20:11:04.891Z → 2026-10-22T20:11:26.061Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-27 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/integration/orchestration.ts
```
Exit: 0; signal: none; 2026-10-22T20:11:04.895Z → 2026-10-22T20:11:26.061Z

- tests/integration/orchestration.ts: PASS; 2026-10-22T20:11:18.415Z → 2026-10-22T20:11:25.325Z

### specialist-reasoning — PASS

2026-10-22T20:11:26.065Z → 2026-10-22T20:12:29.754Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-28 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/acceptance.ts
```
Exit: 0; signal: none; 2026-10-22T20:11:26.068Z → 2026-10-22T20:12:29.751Z

- tests/specialists/acceptance.ts: PASS; 2026-10-22T20:11:39.435Z → 2026-10-22T20:12:28.877Z

### specialist-gateway — PASS

2026-10-22T20:12:29.761Z → 2026-10-22T20:12:44.408Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-29 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/gateway.ts
```
Exit: 0; signal: none; 2026-10-22T20:12:29.767Z → 2026-10-22T20:12:44.408Z

- tests/specialists/gateway.ts: PASS; 2026-10-22T20:12:43.217Z → 2026-10-22T20:12:43.708Z

### specialist-provenance — PASS

2026-10-22T20:12:44.412Z → 2026-10-22T20:12:58.717Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-30 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/provenance.ts
```
Exit: 0; signal: none; 2026-10-22T20:12:44.416Z → 2026-10-22T20:12:58.717Z

- tests/specialists/provenance.ts: PASS; 2026-10-22T20:12:57.508Z → 2026-10-22T20:12:57.970Z

### specialist-learning-fairness — PASS

2026-10-22T20:12:58.722Z → 2026-10-22T20:13:17.970Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-31 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/specialists/learningFairness.ts
```
Exit: 0; signal: none; 2026-10-22T20:12:58.728Z → 2026-10-22T20:13:17.969Z

- tests/specialists/learningFairness.ts: PASS; 2026-10-22T20:13:16.050Z → 2026-10-22T20:13:17.198Z

### specialist-evaluation — PASS

2026-10-22T20:13:17.979Z → 2026-10-22T20:13:36.690Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-32 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/evaluation.ts
```
Exit: 0; signal: none; 2026-10-22T20:13:17.984Z → 2026-10-22T20:13:36.690Z


### evaluation-budget — PASS

2026-10-22T20:13:36.696Z → 2026-10-22T20:13:58.459Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-33 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 --mount type=bind,source=/workspace/sam-production-provisioning-acceptance/full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/budgets.ts
```
Exit: 0; signal: none; 2026-10-22T20:13:36.701Z → 2026-10-22T20:13:58.457Z

- tests/evaluation/budgets.ts: PASS; 2026-10-22T20:13:53.133Z → 2026-10-22T20:13:57.503Z

### evaluation-adapter — PASS

2026-10-22T20:13:58.468Z → 2026-10-22T20:14:15.140Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-34 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/adapters.ts
```
Exit: 0; signal: none; 2026-10-22T20:13:58.474Z → 2026-10-22T20:14:15.140Z

- tests/evaluation/adapters.ts: PASS; 2026-10-22T20:14:13.418Z → 2026-10-22T20:14:14.341Z

### evaluation-orchestration — PASS

2026-10-22T20:14:15.147Z → 2026-10-22T20:14:53.242Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-35 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 --mount type=bind,source=/workspace/sam-production-provisioning-acceptance/full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/orchestration.ts
```
Exit: 0; signal: none; 2026-10-22T20:14:15.151Z → 2026-10-22T20:14:53.241Z

- tests/evaluation/orchestration.ts: PASS; 2026-10-22T20:14:31.429Z → 2026-10-22T20:14:52.205Z

### evaluation-independent-review — PASS

2026-10-22T20:14:53.250Z → 2026-10-22T20:15:10.266Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-36 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/review.ts
```
Exit: 0; signal: none; 2026-10-22T20:14:53.257Z → 2026-10-22T20:15:10.265Z

- tests/evaluation/review.ts: PASS; 2026-10-22T20:15:08.268Z → 2026-10-22T20:15:09.442Z

### evaluation-commercial-market — PASS

2026-10-22T20:15:10.270Z → 2026-10-22T20:15:47.645Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-37 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 --mount type=bind,source=/workspace/sam-production-provisioning-acceptance/full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/market.ts
```
Exit: 0; signal: none; 2026-10-22T20:15:10.274Z → 2026-10-22T20:15:47.643Z

- tests/evaluation/market.ts: PASS; 2026-10-22T20:15:24.987Z → 2026-10-22T20:15:46.884Z

### evaluation-commercial-profitability — PASS

2026-10-22T20:15:47.655Z → 2026-10-22T20:16:24.814Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-38 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 --mount type=bind,source=/workspace/sam-production-provisioning-acceptance/full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/profitability.ts
```
Exit: 0; signal: none; 2026-10-22T20:15:47.661Z → 2026-10-22T20:16:24.813Z

- tests/evaluation/profitability.ts: PASS; 2026-10-22T20:16:01.093Z → 2026-10-22T20:16:23.929Z

### evaluation-commercial-suppliers — PASS

2026-10-22T20:16:24.824Z → 2026-10-22T20:17:03.792Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-39 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 --mount type=bind,source=/workspace/sam-production-provisioning-acceptance/full/metadata,target=/evidence --env SAM_EVALUATION_ARTIFACT_DIR=/evidence node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node scripts/testing/core-reliability.cjs --suite tests/evaluation/suppliers.ts
```
Exit: 0; signal: none; 2026-10-22T20:16:24.835Z → 2026-10-22T20:17:03.791Z

- tests/evaluation/suppliers.ts: PASS; 2026-10-22T20:16:40.154Z → 2026-10-22T20:17:02.905Z

### migration-upgrade-rollback — PASS

2026-10-22T20:17:03.807Z → 2026-10-22T20:17:22.306Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-40 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs prepare
```
Exit: 0; signal: none; 2026-10-22T20:17:03.815Z → 2026-10-22T20:17:22.306Z


### specialist-restart-prepare — PASS

2026-10-22T20:17:22.322Z → 2026-10-22T20:17:40.356Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-41 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-22T20:17:22.329Z → 2026-10-22T20:17:40.356Z


### evaluation-restart-prepare — PASS

2026-10-22T20:17:40.369Z → 2026-10-22T20:17:57.169Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-42 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle --env SAM_VERIFICATION_SOURCE_SHA=c50b50198b75ff4f3828519f2ac459b83bf3dd41 node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts prepare
```
Exit: 0; signal: none; 2026-10-22T20:17:40.381Z → 2026-10-22T20:17:57.169Z


### postgres-restart — PASS

2026-10-22T20:17:57.186Z → 2026-10-22T20:17:57.922Z

```sh
docker restart --time 10 sam-verify-1792699424076-a57f2303-pg
```
Exit: 0; signal: none; 2026-10-22T20:17:57.192Z → 2026-10-22T20:17:57.799Z

```sh
docker exec sam-verify-1792699424076-a57f2303-pg pg_isready -U postgres -d sam_core_test
```
Exit: 0; signal: none; 2026-10-22T20:17:57.799Z → 2026-10-22T20:17:57.922Z


### migration-after-restart — PASS

2026-10-22T20:17:57.930Z → 2026-10-22T20:18:15.718Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-43 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node tests/testing/database-lifecycle.cjs after-restart
```
Exit: 0; signal: none; 2026-10-22T20:17:57.945Z → 2026-10-22T20:18:15.718Z


### specialist-restart-check — PASS

2026-10-22T20:18:15.731Z → 2026-10-22T20:18:31.144Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-44 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/specialists/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-22T20:18:15.743Z → 2026-10-22T20:18:31.144Z


### evaluation-restart-check — PASS

2026-10-22T20:18:31.151Z → 2026-10-22T20:18:45.269Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-45 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle node:22-bookworm@sha256:82693da96a4e38b8c0e2bf0c5df58fcb86d2d25e5a235c07748f09bfa38567c2 node --import tsx tests/evaluation/restart.ts after-restart
```
Exit: 0; signal: none; 2026-10-22T20:18:31.156Z → 2026-10-22T20:18:45.269Z


### phase0-migrations — PASS

2026-10-22T20:18:45.275Z → 2026-10-22T20:18:45.951Z

```sh
docker cp /tmp/sam-verify-O7t5DV/source/packages/db/migrations sam-verify-1792699424076-a57f2303-pg:/migrations
```
Exit: 0; signal: none; 2026-10-22T20:18:45.284Z → 2026-10-22T20:18:45.302Z

```sh
docker exec sam-verify-1792699424076-a57f2303-pg sh -ec 'psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c '\''CREATE EXTENSION IF NOT EXISTS vector;'\''; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done'
```
Exit: 0; signal: none; 2026-10-22T20:18:45.302Z → 2026-10-22T20:18:45.867Z

```sh
docker exec sam-verify-1792699424076-a57f2303-pg psql -U postgres -d sam_greenfield -Atc 'SELECT extname,extversion FROM pg_extension ORDER BY extname'
```
Exit: 0; signal: none; 2026-10-22T20:18:45.867Z → 2026-10-22T20:18:45.951Z


### phase0-acceptance — PASS

2026-10-22T20:18:45.958Z → 2026-10-22T20:18:48.614Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-46 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-O7t5DV/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0/phase0_acceptance.py
```
Exit: 0; signal: none; 2026-10-22T20:18:45.964Z → 2026-10-22T20:18:48.614Z


### phase0-postgres — PASS

2026-10-22T20:18:48.622Z → 2026-10-22T20:18:49.853Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-47 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-O7t5DV/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/real_postgres_test.py
```
Exit: 0; signal: none; 2026-10-22T20:18:48.630Z → 2026-10-22T20:18:49.853Z


### tenant-isolation — PASS

2026-10-22T20:18:49.859Z → 2026-10-22T20:18:51.933Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-48 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-O7t5DV/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_tenant_isolation.py
```
Exit: 0; signal: none; 2026-10-22T20:18:49.865Z → 2026-10-22T20:18:51.933Z


### fail-closed-security — PASS

2026-10-22T20:18:51.941Z → 2026-10-22T20:18:54.164Z

```sh
docker run --rm --name sam-verify-1792699424076-a57f2303-job-49 --label sam.verification.run=sam-verify-1792699424076-a57f2303 --init --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source,dst=/app --workdir /app --user 1000:1000 --env HOME=/tmp --mount type=bind,src=/tmp/sam-verify-O7t5DV/python,dst=/fixtures,readonly --env PYTHONPATH=/fixtures/site --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield --env DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield python:3.11-slim@sha256:cce12316475d7d56d605f76e1d811d0dc4e7227f2d4afd29951521264f504ff8 python tests/phase0_postgres/test_rls_fail_closed_security.py
```
Exit: 0; signal: none; 2026-10-22T20:18:51.947Z → 2026-10-22T20:18:54.164Z


### clean-image — PASS

2026-10-22T20:18:54.172Z → 2026-10-22T20:19:05.138Z

```sh
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/development/build-image.cjs sam-verification:sam-verify-1792699424076-a57f2303 Dockerfile.verification
```
Exit: 0; signal: none; 2026-10-22T20:18:54.181Z → 2026-10-22T20:19:05.138Z


### image-contract — PASS

2026-10-22T20:19:05.145Z → 2026-10-22T20:19:05.166Z

```sh
docker image inspect sam-verification:sam-verify-1792699424076-a57f2303
```
Exit: 0; signal: none; 2026-10-22T20:19:05.151Z → 2026-10-22T20:19:05.165Z


### application-startup-restart — PASS

2026-10-22T20:19:05.172Z → 2026-10-22T20:19:11.704Z

```sh
docker run --rm --init --name sam-verify-1792699424076-a57f2303-application --label sam.verification.run=sam-verify-1792699424076-a57f2303 --network container:sam-verify-1792699424076-a57f2303-pg --mount type=bind,src=/tmp/sam-verify-O7t5DV/source/tests,dst=/app/tests,readonly --workdir /app --env DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application sam-verification:sam-verify-1792699424076-a57f2303 node tests/testing/application-restart.cjs
```
Exit: 0; signal: none; 2026-10-22T20:19:05.177Z → 2026-10-22T20:19:11.704Z


### source-integrity — PASS

2026-10-22T20:19:11.711Z → 2026-10-22T20:19:11.741Z


### cleanup — PASS

2026-10-22T20:19:11.746Z → 2026-10-22T20:19:13.430Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-pg
```
Exit: 0; signal: none; 2026-10-22T20:19:11.752Z → 2026-10-22T20:19:11.767Z

```sh
docker rm --force --volumes sam-verify-1792699424076-a57f2303-pg
```
Exit: 0; signal: none; 2026-10-22T20:19:11.767Z → 2026-10-22T20:19:12.248Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-1
```
Exit: 1; signal: none; 2026-10-22T20:19:12.248Z → 2026-10-22T20:19:12.274Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-2
```
Exit: 1; signal: none; 2026-10-22T20:19:12.274Z → 2026-10-22T20:19:12.306Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-3
```
Exit: 1; signal: none; 2026-10-22T20:19:12.306Z → 2026-10-22T20:19:12.330Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-4
```
Exit: 1; signal: none; 2026-10-22T20:19:12.330Z → 2026-10-22T20:19:12.352Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-5
```
Exit: 1; signal: none; 2026-10-22T20:19:12.352Z → 2026-10-22T20:19:12.375Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-6
```
Exit: 1; signal: none; 2026-10-22T20:19:12.375Z → 2026-10-22T20:19:12.400Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-7
```
Exit: 1; signal: none; 2026-10-22T20:19:12.400Z → 2026-10-22T20:19:12.428Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-8
```
Exit: 1; signal: none; 2026-10-22T20:19:12.428Z → 2026-10-22T20:19:12.456Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-9
```
Exit: 1; signal: none; 2026-10-22T20:19:12.456Z → 2026-10-22T20:19:12.477Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-10
```
Exit: 1; signal: none; 2026-10-22T20:19:12.477Z → 2026-10-22T20:19:12.504Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-11
```
Exit: 1; signal: none; 2026-10-22T20:19:12.504Z → 2026-10-22T20:19:12.526Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-12
```
Exit: 1; signal: none; 2026-10-22T20:19:12.526Z → 2026-10-22T20:19:12.546Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-13
```
Exit: 1; signal: none; 2026-10-22T20:19:12.546Z → 2026-10-22T20:19:12.566Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-14
```
Exit: 1; signal: none; 2026-10-22T20:19:12.566Z → 2026-10-22T20:19:12.587Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-15
```
Exit: 1; signal: none; 2026-10-22T20:19:12.587Z → 2026-10-22T20:19:12.605Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-16
```
Exit: 1; signal: none; 2026-10-22T20:19:12.605Z → 2026-10-22T20:19:12.625Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-17
```
Exit: 1; signal: none; 2026-10-22T20:19:12.625Z → 2026-10-22T20:19:12.646Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-18
```
Exit: 1; signal: none; 2026-10-22T20:19:12.646Z → 2026-10-22T20:19:12.669Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-19
```
Exit: 1; signal: none; 2026-10-22T20:19:12.669Z → 2026-10-22T20:19:12.689Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-20
```
Exit: 1; signal: none; 2026-10-22T20:19:12.689Z → 2026-10-22T20:19:12.710Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-21
```
Exit: 1; signal: none; 2026-10-22T20:19:12.710Z → 2026-10-22T20:19:12.732Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-22
```
Exit: 1; signal: none; 2026-10-22T20:19:12.732Z → 2026-10-22T20:19:12.752Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-23
```
Exit: 1; signal: none; 2026-10-22T20:19:12.752Z → 2026-10-22T20:19:12.773Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-24
```
Exit: 1; signal: none; 2026-10-22T20:19:12.773Z → 2026-10-22T20:19:12.794Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-25
```
Exit: 1; signal: none; 2026-10-22T20:19:12.794Z → 2026-10-22T20:19:12.816Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-26
```
Exit: 1; signal: none; 2026-10-22T20:19:12.816Z → 2026-10-22T20:19:12.837Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-27
```
Exit: 1; signal: none; 2026-10-22T20:19:12.837Z → 2026-10-22T20:19:12.858Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-28
```
Exit: 1; signal: none; 2026-10-22T20:19:12.858Z → 2026-10-22T20:19:12.877Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-29
```
Exit: 1; signal: none; 2026-10-22T20:19:12.877Z → 2026-10-22T20:19:12.898Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-30
```
Exit: 1; signal: none; 2026-10-22T20:19:12.898Z → 2026-10-22T20:19:12.918Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-31
```
Exit: 1; signal: none; 2026-10-22T20:19:12.918Z → 2026-10-22T20:19:12.939Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-32
```
Exit: 1; signal: none; 2026-10-22T20:19:12.939Z → 2026-10-22T20:19:12.959Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-33
```
Exit: 1; signal: none; 2026-10-22T20:19:12.959Z → 2026-10-22T20:19:12.980Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-34
```
Exit: 1; signal: none; 2026-10-22T20:19:12.980Z → 2026-10-22T20:19:12.999Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-35
```
Exit: 1; signal: none; 2026-10-22T20:19:12.999Z → 2026-10-22T20:19:13.019Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-36
```
Exit: 1; signal: none; 2026-10-22T20:19:13.019Z → 2026-10-22T20:19:13.039Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-37
```
Exit: 1; signal: none; 2026-10-22T20:19:13.039Z → 2026-10-22T20:19:13.067Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-38
```
Exit: 1; signal: none; 2026-10-22T20:19:13.067Z → 2026-10-22T20:19:13.087Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-39
```
Exit: 1; signal: none; 2026-10-22T20:19:13.087Z → 2026-10-22T20:19:13.109Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-40
```
Exit: 1; signal: none; 2026-10-22T20:19:13.109Z → 2026-10-22T20:19:13.134Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-41
```
Exit: 1; signal: none; 2026-10-22T20:19:13.134Z → 2026-10-22T20:19:13.154Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-42
```
Exit: 1; signal: none; 2026-10-22T20:19:13.154Z → 2026-10-22T20:19:13.175Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-43
```
Exit: 1; signal: none; 2026-10-22T20:19:13.175Z → 2026-10-22T20:19:13.196Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-44
```
Exit: 1; signal: none; 2026-10-22T20:19:13.196Z → 2026-10-22T20:19:13.215Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-45
```
Exit: 1; signal: none; 2026-10-22T20:19:13.216Z → 2026-10-22T20:19:13.236Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-46
```
Exit: 1; signal: none; 2026-10-22T20:19:13.236Z → 2026-10-22T20:19:13.256Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-47
```
Exit: 1; signal: none; 2026-10-22T20:19:13.256Z → 2026-10-22T20:19:13.276Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-48
```
Exit: 1; signal: none; 2026-10-22T20:19:13.276Z → 2026-10-22T20:19:13.297Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-job-49
```
Exit: 1; signal: none; 2026-10-22T20:19:13.297Z → 2026-10-22T20:19:13.316Z

```sh
docker inspect --format '{{index .Config.Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-application
```
Exit: 1; signal: none; 2026-10-22T20:19:13.316Z → 2026-10-22T20:19:13.336Z

```sh
docker network inspect --format '{{index .Labels "sam.verification.run"}}' sam-verify-1792699424076-a57f2303-net
```
Exit: 0; signal: none; 2026-10-22T20:19:13.336Z → 2026-10-22T20:19:13.349Z

```sh
docker network rm sam-verify-1792699424076-a57f2303-net
```
Exit: 0; signal: none; 2026-10-22T20:19:13.349Z → 2026-10-22T20:19:13.400Z


Exact structured commands, suite results and evidence hashes: [report.json](report.json).
No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.
