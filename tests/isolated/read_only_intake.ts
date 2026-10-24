import assert from 'node:assert/strict';
import {pool} from '../../packages/db/src/client';
import {createOwnerGoal} from '../../apps/command-center/src/store';
const entity='11111111-1111-4111-8111-111111111111';
process.env.SAM_COMMAND_CENTER_READ_ONLY='1';process.env.SAM_REQUIRE_GOAL_ACCEPTANCE='1';
const calls:{sql:string;params?:any[]}[]=[];
const c:any={query:async(sql:string,params?:any[])=>{
 calls.push({sql,params});
 if(sql.includes('FROM legal_entities'))return {rowCount:1,rows:[{id:entity,org_id:entity}]};
 if(sql.includes('next_business_id'))return {rows:[{business_id:'TEST-1',id:'TEST-1'}]};
 if(sql.includes('INSERT INTO goals'))return {rows:[{id:entity,state:'NEW',company_scope:entity}]};
 return {rows:[]};
}};
async function main(){try{
 await assert.rejects(createOwnerGoal(entity,{objective:'Read the supplied inventory.',authorityCeiling:'YELLOW'},{client:c,goalId:entity,actor:'fixture'}),/READ_ONLY_STAGE_AUTHORITY_REQUIRED/);
 await assert.rejects(createOwnerGoal(entity,{objective:'Read the supplied inventory.',acceptanceContract:{}},{client:c,goalId:entity,actor:'fixture'}),/READ_ONLY_STAGE_REPORT_CONTRACT_REQUIRED/);
 assert.equal(calls.filter(x=>x.sql.includes('OWNER_GOAL_DENIED')).length,2);
 await createOwnerGoal(entity,{objective:'Read the supplied inventory.'},{client:c,goalId:entity,actor:'fixture'});
 const insert=calls.find(x=>x.sql.includes('INSERT INTO goals'));assert(insert);
 assert(insert.params?.includes('sam.read_report.v1'));assert(insert.params?.includes('GREEN'));
 console.log('PASS natural-language read-only intake uses existing verified-report contract; elevated authority refused');
}finally{await pool.end();}}
void main().catch(error=>{console.error(error);process.exitCode=1;});
