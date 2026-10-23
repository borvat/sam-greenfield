import {standardContract} from './standardContracts';
import type { AuthorityClass } from "../../../packages/shared/src/types";
import type { SpecialistAgentDefinition } from "./types";
import { SpecialistRegistry } from "./registry";

export interface CapabilityOutputMetadata {
  schemaStatus:'DECLARED'|'UNKNOWN';
  schema?:Record<string,unknown>;
  units:Record<string,string>;
  timeSemantics:string;
  coverageSemantics:string;
  limitations:string[];
}
export interface CapabilityDefinition {
  capabilityId: string;
  authorityClass: AuthorityClass;
  specialistAgentId: string;
  specialistVersion: string;
  description?: string;
  parameters?: Record<string,unknown>;
  sideEffect?: boolean;
  companyScopes?: string[];
  output?:CapabilityOutputMetadata;
}

export class CapabilityCatalog {
  private readonly definitions = new Map<string, CapabilityDefinition>();
  readonly specialists: SpecialistRegistry;

  constructor(items: readonly CapabilityDefinition[]) {
    const byAgent = new Map<string, { version: string; capabilities: string[] }>();

    for (const raw of items) {
      const item=standardContract(raw);
      if (!item.capabilityId.trim()) throw new Error("capabilityId is required");
      if (!item.specialistAgentId.trim()) throw new Error(`specialistAgentId is required for ${item.capabilityId}`);
      if (!item.specialistVersion.trim()) throw new Error(`specialistVersion is required for ${item.capabilityId}`);
      if (this.definitions.has(item.capabilityId)) {
        throw new Error(`Duplicate capability definition: ${item.capabilityId}`);
      }
      this.definitions.set(item.capabilityId,item);

      const existing = byAgent.get(item.specialistAgentId);
      if (existing && existing.version !== item.specialistVersion) {
        throw new Error(
          `Conflicting specialist versions for ${item.specialistAgentId}: ${existing.version}, ${item.specialistVersion}`
        );
      }
      const group = existing ?? {version:item.specialistVersion,capabilities:[]};
      group.capabilities.push(item.capabilityId);
      byAgent.set(item.specialistAgentId,group);
    }

    const specialists: SpecialistAgentDefinition[] = [...byAgent.entries()].map(
      ([agentId,entry])=>({
        agentId,
        version:entry.version,
        capabilities:entry.capabilities
      })
    );
    this.specialists = new SpecialistRegistry(specialists);
  }

  get(capabilityId:string): CapabilityDefinition {
    const item=this.definitions.get(capabilityId);
    if(!item) throw new Error(`Unknown capability: ${capabilityId}`);
    return item;
  }

  authorityPolicies(): Record<string,AuthorityClass> {
    const policies:Record<string,AuthorityClass>={};
    for(const item of this.definitions.values()){
      policies[item.capabilityId]=item.authorityClass;
    }
    return policies;
  }

  planningDescriptors(){
    return [...this.definitions.values()].map(item=>({
      capabilityId:item.capabilityId,authorityClass:item.authorityClass,
      description:item.description??item.capabilityId,parameters:item.parameters??{},
      output:item.output??{schemaStatus:'UNKNOWN',units:{},timeSemantics:'UNKNOWN',coverageSemantics:'UNKNOWN',limitations:['Output fields and completeness are not declared; inspect verified evidence before composing dependent operations']},
      ...(item.sideEffect===undefined?{}:{sideEffect:item.sideEffect}),
      ...(item.companyScopes===undefined?{}:{companyScopes:item.companyScopes})
    }));
  }
}
