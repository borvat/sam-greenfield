# Phase 19 — Executive Command Center

## Objective
Expose a secure owner-facing control surface over SAM so the owner can create executive goals and observe the Golden Chain without touching the database or code.

## Surface
- GET /livez
- GET /api/overview
- GET /api/goals
- GET /api/goals/:id/timeline
- GET /api/finance/latest
- POST /api/goals
- GET / serves the owner dashboard

## Security
- Production requires SAM_COMMAND_CENTER_BEARER_TOKEN.
- Production requires SAM_COMMAND_CENTER_ALLOWED_HOSTS.
- Production requires SAM_COMMAND_CENTER_LEGAL_ENTITY_ID.
- The legal entity is deployment configuration; it cannot be supplied by browser arguments.
- All goal, approval, queue, side-effect and finance queries are scoped to that legal entity.
- Owner goal creation supports GREEN or YELLOW authority ceilings only. RED cannot be created from this surface.
- This phase does not add an approval/execute button for external side effects.

## Golden Chain intent
An owner-created goal is persisted in NEW state. The existing production planner/runtime is responsible for:
NEW → MODELING → PLANNING → work → execution → verification → continuation/completion.

The Command Center observes that chain; it does not bypass it.
