# OSS monitoring to owner inbox — isolated integration

A verified change observed through an actual upstream Filesystem MCP now reaches SAM's internal owner inbox. The production tick runs the notification projector after verification and goal review. Both source polling and notification projection remain disabled by default. No deployment, Render environment change, database migration, merge or external message was performed.

The projector reuses the earlier owner-notification implementation, adapted to the MCP expansion stack. Migration `00105_owner_notifications.sql` follows research 00103 and perception 00104; do not also merge the earlier notification migration 00103 unchanged. This draft supersedes the projector/schema/read-tool portions of that earlier candidate. It does not include or activate an external delivery transport.

For a perception alert, projection requires an actual persisted CHANGED observation, its exact event sequence, source/company, execution and latest VERIFIED verification. The payload's source, verification and fingerprint must match. A copied event without its correlated observation cannot generate another alert. Ordinary successful polling goals do not create completion alerts. Goal failure, owner-decision and overdue notifications retain the earlier projection behavior; delivery remains UNROUTED.

`sam_list_notifications` is a read-only tool behind the existing system-owner gate, requires an explicit company UUID and uses a company-filtered query. The migration also provides row isolation for non-owner database roles. Provider acceptance, confirmed delivery and owner read remain distinct fields; projection sets none of them.

## Validation

- Three extended tests pass, including actual Filesystem MCP -> SAM planning/worker -> independent verification -> goal report -> baseline/unchanged/changed observations -> one internal alert. The test uses synthetic order data, a deterministic model gateway and PGlite with advisory locking stubbed. Poll due times are advanced directly.
- The integrated test checks owner access, another company's empty inbox, duplicate projection, copied event rejection and latest-INCONCLUSIVE rejection. The pre-existing approved file action/reconciliation checks still pass.
- Two inbox contract tests pass: disabled/no-database behavior; atomic rollback of notification and event receipt; stale approval suppression; database RLS under a non-owner role.
- Regression checks: MCP scope suite 13/13; knowledge/planner suite 15/15; bol surface PASS (77 exposed, 54 GREEN, 23 approval-gated).
- No external delivery, elapsed scheduling, live model selection, production PostgreSQL concurrency or browser success is claimed.

Evidence: `docs/acceptance/oss-owner-inbox-tests.txt` and the regenerated `oss-workflow-evidence.json`. The latter is the current isolated test receipt, not a production report.

## Web/browser recheck

`oss-fetch-browser-recheck.json` preserves another PARTIAL acceptance run. File and Git reads remain VERIFIED; Fetch failed, and browser navigation remains blocked by missing Chrome. Direct Python HTTPX requests to example.com succeeded during diagnosis (robots 404 and page 200), but that does not establish a working MCP Fetch path. No upstream safeguards, robots enforcement, TLS checks or browser sandbox were disabled. Previous volatile search INCONCLUSIVE evidence remains unchanged.

GitHub/Render and other authenticated business-system MCPs still need independent SAM runtime credentials. ChatGPT connector access has not been transferred into SAM. No external recipient/channel has been configured.
