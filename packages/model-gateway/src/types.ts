export type DataClassification = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";

export interface ModelTask {
  signal?:AbortSignal;
  /** Fail closed: only explicitly synthetic adapters with usage-limit support. */
  boundedSynthetic?: {
    maxInputTokens: number;
    maxOutputTokens: number;
    reserveAttempt(input:{providerId:string;model:string;tokens:number;costUsd:number}):Promise<void>;
  };
  task: string;
  capability: string;
  dataClassification: DataClassification;
  input: unknown;
  maxCostUsd?: number;
  preferredProviders?: string[];
  requiredModels?: string[];
}

export interface ProviderConfig {
  providerId: string;
  models: string[];
  capabilities: string[];
  privacyClasses: DataClassification[];
  health: "HEALTHY" | "DEGRADED" | "DOWN";
  costPer1kInput: number;
  costPer1kOutput: number;
}

export interface ModelUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface ProviderResult {
  output: unknown;
  model: string;
  modelVersion?: string;
  usage: ModelUsage;
}

export interface ModelProviderAdapter {
  providerId: string;
  executionMode?: "synthetic";
  supportsUsageLimits?: boolean;
  invoke(task: ModelTask, model: string): Promise<ProviderResult>;
}

export interface RouteCandidate {
  providerId: string;
  model: string;
  estimatedCostUsd: number;
  reason: string;
}
