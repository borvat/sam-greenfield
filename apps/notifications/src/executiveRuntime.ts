import {withTransaction} from '../../../packages/db/src/client';
import {generateExecutiveReports,claimExecutiveDelivery,finishExecutiveDelivery,recoverExecutiveDeliveries,type ExecutiveDeliveryAdapter} from './executiveReports';
/** No default transport: an owner-approved, server-configured adapter is required. */
export async function runExecutiveReportTick(adapter?:ExecutiveDeliveryAdapter){
 if(process.env.SAM_EXECUTIVE_REPORTS_ENABLED!=='1')return {enabled:false};
 const context={actor:'sam-executive-scheduler',systemOwner:true,legalEntityId:process.env.SAM_DEFAULT_LEGAL_ENTITY_ID};
 const generation=await withTransaction(async c=>({ ...await generateExecutiveReports(c,context),recovery:await recoverExecutiveDeliveries(c,context)}));
 if(!adapter)return {enabled:true,generation,delivery:'BLOCKED_ADAPTER_UNCONFIGURED'};
 const claim=await withTransaction(c=>claimExecutiveDelivery(c,context,adapter.channel));
 if(!claim)return {enabled:true,generation,delivery:'NO_ELIGIBLE_REPORT'};
 let result:Awaited<ReturnType<ExecutiveDeliveryAdapter['send']>>;
 const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
 try{result=await Promise.race([adapter.send({reportId:claim.id,artifact:claim.artifact,hash:claim.artifact_hash,recipientRef:claim.recipient_ref,idempotencyKey:claim.id,signal:controller.signal}),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('TRANSPORT_TIMEOUT'));},45000);})]);}
 catch{result={outcome:'UNKNOWN',errorCode:'TRANSPORT_AMBIGUOUS'};}
 finally{if(timer)clearTimeout(timer);}
 const delivery=await withTransaction(c=>finishExecutiveDelivery(c,context,claim,result));
 return {enabled:true,generation,delivery};
}
