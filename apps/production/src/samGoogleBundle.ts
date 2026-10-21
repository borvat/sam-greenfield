import type {ProductionBundle} from "./types";
import {sha256Hex} from "../../../packages/shared/src/stableJson";
import {SamGoogleConnection,samGoogleConfigFromEnv} from "./samGoogleConnection";
import {filterReadOnlyTools,type SamGoogleTool} from "./samGoogleMcpBridge";
import type {VerificationContractSpec} from "./verificationContracts";
export let SAM_GOOGLE_VERIFICATION_CONTRACTS:VerificationContractSpec[]=[];
export async function withSamGoogleMcpFromEnv(bundle:ProductionBundle,env:NodeJS.ProcessEnv=process.env):Promise<ProductionBundle>{
 const config=samGoogleConfigFromEnv(env);
 if(!config)return bundle;
 return withSamGoogleConnection(bundle,new SamGoogleConnection(config));
}
export async function withSamGoogleConnection(bundle:ProductionBundle,connection:SamGoogleConnection):Promise<ProductionBundle>{
 const tools=filterReadOnlyTools(await connection.config.store.tools(connection.config.ownerId,connection.config.clientId));
 SAM_GOOGLE_VERIFICATION_CONTRACTS=tools.map(t=>({capabilityId:"google_mcp_"+t.name,description:"Fresh independent MCP readback; changed results are inconclusive",verificationMethod:"api_readback",requiredEvidenceFields:{responseHash:"string"},independentQueryTemplate:{provider:"sam-google-mcp",tool:t.name,method:"fresh_mcp_readback"}}));
 return {...bundle,
 capabilities:[...bundle.capabilities,...tools.map(t=>({capabilityId:"google_mcp_"+t.name,authorityClass:"GREEN" as const,sideEffect:false,specialistAgentId:t.name.includes("gmail")?"communications":"documents",specialistVersion:"1.0.0",description:t.description??t.name,parameters:t.inputSchema as Record<string,unknown>}))],
 toolDefinitions:[...bundle.toolDefinitions,...tools.map(t=>({capabilityId:"google_mcp_"+t.name,authorityClass:"GREEN" as const,sideEffect:false,description:t.description??t.name,inputSchema:t.inputSchema as Record<string,unknown>}))],
 toolAdapters:[...bundle.toolAdapters,...tools.map(t=>({capabilityId:"google_mcp_"+t.name,async execute(request){
  const result=await connection.read(t.name as SamGoogleTool,request.params);
  return {result,evidence:{responseHash:sha256Hex(result),remoteTool:t.name,transport:"mcp",sideEffect:false}};
 }}))],
 verificationAdapters:[...(bundle.verificationAdapters??[]),...tools.map(t=>({capabilityId:"google_mcp_"+t.name,async verify(input){
  if(typeof input.execution.evidence.responseHash!=="string")return {result:"INCONCLUSIVE" as const,evidence:{reason:"missing_response_hash"},verifier:"sam-google-independent-readback"};
  const again=await connection.read(t.name as SamGoogleTool,input.execution.params);
  const hash=sha256Hex(again),equal=hash===input.execution.evidence.responseHash;
  return {result:equal?"VERIFIED" as const:"INCONCLUSIVE" as const,evidence:{readback:true,responseHash:hash,method:"fresh_mcp_readback",...(equal?{}:{reason:"remote_response_changed"})},verifier:"sam-google-independent-readback"};
 }}))]
 };
}
