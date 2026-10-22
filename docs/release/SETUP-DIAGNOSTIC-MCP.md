# Optional public diagnostic MCP — not executive SAM

Implemented but **OFF by default**. No deployment setting was enabled.

After separate owner approval, set only
`SAM_RELEASE_SETUP_DIAGNOSTIC_MCP=1` in **production** configuration, while retaining
`SAM_RELEASE_SETUP_MODE=1`, `SAM_RELEASE_SETUP_LOCAL=0`, `SAM_RELEASE_APPROVED=0`
and the existing resource `https://sam-greenfield.replit.app/mcp`.
Do not set the platform deployment marker yourself.

Push the commit and owner-republish the existing deployment. In ChatGPT create
the MCP connection with that same URL and choose **No authentication**.
No Auth0 client, callback or registration is used for this diagnostic connection.
In this opt-in mode OAuth resource metadata returns 404, rather than advertising
authentication for an anonymous diagnostic service.

Only `sam_service_status` and `sam_release_test_results` are listed/callable.
Both return fixed public constants: disabled executive/DB/models and test status
`NOT_RUN`, explicitly not loaded test evidence or live acceptance. There are no
parameters, tenant/user identifiers, logs, audits, provider data or private files.
No DB, executor, SAM app, worker, model or evidence-file module is imported.
Protocol initialization, initialization notification and ping are control
messages only, not additional tools. Unknown tools/arguments are refused without
echoing names; host/origin and body-size checks bound the public surface.

Anyone who knows the URL can call these diagnostics. Read-only tool annotations
are not an authorization control; the exact implementation allowlist is.
Public requests can still consume hosting CPU/network; this is not a billing cap.
Setting the flag to `0` and republishing restores the existing closed-Setup 401
behavior. The authenticated executive bridge is unchanged; this flag is rejected
outside closed Setup and never enables goal submission or execution.

Local verification: `node --import tsx tests/release/setup_diagnostic.ts`.
Actual ChatGPT Create remains unverified until the owner explicitly enables and
republishes this mode. Do not describe this connection as full SAM.
