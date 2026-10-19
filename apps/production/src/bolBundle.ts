import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { BolClient } from "../../../vendor/bol-mcp-upstream/src/bol-client.js";
import { createServer } from "../../../vendor/bol-mcp-upstream/src/server.js";
import type { ProductionBundle,VerificationAdapter } from "./types";

type BolTool={
  name:string;
  description?:string;
  inputSchema:Record<string,unknown>;
  annotations?:{readOnlyHint?:boolean;destructiveHint?:boolean;idempotentHint?:boolean;openWorldHint?:boolean};
};
type BolBridge={client:Client;tools:BolTool[];close:()=>Promise<void>};

async function createBolBridge(clientId:string,clientSecret:string):Promise<BolBridge>{
  // Disable the upstream read cache so SAM's independent verification is a fresh API call.
  const server=createServer(new BolClient(clientId,clientSecret,undefined,0));
  const client=new Client({name:"sam-bol-retailer-adapter",version:"1.0.0"});
  const [clientTransport,serverTransport]=InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  const {tools=[]}=await client.listTools();
  if(tools.length!==76){
    await client.close();
    await server.close();
    throw new Error(`Expected 76 upstream bol tools, received ${tools.length}`);
  }
  return {client,tools:tools as BolTool[],close:async()=>{await client.close();await server.close();}};
}

function objectResult(result:any):Record<string,unknown>{
  if(result?.isError){
    const message=(result.content??[]).map((part:any)=>part.text??"").filter(Boolean).join("\n");
    throw new Error(message||"bol Retailer API tool failed");
  }
  if(result?.structuredContent&&typeof result.structuredContent==="object") return result.structuredContent;
  return {content:result?.content??[]};
}

function providerReference(value:unknown):string|undefined{
  if(!value||typeof value!=="object") return undefined;
  const record=value as Record<string,unknown>;
  for(const key of ["processStatusId","processStatusID","process_status_id"]){
    if(typeof record[key]==="string"&&record[key]) return record[key] as string;
  }
  return undefined;
}

function verification(tool:BolTool,bridge:BolBridge):VerificationAdapter{
  const capabilityId=`bol_${tool.name}`;
  const readOnly=tool.annotations?.readOnlyHint===true&&tool.name!=="request_product_labels";
  return {
    capabilityId,
    async verify(input){
      if(!readOnly){
        const ref=providerReference(input.execution.evidence);
        if(!ref) return {result:"INCONCLUSIVE" as const,evidence:{reason:"bol_process_status_reference_unavailable"},verifier:"bol-process-status"};
        try{
          const status=objectResult(await bridge.client.callTool({name:"get_process_status",arguments:{processStatusId:ref}}));
          const state=String(status.status??"").toUpperCase();
          if(state==="SUCCESS") return {result:"VERIFIED" as const,evidence:{processStatusId:ref,processStatus:status},verifier:"bol-process-status-readback"};
          if(state==="FAILURE"||state==="TIMEOUT") return {result:"FAILED" as const,evidence:{processStatusId:ref,processStatus:status},verifier:"bol-process-status-readback"};
          return {result:"INCONCLUSIVE" as const,evidence:{processStatusId:ref,processStatus:status},verifier:"bol-process-status-readback"};
        }catch(error){
          return {result:"INCONCLUSIVE" as const,evidence:{processStatusId:ref,error:error instanceof Error?error.message:String(error)},verifier:"bol-process-status-readback"};
        }
      }
      try{
        const result=objectResult(await bridge.client.callTool({name:tool.name,arguments:input.execution.params}));
        return {result:"VERIFIED" as const,evidence:{method:"fresh_bol_api_readback",tool:tool.name,readback:result},verifier:"bol-independent-api-readback"};
      }catch(error){
        return {result:"INCONCLUSIVE" as const,evidence:{method:"fresh_bol_api_readback",error:error instanceof Error?error.message:String(error)},verifier:"bol-independent-api-readback"};
      }
    }
  };
}

export let BOL_VERIFICATION_CONTRACTS:Array<{capabilityId:string;description:string;verificationMethod:"api_readback";requiredEvidenceFields:Record<string,unknown>;independentQueryTemplate:Record<string,unknown>}>=[];

export async function withBolRetailerFromEnv(
  bundle:ProductionBundle,
  env:NodeJS.ProcessEnv=process.env
):Promise<ProductionBundle>{
  const clientId=env.BOL_CLIENT_ID?.trim();
  const clientSecret=env.BOL_CLIENT_SECRET?.trim();
  if(!clientId&&!clientSecret) return bundle;
  if(!clientId||!clientSecret) throw new Error("bol production wiring requires BOL_CLIENT_ID and BOL_CLIENT_SECRET");

  const bridge=await createBolBridge(clientId,clientSecret);
  const capabilities=bridge.tools.map((tool)=>{
    const readOnly=tool.annotations?.readOnlyHint===true&&tool.name!=="request_product_labels";
    const authorityClass=readOnly?"GREEN" as const:tool.annotations?.destructiveHint?"RED" as const:"YELLOW" as const;
    const capabilityId=`bol_${tool.name}`;
    return {capabilityId,authorityClass,specialistAgentId:"marketplace",specialistVersion:"1.0.0",description:tool.description??`bol.com Retailer API: ${tool.name}`};
  });
  const toolDefinitions=bridge.tools.map((tool)=>{
    const readOnly=tool.annotations?.readOnlyHint===true&&tool.name!=="request_product_labels";
    const authorityClass=readOnly?"GREEN" as const:tool.annotations?.destructiveHint?"RED" as const:"YELLOW" as const;
    return {capabilityId:`bol_${tool.name}`,authorityClass,sideEffect:!readOnly,description:tool.description??`bol.com Retailer API: ${tool.name}`,inputSchema:tool.inputSchema};
  });
  const toolAdapters=bridge.tools.map((tool)=>({
    capabilityId:`bol_${tool.name}`,
    async execute(request:{params:Record<string,unknown>}){
      const result=objectResult(await bridge.client.callTool({name:tool.name,arguments:request.params}));
      const ref=providerReference(result);
      return {result:{tool:tool.name,data:result},evidence:{tool:tool.name,...(ref?{processStatusId:ref}:{})},...(ref?{providerReference:ref}:{})};
    }
  }));
  const verificationAdapters=bridge.tools.map((tool)=>verification(tool,bridge));
  const contracts=bridge.tools.map((tool)=>({
    capabilityId:`bol_${tool.name}`,
    description:`Verify ${tool.name} using a fresh bol Retailer API readback or process status lookup`,
    verificationMethod:"api_readback" as const,
    requiredEvidenceFields:{readback:"boolean"},
    independentQueryTemplate:{api:"bol-retailer",tool:tool.name,verification:"fresh_readback_or_process_status"}
  }));
  BOL_VERIFICATION_CONTRACTS=contracts;

  return {...bundle,capabilities:[...bundle.capabilities,...capabilities],toolDefinitions:[...bundle.toolDefinitions,...toolDefinitions],toolAdapters:[...bundle.toolAdapters,...toolAdapters],verificationAdapters:[...(bundle.verificationAdapters??[]),...verificationAdapters]};
}
