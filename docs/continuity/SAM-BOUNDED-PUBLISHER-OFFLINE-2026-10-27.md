# Bounded publisher offline preparation — 2026-10-27

Storage startup/restart acceptance is recorded separately in
SAM-STORAGE-RESTART-ACCEPTANCE-2026-10-27.md. The test service is suspended;
Hermes is unchanged. The real UI source and immutable verifier remain unchanged.

The new UNREGISTERED publisher implementation validates the exact one-file
candidate and a SAM Ed25519-signed independent acceptance before reservation or
network authentication. It rechecks the existing App installation, newly minted
token permissions, exact single-repository inventory and main protection at
publication time. It refuses a moved pinned base, writes one tree/commit and a
new job-specific branch, creates only a Draft PR, checks its one-file/two-line
diff, and revokes the token. There are no main update, merge, settings, Actions,
other-repository or general contents routes. No real publication occurred.

An adapter for the existing side_effect_operations table uses atomic unique
round keys, parameterized SQL, fixed tenant/principal checks and ordered stage
transitions. It contains no DDL, grants, deletes or provisioning. Uncertain work
requires reconciliation. An accepted receipt can be read without new publication.
The filesystem journal is a local fixture unless independently persistent;
it must not be treated as container-replacement durability on ephemeral Render.

Nine publisher cases passed using synthetic signing keys and an entirely fake
transport. Five adapter cases passed on the local PGlite SQL engine, including
close/reopen receipt preservation. PGlite is NOT a native multi-session PostgreSQL
server or Render acceptance. The fixture alone creates local synthetic roles,
tables and grants; no external database mutation or permission change occurred.
Together with nine transfer/crash-journal cases, there are 23 new local cases.
Typecheck passed. Tests do not prove live GitHub writes, native journal races,
key delivery, SDK controller cleanup or isolation. No failures were hidden.

Dispatch remains disabled. These functions are not registered as model tools,
public endpoints, runtime capabilities or startup hooks. SAM verifier key delivery,
durable journal integration, the real SDK controller/image acceptance and native
scope/durability acceptance still need completion before registration. Model or
candidate input must never select verifier keys, transports, journal locations,
pools, credentials, filenames or image acceptance receipts.

The original App identity and separate unlinked publisher vault are retained;
no App permission, connection, token or activation setting was changed here.
No Modal guest/image build/model call/new paid resource was initiated. No new
financial approval exists. Only request one when the live plan and comprehensive
enforceable cap can be substantiated; do not assert that cost is the sole blocker.
