# Actual archive verification and remaining release gate

The owner conditionally approved one temporary Render PostgreSQL 15 restoration destination, with an all-in spending ceiling of USD7. Resource creation still requires prior verification of all charges, billing bounds and deletion eligibility. No resource has been created and no production migration or deployment has occurred.

## Completed work

- Compiled native PostgreSQL 15.19 clients locally from the official, checksum-verified source. No server, system service or security override was installed.
- Downloaded the actual Render export created at `2026-11-01T19:34Z` into a private directory. The archive is 2,769,775 bytes; its SHA256 is `b40ce0f831238bc060f49affdf5e8dcaf31670d2624b00d6d0053a3e43790a79`.
- Independent verification confirmed the matching hash, full gzip CRC, 95 safe archive members and native `pg_restore --list` plus full SQL decoding to `/dev/null`, both exit0. No customer rows, TOC contents or credentials were printed or committed.

These results establish archive readability. They do not establish actual restoration, comparison against live data, native ACL/RLS correctness, operational service rollback or owner delivery.

## Destination and financial decision

The existing PG15 database is production; the other connected database is WMS PG16. Neither is a restoration destination. A local server cannot run safely: the executor is root with no process capabilities, and an ordinary transition to the existing unprivileged user fails. No bypass was attempted.

Render account inspection confirms Hobby, Admin access, no protected project environment and an enabled Delete Database control. Deletion was not invoked. The available paid configuration is USD6/month compute plus USD0.30/month for 1GB storage, prorated by the second. Autoscaling, HA and replicas would remain disabled. Workspace bandwidth allowance is not an exclusive experiment budget, and the pipeline spending limit does not cover the database.

The applicable account tax and a database-specific spending cap/TTL remain unproved. Independent financial review therefore does not accept the strict all-in USD7 condition as satisfied. A higher dollar number alone would not solve that guarantee gap.

A concrete proposal, **not yet approved**, is one instance for at most24 hours, with at most1GB external egress. Conservative compute/storage is USD0.225 and egress USD0.15, totaling USD0.375 before unverified taxes or other fees. It requires explicit owner acceptance of a monitored operational budget instead of a provider-enforced all-in guarantee, plus escalation if deletion fails. Before any cleanup, preserve the required redacted evidence and evaluate whether the destination is still necessary for a safe release. No second resource is authorized.

Alternatively, use an existing private native PG15 destination or obtain an enforceable fixed-price arrangement. Creation and dependent release remain paused until one of these paths satisfies the owner's condition.

## Preserved boundaries

The approved forward release remains exact `8a08e6163516f30f37c65313134170744330c4f4`. Previously passing SQL suites and unchanged PR97 checks were not repeated. PR97 remains isolated and inactive. No production or GitHub billing settings changed. Actual restore, operational rollback, published multi-specialist closure and owner receipt remain outstanding.
