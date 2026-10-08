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
