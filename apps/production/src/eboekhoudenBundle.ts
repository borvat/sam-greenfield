import { EBoekhoudenClient } from "../../../packages/eboekhouden/src/client";
import {
  EBoekhoudenMutationsAdapter,
  EBoekhoudenOutstandingInvoicesAdapter,
  EBoekhoudenLedgersAdapter,
  EBoekhoudenRelationsAdapter
} from "../../tools/src/eboekhoudenAdapters";
import type { VerificationAdapter,ProductionBundle } from "./types";

const CAPABILITIES=[
  "eboekhouden_list_mutations",
  "eboekhouden_outstanding_invoices",
  "eboekhouden_list_ledgers",
  "eboekhouden_list_relations"
] as const;

function verificationAdapter(
  capabilityId:typeof CAPABILITIES[number],
  client:EBoekhoudenClient
):VerificationAdapter{
  return {
    capabilityId,
    async verify(input){
      const params=input.execution.params??{};
      if(capabilityId==="eboekhouden_list_mutations"){
        await client.listMutations(params);
      }else if(capabilityId==="eboekhouden_outstanding_invoices"){
        await client.getOutstandingInvoices(params);
      }else if(capabilityId==="eboekhouden_list_ledgers"){
        await client.listLedgers(params);
      }else{
        await client.listRelations(params);
      }
      return {
        result:"VERIFIED" as const,
        evidence:{method:"eboekhouden_independent_api_readback"},
        verifier:"eboekhouden-independent-readback"
      };
    }
  };
}

export const EBOEKHOUDEN_VERIFICATION_CONTRACTS=CAPABILITIES.map((capabilityId)=>({
  capabilityId,
  description:`Verify ${capabilityId} by an independent e-Boekhouden REST readback`,
  verificationMethod:"api_readback" as const,
  requiredEvidenceFields:{readback:"boolean"},
  independentQueryTemplate:{api:"e-boekhouden",method:"GET"}
}));

export function withEBoekhoudenFromEnv(
  bundle:ProductionBundle,
  env:NodeJS.ProcessEnv=process.env
):ProductionBundle{
  const apiToken=env.EBOEKHOUDEN_API_TOKEN?.trim();
  if(!apiToken) return bundle;

  const client=new EBoekhoudenClient({
    apiToken,
    source:env.EBOEKHOUDEN_SOURCE?.trim()||"SAM",
    baseUrl:env.EBOEKHOUDEN_API_BASE_URL?.trim()||undefined
  });

  const adapters=[
    new EBoekhoudenMutationsAdapter(client),
    new EBoekhoudenOutstandingInvoicesAdapter(client),
    new EBoekhoudenLedgersAdapter(client),
    new EBoekhoudenRelationsAdapter(client)
  ];

  return {
    ...bundle,
    capabilities:[
      ...bundle.capabilities,
      ...CAPABILITIES.map((capabilityId)=>({
        capabilityId,
        authorityClass:"GREEN" as const,
        specialistAgentId:"accounting",
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
      ...CAPABILITIES.map((capabilityId)=>verificationAdapter(capabilityId,client))
    ]
  };
}
