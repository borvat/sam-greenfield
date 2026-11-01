import {BolRetailerClient} from "../../../packages/bol/src/client";
import {EBoekhoudenClient} from "../../../packages/eboekhouden/src/client";
import {runFinanceOperationalLoop} from "../../finance/src/operationalLoop";
import {runWithLegalEntity,CredentialError} from "../../../packages/credentials/src/entityContext";
import type {CredentialResolver} from "../../../packages/credentials/src/resolver";
import {scopedBolClient,scopedAccountingClient} from "./financeReconciliationBundle";

export function createFinanceOperationalTickFromEnv(env:NodeJS.ProcessEnv=process.env){
  const legalEntityId=env.SAM_FINANCE_LEGAL_ENTITY_ID?.trim();
  const bId=env.BOL_CLIENT_ID?.trim();
  const bSecret=env.BOL_CLIENT_SECRET?.trim();
  const eToken=env.EBOEKHOUDEN_API_TOKEN?.trim();

  if(!legalEntityId||!bId||!bSecret||!eToken) return undefined;

  const bol=new BolRetailerClient({
    clientId:bId,
    clientSecret:bSecret,
    tokenUrl:env.BOL_TOKEN_URL?.trim()||undefined,
    baseUrl:env.BOL_RETAILER_BASE_URL?.trim()||undefined
  });
  const accounting=new EBoekhoudenClient({
    apiToken:eToken,
    source:env.EBOEKHOUDEN_SOURCE?.trim()||"SAM",
    baseUrl:env.EBOEKHOUDEN_API_BASE_URL?.trim()||undefined
  });

  return ()=>runFinanceOperationalLoop({
    bol,
    accounting,
    legalEntityId,
    intervalMinutes:Number(env.SAM_FINANCE_LOOP_INTERVAL_MINUTES??180),
    lookbackDays:Number(env.SAM_FINANCE_LOOKBACK_DAYS??30),
    materialVarianceCount:Number(env.SAM_FINANCE_MATERIAL_VARIANCE_COUNT??1),
    maxPages:Number(env.SAM_FINANCE_MAX_PAGES??5)
  });
}

// Multi-account: the loop runs for SAM_FINANCE_LEGAL_ENTITY_ID under that entity's vault
// credentials. A missing/incomplete secret skips the tick (reported, not thrown) so an
// entity that is not onboarded yet cannot wedge the runtime loop.
export function createFinanceOperationalTickFromVault(resolver:CredentialResolver,env:NodeJS.ProcessEnv=process.env){
  const legalEntityId=env.SAM_FINANCE_LEGAL_ENTITY_ID?.trim();
  if(!legalEntityId) return undefined;
  const bol=scopedBolClient(resolver,env),accounting=scopedAccountingClient(resolver,env);
  return async()=>{
    try{
      return await runWithLegalEntity(legalEntityId,()=>runFinanceOperationalLoop({
        bol,
        accounting,
        legalEntityId,
        intervalMinutes:Number(env.SAM_FINANCE_LOOP_INTERVAL_MINUTES??180),
        lookbackDays:Number(env.SAM_FINANCE_LOOKBACK_DAYS??30),
        materialVarianceCount:Number(env.SAM_FINANCE_MATERIAL_VARIANCE_COUNT??1),
        maxPages:Number(env.SAM_FINANCE_MAX_PAGES??5)
      }));
    }catch(e){
      if(e instanceof CredentialError&&(e.code==="CREDENTIAL_NOT_CONFIGURED"||e.code==="CREDENTIAL_INCOMPLETE")){
        process.stderr.write(JSON.stringify({event:"FINANCE_LOOP_SKIPPED",code:e.code,legalEntityId})+"\n");
        return {skipped:e.code,legalEntityId};
      }
      throw e;
    }
  };
}
