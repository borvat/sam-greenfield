## OWNER HANDOFF: invalid Modal credential; all diagnostic startup changes restored — 2026-10-26 05:55 UTC

Current status: financial approval recorded, live real-project admission BLOCKED.
No generated UI patch has been executed, accepted or published.

### Proven live in this resumption

- Observer v3 ran in TEST Hermes deployment dep-dbfeisnavr4c73drp31g.
  SDK 1.6.2 imports successfully. Its actual config resolves BOTH token ID and
  token secret. ONE create_if_missing=False App lookup was refused with
  AuthError, classified INVALID_CREDENTIAL. No token bytes, config contents,
  raw exception text or credential refresh were logged.
- Signed-in workspace ceo-53153 API tokens page reports API tokens (0).
  This independently supports needing a replacement operator credential; do
  not speculate about who revoked it or exactly when it expired.
- Restored ORIGINAL Docker Command /bin/sh /opt/data/sam-hermes-start.sh.
  Final restoration deployment dep-dbfekdom7kps738q88qg is LIVE, finished
  05:52:05 UTC, on the same pinned Hermes image. Settings UI confirms the
  original command. Diagnostic wrappers are no longer configured.
- Fresh Modal main inventory: All 0, Functions 0, Sandboxes 0,
  No containers found. No new App, image or guest was created by this round.
- SAM remains Live at source 93f37e535ceafe7b9053afe96b083a2a12d607ba,
  deployment dep-dbfcs1ss728c73euoid0; no SAM deployment was attempted.
- Fresh main branch GET: protected=true, tip unchanged at
  b55da2761e8fd1de3833be55f03d4fdd268cd0a3. No push/protection test or rule edit.
- ui.ts at current review branch remains blob
  21d6d90babdbc6921075c0a2f2a050c9f9e8cf49. The real repair is NOT authored.

### Local evidence versus remaining live gates

Three host-preflight tests and nine publisher-auth preflight tests passed
locally (12 tests in this resumption). Synthetic inputs only; no actual keys,
network, compute, candidate or model used in these tests. The earlier broker
tests and identity tests were not represented as newly rerun live acceptance.
The publisher network helper is UNREGISTERED, not a deployed publisher.
No actual App-token authentication/mint/revocation has been performed yet.

G01-G04 fixes remain reviewed/tested locally on PR #67, not deployed. Expanded
gate still needs controller-death cleanup/reconciliation, frozen Node image,
one-file transfer plus separate immutable Node verification, trusted publisher
integration and actual bounded-round proof. Dependency additions remain denied.

### Personal credential step prepared, NOT performed by the engineer

A Modal New token form is prepared in the signed-in owner session:
name sam-hermes-bounded-round-20261026; lifetime 1 Hour.
Create token has NOT been clicked. No new credential exists from this work.
Credential creation/entry is left to the owner; never ask for a key in chat.

The existing Render group sam-bounded-publisher-vault remains UNLINKED.
Added two NON-SECRET placeholders using Save only, without a service deploy:
SAM_MODAL_OPERATOR_TOKEN_ID=OWNER_INPUT_REQUIRED
SAM_MODAL_OPERATOR_TOKEN_SECRET=OWNER_INPUT_REQUIRED
Existing GitHub key alias was not revealed or changed, publisher flag stays 0.
The owner may replace those two placeholders with the new Modal token ID and
secret directly in Render, then Save only. Do not change or expose the GitHub
key, link the group, deploy, raise budgets or put token bytes in chat/GitHub.
The prepared fields are storage only; no runtime consumes them yet.

On resumption first verify only masked metadata/completion, then use a reviewed
trusted-host adapter to validate replacement credentials and workspace scope,
never transmit them to the Hermes model or a guest. If the 1-hour credential
expires before admission, do not silently renew or widen its lifetime.
Personal handoff is credential creation/storage, not a renewed spend approval.

### Delivery status

| Requirement | Current result |
|---|---|
| GitHub identity only SAM repo | App 5475103 / installation175336519 configured for only sam-greenfield; actual key/token authentication still unproven |
| main protected | YES: read-only API plus previously reviewed owner rule; never tested by push |
| broker fixes accepted for expanded live use | NO: local fixes/tests accepted; lifecycle/image/integration live gates pending |
| real task ready | scoped bug + immutable tests ready, execution admission NO |
| Hermes actually repaired real UI | NO |
| independent live SAM acceptance | NO; baseline reproduction/local verifier evidence only |
| repair Draft PR | NO; #67 is preparation/security review only |
| new PG restart/no-replay proof | NO; accepted historical clamp evidence retained, not repeated |
| temporary compute closed | YES: fresh Modal inventory zero; diagnostics restored and observers finite |
| cost | zero new Modal compute/model operations; exact existing Render hosting invoice delta not audited |

The owner-approved ceiling remains USD 1 within the existing account limit,
maximum six sequential guests and one real UI task; no new spend has begun.
No previous runtime window/PG deadline renewed, no PG permission/data change,
no Actions, paid model, upgrade, payment method, production write or merge.

Next after owner credential completion: finish reviewed trusted-host credential
consumption and remaining expanded security gates, then open only the newly
authorized bounded window. Do not substitute an engineer-written patch for
Hermes output, reset prior accepted ledgers, or declare task success on a
model claim alone.

---

