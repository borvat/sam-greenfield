# Anonymous free model providers

Scope: add the three actually contacted models as opt-in providers in SAM's
existing model factory. No new service, dependency, key, database migration,
Hermes setting or ordinary planning selection is introduced.

| Provider | Models | Initial health |
| --- | --- | --- |
| ovh-free | Qwen3.5-397B-A17B; Qwen3.5-9B | HEALTHY |
| kilo-free | liquid/lfm-2.5-2.6b:free | DEGRADED |

`HEALTHY` records the observed anonymous endpoint response, not a production SLA.
Kilo's first live tool call cost was reported as zero. Its continuation returned
429 from the shared upstream pool, including the one retry. It is not preferred.
OVH 9B completed the synthetic tool-result round trip. OVH 397B produced the
correct tool call in 7.157 seconds; this is not an end-to-end SAM goal result.
No company/customer data was sent in those checks.

## Enable in a prepared deployment

Both flags default to off:

```dotenv
SAM_FREE_OVH_ENABLED=1
SAM_FREE_KILO_ENABLED=1
```

The normal factory retains every existing provider. Free providers advertise
only `public_free`, with PUBLIC data only. They do not enter ordinary `planning`
or the fixed Hermes analyst model path. Neither endpoint receives an API key.
Models and HTTPS endpoints are fixed to the tested allowlist; no custom host,
paid model, credential, redirect or paid-model auto-router is accepted.

An explicitly selected task uses the EXISTING ModelGateway contract:

```ts
const task = {
  task: "public_text",
  capability: "public_free",
  dataClassification: "PUBLIC" as const,
  allowedProviders: ["ovh-free", "kilo-free"],
  maxCostUsd: 0,
  input: {objective: "Synthetic, public task only"}
};
```

`allowedProviders` is a hard router filter; `preferredProviders` remains only a
preference. An empty allowlist permits none. Every anonymous adapter also
requires an explicit free-only allowlist, even for direct invocation. Thus this
task cannot fall through to an existing paid provider, including one with zero
cost metadata. Failure remains an auditable failure. This adds a provider path,
not a new ChatGPT tool or permission to forward company context.

Local calls are spaced by 31 seconds per OVH model and 19 seconds per Kilo
model; wait + request is bounded to 60 seconds and cancellation is propagated.
This per-process pacing does not reserve shared-IP/provider capacity across
replicas. Upstream 429 still fails normally, without an adapter resend.
Requests cap output at 2048 tokens and input at 32768 characters. Unexpected
served models, truncation, malformed usage and reported nonzero cost fail.
The small model's later adapter probe exhausted this bounded response contract
and was rejected, although its earlier direct tool round trip succeeded. An
experiment with Qwen's documented `chat_template_kwargs` non-thinking parameter
was rejected by OVH's gateway with HTTP 400; that parameter was REMOVED, not
shipped or silently retried. Only the large model currently has a successful
live probe through this exact adapter. Do not advertise equal readiness.

## Live activation boundary

Implementation is based on the restored live baseline `8ebbe5a`, on
`deploy/sam-free-trial-ready`; no intake repair is bundled into this change.
The initial source inspection also covered delivery `f0bb27b`. Production registry sync is
read/validate-only and throws `MODEL_REGISTRY_PROVISIONING_REQUIRED` for a new
row. Enabling either flag before the matching registry metadata is provisioned
will intentionally prevent startup. Do not enable a flag just to display models.
Use the existing operator metadata registration path, then deploy reviewed code
and opt in; do not weaken RLS, add grants, or change the startup guard.
The intake/Hermes window, existing contract and free Nous model remain separate.

Official references:
- https://www.ovhcloud.com/asia/public-cloud/ai-endpoints/catalog/qwen-3-5-397b/
- https://kilo.ai/docs/gateway/authentication
- https://github.com/mnfst/awesome-free-llm-apis
- https://huggingface.co/Qwen/Qwen3.5-9B#instruct-or-non-thinking-mode

## Verification

`node --import tsx --test tests/phase11/anonymous_free.ts`

These are local transport-fixture and routing checks. Run the actual adapters
separately with PUBLIC synthetic input for live evidence; no production DB or
SAM goal is needed. A passing adapter probe is not deployed availability.

Latest local evidence: 10 targeted fixture/routing tests pass, zero failures or
skips. Existing provider-auth regression passes for HTTP 401/403/429/503, one
request each; final full TypeScript check passes. The same checks are repeated
on the restored live baseline before publication, since its tree differs from
the initially inspected intake delivery.

Actual adapter probe: `ovh-free` / `Qwen3.5-397B-A17B` returned exactly
`{"probe":"sam-free-provider","answer":42}` in 16886ms; usage 82 input and
1681 output tokens; response `chatcmpl-855e68d5d26761dc`. No key was supplied.
The matching small-model request failed closed (`FREE_PROVIDER_RESPONSE_REJECTED`,
53432ms), and Kilo returned a redacted `PROVIDER_RATE_LIMITED: HTTP 429` in
6073ms. The three-model probe correctly exited 1 overall, not a false all-green.

Read-only Render evidence: at the first check both services were live on
`f0bb27b`, automatic deployment off. During browser inspection an independent
rollback was visibly building to `8ebbe5a`; the runtime rollback then became live
as `dep-dbg0j859fdbs73cdifag`. This task did not trigger it or modify any service.
Live free-provider activation is held to avoid overwriting this concurrent work.
