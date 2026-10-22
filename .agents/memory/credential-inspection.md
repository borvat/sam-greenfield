---
name: Credential inspection
description: Prevent secret disclosure when inspecting settings misclassified as ordinary environment variables.
---

For credential-named keys, redact ordinary environment values as well as secrets.
Never log the raw environment-variable result while checking credential presence.
A false secret-existence flag does not mean a credential value is absent.

**Why:** A provider credential stored as an ordinary setting was returned in
plaintext during a presence check. Credential storage can also be a tracked
configuration entry rather than the secure secrets store.

**How to apply:** Inspect only presence flags and key names for credentials,
including values nested in environment groups. If a credential has appeared in
output or tracked configuration, require revocation and secure replacement before
using it. Verify configuration exposure with boolean checks without printing
matching lines or raw diffs, and do not copy credentials into patches or memory.
