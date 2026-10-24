# Read-only evaluation preflight

Run `node scripts/evaluation/preflight.cjs` inside the intended service using its existing DATABASE_URL. The command has no arguments, password prompts, credential exports, grants, migrations, model calls or startup changes. It opens a repeatable-read READ ONLY transaction and always rolls it back. It does not read business records.

Receipts are checked against hashes of this checkout's specialist/evaluation migrations. Missing, unreadable and mismatched receipts stay distinct. Ordinary and partitioned tables in the selected schema are included. Absent receipt tables are never queried. Database URLs, credentials, connected role names and receipt contents are not emitted. Driver failures are replaced with one fixed error code.

The report always says PREFLIGHT_ONLY, never READY. Matching receipts do not certify tenant fences, principal enrollment, signer custody, provider admission or hosted lifecycle behavior. There is no provision/apply/enable mode.

Validation: six focused tests, TypeScript check and the 22 existing simulated Render transport tests pass. The full acceptance suite was not rerun. Simulated transport acceptance is not hosted lifecycle or autonomous model certification.

Keep any real-service report in the operator's private evidence store. Do not commit deployment-specific schema, permission or configuration findings to a public repository. Database provisioning, scoped access and live activation are separate operator actions governed by the existing release boundaries.
