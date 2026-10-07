import { BolRetailerClient } from "../../../packages/bol/src/client";
import {
  BolOrdersAdapter,
  BolReturnsAdapter,
  BolInvoicesAdapter,
  BolRetailerAdapter
} from "../../tools/src/bolReadAdapters";
import type { ProductionBundle,VerificationAdapter } from "./types";

const CAPABILITIES=[
  "bol_list_orders",
  "bol_list_returns",
  "bol_list_invoices",
  "bol_get_retailer"
] as const;

function verifier(
  capabilityId:typeof CAPABILITIES[number],
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
          changeIntervalMinute:p.change_interval_minute,
          latestChangeDate:p.latest_change_date,
          vvbOnly:p.vvb_only
        });
      }else if(capabilityId==="bol_list_returns"){
        await client.listReturns({
          page:p.page,
          handled:p.handled,
          fulfilmentMethod:p.fulfilment_method
        });
      }else if(capabilityId==="bol_list_invoices"){
        await client.listInvoices({
          periodStartDate:p.period_start_date,
          periodEndDate:p.period_end_date
        });
      }else{
        await client.getCurrentRetailer();
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
  description:`Verify ${capabilityId} by an independent bol Retailer API readback`,
  verificationMethod:"api_readback" as const,
  requiredEvidenceFields:{readback:"boolean"},
  independentQueryTemplate:{api:"bol-retailer",method:"GET",version:"v10"}
}));

export function withBolRetailerFromEnv(
  bundle:ProductionBundle,
  env:NodeJS.ProcessEnv=process.env
):ProductionBundle{
  const clientId=env.BOL_CLIENT_ID?.trim();
  const clientSecret=env.BOL_CLIENT_SECRET?.trim();

  if(!clientId&&!clientSecret) return bundle;
  if(!clientId||!clientSecret){
    throw new Error("bol production wiring requires BOL_CLIENT_ID and BOL_CLIENT_SECRET");
  }

  const client=new BolRetailerClient({
    clientId,
    clientSecret,
    tokenUrl:env.BOL_TOKEN_URL?.trim()||undefined,
    baseUrl:env.BOL_RETAILER_BASE_URL?.trim()||undefined
  });

  const adapters=[
    new BolOrdersAdapter(client),
    new BolReturnsAdapter(client),
    new BolInvoicesAdapter(client),
    new BolRetailerAdapter(client)
  ];

  return {
    ...bundle,
    capabilities:[
      ...bundle.capabilities,
      ...CAPABILITIES.map((capabilityId)=>({
        capabilityId,
        authorityClass:"GREEN" as const,
        specialistAgentId:"marketplace",
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