## Modal authentication gate and safe identity preparation — 2026-10-26 05:46 UTC

The corrected observer ran on TEST Hermes in deployment
dep-dbfegcqvcj2c73frjge0, Live at 05:43:24 UTC. SDK 1.6.2 import is ready.
Existing credential and ledger paths are present, but the SINGLE read-only
named-App lookup returned AuthError. No Sandbox/App/image creation/model call
occurred. Do not infer revocation, expiry or a needed new key from this class
alone: missing profile/credentials and provider refusal must be distinguished.

Original startup command restored; dep-dbfehci9lscs739re09g is Live as of
05:45:37 UTC, same pinned image. No SAM deployment or PG deadline/write occurred.

Observer v3 records ONLY booleans for SDK-resolved token presence and a fixed
failure category. It never prints token bytes, profile config or exception
text. It will perform one read-only lookup, no retry of denied API calls.
Three local tests pass, including synthetic secret-redaction checks for four
AuthError messages. V3 source SHA-256:
7bab1ca51648e80a576163095b8de61a5ff93550e27c32394b401925db005cdc
Next operator step: distinguish local config absence from actual credential
refusal using this finite observer; restore original command afterward.

New publisher_auth_preflight.cjs is UNREGISTERED and has not used the real key.
It uses only fixed api.github.com routes to inspect the installation, mint a
one-repository short-lived token, independently inspect its repo inventory and
read main.protected, then revoke the token even on downstream rejection.
No repository write route exists; bounded responses/timeouts, no redirects or
provider-error logging. It returns sanitized identity metadata only.
Nine local tests passed using synthetic RSA/token/API transport, including
overscoped installation/token/inventory rejection, unprotected main, secret
redaction and mandatory token revocation. Disabled operator identity fails
before network. Real App authentication is still NOT established.

Financial approval remains valid within its original USD 1 campaign/account
cap; none consumed by a new Modal compute/model operation. Existing Render
hosting continues and its exact invoice delta is not established. No real
UI candidate, independent live verification, repair Draft PR or new SAM
PostgreSQL replacement/no-replay result exists. The real UI source is untouched.

---
## Operator startup diagnostics and restoration — 2026-10-26 05:42 UTC

Financial authorization remains USD 1 for one bounded round; no Modal guest or
model call has started and the runtime/PG window remains unchanged.

Temporary Hermes TEST startup wrapper deployment dep-dbfeapcs728c73f4603g
failed before the preflight ran (exit 127): nested single quotes were treated
as command text. The exact original Docker Command was restored and deployment
dep-dbfedle7bikc73d7ppsg reached Live at 05:37:39 UTC on the SAME pinned image.

A quote-free Python argv wrapper, containing only the reviewed pinned driver
encoded as numeric bytes, then ran the finite operator preflight successfully.
Deployment dep-dbfeennb9u1s73ckoaug reached Live at 05:39:51 UTC.
Read-only output establishes root-only credential and prior ledger path
presence, zero guest creations/model calls, publisher still inactive.
The first observer reported SDK UNAVAILABLE/ModuleNotFoundError because the
venv executable existed before the normal launcher finished pip installation;
SAM_CODING_ROUTE_READY followed 14 seconds later. This is NOT evidence of bad
credentials or missing existing App.

The observer now waits for the pinned modal==1.6.2 import before its SINGLE
read-only lookup. Versioned private report preflight-v2.json preserves the
earlier evidence instead of overwriting it. Two synthetic local tests passed:
executable-before-import race, and completed-report replay after restart.
No real credential/network/Modal call was used in those tests.
Updated source SHA-256:
9b67862b68337eb4f0ef585f1ac7ae5f7cab33a97e74979f566494189879089a

Next: run the corrected finite observer, record actual authentication result,
then restore the original /bin/sh /opt/data/sam-hermes-start.sh Docker Command.
Do not leave a diagnostic wrapper configured. No existing gateway/policy/ledger
file was edited or reset. A transient gateway restart is not new SAM PostgreSQL
durability/no-replay acceptance. SAM source remains 93f37e5; no SAM deploy.

---
## New bounded round authorized; operator access preflight — 2026-10-26

The owner explicitly approved the proposed single round after the previous
checkpoint: maximum USD 1 usage within the existing account credit/cap, no cap
increase/payment method/subscription/paid model, at most six sequential guests,
one real UI task after gates, and a fresh window at most 60 minutes. Financial
authorization is recorded; it is NOT live isolation acceptance. The runtime
window and database deadline have not been opened or changed.

Fresh Modal usage-limit UI reconfirmed provider-set USD 1 account cap and
USD 1 credits. No cloud resource, model run or sandbox has been started.

The Render Web Shell for sam-isolated-test does not provide a working session:
it stays blank and shows Reconnecting. AX/type and a minimal pwd input did not
produce an executed command or output. No database read/write or secret output
occurred through that route. Do not repeat blind input attempts.

A reviewed finite operator-only alternative is prepared in
deploy/hermes-coding/read_only_host_preflight.py. Its SHA-256 is
1400e224d02e9d85b6cfe28341309a53e8a16e4e20450ebbf21cd3c053b2d53c.
It checks known root-only paths and the existing Modal SDK's read-only named-App
lookup, printing only sanitized metadata. It never creates an App/Sandbox,
runs a model/candidate, changes tools, refreshes a credential, touches PostgreSQL
or links the publisher vault. It waits for the normal existing launcher to
provide its previously pinned SDK, then terminates.

