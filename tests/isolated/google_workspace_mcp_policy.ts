import assert from "node:assert/strict";
import {selectReadOnlyWorkspaceTools,WORKSPACE_MCP_ENDPOINTS} from "../../apps/production/src/googleWorkspaceMcpPolicy";
assert.equal(WORKSPACE_MCP_ENDPOINTS.gmail,"https://gmailmcp.googleapis.com/mcp/v1");
assert.equal(WORKSPACE_MCP_ENDPOINTS.drive,"https://drivemcp.googleapis.com/mcp/v1");
const candidate=(name:string,readOnlyHint?:boolean,destructiveHint?:boolean)=>({name,annotations:{readOnlyHint,destructiveHint}});
assert.deepEqual(selectReadOnlyWorkspaceTools("gmail",[
 candidate("list_messages",true),candidate("get_thread",true),candidate("send_message",true),
 candidate("create_draft",true),candidate("get_message"),candidate("delete_message",true),
 candidate("list_labels",true,true)
]).map(t=>t.name),["list_messages","get_thread"]);
assert.deepEqual(selectReadOnlyWorkspaceTools("drive",[
 candidate("list_files",true),candidate("get_file",true),candidate("create_file",true),
 candidate("list_files"),candidate("delete_file",true),candidate("export_file",true)
]).map(t=>t.name),["list_files","get_file","export_file"]);
console.log("GOOGLE_WORKSPACE_MCP_READONLY_POLICY PASS: allowlist, unsafe-deny, unknown-fail-closed");
