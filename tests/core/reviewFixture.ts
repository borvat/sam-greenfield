import type {ReconciliableToolAdapter} from '../../packages/tool-gateway/src/types';
import {pool} from '../../packages/db/src/client';
import {validateProductionBundle} from '../../apps/production/src/bundle';
export async function reviewFixture(sideEffect=false){
 const org=(await pool.query("INSERT INTO organizations(name) VALUES('Synthetic review organization') RETURNING id")).rows[0].id;
 const entity=(await pool.query("INSERT INTO legal_entities(org_id,name) VALUES($1,'Synthetic review entity') RETURNING id",[org])).rows[0].id;
 await pool.query(`INSERT INTO model_providers(provider_id,models,capabilities,privacy_class_allowed,health,cost_per_1k_input,cost_per_1k_output)
 VALUES('review','["review"]','["planning"]','["INTERNAL"]','HEALTHY',0,0)`);
 let invokes=0,sends=0,reconciles=0;
 const adapter:ReconciliableToolAdapter={capabilityId:'review_echo',async execute(){sends++;return {result:{ok:true},evidence:{readback:true},providerReference:'synthetic-only'};},
   async reconcile(){reconciles++;return {result:'NOT_FOUND',evidence:{synthetic:true}};}};
 const bundle=validateProductionBundle({
  capabilities:[{capabilityId:'review_echo',authorityClass:sideEffect?'YELLOW':'GREEN',specialistAgentId:'review',specialistVersion:'1'}],
  toolDefinitions:[{capabilityId:'review_echo',authorityClass:sideEffect?'YELLOW':'GREEN',sideEffect}],
  toolAdapters:[adapter],
  modelProviderConfigs:[{providerId:'review',models:['review'],capabilities:['planning'],privacyClasses:['INTERNAL'],health:'HEALTHY',costPer1kInput:0,costPer1kOutput:0}],
  modelAdapters:[{providerId:'review',async invoke(task:any){invokes++;if(task.input.objective.startsWith('fail'))throw Error('SYNTHETIC_PRIVATE_ERROR');
   await new Promise(r=>setTimeout(r,5));return {model:'review',usage:{inputTokens:1,outputTokens:1},output:{steps:[{capabilityId:'review_echo',params:{ok:true}}]}};}}]
 });
 async function goal(objective:string,state='NEW'){
  return (await pool.query(`INSERT INTO goals(business_id,company_scope,objective,state,authority_ceiling,domain)
   VALUES($1,$2,$3,$4,$5,'review_fixture') RETURNING id`,['review-'+crypto.randomUUID(),entity,objective,state,sideEffect?'YELLOW':'GREEN'])).rows[0].id;
 }
 return {org,entity,bundle,goal,counters:()=>({invokes,sends,reconciles})};
}
