import type { CapabilityDefinition } from "../../agents/src/capabilityCatalog";
import type { DataClassification,ModelProviderAdapter } from "../../../packages/model-gateway/src/types";
import type { ToolAdapter,ToolDefinition } from "../../../packages/tool-gateway/src/types";
import type { VerificationResult } from "../../kernel/src/verification";

export interface VerificationAdapter{
  capabilityId:string;
  verify(input:{
    execution:{
      id:string;
      capabilityId:string;
      params:Record<string,unknown>;
      evidence:Record<string,unknown>;
      operationKeyRef:string|null;
    };
    contract:{
      id:string;
      method:string;
      requiredEvidenceFields:Record<string,unknown>;
      independentQueryTemplate:Record<string,unknown>;
    };
  }):Promise<{
    result:VerificationResult;
    evidence:Record<string,unknown>;
    verifier:string;
  }>;
}

export interface ProductionBundle{
  capabilities:CapabilityDefinition[];
  toolDefinitions:ToolDefinition[];
  toolAdapters:ToolAdapter[];
  modelAdapters?:ModelProviderAdapter[];
  verificationAdapters?:VerificationAdapter[];
  dataClassification?:DataClassification;
  planningMaxCostUsd?:number;
  workerLeaseTtlSeconds?:number;
}
