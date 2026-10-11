---
name: SAM interaction architecture
description: Owner's chosen surfaces and scope for the synthetic SAM pilot.
---

ChatGPT is SAM's only user-facing conversation surface, through the existing MCP
bridge. Keep the existing Greenfield runtime on Replit, Neon as the pilot database
and GitHub as the source. Do not build an independent app chat UI or a new agent.

**Why:** The owner explicitly selected this architecture and requested the minimum
safe integration rather than another dashboard or replacement implementation.

**How to apply:** Reuse ordinary goal intake, planner, worker and verifier. Keep
public access synthetic-only until a separate owner decision authorizes broader
data or actions; preserve internal/original SAM behavior outside the experiment.
Local preparation does not authorize external OAuth provisioning, Neon changes,
paid model calls or publishing.

The owner selected Auth0 Free for the ChatGPT OAuth authorization server, rather
than creating a new authentication system.

**Why:** The owner approved the established-provider route for a one-owner pilot.

**How to apply:** Keep provider provisioning and Neon credential/role changes
separately owner-gated. Approval for local OAuth compatibility preparation is not
approval to create an Auth0 account, connect Neon, Publish or spend.
