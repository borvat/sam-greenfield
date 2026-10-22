"use strict";
// Public constants only: deliberately no SAM, DB, filesystem or env imports.
const names=Object.freeze(["sam_service_status","sam_release_test_results"]);
const values=Object.freeze({
  sam_service_status:Object.freeze({mode:"CLOSED_SETUP_DIAGNOSTIC",executiveWorker:"DISABLED",
    database:"NOT_CONNECTED",models:"DISABLED",businessActions:"DISABLED",privateData:"UNAVAILABLE"}),
  sam_release_test_results:Object.freeze({status:"NOT_RUN",classification:"PUBLIC_STATIC_DIAGNOSTIC",
    readsSavedEvidence:false,provesExecutiveAcceptance:false})
});
function validateDiagnosticResource(value){
  try{
    const url=new URL(value);
    if(url.protocol!=="https:"||url.username||url.password||url.search||url.hash||
      url.pathname!=="/mcp"||url.href!==value||!url.hostname.includes("."))throw new Error();
    return url.href;
  }catch{throw new Error("RELEASE_SETUP_DIAGNOSTIC_RESOURCE_REQUIRED");}
}
function createDiagnosticMcp(resource){
  const {McpServer,createMcpHandler}=require("@modelcontextprotocol/server");
  const {z}=require("zod");
  const url=new URL(validateDiagnosticResource(resource));
  const handler=createMcpHandler(()=>{
    const server=new McpServer({name:"sam-closed-setup-diagnostics",version:"1.0.0"});
    for(const name of names)server.registerTool(name,{
      description:"Public static closed-Setup diagnostics only. Not executive SAM or live acceptance.",
      inputSchema:z.object({}).strict(),
      annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false},
      _meta:{securitySchemes:[{type:"noauth"}]}
    },async()=>({content:[{type:"text",text:JSON.stringify(values[name])}]}));
    return server;
  },{legacy:"stateless",maxRequestBodySize:8192,onerror:()=>{}});
  function answer(res,status,body){
    res.writeHead(status,{"content-type":"application/json","cache-control":"no-store"});
    res.end(body===undefined?"":JSON.stringify(body));
  }
  function refused(res,status,id=null){
    answer(res,status,{jsonrpc:"2.0",id,error:{code:-32600,message:"Diagnostic request refused"}});
  }
  async function handle(req,res){
    try{
      let host;try{host=new URL(`https://${req.headers.host}`).hostname;}catch{}
      if(host!==url.hostname)return refused(res,403);
      if(req.headers.origin&&!["https://chatgpt.com",url.origin].includes(req.headers.origin))return refused(res,403);
      if(req.method!=="POST"){res.setHeader("allow","POST");return refused(res,405);}
      if((req.headers["content-type"]??"").split(";")[0].trim()!=="application/json")return refused(res,415);
      const chunks=[];let size=0;
      for await(const chunk of req){size+=chunk.length;if(size>8192)return refused(res,413);chunks.push(chunk);}
      let message;try{message=JSON.parse(Buffer.concat(chunks).toString("utf8"));}catch{return refused(res,400);}
      if(!message||Array.isArray(message)||message.jsonrpc!=="2.0")return refused(res,400);
      const id=typeof message.id==="number"||typeof message.id==="string"?message.id:null;
      if(!["initialize","notifications/initialized","ping","tools/list","tools/call"].includes(message.method))
        return refused(res,400,id);
      if(message.method==="tools/call"){
        const p=message.params;
        if(!p||!names.includes(p.name)||Object.keys(p).some(k=>!["name","arguments","_meta"].includes(k))||
          (p.arguments!==undefined&&(!p.arguments||Array.isArray(p.arguments)||typeof p.arguments!=="object"||
            Object.keys(p.arguments).length)))return refused(res,400,id);
      }
      const headers=new Headers();
      for(const key of ["content-type","accept","mcp-protocol-version"])
        if(typeof req.headers[key]==="string")headers.set(key,req.headers[key]);
      const response=await handler.fetch(new Request(resource,{method:"POST",headers,body:JSON.stringify(message)}));
      const text=await response.text();
      if(!text)return answer(res,response.status);
      let body;try{
        body=JSON.parse(text);
      }catch{
        const data=text.split("\n").filter(line=>line.startsWith("data: ")).at(-1);
        if(!data)return refused(res,500,id);
        body=JSON.parse(data.slice(6));
      }
      // SDK validation failures must not echo caller-controlled names/arguments.
      if(body.error)body={jsonrpc:"2.0",id,error:{code:body.error.code,message:"Diagnostic request refused"}};
      answer(res,response.status,body);
    }catch{if(!res.headersSent)refused(res,400);else res.end();}
  }
  return {handle,close:()=>handler.close()};
}
module.exports={validateDiagnosticResource,createDiagnosticMcp};
