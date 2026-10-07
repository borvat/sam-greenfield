import { createActionTools } from "./actionTools";
import { createCoreReadTools } from "./coreReadTools";
import { ChatGPTToolRegistry } from "./registry";
import type { ProductionActionDispatcher } from "./types";

export function createChatGPTToolSurface(input:{
  dispatcher?:ProductionActionDispatcher;
}={}):ChatGPTToolRegistry{
  return new ChatGPTToolRegistry([
    ...createCoreReadTools(),
    ...createActionTools(input.dispatcher)
  ]);
}
