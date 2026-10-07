import type { SpecialistAgentDefinition } from "./types";

export class SpecialistRegistry {
  private readonly agents = new Map<string, SpecialistAgentDefinition>();
  private readonly capabilityOwners = new Map<string, SpecialistAgentDefinition>();

  constructor(definitions: readonly SpecialistAgentDefinition[]) {
    for (const definition of definitions) {
      if (!definition.agentId.trim()) throw new Error("Specialist agentId is required");
      if (!definition.version.trim()) throw new Error(`Specialist ${definition.agentId} version is required`);
      if (definition.capabilities.length === 0) {
        throw new Error(`Specialist ${definition.agentId} requires at least one capability`);
      }
      if (this.agents.has(definition.agentId)) {
        throw new Error(`Duplicate specialist agentId: ${definition.agentId}`);
      }

      for (const capability of definition.capabilities) {
        if (!capability.trim()) throw new Error(`Empty capability on ${definition.agentId}`);
        const existing = this.capabilityOwners.get(capability);
        if (existing) {
          throw new Error(
            `Ambiguous specialist ownership for ${capability}: ${existing.agentId}, ${definition.agentId}`
          );
        }
        this.capabilityOwners.set(capability, definition);
      }

      this.agents.set(definition.agentId, definition);
    }
  }

  getAgent(agentId: string): SpecialistAgentDefinition {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Unknown specialist agent: ${agentId}`);
    return agent;
  }

  ownerOf(capabilityId: string): SpecialistAgentDefinition {
    const owner = this.capabilityOwners.get(capabilityId);
    if (!owner) throw new Error(`No specialist owns capability: ${capabilityId}`);
    return owner;
  }
}
