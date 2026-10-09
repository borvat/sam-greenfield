const fs = require("node:fs");
const path = require("node:path");
const { Client } = require("pg");

const root = path.resolve(__dirname, "../..");
const configPath = path.join(root, ".local/sam-dev/config.json");
const targetPath = path.join(root, ".local/sam-dev/target.json");
const schema = "sam_replit_dev";

function developmentEnvironment(targetSchema = schema) {
  if (process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1" ||
      !process.env.REPLIT_DEV_DOMAIN) {
    throw new Error("Development commands require the editor workspace, not a deployment.");
  }
  if (!/^sam_replit_(dev|goal_cycle|drive_read|test_cycle|test_drive_read|test_[0-9]+)$/.test(targetSchema)) {
    throw new Error("Invalid isolated development schema.");
  }
  if (!process.env.DATABASE_URL) throw new Error("The development DATABASE_URL is missing.");

  // Deliberately do not inherit model, OAuth, financial or production bundle settings.
  const env = {};
  for (const key of ["PATH", "HOME", "TMPDIR", "LANG", "TZ", "NODE_EXTRA_CA_CERTS"]) {
    if (process.env[key]) env[key] = process.env[key];
  }
  env.NODE_ENV = "development";
  env.PGOPTIONS = `-c search_path=${targetSchema},pg_catalog`;
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set("options", env.PGOPTIONS);
  env.DATABASE_URL = url.toString();
  env.SAM_DEVELOPMENT_SAFE_MODE = "1";
  return env;
}

function databaseClient(env) {
  // Explicit options also override any search_path supplied in a connection URL.
  return new Client({ connectionString: env.DATABASE_URL, options: env.PGOPTIONS });
}

function readConfig() {
  if (!fs.existsSync(configPath)) throw new Error("Run npm run dev:setup first.");
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function readTarget() {
  if (!fs.existsSync(targetPath)) {
    throw new Error("Missing inspected development database identity; inspect and pin it before setup.");
  }
  return JSON.parse(fs.readFileSync(targetPath, "utf8"));
}

async function assertDevelopmentIdentity(client, target = readTarget()) {
  const result = await client.query(`SELECT current_database() AS database,
    system_identifier::text AS cluster_identifier FROM pg_control_system()`);
  if (result.rows[0].database !== target.databaseName ||
      result.rows[0].cluster_identifier !== target.clusterIdentifier) {
    throw new Error("Database does not match the independently inspected development identity.");
  }
}

async function checkDatabase(env, config) {
  const client = databaseClient(env);
  await client.connect();
  try {
    await assertDevelopmentIdentity(client);
    const result = await client.query("SELECT current_database() AS database, current_schema() AS schema");
    if (result.rows[0].database !== config.databaseName ||
        result.rows[0].schema !== config.schema) {
      throw new Error("Development database/schema does not match the inspected setup target.");
    }
  } finally {
    await client.end();
  }
}

function serviceEnvironment(service, config = readConfig()) {
  const env = developmentEnvironment(config.schema);
  env.SAM_DEV_LEGAL_ENTITY_ID = config.legalEntityId;
  env.SAM_DEV_PLANNING_POLICY_FILE = path.join(root, ".local/sam-dev/planning-policy.json");
  env.SAM_DEV_VALIDATION_FILE = path.join(root, ".local/sam-dev/validation.json");
  const previewHost = process.env.REPLIT_DEV_DOMAIN || "";
  const hosts = ["127.0.0.1", "localhost", previewHost].filter(Boolean).join(",");
  // Keep the existing bearer controls on both services. Never write or log these values.
  const ccToken = process.env.SAM_COMMAND_CENTER_BEARER_TOKEN || process.env.SESSION_SECRET;
  const mcpToken = process.env.SAM_MCP_BEARER_TOKEN || process.env.SESSION_SECRET;
  if (!ccToken || !mcpToken) throw new Error("Development bearer secrets are missing.");

  if (service === "runtime") {
    env.PORT = "8080";
    env.SAM_WORKER_ID = "sam-replit-development";
    env.SAM_TICK_INTERVAL_MS = "1000";
    env.SAM_COMPOSITION_MODULE = path.join(root, "apps/runtime/src/developmentCompositionModule.ts");
  } else if (service === "command-center") {
    env.SAM_COMMAND_CENTER_PORT = "5000";
    env.SAM_COMMAND_CENTER_HOST = "0.0.0.0";
    env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID = config.legalEntityId;
    env.SAM_COMMAND_CENTER_ALLOWED_HOSTS = hosts;
    env.SAM_COMMAND_CENTER_ALLOWED_ORIGINS = previewHost ? `https://${previewHost}` : "";
    env.SAM_COMMAND_CENTER_BEARER_TOKEN = ccToken;
  } else if (service === "mcp") {
    env.SAM_MCP_PORT = "3001";
    env.SAM_MCP_HOST = "0.0.0.0";
    env.SAM_MCP_ALLOWED_HOSTS = hosts;
    env.SAM_MCP_ALLOWED_ORIGINS = previewHost ? `https://${previewHost}` : "";
    env.SAM_MCP_BEARER_TOKEN = mcpToken;
    // Safe mode selects only service health and sanitized test results, no dispatcher.
  } else {
    throw new Error("Unknown development service.");
  }
  return env;
}

module.exports = {
  root, configPath, schema, developmentEnvironment, databaseClient,
  readConfig, readTarget, assertDevelopmentIdentity, checkDatabase, serviceEnvironment
};
