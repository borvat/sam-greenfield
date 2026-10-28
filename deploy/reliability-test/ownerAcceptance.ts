/** Exact synthetic UI exception; no general write-mode switch. */
import {randomUUID,timingSafeEqual} from 'node:crypto';
import {request,type IncomingMessage,type ServerResponse} from 'node:http';
import {sha256Hex} from '../../packages/shared/src/stableJson';
export const acceptanceFixture=Object.freeze({
 context_key:['sam','ui','acceptance','20261028'].join('_'),source:'synthetic:ui-acceptance:20261028',
 statement:'TEST DATA ONLY — SAM UI acceptance fixture; no business decision or execution authority.',
 notificationId:'a1829450-3810-4aac-8af3-4e0331ff0186'
});
export const acceptanceHost='sam-isolated-test.onrender.com';
export const acceptanceService='srv-dbe27ics728c738tuoc0';
export const acceptanceHeader='x-sam-isolated-acceptance';
export const notificationDedup='synthetic:ui-acceptance:20261028:notification';
const startupGoalCompany='2796e0d9-1701-4e53-a7ac-d198c0e44c01';
const startupGoalObjective='Read-only synthetic startup check. Execution remains disabled.';
const goalMetadata='g.id,g.company_scope,g.business_id,g.objective,g.domain,g.state,g.authority_ceiling,g.parent_goal_id,g.current_plan_id';
async function startupNotificationGoals(c:any,entity:string,goalId?:string){
 if(entity!==startupGoalCompany)return [];
 return (await c.query(`SELECT ${goalMetadata} FROM goals g
 JOIN evaluation_companies ec ON ec.legal_entity_id=g.company_scope AND ec.purpose='SYNTHETIC_EVALUATION_ONLY'
 WHERE g.company_scope=$1 AND ($2::uuid IS NULL OR g.id=$2) AND g.company_scope=$3
 AND g.business_id='G000001' AND g.objective=$4 AND g.domain='owner_command' AND g.state='NEW' AND g.authority_ceiling='GREEN'
 AND g.parent_goal_id IS NULL AND g.current_plan_id IS NULL
 AND NOT EXISTS(SELECT 1 FROM plans p WHERE p.goal_id=g.id)
 AND NOT EXISTS(SELECT 1 FROM work_queue w WHERE w.goal_id=g.id)
 AND NOT EXISTS(SELECT 1 FROM executions e WHERE e.goal_id=g.id)`,[entity,goalId??null,startupGoalCompany,startupGoalObjective])).rows;
}
/** Read-only discovery refuses ambiguity; output is limited to goal provenance. */
export async function inspectNotificationGoal(c:any,entity:string){
 const trials=(await c.query(`SELECT DISTINCT g.id FROM goals g JOIN evaluation_trials t ON t.root_goal_id=g.id AND t.legal_entity_id=g.company_scope
 JOIN evaluation_companies ec ON ec.legal_entity_id=g.company_scope AND ec.purpose='SYNTHETIC_EVALUATION_ONLY'
 WHERE g.company_scope=$1`,[entity])).rows;
 const startup=await startupNotificationGoals(c,entity);
 const ids=[...new Set([...trials,...startup].map((g:any)=>g.id))];
 if(ids.length!==1)throw Error('EXACT_SYNTHETIC_GOAL_REQUIRED');
 const rows=(await c.query(`SELECT ${goalMetadata} FROM goals g WHERE g.id=$1 AND g.company_scope=$2`,[ids[0],entity])).rows;
 if(rows.length!==1)throw Error('EXACT_SYNTHETIC_GOAL_REQUIRED');
 return {goal:rows[0],eligibility:trials.some((g:any)=>g.id===ids[0])?'EXISTING_EVALUATION_TRIAL':'EXACT_SYNTHETIC_STARTUP_GOAL',modelCalls:0};
}
export function notificationBody(goalId:string){return {schema:'sam.owner_notification.v1',synthetic:true,source:acceptanceFixture.source,goalId,
 summary:acceptanceFixture.statement,requiredAction:'NONE',deliveryMeaning:'UNROUTED means stored internally, not sent to the owner'};}
