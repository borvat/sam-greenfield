# Reproduction commands and environment

Frozen application checkout: `cd5b76aa73dabdf9b64e6a63a4392657cdbb917a`, clean before full verification. No production environment file or remote DB URL is passed to full verification.

1. Copy that commit's `scripts/testing/verify-full.cjs` outside the checkout.
2. Apply only [readiness.patch](readiness.patch): relocate the checkout/pinned-image paths and replace socket pg_isready with authenticated TCP `SELECT 1`. This avoids accepting the temporary initialization server. No tests, assertions, migrations, budgets or application behavior are changed by the patch.
3. Execute:

```sh
node /tmp/sam-business-verify-full.cjs --output /tmp/sam-business-normalized-full
```

The report records all exact child commands, pinned images, Node version, timestamps and exit statuses. The full harness builds isolated local containers and has no skip option. GitHub Actions is billing-blocked; this is local external acceptance, not a hosted CI result.

Authenticate the copied full result against the application checkout:

```sh
python3 local/verify-package.py full /tmp/sam-business-evidence
NODE_PATH=/workspace/sam-greenfield/node_modules node \
  --import /workspace/sam-greenfield/node_modules/tsx/dist/loader.mjs \
  local/verify-traces.cjs /tmp/sam-business-evidence full/metadata \
  cd5b76aa73dabdf9b64e6a63a4392657cdbb917a
```

The supplemental local PostgreSQL checks use the repository's `core-reliability.cjs --suite tests/core/evidenceIntegration.ts` with SAM_CORE_TEST_DATABASE_URL restricted to the existing disposable localhost sam_core_test database. That harness creates and drops a separate schema, strips inherited provider environment, applies migrations and provisions only synthetic roles. Its logs identify the actual command and whether tests ran. Synthetic fixture passwords are not production credentials.

Earlier working-tree checks used host Node 24.19.0. The full acceptance version is recorded separately; do not conflate host targeted runs with the pinned Node 22 application checks.
