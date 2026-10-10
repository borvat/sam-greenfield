import { loadVerifiedWorldModel } from "./worldModel";
import { loadApprovedMemory } from "./memory";
import { localDevelopment, assembleDevelopmentContext } from "../../development/src/planningPolicy";
import {pilotEnabled,pilotContext} from "../../production/src/syntheticPilotScope";

export async function assembleContext(
  client: any,
  entityType: string,
  entityId: string
) {
  if(pilotEnabled())return pilotContext(entityType,entityId);
  if (localDevelopment()) return assembleDevelopmentContext(client, entityType, entityId);
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
