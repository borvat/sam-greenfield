import assert from 'node:assert/strict';
import {pool,withTransaction} from '../../packages/db/src/client';
import {insertOutboxEvent} from '../../packages/db/src/outbox';
import {createProductionComposition} from '../../apps/production/src/composition';
import {validateProductionBundle} from '../../apps/production/src/bundle';
import {reviewFixture} from './reviewFixture';
async function main(){
 const f=await reviewFixture();
 const bundle=validateProductionBundle({...f.bundle.raw,modelAdapters:[],modelProviderConfigs:[]});
 await withTransaction(async c=>{for(let i=0;i<350;i++)await insertOutboxEvent(c,{aggregateType:'review',aggregateId:crypto.randomUUID(),eventType:'SYNTHETIC_REVIEW_EVENT',payload:{index:i}});});
 const composition=createProductionComposition({bundle,workerId:'synthetic-backlog'}),start=performance.now();
 const batches=[];
 for(let i=0;i<4;i++){
  const result:any=await composition.runWorkTick();
  assert(result.events.relayed<=100&&result.events.consumed<=100);batches.push(result.events);
 }
 const ms=Math.round(performance.now()-start);assert(ms<5000,`350-event backlog exceeded 5000 ms: ${ms}`);
 assert.equal((await pool.query("SELECT count(*)::int n FROM outbox_events WHERE status='PENDING'")).rows[0].n,0);
 assert.equal((await pool.query("SELECT count(*)::int n,count(DISTINCT dedup_key)::int unique_n FROM event_fabric_events WHERE event_type='SYNTHETIC_REVIEW_EVENT'")).rows[0].unique_n,350);
 assert.equal((await pool.query("SELECT count(*)::int n FROM inbox_events WHERE consumer_id='kernel_runtime' AND status='PROCESSED'")).rows[0].n,350);
 console.log(JSON.stringify({check:'bounded event backlog',events:350,ticks:4,batches,ms,thresholdMs:5000}));
 await pool.end();
}
main().catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
