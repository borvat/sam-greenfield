export type ToolAvailability="AVAILABLE"|"READ_ONLY"|"UNAVAILABLE";
export type ToolRisk="READ"|"GREEN"|"YELLOW"|"RED";

export interface ChatGPTToolContext{
  actor:string;
  systemOwner:boolean;
}

export interface ChatGPTToolDefinition{
  name:string;
  description:string;
  risk:ToolRisk;
  availability:ToolAvailability;
  inputSchema:Record<string,unknown>;
}

export interface ChatGPTToolResult{
  ok:boolean;
  data?:unknown;
  error?:string;
  unavailable?:boolean;
}

export type ChatGPTToolHandler=(args:Record<string,unknown>,context:ChatGPTToolContext)=>Promise<ChatGPTToolResult>;

export interface RegisteredChatGPTTool{
  definition:ChatGPTToolDefinition;
  handler:ChatGPTToolHandler;
}

export interface ProductionCapabilityDescriptor{
  capabilityId:string;
  authorityClass:"GREEN"|"YELLOW"|"RED";
  specialistAgentId:string;
  specialistVersion:string;
  availability:ToolAvailability;
  sideEffect:boolean;
  description?:string;
  inputSchema?:Record<string,unknown>;
}

export interface ProductionActionDispatcher{
  manifest():ProductionCapabilityDescriptor[];
  canPlanGoals?():boolean;
  submitGoal?(input:{
    objective:string;
    legalEntityId:string;
    actor:string;
  }):Promise<unknown>;
  execute(input:{
    capabilityId:string;
    params:Record<string,unknown>;
    actor:string;
    legalEntityId?:string;
    objective?:string;
  }):Promise<unknown>;
  reconcile?(input:{
    operationKey?:string;
    limit?:number;
    actor:string;
  }):Promise<unknown>;
}
