import { readFileSync, existsSync } from "node:fs";
import { ChatGPTToolRegistry } from "../../chatgpt-tools/src/registry";
import type { RegisteredChatGPTTool } from "../../chatgpt-tools/src/types";

const emptyInput = { type: "object", properties: {}, additionalProperties: false };
const statusValues = new Set(["PASS", "FAIL", "NOT_RUN"]);
const cycleValues = new Set(["BLOCKED_EXTERNAL_MODEL", "NOT_RUN"]);

export function sanitizedValidationSummary() {
  const missing = { status: "NOT_RUN", passedSuites: 0, failedSuites: 0,
    authenticatedUi: "NOT_RUN", goalCycle: "NOT_RUN", externalModelTest: "NOT_RUN" };
  const file = process.env.SAM_DEV_VALIDATION_FILE;
  if (!file || !existsSync(file)) return missing;
  let raw: any;
  try { raw = JSON.parse(readFileSync(file, "utf8")); } catch { return missing; }
  // Project only bounded counts and fixed enums. Never export logs, arbitrary labels,
  // exception text, file paths, record contents, entity IDs or credentials.
  const count = (value: unknown) => Number.isInteger(value) && Number(value) >= 0 &&
    Number(value) <= 10000 ? Number(value) : 0;
  return {
    status: statusValues.has(raw.status) ? raw.status : "NOT_RUN",
    passedSuites: count(raw.passedSuites),
    failedSuites: count(raw.failedSuites),
    authenticatedUi: statusValues.has(raw.authenticatedUi) ? raw.authenticatedUi : "NOT_RUN",
    goalCycle: cycleValues.has(raw.goalCycle) ? raw.goalCycle : "NOT_RUN",
    externalModelTest: "NOT_RUN"
  };
}

export async function developmentServiceStatus() {
  const targets = [
    ["commandCenter", "http://127.0.0.1:5000/readyz"],
    ["worker", "http://127.0.0.1:8080/readyz"],
    ["mcp", "http://127.0.0.1:3001/livez"]
  ];
  return Object.fromEntries(await Promise.all(targets.map(async ([name, url]) => {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2000), redirect: "error" });
      const body = await response.json();
      return [name, response.status === 200 && ["ready", "alive"].includes(body.status)
        ? "READY" : "NOT_READY"];
    } catch { return [name, "UNAVAILABLE"]; }
  })));
}

export function createDevelopmentReadSurface() {
  const tool = (name: string, description: string, read: () => Promise<unknown> | unknown): RegisteredChatGPTTool => ({
    definition: { name, description, risk: "READ", availability: "READ_ONLY", inputSchema: emptyInput },
    handler: async args => {
      if (Object.keys(args).length) return { ok: false, error: "Arguments are not permitted." };
      return { ok: true, data: await read() };
    }
  });
  return new ChatGPTToolRegistry([
    tool("sam_development_service_status", "Read only the readiness of the three local development services.", developmentServiceStatus),
    tool("sam_development_test_results", "Read bounded, sanitized local test result enums and counts only.", sanitizedValidationSummary)
  ], { redactedErrors: true });
}
