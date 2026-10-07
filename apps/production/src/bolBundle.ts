import { BolClientCredentialsProvider,BolRetailerApiClient } from "../../../packages/bol/src/client";
import { BolListOrdersAdapter,BolGetOrderAdapter,BolListReturnsAdapter,BolListShipmentsAdapter,BolGetOfferAdapter } from "../../tools/src/bolReadAdapters";
import { BolListOrdersVerifier,BolGetOrderVerifier,BolListReturnsVerifier,BolListShipmentsVerifier,BolGetOfferVerifier } from "./bolVerifiers";
import type { ProductionBundle } from "./types";
import type { VerificationContractSpec } from "./verificationContracts";
const IDS=["bol_list_orders","bol_get_order","bol_list_returns","bol_list_shipments","bol_get_offer"] as const;
export const BOL_VERIFICATION_CONTRACTS:VerificationContractSpec[]=IDS.map((capabilityId)=>({capabilityId,description:`Independently verify ${capabilityId} through bol Retailer API v10 readback`,verificationMethod:capabilityId.startsWith("bol_list_")?"list_search":"api_readback",requiredEvidenceFields:{provider:"bol",api_version:"v10"},independentQueryTemplate:{api:"bol_retailer",version:"v10",capability_id:capabilityId}}));
export function withBolFromEnv(bundle:ProductionBundle,env:NodeJS.ProcessEnv=process.env):ProductionBundle{
 const clientId=env.BOL_CLIENT_ID?.trim(),clientSecret=env.BOL_CLIENT_SECRET?.trim();
 if(!clientId&&!clientSecret)return bundle;
 if(!clientId||!clientSecret)throw new Error("bol production wiring requires BOL_CLIENT_ID and BOL_CLIENT_SECRET");
 const tokens=new BolClientCredentialsProvider({clientId,clientSecret,tokenUrl:env.BOL_TOKEN_URL?.trim()||undefined});
 const client=new BolRetailerApiClient({tokens,baseUrl:env.BOL_RETAILER_BASE_URL?.trim()||undefined});
 return {...bundle,
 capabilities:[...bundle.capabilities,...IDS.map(capabilityId=>({capabilityId,authorityClass:"GREEN" as const,specialistAgentId:"marketplace",specialistVersion:"1.0.0"}))],
 toolDefinitions:[...bundle.toolDefinitions,...IDS.map(capabilityId=>({capabilityId,authorityClass:"GREEN" as const,sideEffect:false}))],
 toolAdapters:[...bundle.toolAdapters,new BolListOrdersAdapter(client),new BolGetOrderAdapter(client),new BolListReturnsAdapter(client),new BolListShipmentsAdapter(client),new BolGetOfferAdapter(client)],
 verificationAdapters:[...(bundle.verificationAdapters??[]),new BolListOrdersVerifier(client),new BolGetOrderVerifier(client),new BolListReturnsVerifier(client),new BolListShipmentsVerifier(client),new BolGetOfferVerifier(client)]};
}