Planned temporary Hermes TEST service Docker Command wrapper downloads this
exact public source from a pinned reviewed commit, verifies its hash before
running it, then execs the ORIGINAL /bin/sh /opt/data/sam-hermes-start.sh.
Current pinned image stays unchanged. Original gateway launcher and policy
files are not edited. Restore the exact original Docker Command after this
operator preflight unless a separately reviewed round controller replaces it.
The source and restoration path are reviewable BEFORE changing service config.
This is trusted operator access, never a model-facing Terminal/GitHub tool.

At this checkpoint no service setting or deployment has yet changed. Actual
preflight output and any resulting deployment ID must be recorded separately.
No success, SDK authorization or persistent storage access is inferred yet.

---

## Stored credential metadata, identity adapter and financial boundary — 2026-10-26

The owner's short reply was interpreted as completion of saving the credential.
Read-only Render metadata confirms that the unlinked group now contains an
ENVIRONMENT VARIABLE named sam-github-publisher.pem, NOT a Secret File.
The value stays masked. Secret Files is still empty, and Linked Services still
explicitly says none. The engineer did not reveal/copy/export the value, rename
it, move it, delete it, or ask the owner to paste it again. Its contents and
validity are NOT yet established.

GitHub's Key pairs page now shows exactly one key pair, identifier 5033380,
added by borvat. The PUBLIC fingerprint shown there is:
SHA256:gKgrlZaOgk8D7goI6VIoF2gjAHQnazPU9tQChUIwOSA=
This is public identity evidence, not the private PEM. No key was downloaded,
read or printed by the engineer.

### New local implementation, unregistered and disabled

deploy/hermes-coding/publisher_identity.cjs:
- Reads the exact saved environment alias directly, without shell expansion;
  alternatively recognizes SAM_GITHUB_APP_PRIVATE_KEY and rejects conflicts.
- Does not inspect process.env at module load and refuses activation unless
  SAM_GITHUB_PUBLISHER_ENABLED is exactly 1. The saved operator flag remains 0.
- Parses only bounded RSA private PEM and compares its public DER/SPKI SHA-256
  fingerprint to the independently observed GitHub fingerprint.
- Creates short RS256 App JWTs with fixed App client identity and clock skew.
- Defines an installation-token request explicitly restricted to repository ID
  1408209483 and Contents/Pull requests write plus Metadata read.
- Rejects other App/installation/owner/slug identities, all-repository selection,
  suspension, extra permissions, extra repositories and invalid/expired lifetime.
- Does not expose installation tokens in public validation evidence.
- Contains NO network client, token minting, publisher dispatch, model runner,
  key transfer, general GITHUB_TOKEN fallback or production registration.

Ten new tests passed using freshly generated synthetic RSA material only:
node --test tests/isolated/hermes_publisher_identity.cjs
No real environment secret, file, Render API or GitHub credential is used by
those tests. This is additional local preparation, not successful live App
authentication. The preceding 32 local security tests were already accepted;
they were not all rerun in this resumption.

### Independent UI acceptance suite prepared

tests/isolated/hermes_real_ui_acceptance.cjs now tests five real-task behaviors:
immediate report loading, immediate evidence loading, selected-goal success,
failure display, and late success/failure rejection across A -> B selection.
It uses fake DOM/API state and forbids real fetch; no dependencies or secrets.
On the untouched source: 3 PASS, 2 FAIL (the two intended stale-display cases).
An engineer-authored SYNTHETIC verifier positive control in a temporary
directory passes 5/5. That control was removed with its temporary directory,
never written into the real UI or published as a repair, never attributed to
Hermes, and is not a live acceptance result. Original ui.ts still hashes to
Git blob 21d6d90babdbc6921075c0a2f2a050c9f9e8cf49.
Independent suite SHA-256:
54881bbb9bbd8f8dedc2ee537d3eddbebd1e7522989e26f46157a19584dc8a5c

### Modal account read-only observations

The signed-in Modal account is ceo-53153 on Starter. In environment main:
Containers All=0, Functions=0, Sandboxes=0; the page says no containers found.
The environment selector lists only main. This is a fresh UI observation, not
a historical cleanup assertion. No app/sandbox/function/image was started.

Usage & billing shows this cycle's spend rounded to $0.00, $1.00 included
credits, and a workspace Usage limit of $1 set by Modal. Raising the limit
offers Add payment method; that action was NOT taken. Do not claim the
marketing $30 as available: the actual account currently exposes $1 without
adding a payment method. The displayed rounded spend is not an exact invoice.

Official pricing rechecked:
Sandbox physical CPU USD 0.00003942/core-second and memory
USD 0.00000667/GiB-second. Six sequential guests, each capped at 0.5 physical
CPU + 1 GiB and 90 seconds, estimate USD 0.0142452 guest compute at list rate.
This excludes image preparation, region multipliers and other known extras;
it is NOT the proposed all-inclusive ceiling or an invoice.

