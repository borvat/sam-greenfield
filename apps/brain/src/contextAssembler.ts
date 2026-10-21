import { loadVerifiedWorldModel } from "./worldModel";
import { recallKnowledge } from "./knowledge";
import { loadApprovedMemory } from "./memory";

export async function assembleContext(
  client: any,
  entityType: string,
  entityId: string,
  objective = ""
) {
  const [facts, memory, knowledge] = await Promise.all([
    loadVerifiedWorldModel(client, entityType, entityId),
    loadApprovedMemory(client,200,entityId),
    recallKnowledge(client,entityId,objective)
  ]);

  return {
    entity: { type: entityType, id: entityId },
    facts,
    memory,
    knowledge,
    assembled_at: new Date().toISOString()
  };
}
