import { createActionTools } from "./actionTools";
import { createCoreReadTools } from "./coreReadTools";
import { ChatGPTToolRegistry } from "./registry";
import type { ProductionActionDispatcher,RegisteredChatGPTTool } from "./types";

export function createChatGPTToolSurface(input:{
  dispatcher?:ProductionActionDispatcher;
  additionalTools?:RegisteredChatGPTTool[];
}={}):ChatGPTToolRegistry{
  return new ChatGPTToolRegistry([
    ...(input.additionalTools??[]),
    ...createCoreReadTools(),
    ...createActionTools(input.dispatcher)
  ]);
}