The proposed new bounded round is recorded in
deploy/hermes-coding/real-ui-round-proposal.json. Its financialApproval and
newWindowAuthorized flags are FALSE. Proposed ceiling: USD 1 total new usage
for one campaign, while keeping the EXISTING USD 1 account-cycle outer cap;
never raise it, add payment details, buy credits, upgrade, use paid inference
or create a new paid host. Count gate/repair/retry guests together (maximum 6,
concurrency 1), only one real repair, no GPU/volumes/guest network/credentials.
Image/controller-death/current-runtime/transfer/publisher gates must pass;
otherwise stop before generated-code execution or publication.

A fresh explicit test window, at most 60 minutes, is proposed; no previous
window/role deadline was renewed. Current PostgreSQL role expiry has not been
read live through an internal authorized path. A filtered Render log read
returned historical storage-verification entries and did not establish current
deadline or permission for a new round. Do not infer one from prior acceptance.

### Current blocker / next step

The next resource-consuming step is preparing/verifying the immutable Node
guest and the expanded live gate. It requires a NEW fixed financial approval;
the previous USD 5 approval is not reusable. The new approval may cover the
bounded gate and one real UI task only after all prerequisites pass. It is not
permission for a paid model, subscription, wider PG grants, production rollout
or linking credentials to Hermes/candidate execution. Actual key validation,
scoped token authentication and trusted publisher registration remain unproven;
do not claim the real repair ready or complete.

No new billable operation was initiated in this resumption. Existing services,
deployment source, data, App grants, main rule and broad ChatGPT connection were
not changed. No secret content was accessed; the vault remains unlinked and the
publisher disabled. No real Hermes repair, independent live verification,
repair Draft PR or new container-restart proof exists yet.

Primary references read:
https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-json-web-token-jwt-for-a-github-app
https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/managing-private-keys-for-github-apps
https://docs.github.com/en/rest/apps/apps#create-an-installation-access-token-for-an-app
https://modal.com/pricing
https://modal.com/docs/guide/budgets

---

## Main protection verified; unlinked key vault prepared — 2026-10-26

The owner saved main protection. Fresh authorized branch metadata now reports
protected=true and protection.enabled=true. Read-only inspection of classic rule
85351486 confirms:
- branch pattern main, applying to exactly one branch;
- Require a pull request before merging: checked;
- Do not allow bypassing the above settings: checked (administrators included);
- Require approvals: unchecked;
- status checks, force pushes, deletions: unchecked.
The engineer did not save/change that rule or test it with a main write.
This supersedes all earlier UNPROTECTED snapshots below.

App 5475103 / installation 175336519 remains the independently verified dedicated
one-repository identity. GitHub's Key pairs page currently reports zero key pairs:
https://github.com/settings/apps/sam-bounded-publisher-borvat/key_pairs
Its New key action was NOT invoked. Client secrets are not required for the
installation-token signing flow and were not created.

Using the Render environment/secrets instructions and current official docs,
the engineer identified that saving Secret Files directly on a service can
trigger deployment. Instead, a new UNLINKED environment group was created in
Sam's workspace, with no compute/database/service resource:
- name: sam-bounded-publisher-vault
- ID: evg-dbfdofe7bikc73d58lf0
- URL: https://dashboard.render.com/env-group/evg-dbfdofe7bikc73d58lf0
- one non-secret operator flag: SAM_GITHUB_PUBLISHER_ENABLED=0
- Secret Files: zero (no key generated or saved yet)
- Linked Services: none (explicit UI confirmation)
The name/contents editor was inspected with a synthetic empty, unsaved entry,
then cancelled; no placeholder secret file was persisted.

Prepared owner action in their own browser:
1. In the App's Key pairs page, use New key and complete GitHub's key-generation
   flow. Keep the downloaded private PEM outside conversation/source control.
2. In the unlinked group, Add file; filename sam-github-publisher.pem.
   Open its Contents editor (View secret file), paste the complete PEM locally,
   choose Done and Save only. Do not link the group to any service.
3. Return only confirmation of saving, never the PEM/file/secret in chat.
This is a personal credential-generation/storage handoff, not permission to
activate a publisher or renew a test window. No signing material was viewed,
printed, copied, generated, downloaded or handled by the engineer.

After the owner saves it, inspect filename/count/linked-service metadata ONLY;
do not reveal content or use model-visible tooling to read the key. Validate
the key inside the reviewed trusted publisher at later authorized activation,
with sanitized public-key fingerprint evidence. No credential may enter Hermes
candidate code, Modal guests, logs, git, model prompts or customer services.

Latest Render deploys were re-read after group creation and are unchanged:
SAM dep-dbfcs1ss728c73euoid0 / 93f37e535ceafe7b9053afe96b083a2a12d607ba;
Hermes dep-dbfcm40473hc73cllb6g / pinned image ending ed63fb.
No new deploy/restart, model call, sandbox, paid operation, subscription, role
change or window renewal. Existing hosting charges are not a zero invoice.
Publisher remains disabled and unlinked; live UI repair and its Draft PR have
not started. Existing broader lifecycle/Node-image/transfer/publisher integration
gates and fresh fixed Modal financial approval remain required.

Reference read: https://render.com/docs/configure-environment-variables
Markdown fetch failed due unsupported content type; the official HTML reference
was read successfully. It confirms service Secret Files can trigger deployment,
and an environment group can exist independently of linked services.

---

## Dedicated App verified — 2026-10-26

