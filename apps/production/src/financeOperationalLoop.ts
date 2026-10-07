import {BolRetailerClient} from "../../../packages/bol/src/client";
import {EBoekhoudenClient} from "../../../packages/eboekhouden/src/client";
import {runFinanceOperationalLoop} from "../../finance/src/operationalLoop";

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
