"use strict";
// Public metadata only. No token handling, fetching, keys, DB or SAM imports.
const scopes=Object.freeze(["sam:synthetic:read","sam:synthetic:submit"]);
function invalid(){throw new Error("RELEASE_SETUP_OAUTH_DISCOVERY_INVALID");}
function pinnedUrl(value,path){
  let url;try{url=new URL(value);}catch{invalid();}
  if(typeof value!=="string"||value.length>512||url.protocol!=="https:"||
    url.username||url.password||url.search||url.hash||url.pathname!==path||
    url.href!==value||!/[a-z]$/i.test(url.hostname)||!url.hostname.includes("."))
    invalid();
  return url;
}
function setupOAuthDiscovery(env){
  const resource=env.SAM_MCP_OAUTH_RESOURCE,issuer=env.SAM_MCP_OAUTH_ISSUER;
  const resourceUrl=resource===undefined?null:pinnedUrl(resource,"/mcp");
  const issuerUrl=issuer===undefined?null:pinnedUrl(issuer,"/");
  // Keep Setup running, but do not manufacture incomplete AS metadata.
  if(!resourceUrl||!issuerUrl)return null;
  if(issuerUrl.origin===resourceUrl.origin)invalid(); // SAM is not the AS.
  const metadata={
    resource,authorization_servers:[issuer],scopes_supported:scopes,
    bearer_methods_supported:["header"],
    resource_name:"SAM Greenfield MCP (Setup: all tools disabled)"
  };
  const metadataUrl=new URL("/.well-known/oauth-protected-resource/mcp",resource).href;
  return {metadata,challenge:`Bearer resource_metadata="${metadataUrl}", scope="${scopes.join(" ")}"`};
}
module.exports={setupOAuthDiscovery};