The owner supplied App ID 5475103. Signed-in GitHub UI verification confirms:
- App: SAM-Bounded-Publisher-borvat, owned by borvat.
- App ID: 5475103; installation ID: 175336519.
- Installation settings: https://github.com/settings/installations/175336519
- Only select repositories is selected, exactly ONE repository:
  borvat/sam-greenfield (repository ID 1408209483).
- All repositories is unselected; Save is disabled (configuration is already saved).
- Effective installation permissions displayed: Metadata read; code/Contents
  and Pull requests read/write. No other granted permission appears in the
  installed-App summary.
- User OAuth during installation, Device Flow and Active Webhook are unchecked
  in the App general settings. No setting was edited.

This supersedes the earlier claim that a dedicated App could not be created:
the owner has created and installed it, and its identity/scope were independently
verified in the browser. It does NOT prove that a signing key or installation
token is stored, usable, or bound to a working trusted publisher.

Main protection was rechecked through the authorized branch API and Settings >
Branches. main remains protected=false, protection.enabled=false; no existing
classic rule is listed. The classic new-rule form is accessible. No rule was
saved, no main write attempted, and no bypass configured. A Contents-write
credential must not be represented as main-safe while that enforcement is absent.

No private key, client secret or installation token was generated, read, copied,
stored or sent to a guest. Do not ask the owner to paste one in conversation.
The private-key/vault step remains pending behind the main-protection gate.
Existing broad ChatGPT connection and all deployed services remain unchanged.

No new sandbox/model/dependency install/deploy/paid operation or clamp rerun.
Last reviewed implementation remains be43d40 (32 local tests passed in the
preceding resumption); this update records account state only.

Next owner-side prerequisite: save/enforce a main-only rule requiring PRs with
administrator bypass disabled, force pushes/deletion disabled and no dependency
on Actions checks; if GitHub reports that enforcement requires a paid plan,
stop before any upgrade/payment. Verify the effective rule by read-only API/UI.
Then prepare the separate trusted publisher/vault and only after that generate
signing material via a secure path. Scoped identity alone does not pass the
complete publication or live Modal gates.

---

## Publisher identity resumption — 2026-10-26

This read-only resumption starts from PR #67 source `be43d404d6cefb24e44944705a15ec839d5c20c2`; the PR is still draft/unmerged. No newer implementation commit existed at handoff.

### New authoritative finding: main is unprotected

GitHub's authorized repository branch GET returned:
- branch: main
- commit: `b55da2761e8fd1de3833be55f03d4fdd268cd0a3`
- protected: false
- protection.enabled: false
- required_status_checks.enforcement_level: off

The repository rulesets GET returned an empty list. The signed-in browser's repository Settings > Branches page also showed no existing classic rule, only controls for adding rules. This replaces the earlier UNKNOWN protection status. No main push, rule change, settings mutation or protection bypass was attempted.

A contents-write App/token by itself is not branch-restricted. Do not provision or accept an operational publisher that can write unprotected main and claim that repository scoping solves that problem. Before publishing, main-write prevention must be enforced and independently verified. The existing ChatGPT installation remains repository_selection=all and was not changed.

### Interactive identity path and exact personal blocker

The supported connector cannot create GitHub Apps or mint narrowly scoped credentials. The explicit user-authorized interactive fallback reached `https://github.com/settings/apps/new`, signed in as borvat. GitHub requires sudo-mode reauthentication before showing the new-App configuration. The only offered method was Verify via email.

That button was selected once. GitHub now says that it sent a verification code to the masked address c**@suroohholdings.com. The empty field is sudo_email_otp (text), followed by Verify. No code, password, token, private key or secret was read or entered by the engineer. The owner must complete the secure browserAuth credential form; never paste the code into conversation. No App, installation, token, key or access grant has been created.

Prepared minimum App scope: a separate dedicated App, only the owner's account, installation on borvat/sam-greenfield ONLY; Contents read/write and Pull requests read/write, implicit Metadata read, no Administration, Actions, Secrets, Deployments or workflow write. Disable unnecessary OAuth/webhook capabilities. Prefer short-lived installation credentials, private signing material in an approved existing secret vault, and a separate trusted publisher; neither Hermes code nor any Modal guest receives credentials. Final App creation/access grant must follow the browser's action-time confirmation requirement. Existing ChatGPT/GitHub connection must remain intact.

### Paired-file review and independent local verification

Remote blobs were fetched at the PR head and compared with the tested scratch files. Broker, worker, preflight, all tests and original ui.ts match exactly. Local installer/proxy differed only by one trailing newline; removing that newline in the hash comparison matches the remote blobs. Their remote source was reviewed, not changed.

The broker imports a fixed root-owned worker sibling (repository modal_worker.py; deployed sam-modal-coding-worker.py); it never imports a candidate path. It and the worker must be updated/restored as a reviewed pair. The proxy still exposes only the fixed local route and forwards authentication; the installer still checks root-only control/credential files and gives the gateway only the fixed proxy. Do not deploy a partial pair or run the installer before supply-chain/lifecycle checks.

Local results from the exact PR implementation:
- controller: 5/5 PASS
- independent broker/worker: 21/21 PASS
- unregistered real-project/publisher preflight: 6/6 PASS
- untouched UI reproduction: 1/1 FAIL, exposing the known stale-report bug
- no skipped or expected-failure tests; failures were not hidden
- no cloud SDK call, model call, candidate execution, dependency installation or live clamp rerun

