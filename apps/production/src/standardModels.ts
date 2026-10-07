import type { ProductionBundle } from "./types";
import { buildStandardModelProvidersFromEnv } from "../../../packages/model-providers/src/env";

export function withStandardModelProvidersFromEnv(
  bundle:ProductionBundle,
  env:NodeJS.ProcessEnv=process.env
):ProductionBundle{
  const standard=buildStandardModelProvidersFromEnv(env);
  return {
    ...bundle,
    modelAdapters:standard.adapters,
    modelProviderConfigs:standard.configs
  };
}
