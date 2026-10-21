import test from 'node:test';
import assert from 'node:assert/strict';
import {lab} from './lab';
import {projectOwnerNotifications,runOwnerNotificationTick} from '../../apps/notifications/src/center';
import {createChatGPTToolSurface} from '../../apps/chatgpt-tools/src/surface';
import {createGoal} from '../../apps/production/src/dispatcher';

test('disabled inbox is inert without a database and owner read validates scope',async()=>{
 delete process.env.SAM_NOTIFICATIONS_ENABLED;
 const unavailable={connect:async()=>{throw new Error('unavailable')}};
 assert.deepEqual(await projectOwnerNotifications(unavailable),{enabled:false,created:0});
 const surface=createChatGPTToolSurface(),owner={actor:'fixture',systemOwner:true};
 assert.equal((await surface.invoke('sam_list_notifications',{},owner)).ok,false);
 assert.deepEqual((await surface.invoke('sam_list_notifications',{legal_entity_id:'11111111-1111-4111-8111-111111111111'},owner)).data,[]);
 process.env.SAM_NOTIFICATIONS_ENABLED='true';
 try{assert.equal((await runOwnerNotificationTick(unavailable)).errorCode,'NOTIFICATION_PROJECTION_FAILED')}
 finally{delete process.env.SAM_NOTIFICATIONS_ENABLED}
});

test('owner inbox rolls back receipts atomically, suppresses stale approvals and enforces database row isolation',async()=>{
 const l=await lab();process.env.SAM_NOTIFICATIONS_ENABLED='true';
 try{
  await l.db.query("INSERT INTO notification_settings(id,enabled_at) VALUES('owner',now()-interval '1 hour')");
  const goal=await createGoal({legalEntityId:l.entity,objective:'Isolated owner decision',actor:'fixture',authorityCeiling:'YELLOW'});
  await l.db.query("UPDATE goals SET state='WAITING_OWNER' WHERE id=$1",[goal.id]);
  await l.db.query("INSERT INTO outbox_events(aggregate_type,aggregate_id,event_type,payload) VALUES('goal',$1,'GOAL_STATE_CHANGED',$2)",[goal.id,{to:'WAITING_OWNER',reason:'candidate_plan_requires_authority'}]);
  const failed={connect:async()=>({query:async(sql:string,args?:any[])=>{
   if(sql.includes('notification_event_receipts')&&sql.includes('INSERT'))throw new Error('injected fixture failure');
   if(sql.includes('pg_try_advisory'))return {rows:[{locked:true}]};
   return l.db.query(sql,args);
  },release(){}})};
  await assert.rejects(projectOwnerNotifications(failed),/injected/);
  assert.equal((await l.db.query('SELECT * FROM owner_notifications')).rows.length,0);
  assert.equal((await l.db.query('SELECT * FROM notification_event_receipts')).rows.length,0);
  assert.equal((await projectOwnerNotifications()).created,1);
  assert.equal((await projectOwnerNotifications()).created,0);
  const row:any=(await l.db.query('SELECT * FROM owner_notifications')).rows[0];
  assert.equal(row.status,'UNROUTED');assert.equal(row.confirmed_at,null);assert.equal(row.read_at,null);
  await l.db.exec('CREATE ROLE owner_fixture_reader; GRANT USAGE ON SCHEMA public TO owner_fixture_reader; GRANT SELECT ON owner_notifications TO owner_fixture_reader; SET ROLE owner_fixture_reader');
  assert.equal((await l.db.query('SELECT * FROM owner_notifications')).rows.length,0);
  await l.db.query("SELECT set_config('app.current_legal_entity_id',$1,false)",[l.other]);
  assert.equal((await l.db.query('SELECT * FROM owner_notifications')).rows.length,0);
  await l.db.query("SELECT set_config('app.current_legal_entity_id',$1,false)",[l.entity]);
  assert.equal((await l.db.query('SELECT * FROM owner_notifications')).rows.length,1);
  await l.db.exec('RESET ROLE');
  await l.db.query("UPDATE goals SET state='EXECUTING' WHERE id=$1",[goal.id]);
  await projectOwnerNotifications();
  assert.equal((await l.db.query('SELECT status FROM owner_notifications WHERE id=$1',[row.id])).rows[0].status,'SUPPRESSED');
 }finally{await l.db.exec('RESET ROLE');delete process.env.SAM_NOTIFICATIONS_ENABLED;await l.close()}
});
