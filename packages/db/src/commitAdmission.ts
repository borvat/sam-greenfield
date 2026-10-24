import {AsyncLocalStorage} from 'node:async_hooks';
import type {PoolClient} from 'pg';
type Admission=(client:PoolClient)=>Promise<unknown>;
type Transition={goalId:string;from:string;to:string;eventId:string;transactionId:string};
type Scope={admit:Admission;transitions?:WeakMap<object,Transition[]>};
const admissions=new AsyncLocalStorage<Scope>();
/** Internal trusted runtime scope; ordinary transactions have no extra admission. */
export function withCommitAdmission<T>(admit:Admission,run:()=>Promise<T>,trackGoalTransitions=false):Promise<T>{
 if(admissions.getStore())throw Error('COMMIT_ADMISSION_ALREADY_BOUND');
 return admissions.run({admit,...(trackGoalTransitions?{transitions:new WeakMap<object,Transition[]>()}:{})},run);
}
export async function assertCommitAdmission(client:PoolClient){await admissions.getStore()?.admit(client);}
/** Called by the state machine only after its locked update and outbox INSERT.
 * Private scope + transaction identity prevents a later outbox UPDATE, pooled
 * connection reuse, or a different request from authorizing a late commit. */
export async function recordAdmittedGoalTransition(client:PoolClient,event:Omit<Transition,'transactionId'>){
 const map=admissions.getStore()?.transitions;if(!map)return;
 const transactionId=(await client.query('SELECT txid_current()::text id')).rows[0].id;
 const prior=map.get(client)?.filter(t=>t.transactionId===transactionId)??[];
 map.set(client,[...prior,{...event,transactionId}]);
}
export async function hasAdmittedGoalTransition(client:PoolClient,goalId:string,to:string,allowedFrom:readonly string[]){
 const records=admissions.getStore()?.transitions?.get(client);if(!records?.length)return false;
 const transactionId=(await client.query('SELECT txid_current()::text id')).rows[0].id;
 const ids=records.filter(t=>t.transactionId===transactionId&&t.goalId===goalId&&t.to===to&&allowedFrom.includes(t.from)).map(t=>t.eventId);
 if(!ids.length)return false;
 // A transition rolled back to a savepoint is not an authorization receipt.
 return (await client.query("SELECT 1 FROM outbox_events WHERE id=ANY($1::uuid[]) AND aggregate_id=$2 AND event_type='GOAL_STATE_CHANGED' AND payload->>'to'=$3 LIMIT 1",[ids,goalId,to])).rowCount!==0;
}
