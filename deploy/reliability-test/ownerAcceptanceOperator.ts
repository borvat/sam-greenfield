/** Explicit operator CLI only. No startup import, grants, DDL or renewal. */
import {readFile,mkdtemp,writeFile,chmod,rm} from 'node:fs/promises';
import {Client} from 'pg';
import {openPersistentBinding} from './persistentBinding';
import {acceptanceFixture as f,assertAcceptanceEnvironment,assertOwnerAcceptancePrivileges,seedAcceptanceNotification} from './ownerAcceptance';
export async function acceptanceReadback(c:any,entity:string){
 const memories=(await c.query(`SELECT id,type,statement,source,status,scope FROM memory_records
 WHERE scope->>'legal_entity_id'=$1 AND (source=$2 OR scope->>'context_key'=$3) ORDER BY id`,[entity,f.source,f.context_key])).rows;
 if(memories.some((x:any)=>x.type!=='OWNER_DECISION'||x.statement!==f.statement||x.source!==f.source||x.status!=='APPROVED_RULE'||
  x.scope.schema!=='sam.approved_owner_decision.v1'||x.scope.context_key!==f.context_key||x.scope.approved_by!=='command-center-owner')||memories.length>1)throw Error('EXACT_SYNTHETIC_MEMORY_CONFLICT');
 const notifications=(await c.query('SELECT id,goal_id,status,body FROM owner_notifications WHERE id=$1 AND legal_entity_id=$2',[f.notificationId,entity])).rows;
 if(notifications.length!==1)throw Error('EXACT_SYNTHETIC_NOTIFICATION_REQUIRED');
 const n=notifications[0];await seedAcceptanceNotification(c,entity,n.goal_id,false);
 const counts=(await c.query(`SELECT
 (SELECT count(*)::int FROM audit_log WHERE entity_type='legal_entity' AND entity_id=$1 AND actor='command-center-owner' AND action='OWNER_DECISION_SAVED' AND after_ref->>'memoryId'=ANY($2::text[])) save_audits,
 (SELECT count(*)::int FROM audit_log WHERE entity_type='legal_entity' AND entity_id=$1 AND actor='command-center-owner' AND action='OWNER_NOTIFICATION_READ' AND after_ref->>'notificationId'=$3) read_receipts`,[entity,memories.map((x:any)=>x.id),f.notificationId])).rows[0];
 return {company:entity,memoryCount:memories.length,memories,notification:{id:n.id,goalId:n.goal_id,status:n.status,source:n.body.source,synthetic:true},...counts,modelCalls:0,pushPerformed:false};
}
export async function main(){
 assertAcceptanceEnvironment(process.env);
 const [mode,goalId,...extra]=process.argv.slice(2);
 if(!['--seed-notification','--verify'].includes(mode)||extra.length||(mode==='--verify'&&goalId))throw Error('EXPLICIT_UI_ACCEPTANCE_OPERATION_REQUIRED');
 const bytes=await readFile('/etc/secrets/sam-restricted-connection.json');
 if(bytes.length<1||bytes.length>8192)throw Error('PRIVATE_BINDING_FILE_REQUIRED');
 const dir=await mkdtemp('/tmp/sam-ui-acceptance-');await chmod(dir,0o700);
 let storage:Awaited<ReturnType<typeof openPersistentBinding>>;
 try{await writeFile(dir+'/binding.json',bytes,{mode:0o600,flag:'wx'});storage=await openPersistentBinding(dir+'/binding.json');}
 finally{bytes.fill(0);await rm(dir,{recursive:true,force:true});}
 const c=new Client({connectionString:storage.binding.connectionString,connectionTimeoutMillis:5000,statement_timeout:5000});
 try{
  await c.connect();await assertOwnerAcceptancePrivileges(c);
  await c.query(mode==='--verify'?'BEGIN READ ONLY':'BEGIN');
  if(mode==='--seed-notification')await seedAcceptanceNotification(c,storage.binding.entity,goalId??'');
  const result=await acceptanceReadback(c,storage.binding.entity);
  if(performance.now()>=storage.leaseDeadline)throw Error('STORAGE_WINDOW_ENDED');
  await c.query('COMMIT');console.info(JSON.stringify(result));
 }catch(e){await c.query('ROLLBACK').catch(()=>{});throw e;}finally{await c.end();}
}
if(process.argv[1]?.endsWith('/ownerAcceptanceOperator.ts'))void main().catch(()=>{
 console.error('SYNTHETIC_UI_ACCEPTANCE_BLOCKED; no grant, renewal, credential output or model call performed');process.exitCode=1;
});
