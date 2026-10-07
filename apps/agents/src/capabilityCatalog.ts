import type { AuthorityClass } from "../../../packages/shared/src/types";
import type { SpecialistAgentDefinition } from "./types";
import { SpecialistRegistry } from "./registry";

export interface CapabilityDefinition {
  capabilityId: string;
  authorityClass: AuthorityClass;
  specialistAgentId: string;
  specialistVersion: string;
}

export class CapabilityCatalog {
  private readonly definitions = new Map<string, CapabilityDefinition>();
  readonly specialists: SpecialistRegistry;

  constructor(items: readonly CapabilityDefinition[]) {
    const byAgent = new Map<string, { version: string; capabilities: string[] }>();

    for (const item of items) {
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
}
