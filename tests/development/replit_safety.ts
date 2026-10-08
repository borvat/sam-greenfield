import assert from "node:assert/strict";
import http from "node:http";
import { Script } from "node:vm";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { pool } from "../../packages/db/src/client";
import dev from "../../scripts/development/environment.cjs";

async function json(path: string, token?: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (token) headers.set("authorization", `Bearer ${token}`);
  if (init.body) headers.set("content-type", "application/json");
  const response = await fetch(`http://127.0.0.1:5000${path}`, { ...init, headers });
  return { status: response.status, body: await response.json() };
}

async function forbiddenHost() {
  return new Promise<number>((resolve, reject) => {
    http.get({
      hostname: "127.0.0.1", port: 5000, path: "/",
      headers: { host: "untrusted.example" }
    }, response => {
      response.resume();
      resolve(response.statusCode!);
    }).on("error", reject);
  });
}

async function main() {
  const config = dev.readConfig();
  const ccEnv = dev.serviceEnvironment("command-center", config);
  const mcpEnv = dev.serviceEnvironment("mcp", config);
  const runtimeEnv = dev.serviceEnvironment("runtime", config);
  const externalKeys = /^(OPENAI_|ANTHROPIC_|GOOGLE_|DEEPSEEK_|QWEN_|BOL_|EBOEKHOUDEN_|SAM_FINANCE_|SAM_PRODUCTION_BUNDLE_MODULE)/;
  for (const env of [ccEnv, mcpEnv, runtimeEnv]) {
    assert.equal(Object.keys(env).filter(key => externalKeys.test(key)).length, 0);
    assert.ok(env.PGOPTIONS.includes("sam_replit_dev"));
    assert.equal(env.NODE_ENV, "development");
  }
  await dev.checkDatabase(ccEnv, config);
  const html = await (await fetch("http://127.0.0.1:5000/")).text();
  assert.ok(html.includes('data-development-safe="true"'));
  assert.ok(html.includes('id="bearerToken"'));
  assert.ok(!html.includes('prompt('));
  const browserScript = html.match(/<script>([\s\S]*?)<\/script>/)![1];
  new Script(browserScript);
  console.log("DEVELOPMENT_BROWSER_SCRIPT PASS: served JavaScript parses; inline login and safe-mode notice present.");
  await assert.rejects(dev.checkDatabase(ccEnv, { ...config, databaseName: "not-the-development-database" }));
  assert.equal((await json("/api/overview")).status, 401);
  assert.equal((await json("/api/overview", "invalid-token")).status, 401);
  assert.equal(await forbiddenHost(), 403);
  const token = ccEnv.SAM_COMMAND_CENTER_BEARER_TOKEN;
  assert.equal((await json("/readyz")).status, 200);
  assert.equal((await json("/api/overview", token)).status, 200);
  assert.equal((await json("/api/goals", token, {
    method: "POST",
    body: JSON.stringify({ objective: "Forbidden red experiment", authority_ceiling: "RED" })
  })).status, 400);
  assert.equal((await json("/api/goals", token, {
    method: "POST",
    body: JSON.stringify({ objective: "Blocked origin test", authority_ceiling: "GREEN" }),
    headers: { origin: "https://untrusted.example" }
  })).status, 403);

  // A real local goal, not a fabricated completed plan or verification.
  const existing = await json("/api/goals", token);
  const objective = "Development connectivity check — no external execution";
  let goal = existing.body.data.find((item: any) => item.objective === objective);
  if (!goal) {
    const created = await json("/api/goals", token, {
      method: "POST",
      body: JSON.stringify({ objective, domain: "development_probe", authority_ceiling: "GREEN" })
    });
    assert.equal(created.status, 201);
    goal = created.body.data;
  }
  await new Promise(resolve => setTimeout(resolve, 2100));
  const timeline = await json(`/api/goals/${goal.id}/timeline`, token);
  assert.equal(timeline.status, 200);
  assert.equal(timeline.body.data.goal.state, "NEW");
  assert.equal(timeline.body.data.plans.length, 0);
  assert.equal(timeline.body.data.executions.length, 0);
  assert.equal(timeline.body.data.verifications.length, 0);
  assert.ok(timeline.body.data.audit.some((entry: any) => entry.action === "OWNER_GOAL_CREATED"));

  const runtime = await fetch("http://127.0.0.1:8080/readyz");
  assert.equal(runtime.status, 200);
  assert.equal((await runtime.json()).status, "ready");
  const client = new Client({ name: "sam-replit-development-test", version: "1.0.0" }, {
    versionNegotiation: { mode: "auto" }
  });
  try {
    await client.connect(new StreamableHTTPClientTransport(new URL("http://127.0.0.1:3001/mcp"), {
      requestInit: { headers: { Authorization: `Bearer ${mcpEnv.SAM_MCP_BEARER_TOKEN}` } }
    }));
    const tools = await client.listTools();
    assert.deepEqual(tools.tools.map(tool=>tool.name).sort(),
      ["sam_development_service_status","sam_development_test_results"]);
    assert.ok(tools.tools.every((tool: any) => tool.annotations?.readOnlyHint === true));
    assert.ok(!tools.tools.some(tool => ["sam_execute", "sam_reconcile_side_effects"].includes(tool.name)));
    const status = await client.callTool({ name: "sam_development_service_status", arguments: {} });
    assert.equal(status.isError ?? false, false);
    assert.ok(!JSON.stringify(status).includes(token));
    assert.ok(!JSON.stringify(status).includes(mcpEnv.SAM_MCP_BEARER_TOKEN));
    for (const [name,args] of [
      ["sam_list_users",{}], ["sam_list_memory",{}], ["sam_list_financial_documents",{}],
      ["sam_list_legal_entities",{}], ["sam_system_status",{}], ["sam_execute",{}],
      [mcpEnv.SAM_MCP_BEARER_TOKEN,{}],
      ["sam_development_test_results",{legalEntityId:"ffffffff-ffff-ffff-ffff-ffffffffffff"}],
      ["sam_development_test_results",{token:mcpEnv.SAM_MCP_BEARER_TOKEN}]
    ] as [string,Record<string,unknown>][]) {
      let result:any, error:any;
      try{result=await client.callTool({name,arguments:args})}catch(caught){error=caught}
      assert.ok(result?.isError===true||[-32601,-32602].includes(error?.code));
      if(result){
        assert.ok(!JSON.stringify(result).includes(mcpEnv.SAM_MCP_BEARER_TOKEN));
      }
      if(error){
        assert.ok(!String(error.message).includes(mcpEnv.SAM_MCP_BEARER_TOKEN));
      }
    }
    console.log("DEVELOPMENT_MCP_DENIAL PASS: live protocol rejects broad tools/entity arguments; bearer absent from valid and rejected outputs.");
    console.log(`DEVELOPMENT_LIVE_SERVICES PASS: authenticated dashboard; audited NEW goal; worker ready; MCP handshake/read tools=${tools.tools.length}; actions unavailable.`);
  } finally {
    await client.close();
  }
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='public'")).rows[0].n, 0);
  console.log("DEVELOPMENT_ISOLATION PASS: pinned development identity; no external credentials; public schema untouched.");
}

main().then(() => pool.end()).catch(async error => {
  console.error(error.message);
  await pool.end();
  process.exitCode = 1;
});