export async function assertOwnerAcceptancePrivileges(c:any){
 const row=(await c.query(`SELECT bool_and(to_regclass(name) IS NOT NULL AND has_table_privilege(current_user,to_regclass(name),'SELECT')
 AND CASE WHEN name IN ('memory_records','audit_log','owner_notifications') THEN has_table_privilege(current_user,to_regclass(name),'INSERT') ELSE true END
 AND CASE WHEN name='memory_records' THEN has_table_privilege(current_user,to_regclass(name),'UPDATE') ELSE true END) allowed
 FROM unnest(ARRAY['memory_records','audit_log','owner_notifications','goals','evaluation_trials','evaluation_companies']) name`)).rows[0];
 if(row?.allowed!==true)throw Error('PERSISTENT_UI_ACCEPTANCE_PRIVILEGES_REQUIRED');
}
/** Caller owns transaction; never creates a goal, company, policy or memory. */
export async function seedAcceptanceNotification(c:any,entity:string,goalId:string,insertIfMissing=true){
 if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(goalId))throw Error('EXACT_SYNTHETIC_GOAL_REQUIRED');
 await c.query('SELECT pg_advisory_xact_lock(hashtext($1))',[notificationDedup]);
 let goal=(await c.query(`SELECT g.id FROM goals g JOIN evaluation_trials t ON t.root_goal_id=g.id AND t.legal_entity_id=g.company_scope
 JOIN evaluation_companies ec ON ec.legal_entity_id=g.company_scope AND ec.purpose='SYNTHETIC_EVALUATION_ONLY'
 WHERE g.id=$1 AND g.company_scope=$2 LIMIT 1`,[goalId,entity])).rows[0];
 if(!goal){const startup=await startupNotificationGoals(c,entity,goalId);if(startup.length===1)goal=startup[0];}
 if(!goal)throw Error('EXACT_SYNTHETIC_GOAL_REQUIRED');
 let rows=(await c.query('SELECT * FROM owner_notifications WHERE id=$1 OR dedup_key=$2',[acceptanceFixture.notificationId,notificationDedup])).rows;
 const body=notificationBody(goalId);
 if(!rows.length&&insertIfMissing){
  await c.query(`INSERT INTO owner_notifications(id,legal_entity_id,goal_id,dedup_key,kind,severity,title,body,status)
   VALUES($1,$2,$3,$4,'PROGRESS','INFO','TEST DATA ONLY — SAM UI acceptance notification',$5::jsonb,'UNROUTED')`,
   [acceptanceFixture.notificationId,entity,goalId,notificationDedup,JSON.stringify(body)]);
  rows=(await c.query('SELECT * FROM owner_notifications WHERE id=$1 OR dedup_key=$2',[acceptanceFixture.notificationId,notificationDedup])).rows;
 }
 const x=rows[0];
 if(rows.length!==1||!x||x.id!==acceptanceFixture.notificationId||x.dedup_key!==notificationDedup||x.legal_entity_id!==entity||x.goal_id!==goalId||x.status!=='UNROUTED'||
  x.kind!=='PROGRESS'||x.severity!=='INFO'||x.title!=='TEST DATA ONLY — SAM UI acceptance notification'||sha256Hex(x.body)!==sha256Hex(body)||
  x.source_event_id||x.channel||x.recipient_ref||x.accepted_at||x.confirmed_at||x.receipt_id||x.read_at||Number(x.attempt??0)!==0)throw Error('EXACT_SYNTHETIC_NOTIFICATION_CONFLICT');
 return {notificationId:x.id,goalId:x.goal_id,status:x.status,source:x.body.source,synthetic:true};
}
export function assertAcceptanceEnvironment(env:NodeJS.ProcessEnv){
 if(env.SAM_RELIABILITY_TEST_ENABLED!=='1'||env.SAM_UI_ACCEPTANCE_ENABLED!=='1'||env.RENDER_SERVICE_ID!==acceptanceService||env.RENDER_EXTERNAL_HOSTNAME!==acceptanceHost)throw Error('EXACT_UI_ACCEPTANCE_OPT_IN_REQUIRED');
}
export function cappedAcceptanceDeadline(originalDeadline:number,started:number){
 if(!Number.isFinite(originalDeadline)||!Number.isFinite(started))throw Error('STORAGE_WINDOW_INVALID');
 return Math.min(originalDeadline,started+30*60*1000);
}
export function createOwnerAcceptance(deadline:number,{now=()=>performance.now(),wallNow=()=>Date.now()}={}){
 const nonce=randomUUID(),startedAt=wallNow();let frozenSave:string|undefined;
 const lost=new Set<string>();
 function assertMutation(req:Pick<IncomingMessage,'method'|'url'|'headers'>,body:unknown){
  if(now()>=deadline||!Number.isFinite(deadline))throw Error('EXACT_UI_ACCEPTANCE_EXPIRED');
  if(req.method!=='POST'||req.headers.host!==acceptanceHost||req.headers[acceptanceHeader]!==nonce)throw Error('EXACT_UI_ACCEPTANCE_REQUEST_REQUIRED');
  if(!body||typeof body!=='object'||Array.isArray(body))throw Error('EXACT_UI_ACCEPTANCE_BODY_REQUIRED');
  const x=body as Record<string,unknown>;
  if(req.url===`/api/notifications/${acceptanceFixture.notificationId}/ack`){
   if(Object.keys(x).length)throw Error('EXACT_UI_ACCEPTANCE_BODY_REQUIRED');
   return;
  }
  if(req.url!=='/api/owner-memory'||Object.keys(x).sort().join(',')!=='approved,context_key,idempotency_key,source,source_timestamp,statement'||
   x.statement!==acceptanceFixture.statement||x.context_key!==acceptanceFixture.context_key||x.source!==acceptanceFixture.source||x.approved!==true||
   typeof x.idempotency_key!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x.idempotency_key)||
   typeof x.source_timestamp!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(x.source_timestamp)||
   !Number.isFinite(Date.parse(x.source_timestamp))||new Date(x.source_timestamp).toISOString()!==x.source_timestamp||
   Date.parse(x.source_timestamp)<startedAt||Date.parse(x.source_timestamp)>wallNow())throw Error('EXACT_UI_ACCEPTANCE_FIXTURE_REQUIRED');
  const canonical=JSON.stringify([x.statement,x.context_key,x.source,x.source_timestamp,x.idempotency_key,x.approved]);
  if(frozenSave&&frozenSave!==canonical)throw Error('EXACT_UI_ACCEPTANCE_REPLAY_REQUIRED');
  frozenSave=canonical;
 }
 return {nonce,assertMutation,notificationId:acceptanceFixture.notificationId,memoryFixture:acceptanceFixture,
  loseSuccessfulResponse(path:string,status:number,body:unknown){
   const expected=path==='/api/owner-memory'?201:path===`/api/notifications/${acceptanceFixture.notificationId}/ack`?200:0;
   const x=body as {ok?:boolean;data?:unknown}|null;
   if(!expected||status!==expected||!x?.ok||!x.data||lost.has(path))return false;
   lost.add(path);return true;
  }};
}
/** Buffer the committed CC reply before withholding it once; retries hit CC again. */
export async function forwardAcceptanceMutation(req:IncomingMessage,res:ServerResponse,gate:ReturnType<typeof createOwnerAcceptance>,token:string,port:number){
 const deny=(status:number,error:string)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify({error}));};
 if(req.method!=='POST'||!(req.url==='/api/owner-memory'||req.url===`/api/notifications/${gate.notificationId}/ack`)){deny(405,'command_center_read_only');return;}
 const supplied=Buffer.from(req.headers.authorization??''),expected=Buffer.from('Bearer '+token);
 if(supplied.length!==expected.length||!timingSafeEqual(supplied,expected)){deny(401,'unauthorized');return;}
 const headers={...req.headers};let body:Buffer;
 try{
  if(headers[acceptanceHeader]!==undefined)throw Error('EXACT_UI_ACCEPTANCE_REQUEST_REQUIRED');
  const chunks:Buffer[]=[];let size=0;
  for await(const chunk of req){const b=Buffer.from(chunk);size+=b.length;if(size>8192)throw Error('EXACT_UI_ACCEPTANCE_BODY_REQUIRED');chunks.push(b);}
  body=Buffer.concat(chunks);headers[acceptanceHeader]=gate.nonce;
  gate.assertMutation({method:req.method,url:req.url,headers},JSON.parse(body.toString('utf8')));
 }catch{deny(403,'isolated_fixture_request_denied');return;}
 const upstream=request({hostname:'127.0.0.1',port,path:req.url,method:'POST',headers},r=>{
  const chunks:Buffer[]=[];r.on('data',(b:Buffer)=>chunks.push(b));
  r.on('end',()=>{
   const response=Buffer.concat(chunks);let value:unknown;try{value=JSON.parse(response.toString('utf8'));}catch{}
   if(gate.loseSuccessfulResponse(req.url!,r.statusCode??502,value)){
    deny(503,'Synthetic acceptance: committed response intentionally withheld once; retry this unchanged form or button.');return;
   }
   res.writeHead(r.statusCode??502,r.headers);res.end(response);
  });
  r.on('error',()=>{if(!res.headersSent)deny(503,'test_service_unavailable');else res.end();});
 });
 upstream.on('error',()=>{if(!res.headersSent)deny(503,'test_service_unavailable');else res.end();});
 upstream.end(body);
}
