"use strict";
// Install in the existing Auth0 Login flow; configured owner/client only.
exports.onExecutePostLogin=async(event,api)=>{
  const s=event.secrets??{};
  if(!s.SAM_MCP_RESOURCE||event.resource_server?.identifier!==s.SAM_MCP_RESOURCE)return;
  const deny=()=>api.access.deny("SAM authorization refused");
  try{
    const resource=new URL(s.SAM_MCP_RESOURCE);
    if(resource.protocol!=="https:"||resource.pathname!=="/mcp"||resource.username||resource.password||resource.search||resource.hash||
      resource.href!==s.SAM_MCP_RESOURCE||!s.SAM_MCP_CLIENT_ID||!s.SAM_MCP_OWNER_SUB||
      event.client?.client_id!==s.SAM_MCP_CLIENT_ID||event.user?.user_id!==s.SAM_MCP_OWNER_SUB)return deny();
    if([s.SAM_MCP_ORG_ID,s.SAM_MCP_ENTITY_ID].some(id=>typeof id!=="string"||!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)))return deny();
    api.accessToken.setCustomClaim(resource.origin+"/sam/org_id",s.SAM_MCP_ORG_ID.toLowerCase());
    api.accessToken.setCustomClaim(resource.origin+"/sam/legal_entity_id",s.SAM_MCP_ENTITY_ID.toLowerCase());
  }catch{return deny();}
};
