import {compareReadback} from './contentVerification';
import { BolRetailerClient } from "../../../packages/bol/src/client";
import {
  BolOrdersAdapter,
  BolReturnsAdapter,
  BolInvoicesAdapter,
  BolRetailerAdapter,
  BolOrderDetailAdapter,
  BolShipmentsAdapter,
  BolCommissionAdapter,
  BolCompetingOffersAdapter
} from "../../tools/src/bolReadAdapters";
import type { ProductionBundle,VerificationAdapter } from "./types";

const CAPABILITIES=[
  "bol_list_orders",
  "bol_list_returns",
  "bol_list_invoices",
  "bol_get_retailer",
  "bol_get_order",
  "bol_list_shipments",
  "bol_get_commission",
  "bol_get_competing_offers"
] as const;

function verifier(
  capabilityId:typeof CAPABILITIES[number],
  client:BolRetailerClient
):VerificationAdapter{
  return {
    capabilityId,
    async verify(input){
      const p=input.execution.params??{};
      let fresh:unknown;
      if(capabilityId==="bol_list_orders"){
        fresh=await client.listOrders({
          page:p.page,
          fulfilmentMethod:p.fulfilment_method,
          status:p.status,
          changeIntervalMinute:p.change_interval_minute,
          latestChangeDate:p.latest_change_date,
          vvbOnly:p.vvb_only
        });
      }else if(capabilityId==="bol_list_returns"){
        fresh=await client.listReturns({
          page:p.page,
          handled:p.handled,
          fulfilmentMethod:p.fulfilment_method
        });
      }else if(capabilityId==="bol_list_invoices"){
        fresh=await client.listInvoices({
          periodStartDate:p.period_start_date,
          periodEndDate:p.period_end_date
        });
      }else if(capabilityId==="bol_get_retailer"){
        fresh=await client.getCurrentRetailer();
      }else if(capabilityId==="bol_get_order"){
        fresh=await client.getOrder(p.order_id);
      }else if(capabilityId==="bol_list_shipments"){
        fresh=await client.listShipments({page:p.page,fulfilmentMethod:p.fulfilment_method});
      }else if(capabilityId==="bol_get_commission"){
        fresh=await client.getCommission({ean:p.ean,unitPrice:p.unit_price,condition:p.condition});
      }else{
        fresh=await client.getCompetingOffers({ean:p.ean,page:p.page,countryCode:p.country_code,bestOfferOnly:p.best_offer_only,condition:p.condition});
      }

      return compareReadback(input.execution.result?.data,fresh,'bol-independent-readback',{method:'bol-independent-api-readback'});
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
    new BolRetailerAdapter(client),
    new BolOrderDetailAdapter(client),
    new BolShipmentsAdapter(client),
    new BolCommissionAdapter(client),
    new BolCompetingOffersAdapter(client)
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
