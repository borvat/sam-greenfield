import { BolAccessTokenProvider } from "../../../packages/bol/src/auth";
import { BolRetailerClient } from "../../../packages/bol/src/client";
import {
  BolListOrdersAdapter,
  BolGetOrderAdapter,
  BolListReturnsAdapter,
  BolGetReturnAdapter,
  BolGetProcessStatusAdapter
} from "../../tools/src/bolAdapters";
import type { VerificationAdapter,ProductionBundle } from "./types";

const CAPABILITIES=[
  "bol_list_orders",
  "bol_get_order",
  "bol_list_returns",
  "bol_get_return",
  "bol_get_process_status"
] as const;

type BolCapability=typeof CAPABILITIES[number];

function verifier(
  capabilityId:BolCapability,
  client:BolRetailerClient
):VerificationAdapter{
  return {
    capabilityId,
    async verify(input){
      const p=input.execution.params??{};
      if(capabilityId==="bol_list_orders"){
        await client.listOrders({
          page:p.page,
          fulfilmentMethod:p.fulfilment_method,
          status:p.status,
          changeIntervalMinute:p.change_interval_minute
        });
      }else if(capabilityId==="bol_get_order"){
        await client.getOrder(String(p.order_id??""));
      }else if(capabilityId==="bol_list_returns"){
        await client.listReturns({
          page:p.page,
          handled:p.handled,
          fulfilmentMethod:p.fulfilment_method
        });
      }else if(capabilityId==="bol_get_return"){
        await client.getReturn(String(p.return_id??""));
      }else{
        await client.getProcessStatus(String(p.process_status_id??""));
      }
      return {
        result:"VERIFIED" as const,
        evidence:{method:"bol-independent-api-readback"},
        verifier:"bol-independent-readback"
      };
    }
  };
}

export const BOL_VERIFICATION_CONTRACTS=CAPABILITIES.map((capabilityId)=>({
  capabilityId,
  description:`Verify ${capabilityId} through an independent bol.com Retailer API v10 readback`,
  verificationMethod:"api_readback" as const,
  requiredEvidenceFields:{readback:"boolean"},
  independentQueryTemplate:{api:"bol-retailer-v10",method:"GET"}
}));

export function withBolFromEnv(
  bundle:ProductionBundle,
  env:NodeJS.ProcessEnv=process.env
):ProductionBundle{
  const clientId=env.BOL_CLIENT_ID?.trim();
  const clientSecret=env.BOL_CLIENT_SECRET?.trim();

  if(!clientId&&!clientSecret) return bundle;
  if(!clientId||!clientSecret){
    throw new Error("bol.com wiring requires BOL_CLIENT_ID and BOL_CLIENT_SECRET");
  }

  const tokens=new BolAccessTokenProvider({
    clientId,
    clientSecret,
    tokenUrl:env.BOL_TOKEN_URL?.trim()||undefined
  });
  const client=new BolRetailerClient({
    tokens,
    apiRoot:env.BOL_API_ROOT?.trim()||undefined
  });

  const adapters=[
    new BolListOrdersAdapter(client),
    new BolGetOrderAdapter(client),
    new BolListReturnsAdapter(client),
    new BolGetReturnAdapter(client),
    new BolGetProcessStatusAdapter(client)
  ];

  return {
    ...bundle,
    capabilities:[
      ...bundle.capabilities,
      ...CAPABILITIES.map((capabilityId)=>({
        capabilityId,
        authorityClass:"GREEN" as const,
        specialistAgentId:"marketplace-bol",
        specialistVersion:"1.0.0"
      }))
    ],
    toolDefinitions:[
      ...bundle.toolDefinitions,
      ...CAPABILITIES.map((capabilityId)=>({
        capabilityId,
        authorityClass:"GREEN" as const,
        sideEffect:false
      }))
    ],
    toolAdapters:[...bundle.toolAdapters,...adapters],
    verificationAdapters:[
      ...(bundle.verificationAdapters??[]),
      ...CAPABILITIES.map((capabilityId)=>verifier(capabilityId,client))
    ]
  };
}
