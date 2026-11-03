import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { syntheticTestApp } from './test-app.mjs';

// Existing host Playwright dependency only; does not install anything in this repository.
const require = createRequire(import.meta.url);
const domOnly = process.env.AI_EVAL_DOM_ONLY === '1';
const { chromium } = domOnly ? {} : require(process.env.AI_EVAL_PLAYWRIGHT_MODULE || 'playwright');
const browser = domOnly ? undefined : await chromium.launch({ headless: true,
  executablePath: process.env.AI_EVAL_BROWSER_BIN, args: ['--no-sandbox'] });
const evidence = [];
try {
  for (const seededFaults of [true, false]) {
    const server = syntheticTestApp({ seededFaults });
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const origin = `http://127.0.0.1:${server.address().port}`;
    try {
      const smoke = (await fetch(origin + '/health')).status === 200;
      const rows = await (await fetch(origin + '/api/orders?project=alpha&status=paid')).json();
      const filtered = rows.length === 1 && rows.every(o => o.status === 'paid');
      const isolation = (await fetch(origin + '/api/order/S-200?project=alpha')).status === 404;
      let totalText;
      if (browser) {
        const page = await browser.newPage(); await page.goto(origin); await page.locator('#load').click();
        await page.waitForFunction(() => document.querySelector('#total').textContent.startsWith('EUR'));
        totalText = await page.locator('#total').textContent(); await page.close();
      } else {
        const html = await (await fetch(origin)).text();
        const button = {}, output = { textContent: '' };
        const context = vm.createContext({ document: { querySelector: s => s === '#load' ? button : output },
          fetch: path => fetch(new URL(path, origin)) });
        // Execute only this synthetic fixture's static inline script, no model or customer code.
        new vm.Script(html.match(/<script>([\s\S]+)<\/script>/)[1]).runInContext(context, { timeout: 1000 });
        await button.onclick(); totalText = output.textContent;
      }
      const total = totalText === 'EUR 20.00';
      assert.equal(smoke, true); assert.equal(filtered, !seededFaults); assert.equal(isolation, !seededFaults); assert.equal(total, !seededFaults);
      evidence.push({ variant: seededFaults ? 'seeded-faults' : 'positive-control', healthSmoke: smoke,
        paidFilterMeetsPRD: filtered, projectIsolationMeetsPRD: isolation, invoiceTotalMeetsPRD: total, actualTotal: totalText });
    } finally { await new Promise(r => server.close(r)); }
  }
} finally { await browser?.close(); }
console.log(JSON.stringify({ evaluator: domOnly ? 'independent-local-HTTP-and-mocked-DOM' : 'independent-local-Playwright-and-HTTP',
  browserRun: !domOnly, testspriteRun: false, evidence }, null, 2));
