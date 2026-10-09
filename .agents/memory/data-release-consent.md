---
name: Data release consent
description: Read-only access and permission to disclose SAM data are separate decisions.
---

Treat permission to read SAM as separate from permission to disclose its records to
a model or assistant. Do not infer data-release consent from a read-only annotation,
a successful bearer check, or system-owner access.

**Why:** The owner explicitly restricted the development assistant proposal to
service health and sanitized test results, not automatic access to users, memory,
legal/financial documents, or other entities. The original owner read surface was
broader than this intended disclosure boundary.

**How to apply:** Before widening a development integration, obtain an explicit
decision about data categories, entities, fields and recipient. Preserve original
SAM behavior outside the development experiment; do not make a broad production
authorization refactor to satisfy a narrower local data-release requirement.

Adding a managed Google connection does not authorize account-wide enumeration,
document content, writes, or forwarding retrieved data to a model. The development
read proof is restricted to an explicitly selected non-company resource and
approved operations; do not treat its completion as permission for another resource.

**Why:** The owner initially approved a personal, non-company metadata-only read,
then separately authorized text from the dedicated test document with an
independently supplied known line. Neither approval authorized model disclosure
or other resources. Narrow application behavior and narrow OAuth grants are
different guarantees.

**How to apply:** Keep the resource/field/method boundary independent of connection
attachment. When model disclosure is not approved, an owner-declared plan can use
the original validation, authority, persistence and worker paths; label it honestly
as owner-planned, not model-planned. Local fixtures remain separate from live proof.

Validate known content against an independently supplied owner reference, not a
reference learned from the first response. A second matching content fingerprint
proves consistency between reads, not correctness against a previously known value.

**Why:** The owner required both a known-text check and independent live readback,
not merely a successful export or two equal responses.

**How to apply:** Bind the resource and expected reference to immutable development
controls, perform fresh readback, and retain only safe fingerprints/counts in
reports. Do not make retrieved text model context or log raw document content.
