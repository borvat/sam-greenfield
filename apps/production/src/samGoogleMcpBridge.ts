/**
 * SAM -> self-hosted Google Workspace MCP read-only bridge (isolated pilot).
 *
 * SECURITY: Never forwards ChatGPT tokens. Requires its own SAM-issued OAuth
 * access token from the service's OAuth authorization-code+PKCE flow.
 * This module is deliberately NOT registered in production until authentication,
 * discovery and independent verification have passed.
 */
export const SAM_GOOGLE_MCP_URL = "https://sam-google-workspace-mcp.onrender.com/mcp";
export const SAM_GOOGLE_ALLOWED_TOOLS = [
  "search_gmail_messages",
  "get_gmail_message_content",
  "get_gmail_messages_content_batch",
  "search_drive_files",
  "get_drive_file_content",
  "get_drive_file_download_url",
  "get_drive_shareable_link",
] as const;
export type SamGoogleTool = typeof SAM_GOOGLE_ALLOWED_TOOLS[number];
const ALLOW = new Set<string>(SAM_GOOGLE_ALLOWED_TOOLS);
const unsafe = /(send|delete|update|create|modify|upload|share_file|grant|revoke|trash|write|draft|move|copy|permission)/i;

export interface McpTool {name:string;description?:string;inputSchema?:unknown;annotations?:{readOnlyHint?:boolean;destructiveHint?:boolean}}
export function allowedTool(tool:McpTool):boolean {
  return ALLOW.has(tool.name) && !unsafe.test(tool.name)
    && tool.annotations?.destructiveHint !== true
    && tool.annotations?.readOnlyHint === true;
}
export function filterReadOnlyTools(tools:McpTool[]):McpTool[] {
  if(!Array.isArray(tools)) throw new Error("INVALID_TOOLS_LIST");
  return tools.filter(allowedTool);
}

export class SamGoogleMcpBridge {
  private id=1;
  private session:string|undefined;
  private initialized=false;
  constructor(private readonly accessToken:string,private readonly endpoint=SAM_GOOGLE_MCP_URL) {
    if(!accessToken || !accessToken.trim())throw new Error("SAM_GOOGLE_OAUTH_ACCESS_TOKEN_REQUIRED");
    const u=new URL(endpoint);
    if(u.protocol!=="https:" || u.username || u.password || u.origin!==new URL(SAM_GOOGLE_MCP_URL).origin || u.pathname!=="/mcp" || u.search || u.hash)throw new Error("HTTPS_MCP_ENDPOINT_REQUIRED");
  }
  private async rpc(method:string,params:Record<string,unknown>,notification=false):Promise<any> {
    const ctrl=new AbortController();
    const timeout=setTimeout(()=>ctrl.abort(),20000);
    try {
      const headers:Record<string,string>={
        "Content-Type":"application/json",
        "Accept":"application/json, text/event-stream",
        "Authorization":`Bearer ${this.accessToken}`,
        "MCP-Protocol-Version":"2025-03-26",
      };
      if(this.session)headers["Mcp-Session-Id"]=this.session;
      const id=notification?undefined:this.id++;
      const resp=await fetch(this.endpoint,{
        method:"POST",headers,signal:ctrl.signal,redirect:"error",
        body:JSON.stringify({jsonrpc:"2.0",...(notification?{}:{id}),method,params})
      });
      if(resp.status===401 || resp.status===403)throw new Error("SAM_GOOGLE_AUTH_REQUIRED");
      if(!resp.ok)throw new Error(`MCP_HTTP_${resp.status}`);
      const session=resp.headers.get("mcp-session-id");
      if(session)this.session=session;
      if(notification){await resp.body?.cancel();return;}
      const raw=await resp.text();
      // Streamable HTTP responses may be JSON or SSE.
      const json=resp.headers.get("content-type")?.includes("text/event-stream")
        ?raw.split(/\r?\n/).filter(line=>line.startsWith("data:"))
            .map(line=>{try{return JSON.parse(line.slice(5).trim())}catch{return null}})
            .find(o=>o?.id===id)
        :JSON.parse(raw);
      if(!json || json.id!==id || json.jsonrpc!=="2.0" || json.error || !("result" in json))throw new Error("MCP_RPC_FAILURE");
      return json.result;
    } finally {clearTimeout(timeout)}
  }
  async discover():Promise<McpTool[]> {
    if(!this.initialized){
      const init=await this.rpc("initialize",{protocolVersion:"2025-03-26",capabilities:{},clientInfo:{name:"sam-google-readonly",version:"0.2.0"}});
      if(init?.protocolVersion!=="2025-03-26")throw new Error("MCP_PROTOCOL_VERSION_UNSUPPORTED");
      await this.rpc("notifications/initialized",{},true);
      this.initialized=true;
    }
    const results:McpTool[]=[];
    let cursor:string|undefined;
    const seen=new Set<string>();
    for(let i=0;i<20;i++){
      const page=await this.rpc("tools/list",cursor?{cursor}:{});
      if(!Array.isArray(page?.tools))throw new Error("INVALID_TOOLS_LIST");
      results.push(...page.tools);
      if(!page.nextCursor) return filterReadOnlyTools(results);
      cursor=String(page.nextCursor);
      if(seen.has(cursor))throw new Error("REPEATED_CURSOR");
      seen.add(cursor);
    }
    throw new Error("TOOL_PAGINATION_LIMIT");
  }
  async read(name:SamGoogleTool,args:Record<string,unknown>):Promise<unknown> {
    if(!ALLOW.has(name) || unsafe.test(name))throw new Error("TOOL_NOT_ALLOWED");
    const discovered=await this.discover();
    if(!discovered.some(t=>t.name===name))throw new Error("TOOL_NOT_DISCOVERED_OR_NOT_READONLY");
    const result=await this.rpc("tools/call",{name,arguments:args});
    if(result?.isError)throw new Error("REMOTE_TOOL_ERROR");
    return result;
  }
}
