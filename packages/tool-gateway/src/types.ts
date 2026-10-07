import type { AuthorityClass } from "../../shared/src/types";

export interface ToolDefinition {
  capabilityId:string;
  authorityClass:AuthorityClass;
  sideEffect:boolean;
}

export interface ToolExecutionRequest {
  capabilityId:string;
  params:Record<string,unknown>;
  idempotencyKey:string;
}

export interface ToolExecutionResult {
  providerReference?:string;
  result:Record<string,unknown>;
  evidence:Record<string,unknown>;
}

export interface ToolAdapter {
  capabilityId:string;
  execute(request:ToolExecutionRequest):Promise<ToolExecutionResult>;
}

export interface ToolReconciliationResult {
  result:"CONFIRMED"|"FAILED"|"NOT_FOUND";
  evidence:Record<string,unknown>;
}

export interface ReconciliableToolAdapter extends ToolAdapter {
  reconcile(input:{
    capabilityId:string;
    providerReference:string|null;
    idempotencyKey:string;
  }):Promise<ToolReconciliationResult>;
}
