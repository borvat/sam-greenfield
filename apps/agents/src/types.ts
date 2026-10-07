export interface SpecialistAgentDefinition {
  agentId: string;
  version: string;
  capabilities: readonly string[];
}

export interface SpecialistAssignment {
  agentId: string;
  agentVersion: string;
  capabilityId: string;
}
