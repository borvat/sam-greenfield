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
