---
name: One-shot inference evidence
description: Preserve diagnostic evidence without widening the authorization for a single paid model request.
---

Before consuming a one-request approval, ensure original SAM validation and stricter
synthetic-test validation have separately recorded outcomes. Retain only bounded,
redacted diagnostic fields, not provider error bodies or unrestricted output.

**Why:** A live synthetic response reached combined validation but its rejection
reason was not retained. Once the disposable environment and response were gone,
identifying the rejecting check would have required another unauthorized inference.
Do not claim a specific validator rejected a response when only a combined failure
was captured.

**How to apply:** Record each stage before proceeding, retain a durable one-shot
claim through failures/timeouts, and report unknown diagnostics honestly. Do not
loosen the test contract or retry a provider call merely to produce a passing result.
