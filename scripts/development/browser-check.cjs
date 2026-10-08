const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const dev = require("./environment.cjs");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let phase = "database-identity";
const diagnostics = {};

async function main() {
  const env = dev.serviceEnvironment("command-center");
  await dev.checkDatabase(env, dev.readConfig());
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "sam-private-browser-"));
  // Explicit loopback exclusions are needed even for numeric hosts in resolver rules.
  // All background traffic uses a dead local proxy; page traffic is also GET-only.
  const chrome = spawn("chromium", [
    "--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--no-first-run",
    "--disable-background-networking", "--disable-component-update", "--disable-sync",
    "--disable-default-apps", "--disable-extensions", "--no-pings",
    "--disable-features=MediaRouter,OptimizationHints", "--remote-debugging-address=127.0.0.1",
    "--remote-debugging-port=0", "--proxy-server=http://127.0.0.1:9",
    "--proxy-bypass-list=127.0.0.1;localhost",
    "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost",
    "--user-data-dir=" + directory, "about:blank"
  ], { env: { PATH: process.env.PATH, HOME: process.env.HOME, LANG: "C.UTF-8" }, stdio: "ignore" });
  let socket, sequence = 0, exceptions = 0, blocked = 0;
  const pending = new Map(), responses = [];
  function call(method, params = {}) {
    const id = ++sequence;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(new Error("CDP_TIMEOUT")); }, 10000);
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const reply = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (reply.exceptionDetails) throw new Error("PAGE_SCRIPT_FAILURE");
    return reply.result.value;
  }
  async function until(expression) {
    for (let i = 0; i < 60; i++) { if (await evaluate(expression)) return; await sleep(100); }
    throw new Error("UI_STATE_TIMEOUT");
  }
  try {
    phase = "browser-start";
    const active = path.join(directory, "DevToolsActivePort");
    for (let i = 0; i < 100 && !fs.existsSync(active); i++) await sleep(100);
    if (!fs.existsSync(active)) throw new Error("BROWSER_START_FAILURE");
    const port = fs.readFileSync(active, "utf8").split("\n")[0];
    const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", () => reject(new Error("CDP_OPEN_FAILURE")), { once: true });
    });
    socket.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const item = pending.get(message.id);
        if (item) {
          clearTimeout(item.timer); pending.delete(message.id);
          message.error ? item.reject(new Error("CDP_REQUEST_FAILURE")) : item.resolve(message.result);
        }
        return;
      }
      if (message.method === "Runtime.exceptionThrown") exceptions++;
      if (message.method === "Network.loadingFailed" && /^net::[A-Z_]+$/.test(message.params.errorText)) {
        diagnostics.networkError = message.params.errorText;
      }
      if (message.method === "Network.responseReceived") {
        const response = message.params.response, url = new URL(response.url);
        if (url.pathname.startsWith("/api/")) responses.push({
          path: url.pathname.replace(/\/api\/goals\/[^/]+\/timeline/, "/api/goals/:id/timeline"), status: response.status
        });
      }
      if (message.method === "Fetch.requestPaused") {
        const request = message.params.request, origin = new URL(request.url).origin;
        const allowed = origin === "http://localhost:5000" && ["GET", "HEAD"].includes(request.method);
        if (!allowed) blocked++;
        call(allowed ? "Fetch.continueRequest" : "Fetch.failRequest", allowed
          ? { requestId: message.params.requestId }
          : { requestId: message.params.requestId, errorReason: "BlockedByClient" }).catch(() => {});
      }
    });
    await call("Page.enable"); await call("Runtime.enable"); await call("Network.enable");
    await call("Fetch.enable", { patterns: [{ urlPattern: "*" }] });
    phase = "local-login-page";
    await call("Page.navigate", { url: "http://localhost:5000/" });
    await sleep(1000);
    diagnostics.localDocument = await evaluate("location.origin==='http://localhost:5000'");
    diagnostics.loginPresent = await evaluate("!!document.getElementById('bearerToken')");
    await until("document.getElementById('status')?.textContent==='AUTH REQUIRED'");
    phase = "private-authentication";
    const global = (await call("Runtime.evaluate", { expression: "globalThis" })).result.objectId;
    const authenticated = await call("Runtime.callFunctionOn", {
      objectId: global, functionDeclaration: "async function(token){document.getElementById('bearerToken').value=token;await connect();return true}",
      arguments: [{ value: env.SAM_COMMAND_CENTER_BEARER_TOKEN }], returnByValue: true, awaitPromise: true
    });
    if (authenticated.exceptionDetails) throw new Error("PRIVATE_LOGIN_FAILURE");
    await until("document.getElementById('status').textContent==='DEVELOPMENT · CONNECTED'");
    const ui = await evaluate(`({
      connected:document.getElementById('status').textContent==='DEVELOPMENT · CONNECTED',
      metrics:document.querySelectorAll('#metrics .metric').length,
      goals:document.querySelectorAll('#goals [data-goal-id]').length,
      loginHidden:getComputedStyle(document.getElementById('authPanel')).display==='none',
      passwordCleared:document.getElementById('bearerToken').value==='',
      sessionTokenPresent:!!sessionStorage.getItem('sam_cc_token'),
      persistentTokenAbsent:!localStorage.getItem('sam_cc_token')
    })`);
    assert.equal(ui.metrics, 6); assert.ok(ui.goals > 0);
    assert.ok(ui.connected && ui.loginHidden && ui.passwordCleared && ui.sessionTokenPresent && ui.persistentTokenAbsent);
    phase = "existing-goal-read";
    await evaluate("document.querySelector('#goals [data-goal-id]').click()");
    await until("(()=>{try{return !!JSON.parse(document.getElementById('timeline').textContent).goal}catch{return false}})()");
    const timeline = await evaluate(`(()=>{const t=JSON.parse(document.getElementById('timeline').textContent);
      return {state:t.goal.state,plans:t.plans.length,executions:t.executions.length,verifications:t.verifications.length,auditEntries:t.audit.length}})()`);
    await evaluate("refresh()");
    assert.equal(exceptions, 0); assert.ok(responses.length >= 7 && responses.every(response => response.status === 200));
    phase = "redacted-visual-proof";
    // Browser-only redaction AFTER verifying real responses. This does not alter SAM.
    await evaluate(`document.getElementById('authPanel').remove();
      document.querySelectorAll('#goals [data-goal-id]').forEach((node,index)=>{
        node.textContent='Development goal '+(index+1)+' — identifiers and text redacted for visual verification';node.removeAttribute('data-goal-id');
      });
      document.getElementById('timeline').textContent='Timeline read verified; raw record contents redacted.';
      true`);
    const screenshot = await call("Page.captureScreenshot", { format: "png" });
    const screenshotPath = path.join(os.tmpdir(), "sam-authenticated-redacted.png");
    fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, "base64"), { mode: 0o600 });
    const proof = { checkedAt: new Date().toISOString(), status: "PASS", ui, timeline, apiResponses: responses,
      javascriptExceptions: exceptions, blockedRequests: blocked, writeRequests: 0, externalModelRequests: 0 };
    fs.writeFileSync(path.join(os.tmpdir(), "sam-browser-proof.json"), JSON.stringify(proof, null, 2));
    console.log(JSON.stringify(proof, null, 2));
    console.log("REDACTED_LOCAL_SCREENSHOT=" + screenshotPath);
  } finally {
    if (socket) socket.close();
    for (const item of pending.values()) { clearTimeout(item.timer); item.reject(new Error("CLEANUP")); }
    chrome.kill("SIGTERM"); await sleep(500); if (chrome.exitCode === null) chrome.kill("SIGKILL");
    fs.rmSync(directory, { recursive: true, force: true });
  }
}
main().catch(() => {
  console.error(JSON.stringify({ status: "FAIL", phase, diagnostics, sensitiveDetails: "suppressed" }));
  process.exitCode = 1;
});
