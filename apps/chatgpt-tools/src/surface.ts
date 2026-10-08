import { createActionTools } from "./actionTools";
import { createCoreReadTools } from "./coreReadTools";
import { ChatGPTToolRegistry } from "./registry";
import type { ProductionActionDispatcher } from "./types";
import { localDevelopment, denyDevelopment } from "../../development/src/planningPolicy";
import { createDevelopmentReadSurface } from "../../development/src/readSurface";

export function createChatGPTToolSurface(input:{
  dispatcher?:ProductionActionDispatcher;
}={}):ChatGPTToolRegistry{
  if(localDevelopment()){
    if(input.dispatcher) denyDevelopment("ACTION_DISPATCHER_NOT_ALLOWED");
    return createDevelopmentReadSurface();
  }
  return new ChatGPTToolRegistry([
    ...createCoreReadTools(),
    ...createActionTools(input.dispatcher)
  ]);
}
