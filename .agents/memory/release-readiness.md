---
name: Release readiness boundaries
description: Native-process deployment evidence, Replit loopback ports, and explicit owner acceptance criteria.
---

Do not assume a fixed loopback port is free, or equate a health response on it with
the child process that was just started.

**Why:** Port 18080 was already occupied by the workspace's internal pid1 service.
A separate authenticated worker-status check exposed that the intended child had
failed. Use dynamically allocated loopback ports, confirm child lifecycle and
worker progress, and never stop the unrelated platform listener.

**How to apply:** Test the real service processes through the release envelope,
not only fixture backends or an HTTP 200 response.

Treat async module export/interoperability as a deployment concern, not a build
success guarantee.

**Why:** This repository's tsx/CommonJS loading rejected top-level await when the
native production composition was actually imported.

**How to apply:** Preserve native composition behavior through asynchronous
exports supported by the loader; test process startup rather than compilation
alone.

Independent arithmetic verification does not establish user-intent compliance.
An owner-authored acceptance criterion must not be replaced by one invented by
the planner/executor. Keep new-build regression proof separate from historical
live-model acceptance, and keep closed inference authorizations closed.

**Why:** The owner requires rejection of mathematically valid results that do not
meet the requested goal, and a separate decision before production or new spending.

**How to apply:** Report computational verification, goal acceptance, learning,
and live-model/build provenance as distinct gates. Production backup/restore,
monitoring cost coverage and unresolved scanner findings remain separate gates.

Pin each isolated database connection's search path independently of the parent
development process.

**Why:** Inherited development connection options made a newly created restore
database resolve the old development namespace while migrations had correctly
populated public. A successful migration subprocess did not prove its reader's
effective namespace.

**How to apply:** Independently assert database/cluster identity and effective
schema for dump/restore clients; do not reuse deployment or development options
implicitly across targets.

Restore usability must be checked with nonempty audit/receipt records and the
actual restricted reader, not only matching administrative dump inventories.

**Why:** An isolated restore preserved all rows and policies, yet the native
non-bypass reader could see no audit records under the inherited policy set.
Empty fixtures would have hidden this distinction.

**How to apply:** Keep restoration integrity, fixture reader permissions and
production authorization separate. Run compatibility readers in READ ONLY
transactions; never start the worker merely to prove a quarantined restore.
