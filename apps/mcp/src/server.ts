import { McpServer } from "@modelcontextprotocol/server";
import type { ChatGPTToolRegistry } from "../../chatgpt-tools/src/registry";
import { chatGPTInputSchemaToZod } from "./schema";

export function buildSamMcpServer(input:{
  surface:ChatGPTToolRegistry;
  actor:string;
}):McpServer{
  const server=new McpServer({
    name:"sam-executive",
    version:"1.0.0"
  });

  for(const definition of input.surface.definitions()){
    if(definition.availability==="UNAVAILABLE") continue;

    server.registerTool(
      definition.name,
      {
        description:definition.description,
        inputSchema:chatGPTInputSchemaToZod(definition.inputSchema),
        annotations:{
          readOnlyHint:definition.risk==="READ",
          destructiveHint:definition.risk==="RED",
          idempotentHint:definition.risk==="READ"
        }
      },
      async(args)=>{
        const result=await input.surface.invoke(
          definition.name,
          (args??{}) as Record<string,unknown>,
          {
            actor:input.actor,
            systemOwner:true
          }
        );

        const payload={
          ok:result.ok,
          data:result.data??null,
          error:result.error??null,
          unavailable:result.unavailable??false
        };

        return {
          isError:!result.ok,
          content:[{
            type:"text" as const,
            text:JSON.stringify(payload)
          }]
        };
      }
    );
  }

  return server;
}
