/** Official Google Workspace MCP discovery policy. Never expose unknown tools. */
export const WORKSPACE_MCP_ENDPOINTS={
  gmail:"https://gmailmcp.googleapis.com/mcp/v1",
  drive:"https://drivemcp.googleapis.com/mcp/v1"
} as const;

type RemoteTool={name:string;description?:string;inputSchema?:unknown;annotations?:Record<string,unknown>};
const SAFE_GMAIL=new Set(["list_messages","get_message","list_threads","get_thread","list_labels","get_profile"]);
const SAFE_DRIVE=new Set(["list_files","get_file","export_file"]);
const DENY=/(send|draft|create|update|delete|modify|trash|move|copy|permission|share|upload|batch|watch|label_message|set_)/i;
export function selectReadOnlyWorkspaceTools(service:"gmail"|"drive",tools:RemoteTool[]):RemoteTool[]{
 const allowed=service==="gmail"?SAFE_GMAIL:SAFE_DRIVE;
 return tools.filter(tool=>{
   const name=tool.name.trim().toLowerCase();
   if(DENY.test(name)||!allowed.has(name))return false;
   // The server must explicitly mark operations read-only. Unknown annotation
   // shapes fail closed; never trust names alone for access to production data.
   return tool.annotations?.readOnlyHint===true && tool.annotations?.destructiveHint!==true;
 });
}