G01–G04 regressions pass within their documented local scope. Receipt checks reject incomplete, mismatched or duplicate-stage evidence and nonzero worker exits; they are not a cryptographic proof against a compromised trusted controller. Original fixture records remain history, not authorization for a new execution. Mocked cleanup proves finally behavior on a harness failure, not cleanup after controller death; the previously documented orphan/reconciliation, image/SDK provenance and Node-profile integration gaps remain blockers.

Rollback preparation: retain the exact old broker/worker/proxy/installer bundle plus durable SQLite job state and original guest receipts; a code rollback must not reset job counts, overwrite receipts, renew a campaign, or rerun the accepted clamp. No rollback or deployment was performed.

### Services and cost

Render workspace was reconfirmed. SAM remains on live deploy `dep-dbfcs1ss728c73euoid0`, source `93f37e535ceafe7b9053afe96b083a2a12d607ba`, auto-deploy off. Hermes remains on live deploy `dep-dbfcm40473hc73cllb6g` and the same pinned image digest ending `ed63fb`. No service or environment variable was changed.

No new Sandbox, model call, subscription, upgrade, billable operation, database/network/role change, window renewal, Actions dispatch, main push or merge was initiated. Existing hosting continues; no current invoice total is claimed. Modal inventory and current private runtime/role state were not read live, so zero currently active Sandboxes is NOT independently established.

### Ten-item delivery snapshot

| Item | Result |
| --- | --- |
| One-repository identity created | NO: GitHub requires owner email reauthentication before the App form |
| main protection checked | YES: main is currently UNPROTECTED; publishing remains blocked |
| Broker review | Local four-fix review and 32 tests PASS; broader live gate remains blocked |
| Real task ready | Scope/reproduction ready; execution prerequisites incomplete |
| Hermes performed repair | NO |
| Independent live verification | NO |
| Real-repair Draft PR | NO; PR #67 remains safety preparation |
| New restart persistence proof | NO; local SQLite tests only, historical proof untouched |
| Temporary cleanup | No new cloud resource created; existing Modal inventory unknown |
| Cost/blockers | No new billable operation; owner reauthentication first, then main enforcement/scoped identity and existing live-gate prerequisites |

Resume from the existing GitHub App tab if its authentication flow is still valid. If the code expires, inspect GitHub's actual page and request a fresh code once; do not collect it in chat. After secure reauthentication, inspect the App form and prepare the precise grants. Keep publication disabled until main enforcement and actual repository scoping are verified. No financial approval is requested at this personal-authentication boundary; a later billable Modal round needs a separate fixed approval after account/cap/inventory checks.

---

# SAM × Hermes: real-project expansion gate — 2026-10-26

Status: BLOCKED BEFORE REAL-PROJECT MODIFICATION AND BILLABLE EXECUTION.
This checkpoint includes isolated broker hardening, independent audit tests and
an UNREGISTERED real-task/publisher preflight. No deployed configuration,
accepted records, production files, or selected UI source were changed. This is
engineer-authored safety preparation, not a Hermes-authored repair or rollout.
Baseline audit checkpoint: `80f61a62b19e322064e6b0b0ac302541a5a787de`.

## Verified read-only handoff

- PR #66 remains open/draft/unmerged, head `91da88a224eabb2e0a9701dd1ed462c7a0e69f2d`.
- PR #65 remains open/draft/unmerged, head `7d41234efa7ded30612cfc2e911df82cdf5e39e0`.
- The final coding acceptance report and PRIVATE fixture PR #1 were read. Fixture
  head is `34299bb683dee2f5e16bf0bec571f9158db0b599`. Their accepted historical
  clamp/46-assertion/one-attempt/container-replacement results were not rerun.
- Render workspace confirmed by listing: Sam's workspace, matching owner email.
- Latest SAM deploy record: `dep-dbfcs1ss728c73euoid0`, live, source
  `93f37e535ceafe7b9053afe96b083a2a12d607ba`. Auto-deploy is off.
- Latest Hermes deploy record: `dep-dbfcm40473hc73cllb6g`, live, pinned image
  `docker.io/nousresearch/hermes-agent@sha256:fd822bae0a61bf023450737edbeaeea5fc6460f17cb4ee240a7e67b306ed63fb`.
- Recent SAM logs confirm restricted storage checks, five PostgreSQL build groups
  and authenticated smoke checks from that source. This is historical startup
  evidence, not a fresh database query or a new restart experiment.
- `sam-trial-postgres` is available. Hosted read-only query was refused because
  external connections are blocked. No networking/roles/data/window were changed.
- The final acceptance checkpoint reports campaign disabled and no pending
  execution/deploy/model task/sandbox. Current root-only broker policy, actual
  role expiry, pending-work counts, model runs and Modal inventory were NOT
  independently read live in this session. They must be read through an approved
  private/internal path before future admission. No authority renewal is inferred.
- No AGENTS.md was present in the inspected repository tree.

## Independent no-cloud audit

Commands, from the repository root:

```text
python3 tests/isolated/hermes_coding_worker.py -v
python3 tests/isolated/hermes_broker_expansion_audit.py -v
node --test tests/isolated/hermes_real_ui_repro.cjs
python3 tests/isolated/hermes_real_project_policy.py -v
```

