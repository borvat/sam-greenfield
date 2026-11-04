import {withOwnerReportEmailFromEnv} from './ownerReportEmailBundle';
import type { ProductionBundle } from "./types";
import {withSamGoogleMcpFromEnv} from "./samGoogleBundle";
import { withStandardModelProvidersFromEnv } from "./standardModels";
import { withGmailFromEnv } from "./gmailBundle";
import { withGmailReadFromEnv } from "./gmailReadBundle";
import { withGoogleDriveFromEnv } from "./driveBundle";
import { withEBoekhoudenFromEnv } from "./eboekhoudenBundle";
import { withBolRetailerFromEnv } from "./bolMcpBundle";
import { withFinanceReconciliationFromEnv } from "./financeReconciliationBundle";
import {withHermesDataAnalysisFromEnv} from './hermesDataAnalysis';
import {withExecutiveBrief} from './executiveBriefCapability';

async function buildBundle():Promise<ProductionBundle>{
  let bundle:ProductionBundle={capabilities:[],toolDefinitions:[],toolAdapters:[]};
  bundle=withStandardModelProvidersFromEnv(bundle);
  if(process.env.SAM_GOOGLE_MCP_ENABLED==="true"){
    bundle=await withSamGoogleMcpFromEnv(bundle);
  }else{
    bundle=process.env.SAM_GOOGLE_READ_ONLY==="true"?withGmailReadFromEnv(bundle):withGmailFromEnv(bundle);
    bundle=withGoogleDriveFromEnv(bundle);
  }
  bundle=await withBolRetailerFromEnv(bundle);
  if(process.env.SAM_GOOGLE_READ_ONLY!=="true"){
    bundle=withEBoekhoudenFromEnv(bundle);
    bundle=withFinanceReconciliationFromEnv(bundle);
  }
  if(process.env.SAM_GOOGLE_READ_ONLY==="true"){
    const allowed=new Set(bundle.toolDefinitions.filter(d=>!d.sideEffect&&d.authorityClass==="GREEN").map(d=>d.capabilityId));
    const keep=(id:string)=>allowed.has(id)||id.startsWith("bol_");
    bundle={...bundle,capabilities:bundle.capabilities.filter(c=>keep(c.capabilityId)),
      toolDefinitions:bundle.toolDefinitions.filter(d=>keep(d.capabilityId)),
      toolAdapters:bundle.toolAdapters.filter(a=>keep(a.capabilityId)),
      verificationAdapters:bundle.verificationAdapters?.filter(v=>keep(v.capabilityId))};
  }
  // Opt-in capability: a failed registration must never keep the worker from starting.
  if(process.env.SAM_EXECUTIVE_BRIEF_ENABLED==='1'){
    try{bundle=withExecutiveBrief(bundle);}
    catch(error){console.error(JSON.stringify({event:'EXECUTIVE_BRIEF_REGISTRATION_FAILED',details:'withheld'}));}
  }
  return withOwnerReportEmailFromEnv(await withHermesDataAnalysisFromEnv(bundle));
}

export default buildBundle;
