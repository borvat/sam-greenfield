/** Checkpoint safety only: no company draft business handler may touch the DB. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {pool} from '../../packages/db/src/client';
import {startCommandCenterHttpServer} from '../../apps/command-center/src/http';

test('company drafts fail closed when disabled and reject every mutation in read-only mode before DB access',async t=>{
 const priorCompany=process.env.SAM_COMPANY_ENABLED,priorReadOnly=process.env.SAM_COMMAND_CENTER_READ_ONLY;
 t.after(()=>{
  if(priorCompany===undefined)delete process.env.SAM_COMPANY_ENABLED;else process.env.SAM_COMPANY_ENABLED=priorCompany;
  if(priorReadOnly===undefined)delete process.env.SAM_COMMAND_CENTER_READ_ONLY;else process.env.SAM_COMMAND_CENTER_READ_ONLY=priorReadOnly;
 });
 let dbAccess=0;
 const denyDatabase=()=>{dbAccess++;throw Error('UNEXPECTED_DATABASE_ACCESS');};
 t.mock.method(pool,'connect',denyDatabase);
 t.mock.method(pool,'query',denyDatabase);
 const service=await startCommandCenterHttpServer({legalEntityId:'synthetic-unused',port:0,host:'127.0.0.1',bearerToken:'synthetic-company-gate-only'});
 t.after(()=>service.close());
 const address=service.server.address();assert.ok(address&&typeof address!=='string');
 const base='http://127.0.0.1:'+address.port;
 const headers={authorization:'Bearer synthetic-company-gate-only','content-type':'application/json'};
 const writes=['/performance/assess','/reports/settings','/skills/propose','/skills/review','/skills/adopt','/skills/replace'];
 for(const flag of [undefined,'0','true']){
  if(flag===undefined)delete process.env.SAM_COMPANY_ENABLED;else process.env.SAM_COMPANY_ENABLED=flag;
  for(const [method,path] of [...['/office','/memory?profile=research&query=test','/reports','/skills'].map(path=>['GET',path]),...writes.map(path=>['POST',path])]){
   const response=await fetch(base+'/api/company'+path,{method,headers,...(method==='POST'?{body:'{invalid-json'}:{})});
   assert.equal(response.status,503,path);assert.deepEqual(await response.json(),{error:'company_feature_disabled'});
  }
 }
 process.env.SAM_COMPANY_ENABLED='1';process.env.SAM_COMMAND_CENTER_READ_ONLY='1';
 for(const path of writes){
  const response=await fetch(base+'/api/company'+path,{method:'POST',headers,body:'{invalid-json'});
  assert.equal(response.status,405,path);assert.equal(response.headers.get('allow'),'GET');
  assert.deepEqual(await response.json(),{error:'command_center_read_only'});
 }
 assert.equal(dbAccess,0);
});