Baseline controller tests: 5 passed. At checkpoint `80f61a6`, the independent
broker/worker audit had 15 tests: 11 passed and 4 FAILED. Those failures were
the evidence for G01–G04 below, and remain reproducible at that checkpoint.
After isolated hardening: 5 controller tests + 21 independent broker/worker
tests + 6 offline real-task/publisher policy tests passed (32 total). The old
broker test's invalid payload was replaced with a valid constrained artifact;
closed admission remains separately tested with a valid request. No failure
was skipped, masked with expectedFailure, or relabeled as cloud acceptance.
UI task reproduction: 1 test, FAILED as expected on the untouched original UI.

The new audit mocks the Modal API and worker subprocess. Candidate code never
runs on the host; synthetic file names contain no actual secret. It exercises
real local SQLite persistence and module reconstruction, not Render restart.
Passing fake-SDK checks establish forwarded options and control flow only;
they do NOT establish cloud isolation or provider enforcement.

Passing checks include: closed admission; conflicting-replay refusal; durable
replay after broker module reconstruction; no second dispatch after a simulated
worker timeout; claimed-job reconciliation refusal; minimal worker environment;
worker denial of unapproved paths/imports/host effects/empty or oversized source;
three fresh fake guests with explicit network/secrets/mount/resource controls;
and guest termination after a harness failure.

| Baseline finding | Reproduction and consequence | Isolated remediation, not deployed |
| --- | --- | --- |
| G01: validation after durable claim | Broker dispatched a malformed `../.env` artifact to the worker and consumed its only slot. Worker separately rejected it; no path traversal or secret read is claimed. | Full artifact/source/size validation now precedes database creation and worker dispatch. Invalid syntax is also rejected. Regression passed. |
| G02: incomplete receipt accepted by broker | `{ok:true,receipt:{complete:false}}` was returned unchanged. Existing SAM checks were additional protection; no end-to-end false verification is claimed. | New worker receipts bind job/source/requested-test/immutable-test hashes, stage identity/source/test/output hashes, expected exit statuses, 46 assertions and cleanup. Altered hashes/stages, duplicate IDs and booleans masquerading as numeric counts are denied. A future real-task contract must additionally bind base and policy identity. |
| G03: child exit status ignored | Nonzero subprocess exit with success-shaped stdout was accepted. | Successful process exit plus a valid bounded receipt are required; failures remain durable and are not automatically replayed. Regression passed. |
| G04: stored result hidden by closed policy | Identical completed-result replay returned POLICY_CLOSED, without reexecution. | Existing-result lookup now precedes admission policy, retaining closed admission. Legacy complete receipts remain byte-equivalent JSON history without being accepted for a NEW job. Regression passed. |

The trusted broker imports validation from its fixed operator-owned worker sibling;
it never imports a payload path. Loading that module performs no Modal import or
candidate execution. No new library is installed. The original installer still
needs paired-file artifact/hash verification before any future rollout; current
deployed files were not replaced. Root-only ownership remains required.

Additional source-review concerns, not independently exploited:

- Controller timeout/kill can bypass its finally block. Local timeout test proves
  no retry but not cleanup after controller death. Provider lifetime bounds guest
  duration; current code has no durable external reaper/reconciliation proof for
  this failure path. Preserve sandbox IDs before work, mark uncertain cleanup,
  reconcile externally, and prove no orphan before admitting another job.
- The isolated worker now caps the requested lifetime by the integer remaining
  campaign seconds (and 90 seconds), and rejects an expired campaign before guest
  creation. Fake-SDK tests pass. This does not prove wall-clock expiry through
  provider provisioning delays, prompt revocation or controller death; live
  lifecycle/reconciliation proof is still required. No old window is renewed.
- Current image builder uses a Python version selector rather than a recorded
  immutable image identity. The installer pins Modal 1.6.2 but performs runtime
  pip resolution without a dependency hash lock. No dependency provenance or
  frozen Node execution profile has yet been accepted.
- Network blocking, empty guest secrets/mounts/OIDC, credential separation and
  non-root/resource limits are explicit in source and historically tested for
  clamp. None of these findings establishes an escape from that accepted run.
- The controller is deliberately hardcoded to one `clamp.py` and a 4,000-character
  source/test limit. It is unsuitable for the selected real UI without a new,
  independently tested language/file profile. Do not broaden it implicitly.

## Publisher gate

GitHub installation inspection returned `repository_selection: all` for the
existing connected identity. It is NOT a repository-limited publisher.
Available tools can publish files/branches/PRs but cannot mint a new narrowly
scoped installation token or inspect/reconfigure that token's grants.
No credential was requested, read, copied to a guest, or changed.

Repository rulesets endpoint returned an empty list; classic main protection
inspection returned HTTP 403 (integration lacks administration access). The
403 does not prove protection absent. Main-write prevention is unproven.
Do not test it by attempting to push to main, and do not alter protection.

Required separate identity: selected repository `borvat/sam-greenfield` ONLY,
minimum contents/PR write plus required metadata read, no administration,
workflow, deployment or secret permissions. Its trusted publisher must enforce
an immutable repository/base/file allowlist, a new prefixed branch, Draft PR only,
no merge or main write, credential removal before any candidate execution, and
durable idempotent publication receipts. Existing main protection must be
verified through an authorized read path. Reject a target outside that one repo.
Do not narrow the user's global connector or break other connected projects.
No repository-limited credential has been provisioned or accepted.

