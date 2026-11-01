import {BolRetailerClient} from "../../../packages/bol/src/client";
import {EBoekhoudenClient} from "../../../packages/eboekhouden/src/client";
import {FinanceReconciliationPreviewAdapter,FinanceOutstandingSnapshotAdapter} from "../../tools/src/financeReadAdapters";
import {reconcileExactReferences,outstandingSnapshot} from "../../finance/src/reconciliation";
import { entityScopedClient } from "../../../packages/credentials/src/scopedClient";
import type { CredentialResolver } from "../../../packages/credentials/src/resolver";
import type {ProductionBundle,VerificationAdapter} from "./types";
import type {VerificationContractSpec} from "./verificationContracts";

const IDS=["finance_reconciliation_preview","finance_outstanding_snapshot"] as const;

export const FINANCE_RECONCILIATION_CONTRACTS:VerificationContractSpec[]=IDS.map((capabilityId)=>({
  capabilityId,
  description:`Verify ${capabilityId} by independent source readback`,
  verificationMethod:"api_readback",
  requiredEvidenceFields:{readback:"boolean"},
  independentQueryTemplate:{sources:["bol","eboekhouden"],policy:"exact_reference_only"}
}));

export function withFinanceReconciliationFromEnv(bundle:ProductionBundle,env:NodeJS.ProcessEnv=process.env):ProductionBundle{
  const bId=env.BOL_CLIENT_ID?.trim(),bSecret=env.BOL_CLIENT_SECRET?.trim(),eToken=env.EBOEKHOUDEN_API_TOKEN?.trim();
  if(!bId&&!bSecret&&!eToken) return bundle;
  if(!bId||!bSecret||!eToken) return bundle;

  return withFinanceClients(bundle,
    new BolRetailerClient({clientId:bId,clientSecret:bSecret,tokenUrl:env.BOL_TOKEN_URL?.trim()||undefined,baseUrl:env.BOL_RETAILER_BASE_URL?.trim()||undefined}),
    new EBoekhoudenClient({apiToken:eToken,source:env.EBOEKHOUDEN_SOURCE?.trim()||"SAM",baseUrl:env.EBOEKHOUDEN_API_BASE_URL?.trim()||undefined}));
}

// Multi-account: bol and e-Boekhouden are both resolved for the goal's legal entity.
export function withFinanceReconciliationFromVault(bundle:ProductionBundle,resolver:CredentialResolver,env:NodeJS.ProcessEnv=process.env):ProductionBundle{
  return withFinanceClients(bundle,scopedBolClient(resolver,env),scopedAccountingClient(resolver,env));
}

export function scopedBolClient(resolver:CredentialResolver,env:NodeJS.ProcessEnv=process.env):BolRetailerClient{
  return entityScopedClient({resolver,provider:"bol",build:f=>new BolRetailerClient({clientId:f.client_id,clientSecret:f.client_secret,
    tokenUrl:env.BOL_TOKEN_URL?.trim()||undefined,baseUrl:env.BOL_RETAILER_BASE_URL?.trim()||undefined})});
}
export function scopedAccountingClient(resolver:CredentialResolver,env:NodeJS.ProcessEnv=process.env):EBoekhoudenClient{
  return entityScopedClient({resolver,provider:"eboekhouden",build:f=>new EBoekhoudenClient({apiToken:f.api_token,
    source:f.source||env.EBOEKHOUDEN_SOURCE?.trim()||"SAM",baseUrl:env.EBOEKHOUDEN_API_BASE_URL?.trim()||undefined})});
}

function withFinanceClients(bundle:ProductionBundle,bol:BolRetailerClient,accounting:EBoekhoudenClient):ProductionBundle{
  const verifier=(capabilityId:typeof IDS[number]):VerificationAdapter=>({
    capabilityId,
    async verify(input){
      const p=input.execution.params??{};
      if(capabilityId==="finance_reconciliation_preview"){
        const [b,m]=await Promise.all([
          bol.listInvoices({periodStartDate:p.period_start_date,periodEndDate:p.period_end_date}),
          accounting.listMutations({limit:p.limit??100,offset:p.offset??0})
        ]);
        const preview=reconcileExactReferences(b,m);
        return {result:"VERIFIED" as const,evidence:{method:"independent_cross_source_readback",counts:preview.counts},verifier:"finance-independent-readback"};
      }
      const body=await accounting.getOutstandingInvoices({limit:p.limit??100,offset:p.offset??0});
      const snapshot=outstandingSnapshot(body);
      return {result:"VERIFIED" as const,evidence:{method:"independent_outstanding_readback",count:snapshot.count},verifier:"finance-independent-readback"};
    }
  });

  return {...bundle,
    capabilities:[...bundle.capabilities,...IDS.map(capabilityId=>({capabilityId,authorityClass:"GREEN" as const,specialistAgentId:"finance",specialistVersion:"1.0.0"}))],
    toolDefinitions:[...bundle.toolDefinitions,...IDS.map(capabilityId=>({capabilityId,authorityClass:"GREEN" as const,sideEffect:false}))],
    toolAdapters:[...bundle.toolAdapters,new FinanceReconciliationPreviewAdapter(bol,accounting),new FinanceOutstandingSnapshotAdapter(accounting)],
    verificationAdapters:[...(bundle.verificationAdapters??[]),verifier("finance_reconciliation_preview"),verifier("finance_outstanding_snapshot")]
  };
}
