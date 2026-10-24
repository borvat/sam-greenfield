const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createServer}=require('node:http');
const {createStorageLease}=require('../../deploy/render-test/storageLease.cjs');
test('test storage window rejects missing, expired, infinite or overlong leases',()=>{
 for(const ms of [undefined,0,-1,2000,Infinity,NaN,3600001])assert.throws(()=>createStorageLease(ms,()=>{}),/STORAGE_WINDOW_INVALID/);
});
test('deadline check refuses HTTP work even if the expiry timer was delayed',async()=>{
 let clock=10,stops=0,writes=0;const scheduled=[];
 const lease=createStorageLease(10000,()=>stops++,{now:()=>clock,schedule:(f,ms)=>{scheduled.push({f,ms});return 1;},cancel:()=>{}});
 const server=createServer((req,res)=>{if(lease.expired()){res.writeHead(503);res.end();return;}writes++;res.end('admitted');});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 try{
  assert.equal((await fetch(url)).status,200);assert.equal(scheduled[0].ms,8000);
  clock=8010;assert.equal((await fetch(url)).status,503);assert.equal(writes,1);assert.equal(stops,1);
  scheduled[0].f();assert.equal(lease.expired(),true);assert.equal(stops,1);
 }finally{lease.close();await new Promise(r=>server.close(r));}
});
test('timer expiry ends admission once and cannot renew its deadline',()=>{
 let clock=0,callback,stops=0;
 const lease=createStorageLease(10000,()=>stops++,{now:()=>clock,schedule:f=>{callback=f;return 1;},cancel:()=>{}});
 callback();clock=1;assert.equal(lease.expired(),true);callback();assert.equal(stops,1);
});
