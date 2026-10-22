---
name: SAM interaction architecture
description: Owner's chosen surfaces and scope for the synthetic SAM pilot.
---

ChatGPT is SAM's only user-facing conversation surface, through the existing MCP
bridge. Keep the existing Greenfield runtime on Replit and GitHub as the source.
The owner now prioritizes Replit-managed PostgreSQL if safely compatible, instead
of requiring Neon. Do not build an independent app chat UI or a new agent.

**Why:** The owner explicitly selected this architecture and requested the minimum
safe integration rather than another dashboard or replacement implementation.

**How to apply:** Reuse ordinary goal intake, planner, worker and verifier. Keep
public access synthetic-only until a separate owner decision authorizes broader
data or actions; preserve internal/original SAM behavior outside the experiment.
Local preparation does not authorize external OAuth provisioning, Neon changes,
paid model calls or publishing.

The owner's ChatGPT custom-MCP admin flow requires standard OAuth discovery and
does not accept manual authorization/token endpoint configuration.

**Why:** The owner encountered an explicit discovery-required error in that UI.

**How to apply:** Repair public resource discovery and link the real Auth0 issuer;
do not tell the owner to bypass discovery with a bearer or manual-endpoint setup.
Publishing metadata alone does not authorize SAM tools, database access or workers.

The owner selected Auth0 Free for the ChatGPT OAuth authorization server, rather
than creating a new authentication system.

**Why:** The owner approved the established-provider route for a one-owner pilot.

**How to apply:** Keep provider provisioning and Neon credential/role changes
separately owner-gated. Approval for local OAuth compatibility preparation is not
approval to create an Auth0 account, connect Neon, Publish or spend.

«رابط MCP واحد، ربط واحد داخل ChatGPT، وسام التنفيذي يشتغل بأدواته وصلاحياته
الحقيقية. بدون لوحات محادثة جديدة، وبدون تحميلك تفاصيل التنفيذ».
الاتصال التشخيصي المحدود ليس سام الكامل ولا معيار قبول للنتيجة النهائية.

**Why:** The owner explicitly rejected adopting the diagnostic connection as
full SAM, while allowing the already-running local preparation to finish.

**How to apply:** Keep optional diagnostics disabled unless separately approved;
do not ask the owner to adopt them as the final integration. Final acceptance
requires the authenticated existing executive and actual permitted goal flow,
without treating this direction as approval for paid resources or company access.
