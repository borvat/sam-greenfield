import { McpServer } from "@modelcontextprotocol/server";
import type { ChatGPTToolRegistry } from "../../chatgpt-tools/src/registry";
import { chatGPTInputSchemaToZod } from "./schema";
import { localDevelopment } from "../../development/src/planningPolicy";

export function buildSamMcpServer(input:{
  surface:ChatGPTToolRegistry;
  actor:string;
  syntheticOnly?:boolean;
}):McpServer{
  const server=new McpServer({
    name:"sam-executive",
    version:"1.0.0"
  });
  const invoke=async(name:string,args:Record<string,unknown>)=>{
    const result=await input.surface.invoke(name,args,{actor:input.actor,systemOwner:true});
    const scope=input.syntheticOnly&&result.error==="MCP_SCOPE_REQUIRED_READ"?"sam:synthetic:read":
      input.syntheticOnly&&result.error==="MCP_SCOPE_REQUIRED_SUBMIT"?"sam:synthetic:submit":undefined;
    return {
      isError:!result.ok,
      ...(scope?{_meta:{"mcp/www_authenticate":`Bearer error="insufficient_scope", scope="${scope}"`}}:{}),
      content:[{type:"text" as const,text:JSON.stringify({
        ok:result.ok,data:result.data??null,error:result.error??null,unavailable:result.unavailable??false
      })}]
    };
  };

  for(const definition of input.surface.definitions()){
    if(definition.availability==="UNAVAILABLE") continue;

    server.registerTool(
      definition.name,
      {
        description:definition.description,
        ...(input.syntheticOnly?{_meta:{securitySchemes:[{type:"oauth2",
          scopes:[definition.risk==="READ"?"sam:synthetic:read":"sam:synthetic:submit"]}]}}:{}),
        inputSchema:chatGPTInputSchemaToZod(definition.inputSchema),
        annotations:{
          readOnlyHint:definition.risk==="READ",
          destructiveHint:definition.risk==="RED",
          idempotentHint:definition.risk==="READ"||Boolean(input.syntheticOnly)
        }
      },
      async(args)=>invoke(definition.name,(args??{}) as Record<string,unknown>)
    );
  }
  if(localDevelopment()||input.syntheticOnly){
    // The SDK's default unknown-tool error echoes the submitted name.
    // Route development calls through our static denials, including malformed
    // caller-supplied names. The two allowed handlers still reject all arguments.
    server.server.setRequestHandler("tools/call",async(request)=>
      invoke(request.params.name,request.params.arguments??{}));
  }

  return server;
}
