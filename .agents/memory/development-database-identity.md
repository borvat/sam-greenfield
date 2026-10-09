---
name: Development database identity
description: Why the imported workspace's environment label alone is insufficient to identify development versus production.
---

Do not infer the database target solely from `REPLIT_ENVIRONMENT`.

**Why:** During setup, the editor workspace reported `REPLIT_ENVIRONMENT=production`,
but read-only PostgreSQL metadata from the shell connection matched the independently
queried Replit development database. The initial environment-label guard correctly
stopped all writes until this discrepancy was investigated.

**How to apply:** Before writes, compare the intended development database identity
with the application's actual connection using read-only metadata. Fail on a mismatch.
Never disable a production guard just because the editor preview exists, and never
assume a reused connection points at development. Re-inspect after connection changes.

A credential's presence in the production environment view does not prove a
production database exists or that the credential is production-specific.

**Why:** Production views inherit shared settings; a managed DATABASE_URL was
reported present while independent production metadata remained unavailable.

**How to apply:** Separate setting presence, actual target identity, restricted
LOGIN proof and provisioning status. Never authorize launch from presence alone.
