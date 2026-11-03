# Synthetic invoice evaluation application

This app uses synthetic projects and orders only. Bind to loopback; never deploy it.

1. `GET /health` reports readiness and synthetic data status.
2. `GET /api/orders?project=alpha&status=paid` returns S-100 only. Canceled S-101 must be excluded.
3. `GET /api/order/S-200?project=alpha` returns 404 because S-200 belongs to beta.
4. Clicking **Load invoice S-100** displays **EUR 20.00**, price 10 times quantity 2.
5. No payments, real auth, customer data, databases or other projects are involved.

The default fixture deliberately violates requirements 2–4. `seededFaults:false` is a
positive control. Independent checks must reject all three faults and accept the control.
These checks prepare a ground truth; they do not constitute a TestSprite run.

TestSprite acceptance after a free account/quota is confirmed: give it this directory only,
pin the inspected MCP version, use verified TLS-only tunnel endpoints, disable arbitrary
project/credential access, compare reported defects with the three independent repro cases,
record credits before/after, and verify repairs with the unchanged independent checks.
