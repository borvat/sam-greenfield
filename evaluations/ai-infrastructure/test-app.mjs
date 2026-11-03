import { createServer } from 'node:http';

/** Deliberately faulty synthetic application. Never register or deploy it. */
export function syntheticTestApp({ seededFaults = true } = {}) {
  const orders = [
    { id: 'S-100', project: 'alpha', status: 'paid', price: 10, quantity: 2 },
    { id: 'S-101', project: 'alpha', status: 'canceled', price: 5, quantity: 1 },
    { id: 'S-200', project: 'beta', status: 'paid', price: 3, quantity: 4 }
  ];
  return createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    res.setHeader('cache-control', 'no-store');
    const json = (code, data) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(data)); };
    if (url.pathname === '/health') return json(200, { ok: true, synthetic: true });
    if (url.pathname === '/api/orders') return json(200, orders.filter(o => o.project === url.searchParams.get('project') &&
      (seededFaults || !url.searchParams.get('status') || o.status === url.searchParams.get('status'))));
    if (url.pathname.startsWith('/api/order/')) {
      const order = orders.find(o => o.id === url.pathname.split('/').at(-1));
      if (!order || (!seededFaults && order.project !== url.searchParams.get('project'))) return json(404, { error: 'NOT_FOUND' });
      return json(200, order);
    }
    if (url.pathname !== '/') return json(404, { error: 'NOT_FOUND' });
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'content-security-policy': "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'" });
    res.end(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Synthetic invoice fixture</title><style>body{font:18px system-ui;margin:3rem;max-width:40rem}button{padding:1rem}output{display:block;margin:1rem}</style>
      <h1>Synthetic invoice</h1><p>Fixture only · no real accounts or data</p>
      <button id="load">Load invoice S-100</button><output id="total" aria-live="polite"></output>
      <script>document.querySelector('#load').onclick=async()=>{const o=await fetch('/api/order/S-100?project=alpha').then(r=>r.json());
      document.querySelector('#total').textContent='EUR '+(o.price${seededFaults ? '' : '*o.quantity'}).toFixed(2);};</script></html>`);
  });
}
