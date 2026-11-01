'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{ProcessRegistry}=require('./process-registry.cjs');
async function ready(child){await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('FIXTURE_BOOT_TIMEOUT')),3000);child.stdout.once('data',()=>{clearTimeout(timer);resolve();});child.once('error',reject);});}
test('all phase/service children remain registered; timeout cleanup waits and escalates ignoring child',async()=>{
 const registry=new ProcessRegistry();
 const first=registry.spawn(process.execPath,['-e',"process.stdout.write('ready');setInterval(()=>{},1000)"],{env:{},stdio:['ignore','pipe','pipe']},'offline-phase');await ready(first);
 try{await assert.rejects(registry.wait(first,10),/REGISTERED_CHILD_WAIT_TIMEOUT/);}finally{const result=await registry.stop(first,100,1000);assert.equal(result.signal,'SIGTERM');}
 const ignoring=registry.spawn(process.execPath,['-e',"process.on('SIGTERM',()=>{});process.stdout.write('ready');setInterval(()=>{},1000)"],{env:{},stdio:['ignore','pipe','pipe']},'offline-ignores-term');await ready(ignoring);
 const killed=await registry.stop(ignoring,30,1000);assert.equal(killed.escalated,true);assert.equal(killed.signal,'SIGKILL');
 const cleanup=await registry.stopAll();assert.equal(cleanup.allRegisteredChildrenClosed,true);assert.equal(cleanup.children.length,2);assert.ok(cleanup.children.every(child=>child.pid&&child.signal));assert.ok(cleanup.children.some(child=>child.escalated));
});
