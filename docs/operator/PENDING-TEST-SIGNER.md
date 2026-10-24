# Pending signing identity for owner review

`scripts/evaluation/prepare-pending-signer.cjs` prepares a fresh Ed25519 key pair outside the repository. Input is one bounded JSON request on stdin with kind `SAM_PENDING_SIGNER_REQUEST`, a base commit, data scope `SYNTHETIC_READ_ONLY`, a positive cost ceiling no greater than USD 0.30, and a lifetime of at most 60 minutes. The new private directory and files are 0700/0600. Existing identities are never overwritten.

Output is a nonsecret fingerprint and scope record with `PENDING_OWNER_ATTESTATION`. The script does not create owner trust or a live permit, sign an approval, register the key, change the disabled release interlock, provision a database principal, load provider credentials, or spend money. A generated key is never described as an owner's existing private key or promoted from a fixture key.

Owner review must establish custody and approve the fingerprint and exact test scope before any operator uses it as an attested signer. The existing runtime additionally requires a reviewed activation release, exact signed trial/spec/commit/corpus/endpoint/prices/deadline, restricted database admission and durable budgets. A financial approval alone is not a cryptographic owner signature. Do not copy the private key into runtime, a hosted service, a repository, an approval file, logs, or a report; only signatures and public material may be delivered through an authorized route.

The scope's expiry is a proposal limit, not a self-enforcing permission. The trusted operator must enforce it, and every issued runtime approval remains bounded by the actual trial deadline and permit checks. Missing, expired, unapproved or mismatched identity/scope must stop issuance. No live run or readiness claim follows from preparing this file.
