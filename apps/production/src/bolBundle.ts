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

const PAGED_READS:Record<string,string>={
  list_orders:"orders",
  get_inventory:"inventory",
  list_returns:"returns"
};
const MAX_READ_PAGES=100;

export async function readAllBolPages(input:{
  readPage:(page:number)=>Promise<Record<string,unknown>>;
  collectionKey:string;
  startPage?:number;
  maxPages?:number;
}):Promise<Record<string,unknown>>{
  const startPage=input.startPage??1;
  const maxPages=input.maxPages??MAX_READ_PAGES;
  if(!Number.isInteger(startPage)||startPage<1) throw new Error("page must be a positive integer");
  if(!Number.isInteger(maxPages)||maxPages<1) throw new Error("maxPages must be a positive integer");

  let first:Record<string,unknown>={};
  const rows:unknown[]=[];
  let pagesFetched=0;
  let reachedEmptyPage=false;
  for(let offset=0;offset<maxPages;offset++){
    const page=startPage+offset;
    const result=await input.readPage(page);
    if(offset===0) first=result;
    pagesFetched++;
    const pageRows=Array.isArray(result[input.collectionKey])?result[input.collectionKey] as unknown[]:[];
    if(pageRows.length===0){
      reachedEmptyPage=true;
      break;
    }
    rows.push(...pageRows);
  }

  return {
    ...first,
    [input.collectionKey]:rows,
    pagination:{
      startPage,
      pagesFetched,
      allPagesComplete:startPage===1&&reachedEmptyPage,
      termination:reachedEmptyPage?"empty_page":"page_limit"
    }
  };
}

function record(value:unknown):Record<string,any>|undefined{
  return value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,any>:undefined;
}

export function selectOrdersByPlacedDate(orders:unknown[],startDate?:string){
  const from=startDate?Date.parse(`${startDate.slice(0,10)}T00:00:00Z`):undefined;
  if(startDate&&Number.isNaN(from))throw new Error(`Invalid order period start date: ${startDate}`);
  return orders.filter((raw)=>{
    const order=record(raw);
    if(!order) return false;
    if(from===undefined) return true;
    const placed=Date.parse(String(order.orderPlacedDateTime??""));
    return Number.isFinite(placed)&&placed>=from;
  });
}

export function summarizeBolOrders(orders:unknown[]){
  const byEan:Record<string,{orders:number;items:number;unitsOrdered:number;unitsShipped:number;unitsCancelled:number}>={};
  let items=0,unitsOrdered=0,unitsShipped=0,unitsCancelled=0;
  for(const raw of orders){
    const order=record(raw);
    const orderItems=Array.isArray(order?.orderItems)?order.orderItems:[];
    for(const rawItem of orderItems){
      const item=record(rawItem);
      if(!item) continue;
      const product=record(item.product);
      const ean=String(product?.ean??item.ean??"unknown");
      const qty=Number(item.quantity??0)||0;
      const cancelled=Number(item.quantityCancelled??0)||0;
      const shipped=Number(item.quantityShipped??0)||0;
      const target=byEan[ean]??={orders:0,items:0,unitsOrdered:0,unitsShipped:0,unitsCancelled:0};
      target.orders++;
      target.items++;
      target.unitsOrdered+=qty;
      target.unitsShipped+=shipped;
      target.unitsCancelled+=cancelled;
      items++;unitsOrdered+=qty;unitsShipped+=shipped;unitsCancelled+=cancelled;
    }
  }
  return {orders:orders.length,items,unitsOrdered,unitsShipped,unitsCancelled,unitsAfterCancellations:Math.max(0,unitsOrdered-unitsCancelled),byEan};
}

export function summarizeBolInventory(inventory:unknown[],threshold=10){
  const lowStock=inventory.filter((item)=>{
    const row=record(item);
    return row&&Number(row.regularStock??0)<=threshold;
  });
  return {inventoryItems:inventory.length,lowStockThreshold:threshold,lowStockItems:lowStock.length,lowStockByEan:lowStock.map((item)=>{const row=record(item)!;return {ean:row.ean??"unknown",title:row.title??"unknown",regularStock:row.regularStock??0,gradedStock:row.gradedStock??0};})};
}

function readBolTool(bridge:BolBridge,toolName:string,params:Record<string,unknown>):Promise<Record<string,unknown>>{
  const collectionKey=PAGED_READS[toolName];
  if(!collectionKey) return bridge.client.callTool({name:toolName,arguments:params}).then(objectResult);
  const requestedStart=Number(params.page??1);
  // latestChangeDate filters by item update time. For a sales period, fetch
  // the recent order window and filter by placed time locally instead.
  const providerParams={...params};
  if(toolName==="list_orders") delete providerParams.latestChangeDate;
  return readAllBolPages({
    collectionKey,
    startPage:requestedStart,
    readPage:(page)=>bridge.client.callTool({name:toolName,arguments:{...providerParams,page}}).then(objectResult)
  }).then((data)=>{
    if(toolName==="list_orders"){
      const orders=Array.isArray(data.orders)?data.orders:[];
      const filtered=selectOrdersByPlacedDate(orders,typeof params.latestChangeDate==="string"?params.latestChangeDate:undefined);
      return {...data,orders:filtered,analysis:{periodStart:typeof params.latestChangeDate==="string"?params.latestChangeDate:null,...summarizeBolOrders(filtered)},fetchStrategy:"all_recent_pages_then_filter_by_order_placed_date",sourceOrderCount:orders.length};
    }
    if(toolName==="get_inventory"){
      const inventory=Array.isArray(data.inventory)?data.inventory:[];
      return {...data,analysis:summarizeBolInventory(inventory)};
    }
    const returns=Array.isArray(data.returns)?data.returns:[];
    return {...data,analysis:{returns:returns.length,handled:returns.filter((item)=>record(item)?.returnItems?.every((ri:any)=>ri.handled===true)).length,unhandled:returns.filter((item)=>record(item)?.returnItems?.some((ri:any)=>ri.handled===false)).length}};
  });
}

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
        const result=await readBolTool(bridge,tool.name,input.execution.params);
        const pagination=record(result.pagination);
        if(pagination&&pagination.allPagesComplete!==true){
          return {result:"FAILED" as const,evidence:{method:"fresh_bol_api_readback",tool:tool.name,readback:result,reason:"pagination_incomplete"},verifier:"bol-independent-api-readback"};
        }
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
      const result=await readBolTool(bridge,tool.name,request.params);
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
