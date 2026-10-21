import {test} from "node:test";
import assert from "node:assert/strict";
import {pool} from "../../packages/db/src/client";
import {verifyNextExecution} from "../../apps/production/src/verifier";

test("a busy or already verified execution is not read twice; thrown verification releases its cross-worker claim",async()=>{
 const original=pool.connect;
 try{
  for(const scenario of ["busy","stale","throw"]){
   let connections=0,unlocks=0,releases=0,reads=0;
   (pool as any).connect=async()=>{
    const selection=++connections===1;
    return {release(){releases++},async query(sql:string){
     if(selection)return sql.includes("FROM executions e")?{rows:[{id:"execution",capability_id:"read",params:{},evidence:{},contract_id:"contract"}]}:{rows:[]};
     if(sql.includes("pg_try_advisory_lock"))return {rows:[{locked:scenario!=="busy"}]};
     if(sql.includes("pg_advisory_unlock")){unlocks++;return {rows:[]}}
     return {rows:[],rowCount:scenario==="stale"?0:1};
    }};
   };
   const bundle:any={verifiers:new Map([["read",{async verify(){reads++;throw new Error("provider unavailable")}}]])};
   if(scenario==="throw")await assert.rejects(verifyNextExecution(bundle),/provider unavailable/);
   else assert.equal((await verifyNextExecution(bundle)).processed,false);
   assert.equal(reads,scenario==="throw"?1:0);assert.equal(unlocks,scenario==="busy"?0:1);assert.equal(releases,2);
  }
 }finally{pool.connect=original}
});
