import { EBoekhoudenSoapClient } from "../../../packages/eboekhouden/src/client";
import { EBoekhoudenInvoicesAdapter,EBoekhoudenMutationsAdapter,EBoekhoudenOpenItemsAdapter } from "../../tools/src/eboekhoudenAdapters";
import { EBoekhoudenInvoicesVerifier,EBoekhoudenMutationsVerifier,EBoekhoudenOpenItemsVerifier } from "./eboekhoudenVerifiers";
import type { ProductionBundle } from "./types";

export const EBOEKHOUDEN_VERIFICATION_CONTRACTS=[
  {
    capabilityId:"eboekhouden_get_invoices",
    description:"Verify invoices with an independent GetFacturen readback",
    verificationMethod:"api_readback" as const,
    requiredEvidenceFields:{count:"number"},
    independentQueryTemplate:{provider:"eboekhouden",method:"GetFacturen"}
  },
  {
    capabilityId:"eboekhouden_get_mutations",
    description:"Verify mutations with an independent GetMutaties readback",
    verificationMethod:"api_readback" as const,
    requiredEvidenceFields:{count:"number"},
    independentQueryTemplate:{provider:"eboekhouden",method:"GetMutaties"}
  },
  {
    capabilityId:"eboekhouden_get_open_items",
    description:"Verify open items with an independent GetOpenPosten readback",
    verificationMethod:"api_readback" as const,
    requiredEvidenceFields:{count:"number"},
    independentQueryTemplate:{provider:"eboekhouden",method:"GetOpenPosten"}
  }
];

export function withEBoekhoudenFromEnv(
  bundle:ProductionBundle,
  env:NodeJS.ProcessEnv=process.env
):ProductionBundle{
  const username=env.EBOEKHOUDEN_USERNAME?.trim();
  const securityCode1=env.EBOEKHOUDEN_SECURITY_CODE1?.trim();
  const securityCode2=env.EBOEKHOUDEN_SECURITY_CODE2?.trim();

  if(!username&&!securityCode1&&!securityCode2) return bundle;
  if(!username||!securityCode1||!securityCode2){
    throw new Error("e-Boekhouden wiring requires EBOEKHOUDEN_USERNAME, EBOEKHOUDEN_SECURITY_CODE1, and EBOEKHOUDEN_SECURITY_CODE2");
  }

  const client=new EBoekhoudenSoapClient({
    credentials:{username,securityCode1,securityCode2,source:env.EBOEKHOUDEN_SOURCE?.trim()||"SAM"},
    endpoint:env.EBOEKHOUDEN_SOAP_ENDPOINT?.trim()||undefined
  });

  return {
    ...bundle,
    capabilities:[
      ...bundle.capabilities,
      {capabilityId:"eboekhouden_get_invoices",authorityClass:"GREEN",specialistAgentId:"finance-read",specialistVersion:"1.0.0"},
      {capabilityId:"eboekhouden_get_mutations",authorityClass:"GREEN",specialistAgentId:"finance-read",specialistVersion:"1.0.0"},
      {capabilityId:"eboekhouden_get_open_items",authorityClass:"GREEN",specialistAgentId:"finance-read",specialistVersion:"1.0.0"}
    ],
    toolDefinitions:[
      ...bundle.toolDefinitions,
      {capabilityId:"eboekhouden_get_invoices",authorityClass:"GREEN",sideEffect:false},
      {capabilityId:"eboekhouden_get_mutations",authorityClass:"GREEN",sideEffect:false},
      {capabilityId:"eboekhouden_get_open_items",authorityClass:"GREEN",sideEffect:false}
    ],
    toolAdapters:[
      ...bundle.toolAdapters,
      new EBoekhoudenInvoicesAdapter(client),
      new EBoekhoudenMutationsAdapter(client),
      new EBoekhoudenOpenItemsAdapter(client)
    ],
    verificationAdapters:[
      ...(bundle.verificationAdapters??[]),
      new EBoekhoudenInvoicesVerifier(client),
      new EBoekhoudenMutationsVerifier(client),
      new EBoekhoudenOpenItemsVerifier(client)
    ]
  };
}
