# Owner notification center — staged implementation

Based on af4be2e and independent of PR #37's knowledge feature. No production
service, database migration, environment variable, deploy, restart, delivery
channel or paid resource was changed. Keep the 24-hour fixed-version soak intact.

## What this branch implements

The existing runtime calls a separate observer at the beginning of each work
tick. `SAM_NOTIFICATIONS_ENABLED=true` opts into migration 00103's notification
inbox. With the flag absent, there is no access to new tables. Projection errors
return a bounded error code and do not prevent the ordinary work tick.

The observer reads goal transitions from the existing Outbox regardless of its
PENDING/PUBLISHED status. It does not consume the runtime relay's messages or
change their publication state. A durable receipt per source event and a unique
notification key prevent replay/restart duplication. Event receipt and inbox
insert commit in one transaction. A transaction-scoped advisory lock serializes
projection workers; delivery uses row claims separately.

Four kinds are generated:

| Kind | Trigger | Content |
| --- | --- | --- |
| COMPLETED | Current goal reached COMPLETED | Current-plan final read report/hash when present, latest verified execution IDs, replan count |
| FAILED | Current goal reached FAILED | Reason code and Arabic explanation, bounded failed-tool attempts, links by persisted IDs |
| APPROVAL | Current goal entered WAITING_OWNER | Urgent request, existing pending approval IDs/capabilities/expiry; never an approval itself |
| PROGRESS | WAITING_EXTERNAL / BLOCKED, or active for over 30 minutes | Dependency/block notice, or one overdue notice per active plan/state; overdue does not mean failed |

Routine transitions generate no owner alert. The first enabled projection sets a
persisted cutover timestamp. Historical pre-cutover transitions are not replayed.
An old approval event is skipped if the goal has resumed. Pending approval and
progress entries/deliveries are suppressed if the goal's state has changed. Overdue
scanning excludes already-notified plan/state keys before its limit, so older
long-running goals cannot starve newer ones.

Summaries are deterministic except for text copied from an already persisted
final report. They never infer verification from the COMPLETED label alone.
Missing final reports and zero verified executions are disclosed. A final report
must match the goal's current plan and the event report_hash, when supplied.
Provider error bodies are not copied into notifications or delivery errors.
Notification content is data; no source/model text is executed as instructions.

`sam_list_notifications` is an owner-only READ tool using the existing registry.
It requires an explicit legal_entity_id; the inbox also has fail-closed RLS.
This is on-demand retrieval, not spontaneous posting into a ChatGPT conversation.
Reading via the tool does not invent device delivery or set read_at automatically.

## Delivery ledger and safety boundaries

No concrete email, WhatsApp, Telegram, ChatGPT or phone push adapter is included
or enabled. The projection stores `UNROUTED`, which explicitly means NOT SENT.
No existing account credential or destination is assumed.

Internal trusted code may route a notification to an operator-authorized channel
and owner recipient. This is not exposed as a model-callable action. A future
adapter must implement OwnerNotificationTransport and be invoked with
`SAM_NOTIFICATION_DELIVERY_ENABLED=true`. The current runtime composition only
projects notifications; it does not invoke an external transport.

Delivery states mean different things:

- UNROUTED: only an inbox entry exists.
- PENDING / RETRY: routed and eligible or awaiting bounded backoff.
- SENDING: an attempt owns a 60-second claim; network call occurs after commit.
- ACCEPTED: provider returned an acceptance receipt; this is not device delivery.
- CONFIRMED: adapter reports provider-confirmed delivery, not owner reading.
- UNKNOWN: timeout, ambiguous error or expired in-flight claim; reconcile before
  any further send. A late acknowledgement cannot overwrite a fenced outcome.
- FAILED: permanent provider rejection or exhausted retry budget.
- SUPPRESSED: an approval/progress request became obsolete before sending.

The notification UUID is the transport idempotency key. Only the typed
NotificationNotSentError can trigger retry, and only when the adapter can prove
no send occurred. Maximum five attempts with exponential backoff; arbitrary
exceptions and a 20-second deadline become UNKNOWN, never blind retries. Logs
persist sanitized error codes and receipts, not raw provider error text. Each
attempt has a separate durable audit row. UNKNOWN reconciliation and asynchronous
receipt webhooks are future channel-specific work; no exactly-once external
network or phone receipt guarantee is claimed.

## Validation

`npm run test:notifications` exercises isolated real PostgreSQL-compatible SQL
with PGlite and deterministic transport doubles. The advisory lock result is
stubbed in this environment; multi-process production PostgreSQL locking is not
claimed as tested. It covers important/routine/
stale events, final report and verification correlation, published-vs-delivered,
replay and rollback, durable database close/reopen, cutover, long-task dedup,
recipient binding, owner access and non-owner RLS, attempt budgets and backoff,
uncertain sends and late receipts, expired claims and worker overlap, disabled
operation and projection failure containment. No real owner message is sent.

## Next gates

1. Keep this PR separate/unmerged during the current soak; review overlapping
   package/tool-surface edits with PR #37 when integrating later.
2. On staging apply migration 00103, enable inbox projection and run end-to-end
   completion, failure, owner-approval and overdue goals through the real runtime.
3. Restart staging and verify the same source event creates no duplicate entry.
4. Choose and authorize a supported owner channel. Verify the recipient and
   provider receipt semantics; wire its adapter and reconciliation path. Test
   rejection, timeout, ambiguous acceptance and restart with a controlled inbox.
5. Enable production only after staging evidence is accepted. Use the shared
   Render configuration group for the projection flag so Runtime and MCP agree;
   do not copy secrets into individual services or enable outbound delivery merely
   because the inbox works.

The existing hourly soak automation remains unchanged. A scheduled ChatGPT
observer is a polling mechanism and must be described separately from direct
provider delivery or posting to an existing conversation.
