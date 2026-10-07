import type { ToolAdapter,ToolDefinition } from "./types";

export class ToolRegistry {
  private readonly defs=new Map<string,ToolDefinition>();
  private readonly adapters=new Map<string,ToolAdapter>();

  constructor(definitions:readonly ToolDefinition[],adapters:readonly ToolAdapter[]){
    for(const def of definitions){
      if(this.defs.has(def.capabilityId)) throw new Error(`Duplicate tool definition: ${def.capabilityId}`);
      this.defs.set(def.capabilityId,def);
    }
    for(const adapter of adapters){
      if(this.adapters.has(adapter.capabilityId)) throw new Error(`Duplicate tool adapter: ${adapter.capabilityId}`);
      if(!this.defs.has(adapter.capabilityId)) throw new Error(`Adapter has no trusted tool definition: ${adapter.capabilityId}`);
      this.adapters.set(adapter.capabilityId,adapter);
    }
  }

  definition(capabilityId:string):ToolDefinition{
    const def=this.defs.get(capabilityId);
    if(!def) throw new Error(`Unknown tool capability: ${capabilityId}`);
    return def;
  }

  adapter(capabilityId:string):ToolAdapter{
    const adapter=this.adapters.get(capabilityId);
    if(!adapter) throw new Error(`No tool adapter configured: ${capabilityId}`);
    return adapter;
  }
}
