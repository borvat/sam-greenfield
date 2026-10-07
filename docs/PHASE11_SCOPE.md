# Phase 11 — Real Model Provider Adapters

## Objective
Replace Phase 2's test-only model-provider adapters with real production HTTP adapters for the five approved model families while preserving ModelGateway routing, budget, privacy, fallback, and audit boundaries.

## Providers
- OpenAI Responses API
- Anthropic Messages API
- Google Gemini generateContent
- DeepSeek OpenAI-compatible Chat Completions API
- Qwen / Alibaba Model Studio OpenAI-compatible Chat API

## Invariants
- API keys are read only from environment variables.
- No key or Authorization header is logged or returned in model output.
- Model IDs are deployment configuration, not hard-coded business logic.
- Provider HTTP failures fail normally and remain auditable through ModelGateway.
- Provider responses are converted into the existing ProviderResult contract.
- JSON-looking model output is parsed to objects; plain text remains text.
- Production startup syncs only explicitly configured provider metadata into model_providers.
- Missing provider credentials mean that provider is absent, not fake.
- No synthetic adapter is ever included by the production environment factory.

## Required production configuration
Each enabled provider requires its API key and model name.
Qwen additionally requires an explicit compatible-mode base URL because the Alibaba endpoint can be workspace/region-specific.

Costs and allowed privacy classes are configurable per provider.