The broad user-authorized connector is used only to save this review checkpoint;
that administrative documentation write is NOT the future accepted-code publisher.
Commits use `[skip ci]`; no workflow dispatch, billing repair or Actions testing
is requested. Do not use Actions as validation for this work.

## Selected real task, prepared but NOT executed

Repository: `borvat/sam-greenfield`. Baseline:
`91da88a224eabb2e0a9701dd1ed462c7a0e69f2d`.
Only candidate-modifiable path: `apps/command-center/src/ui.ts`, Git blob
`21d6d90babdbc6921075c0a2f2a050c9f9e8cf49`.

Bug: `timeline(id)` changes the selected goal and shows loading in goalProgress,
but leaves finalReport and timeline populated with the previously selected
goal's report/evidence while the new request is pending. A slow or stalled
request therefore displays mismatched evidence. This is a presentation defect;
no execution, accounting, payments, inventory, auth or database change is needed.

Expected behavior: clear/replace both old report and raw evidence immediately on
selection; show loading until that selection resolves; retain the existing
request-generation check so late responses cannot overwrite a newer selection.
Keep success, error, report escaping, endpoints, permissions and goal execution
semantics unchanged. No CSS redesign or unrelated refactoring.

The independent local repro loads the actual template/script in a Node VM with
a fake DOM, empty fake session and a never-resolving synthetic API. Real fetch
throws if invoked. It confirms that the old report stays visible. This is not
a browser screenshot or Hermes execution. It makes no real HTTP/model call.

Prepared verification contract for a future immutable guest suite:
1. Reject the untouched baseline (wrong-control test).
2. Preload goal A report/evidence; selecting B immediately removes BOTH A panels.
3. B success displays B; B failure shows Unavailable and never A.
4. Resolve A after B and verify the existing stale-response guard still holds.
5. No API call/path/auth changes; no new file, import, network, install or external
   executable; existing escaping and report rendering remain intact.

The unregistered `deploy/hermes-coding/real_project_policy.py` now implements an
offline candidate/destination preflight. Six test groups check other repos,
main/merge/non-draft operations, extra authority, extra files, traversal, secret
and workflow paths, dependency/command/environment fields, altered baseline,
oversized or invalid encoding, unrelated source edits and executable insertion.
It only admits two static textContent loading assignments at the unique reviewed
location while preserving the exact original source. Its synthetic positive
control is never saved as a repaired source or attributed to Hermes. The
publisher preflight explicitly returns published=false and
credentialScopeVerified=false; it has no token, network or publishing code.
Baseline Git blob and SHA-256 were independently matched locally.

Remaining proposed transfer/runtime profile, NOT wired or live-approved:
exactly the pinned UI source
and immutable controller-owned tests; full source byte/hash checking; UTF-8 only;
32 KiB source, 16 KiB test and 64 KiB total caps. No repository checkout, git
metadata, environment files, lockfiles, package manifests, credentials, binary,
symlink or dependency sync. No runtime package download or install/lifecycle
script. A prebuilt immutable Node image with verified identity is required.
The offline patch guard preserves the entire baseline except explicitly bounded
loading-panel assignments at the reviewed selection point; do not admit general
JavaScript execution based only on filenames or VM confinement. Node VM is a
test harness, not an isolation boundary. Exercise adversarial changes before
opening the gate. Hermes must author the candidate after admission; no engineer
patch may be relabeled as Hermes output.

## Delivery status and restart point

| Acceptance item | This phase |
| --- | --- |
| Broker security audit passed for expansion | NO: G01–G04 fixed locally; lifecycle/provenance/integration live proof pending |
| Real-project file/dependency policy accepted | Offline bounded preflight and negative tests pass; no Node runtime/transfer/live admission accepted |
| Publisher credential restricted to one repo | NO: connected identity covers all; separate identity unavailable |
| Real defect selected/reproduced | YES: stale report/evidence while switching goals |
| Hermes performed the real repair | NO: not dispatched |
| SAM independently verified the real repair | NO |
| Real-repair Draft PR | NO; review checkpoint must not be reported as repair PR |
| New restart/persistence/no-repeat proof | NO; historical acceptance preserved, local SQLite reconstruction tested |
| Temporary resources closed | This phase created zero cloud/model resources; current Modal inventory not independently queried |
| Cost | No new billable operation initiated; existing Render hosting continues; current invoice not audited |

Do not reuse the prior USD 5 authorization. No paid model, DeepSeek, sandbox,
subscription, upgrade, window renewal, deployment, service change, database
change, Actions invocation, main push or merge was performed. No sub-agent or
parallel programmer was used.

Resume with the local G01–G04 hardening and offline profile already present; do
not redo them or represent them as deployed. Keep the real UI untouched.
The immediate external blocker is a separate one-repository publisher identity;
current tools cannot provision it or verify classic branch protection. Provision
it via a supported secure account
path and verify existing protection without changing it. Read current private
campaign/role/queue state via an authorized internal path. Only after those gates
and controller-death/image-provenance/real-profile integration gates pass,
request ONE new fixed financial approval with verified current account
caps and all-inclusive cost bounds; do not request payment merely to continue
this free preparation. Live gate -> SAM task -> free Nous candidate -> separate
immutable verification -> scoped publisher Draft PR -> persistence/readback ->
cleanup follows only after those prerequisites. Never replay the accepted clamp.
