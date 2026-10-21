import assert from "node:assert/strict";
import {test} from "node:test";
import {allowedTool,filterReadOnlyTools,SamGoogleMcpBridge,SAM_GOOGLE_ALLOWED_TOOLS} from "../../apps/production/src/samGoogleMcpBridge";

test("only the seven explicitly requested read tools are accepted",()=>{
 const known=SAM_GOOGLE_ALLOWED_TOOLS.map(name=>({name,annotations:{readOnlyHint:true}}));
 assert.equal(filterReadOnlyTools(known).length,7);
 assert.equal(allowedTool({name:"send_gmail_message",annotations:{readOnlyHint:true}}),false);
 assert.equal(allowedTool({name:"delete_drive_file",annotations:{readOnlyHint:true}}),false);
 assert.equal(allowedTool({name:"get_drive_file_content",annotations:{readOnlyHint:false}}),false);
 assert.equal(allowedTool({name:"get_drive_file_content",annotations:{destructiveHint:true}}),false);
});
test("bridge rejects missing authentication and insecure endpoints",()=>{
 assert.throws(()=>new SamGoogleMcpBridge(""),/ACCESS_TOKEN_REQUIRED/);
 assert.throws(()=>new SamGoogleMcpBridge("secret","http://example.com/mcp"),/HTTPS_MCP_ENDPOINT_REQUIRED/);
});
test("unsafe calls are rejected before any network request",async()=>{
 const client=new SamGoogleMcpBridge("test-token");
 await assert.rejects(client.read("send_gmail_message" as any,{}),/TOOL_NOT_ALLOWED/);
});

test("read-only tool discovery uses authenticated MCP initialize and tools/list",async()=>{
 const original=globalThis.fetch;
 const methods:string[]=[];
 globalThis.fetch=(async (_url:any,options:any)=>{
   const request=JSON.parse(options.body);
   methods.push(request.method);
   assert.equal(options.headers.Authorization,"Bearer test-token");
   const result=request.method==="initialize"
      ?{protocolVersion:"2025-03-26",capabilities:{},serverInfo:{name:"test",version:"1"}}
      :{tools:[{name:"search_gmail_messages",annotations:{readOnlyHint:true}},{name:"send_gmail_message",annotations:{readOnlyHint:false}}]};
   return new Response(JSON.stringify({jsonrpc:"2.0",id:request.id,result}),{status:200,headers:{"Content-Type":"application/json"}});
 }) as typeof fetch;
 try{
   const bridge=new SamGoogleMcpBridge("test-token");
   assert.deepEqual((await bridge.discover()).map(x=>x.name),["search_gmail_messages"]);
   assert.deepEqual(methods,["initialize","tools/list"]);
 }finally{globalThis.fetch=original}
});
test("401 fails closed instead of registering capabilities",async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=(async()=>new Response("",{status:401})) as typeof fetch;
 try{
   await assert.rejects(new SamGoogleMcpBridge("expired-token").discover(),/SAM_GOOGLE_AUTH_REQUIRED/);
 }finally{globalThis.fetch=original}
});
