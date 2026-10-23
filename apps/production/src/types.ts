import type { CapabilityDefinition } from "../../agents/src/capabilityCatalog";
import type { DataClassification,ModelProviderAdapter,ProviderConfig } from "../../../packages/model-gateway/src/types";
import type { ToolAdapter,ToolDefinition } from "../../../packages/tool-gateway/src/types";
import type { VerificationResult } from "../../kernel/src/verification";
import type { ModelGateway } from "../../../packages/model-gateway/src/gateway";

export interface VerificationAdapter{
  capabilityId:string;
  verify(input:{
    execution:{
      id:string;
      capabilityId:string;
      params:Record<string,unknown>;
      result?:Record<string,unknown>;
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
  reviewEvidenceChars?:number;
  reviewInputAdmission?:(goalId:string,input:unknown)=>void;
  requireGoalObligations?:boolean;
  descendantEvidencePolicy?:import("../../brain/src/evidence/delegationScope").DelegationPolicy;
  /** Explicit composition only; no production registry is installed by default. */
  verifiedEvidenceContracts?:import("../../brain/src/evidence/contracts").OutputContracts;
  capabilities:CapabilityDefinition[];
  toolDefinitions:ToolDefinition[];
  toolAdapters:ToolAdapter[];
  modelAdapters?:ModelProviderAdapter[];
  modelProviderConfigs?:ProviderConfig[];
  verificationAdapters?:VerificationAdapter[];
  dataClassification?:DataClassification;
  planningMaxCostUsd?:number;
  workerLeaseTtlSeconds?:number;
  plannerGateway?:()=>ModelGateway;
  /** Explicit isolated evaluation composition; shared planning/review budget. */
  modelGatewayForGoal?:(goalId:string)=>ModelGateway;
  deferVerification?:boolean;
  replanPolicy?:{recoverableEvidenceReasons:string[]};
  verifiedLearning?:{
    capabilityIds:string[];
    project:(execution:{capabilityId:string;result:Record<string,unknown>})=>{attribute:string;value:unknown}[];
  };
}
