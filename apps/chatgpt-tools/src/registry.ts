import type {
  ChatGPTToolContext,
  ChatGPTToolDefinition,
  ChatGPTToolResult,
  RegisteredChatGPTTool
} from "./types";

export class ChatGPTToolRegistry{
  private readonly tools=new Map<string,RegisteredChatGPTTool>();

  constructor(items:readonly RegisteredChatGPTTool[]){
    for(const item of items){
      if(!item.definition.name.trim()) throw new Error("Tool name is required");
      if(this.tools.has(item.definition.name)){
        throw new Error(`Duplicate ChatGPT tool: ${item.definition.name}`);
      }
      this.tools.set(item.definition.name,item);
    }
  }

  definitions():ChatGPTToolDefinition[]{
    return [...this.tools.values()]
      .map((item)=>item.definition)
      .sort((a,b)=>a.name.localeCompare(b.name));
  }

  definition(name:string):ChatGPTToolDefinition{
    const tool=this.tools.get(name);
    if(!tool) throw new Error(`Unknown ChatGPT tool: ${name}`);
    return tool.definition;
  }

  async invoke(
    name:string,
    args:Record<string,unknown>,
    context:ChatGPTToolContext
  ):Promise<ChatGPTToolResult>{
    const tool=this.tools.get(name);
    if(!tool){
      return {ok:false,error:`Unknown ChatGPT tool: ${name}`};
    }
    if(!context.systemOwner){
      return {ok:false,error:"System-owner context is required"};
    }
    if(tool.definition.availability==="UNAVAILABLE"){
      return {
        ok:false,
        unavailable:true,
        error:`Tool ${name} is unavailable in the current production composition`
      };
    }
    return tool.handler(args,context);
  }
}
