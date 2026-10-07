# Phase 9 — Production Wiring + Kernel-backed Capability Dispatch

## Objective
Wire the production runtime without bypassing SAM's authority, queue, verification, reconciliation, or audit boundaries.

## Invariants
- No synthetic/test adapter may enter production wiring.
- A declared production capability must have a trusted tool definition and concrete adapter.
- ChatGPT sam_execute creates durable kernel work; it never calls an external provider directly.
- YELLOW/RED actions that lack approval enter WAITING_OWNER and create a pending approval request.
- Reconciliation uses the registered production ToolRegistry only.
- Autonomous planning runs only when real model adapters are registered.
- Independent verification runs only when a real verification adapter is registered.
- Missing production wiring means no action, never fake success.
- Existing Phase 0–8 invariants remain green.

## Runtime loop
1. Reconcile unresolved side effects.
2. Plan one NEW goal when a real ModelGateway is available.
3. Execute one claimed specialist work item.
4. Independently verify one execution when a matching verifier exists.
5. Leave unsupported work fail-closed and visible.

## Production bundle
A trusted production bundle supplies:
- CapabilityDefinition[]
- ToolDefinition[]
- ToolAdapter[]
- ModelProviderAdapter[]
- VerificationAdapter[]
- runtime defaults (classification, planning budget, worker lease TTL)

The repository now provides the wiring and safety boundary. Concrete provider/business adapters remain separate production modules.
