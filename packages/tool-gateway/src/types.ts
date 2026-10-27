import type { AuthorityClass } from "../../shared/src/types";

export interface ToolDefinition {
  capabilityId:string;
  authorityClass:AuthorityClass;
  sideEffect:boolean;
  description?:string;
  inputSchema?:Record<string,unknown>;
  /** Operator-reviewed per-attempt ceiling; required by bounded specialist profile. */
  costUpperBoundUsd?:number;
  companyScopes?:string[];
}

export interface ToolExecutionRequest {
  capabilityId:string;
  params:Record<string,unknown>;
  idempotencyKey:string;
  /** SAM-owned lease identity; never accepted in capability parameters. */
  executionContext?:{queueId:string;fencingToken:number};
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
