import type { ModelGateway } from "../../../packages/model-gateway/src/gateway";
import type { DataClassification } from "../../../packages/model-gateway/src/types";
import type { CapabilityExecutor } from "../../kernel/src/workerRuntime";
import { runBrainPlanningCycle } from "../../brain/src/executiveBrain";
import { runBrainReplanCycle } from "../../brain/src/replanner";
import type { CapabilityCatalog } from "./capabilityCatalog";
import { runSpecialistSupervisorTick } from "./supervisor";

export async function runCatalogPlanningCycle(input:{
  catalog:CapabilityCatalog;
  gateway:ModelGateway;
  goalId:string;
  dataClassification:DataClassification;
  maxCostUsd:number;
  preferredProviders?:string[];
}){
  return runBrainPlanningCycle({
    gateway:input.gateway,
    goalId:input.goalId,
    dataClassification:input.dataClassification,
    maxCostUsd:input.maxCostUsd,
    preferredProviders:input.preferredProviders,
    capabilityPolicies:input.catalog.authorityPolicies()
  });
}

export async function runCatalogReplanCycle(input:{
  catalog:CapabilityCatalog;
  gateway:ModelGateway;
  goalId:string;
  reason:string;
  dataClassification:DataClassification;
  maxCostUsd:number;
  preferredProviders?:string[];
}){
  return runBrainReplanCycle({
    gateway:input.gateway,
    goalId:input.goalId,
    reason:input.reason,
    dataClassification:input.dataClassification,
    maxCostUsd:input.maxCostUsd,
    preferredProviders:input.preferredProviders,
    capabilityPolicies:input.catalog.authorityPolicies()
  });
}

export async function runCatalogSpecialistTick(input:{
  catalog:CapabilityCatalog;
  workerInstanceId:string;
  ttlSeconds:number;
  executors:Record<string,CapabilityExecutor>;
}){
  return runSpecialistSupervisorTick(input);
}
