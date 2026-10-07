import { loadVerifiedWorldModel } from "./worldModel";
import { loadApprovedMemory } from "./memory";

export async function assembleContext(
  client: any,
  entityType: string,
  entityId: string
) {
  const [facts, memory] = await Promise.all([
    loadVerifiedWorldModel(client, entityType, entityId),
    loadApprovedMemory(client)
  ]);

  return {
    entity: { type: entityType, id: entityId },
    facts,
    memory,
    assembled_at: new Date().toISOString()
  };
}
