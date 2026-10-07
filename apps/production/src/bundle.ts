import { CapabilityCatalog } from "../../agents/src/capabilityCatalog";
import { ToolRegistry } from "../../../packages/tool-gateway/src/registry";
import type { ProductionBundle,VerificationAdapter } from "./types";

export interface ValidatedProductionBundle{
  raw:ProductionBundle;
  catalog:CapabilityCatalog;
  tools:ToolRegistry;
  verifiers:Map<string,VerificationAdapter>;
}

export function validateProductionBundle(bundle:ProductionBundle):ValidatedProductionBundle{
  if(!Array.isArray(bundle.capabilities)||bundle.capabilities.length===0){
    throw new Error("Production bundle requires at least one real capability");
  }

  const catalog=new CapabilityCatalog(bundle.capabilities);
  const tools=new ToolRegistry(bundle.toolDefinitions,bundle.toolAdapters);
  const adapterIds=new Set(bundle.toolAdapters.map((a)=>a.capabilityId));
  const definitionIds=new Set(bundle.toolDefinitions.map((d)=>d.capabilityId));

  for(const capability of bundle.capabilities){
    if(!definitionIds.has(capability.capabilityId)){
      throw new Error(`Production capability has no trusted tool definition: ${capability.capabilityId}`);
    }
    if(!adapterIds.has(capability.capabilityId)){
      throw new Error(`Production capability has no concrete adapter: ${capability.capabilityId}`);
    }
    const tool=tools.definition(capability.capabilityId);
    if(tool.authorityClass!==capability.authorityClass){
      throw new Error(
        `Authority mismatch for ${capability.capabilityId}: catalog=${capability.authorityClass} tool=${tool.authorityClass}`
      );
    }
  }

  for(const adapter of bundle.toolAdapters){
    if(!catalog.authorityPolicies()[adapter.capabilityId]){
      throw new Error(`Tool adapter is not owned by a production capability: ${adapter.capabilityId}`);
    }
  }

  const verifiers=new Map<string,VerificationAdapter>();
  for(const verifier of bundle.verificationAdapters??[]){
    if(verifiers.has(verifier.capabilityId)){
      throw new Error(`Duplicate verification adapter: ${verifier.capabilityId}`);
    }
    if(!catalog.authorityPolicies()[verifier.capabilityId]){
      throw new Error(`Verifier has no production capability: ${verifier.capabilityId}`);
    }
    verifiers.set(verifier.capabilityId,verifier);
  }

  return {raw:bundle,catalog,tools,verifiers};
}
