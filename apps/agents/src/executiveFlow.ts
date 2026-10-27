import type {PlanningCandidatePolicy} from '../../brain/src/planner';
import type { ModelGateway } from "../../../packages/model-gateway/src/gateway";
import type { DataClassification } from "../../../packages/model-gateway/src/types";
import type { CapabilityExecutor } from "../../kernel/src/workerRuntime";
import { runBrainPlanningCycle } from "../../brain/src/executiveBrain";
import { runBrainReplanCycle } from "../../brain/src/replanner";
import type { CapabilityCatalog } from "./capabilityCatalog";
import { runSpecialistSupervisorTick } from "./supervisor";

export async function runCatalogPlanningCycle(input:{
  alreadyModeling?:boolean;
  catalog:CapabilityCatalog;
  gateway:ModelGateway;
  goalId:string;
  dataClassification:DataClassification;
  maxCostUsd:number;
  signal?:AbortSignal;
  candidatePolicy?:PlanningCandidatePolicy;
  preferredProviders?:string[];
}){
  return runBrainPlanningCycle({
    alreadyModeling:input.alreadyModeling,
    gateway:input.gateway,
    goalId:input.goalId,
    dataClassification:input.dataClassification,
    maxCostUsd:input.maxCostUsd,
    signal:input.signal,candidatePolicy:input.candidatePolicy,preferredProviders:input.preferredProviders,
    capabilityPolicies:input.catalog.authorityPolicies()
    ,availableCapabilities:input.catalog.planningDescriptors()
  });
}

export async function runCatalogReplanCycle(input:{
  alreadyStarted?:boolean;
  catalog:CapabilityCatalog;
  gateway:ModelGateway;
  goalId:string;
  reason:string;
  dataClassification:DataClassification;
  maxCostUsd:number;
  signal?:AbortSignal;
  candidatePolicy?:PlanningCandidatePolicy;
  preferredProviders?:string[];
}){
  return runBrainReplanCycle({
    alreadyStarted:input.alreadyStarted,
    gateway:input.gateway,
    goalId:input.goalId,
    reason:input.reason,
    dataClassification:input.dataClassification,
    maxCostUsd:input.maxCostUsd,
    signal:input.signal,candidatePolicy:input.candidatePolicy,preferredProviders:input.preferredProviders,
    capabilityPolicies:input.catalog.authorityPolicies()
    ,availableCapabilities:input.catalog.planningDescriptors()
  });
}

export async function runCatalogSpecialistTick(input:{
  catalog:CapabilityCatalog;
  workerInstanceId:string;
  ttlSeconds:number;
  executors:Record<string,CapabilityExecutor>;
  maxConcurrency?:number;
  rootGoalId?:string;
  advancers?:Parameters<typeof runSpecialistSupervisorTick>[0]['advancers'];
}){
  return runSpecialistSupervisorTick(input);
}
