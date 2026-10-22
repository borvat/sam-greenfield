"use strict";
// Reviewed Auth0 Action template. Not installed or executed against Auth0.
// This only binds claims. API/client grants, PKCE and JWT profile remain Auth0's
// responsibility. No scope grants, credentials, HTTP calls or logging.
exports.onExecutePostLogin=async(event,api)=>{
  const s=event.secrets??{};
  // On incomplete installation, fail closed for the known SAM API without
  // breaking unrelated applications in the tenant's shared Login flow.
  const target=s.SAM_MCP_RESOURCE||"https://sam-greenfield.replit.app/mcp";
  if(event.resource_server?.identifier!==target)return;
  if(!s.SAM_MCP_RESOURCE)return api.access.deny("SAM configuration unavailable");
  const deny=()=>api.access.deny("SAM authorization refused");
  try{
    const resource=new URL(s.SAM_MCP_RESOURCE);
    if(resource.protocol!=="https:"||resource.pathname!=="/mcp"||
      resource.username||resource.password||resource.search||resource.hash||
      resource.href!==s.SAM_MCP_RESOURCE)return deny();
    if(!s.SAM_MCP_CLIENT_ID||!s.SAM_MCP_OWNER_SUB||
      event.client?.client_id!==s.SAM_MCP_CLIENT_ID||
      event.user?.user_id!==s.SAM_MCP_OWNER_SUB)return deny();
    const ids=[s.SAM_MCP_ORG_ID,s.SAM_MCP_ENTITY_ID,s.SAM_MCP_RUN_ID];
    if(ids.some(id=>typeof id!=="string"||!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)))return deny();
    const deadline=Date.parse(s.SAM_MCP_RUN_EXPIRES_AT);
    const now=Date.now();
    if(!Number.isFinite(deadline)||deadline<=now||deadline>now+86400000)return deny();
    const namespace=resource.origin+"/sam";
    for(const [key,value] of [["org_id",ids[0]],["legal_entity_id",ids[1]],["pilot_run_id",ids[2]]])
      api.accessToken.setCustomClaim(namespace+"/"+key,value.toLowerCase());
  }catch{return deny();}
};
