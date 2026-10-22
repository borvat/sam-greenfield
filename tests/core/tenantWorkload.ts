import assert from 'node:assert/strict';
import {Client} from 'pg';
import {pool,withTransaction} from '../../packages/db/src/client';
import {assertRuntimeTenantBinding,provisionRuntimeAccess} from '../../packages/db/src/runtimeAccess';
import {assertReleaseDatabaseSafety} from '../../packages/db/src/releaseSafety';
import {reviewFixture} from './reviewFixture';
async function main(){
 const f=await reviewFixture(),schema=(await pool.query('SELECT current_schema() s')).rows[0].s;
 const tenants=[{org:f.org,entity:f.entity}];
 for(let i=1;i<4;i++){
  const org=(await pool.query("INSERT INTO organizations(name) VALUES($1) RETURNING id",['Synthetic org '+i])).rows[0].id;
  const entity=(await pool.query("INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",[org,'Synthetic company '+i])).rows[0].id;
  tenants.push({org,entity});
 }
 const roles:string[]=[],clients:Client[]=[];
 async function login(role:string,tenant:{org:string;entity:string}){
  const url=new URL(process.env.DATABASE_URL!);url.username=role;url.password='review-fixture-only';
  const client=new Client({connectionString:url.href});await client.connect();clients.push(client);
  await client.query("SELECT set_config('app.current_org_id',$1,false),set_config('app.current_legal_entity_id',$2,false)",[tenant.org,tenant.entity]);
  return client;
 }
 async function role(name:string){roles.push(name);await pool.query(`CREATE ROLE ${name} LOGIN PASSWORD 'review-fixture-only' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`);}
 try{
  const apps:Client[]=[];
  for(const [i,tenant] of tenants.entries()){
   const name='review_tenant_'+process.pid+'_'+i;await role(name);
   await withTransaction(c=>provisionRuntimeAccess(c,{schema,role:name,orgId:tenant.org,legalEntityId:tenant.entity}));
   const app=await login(name,tenant);await assertRuntimeTenantBinding(app);apps.push(app);
  }
  const start=performance.now();
  await Promise.all(apps.map(async (app,i)=>{
   for(let j=0;j<20;j++)await app.query(`INSERT INTO goals(business_id,company_scope,objective,state)
    VALUES(next_business_id('goal',NULL),$1,'synthetic parallel workload','NEW')`,[tenants[i].entity]);
   const rows=(await app.query('SELECT company_scope FROM goals')).rows;
   assert.equal(rows.length,20);assert(rows.every(r=>r.company_scope===tenants[i].entity));
  }));
  const ms=Math.round(performance.now()-start);assert(ms<3000,`four-tenant workload exceeded 3000 ms: ${ms}`);
  assert.equal((await pool.query('SELECT count(DISTINCT business_id)::int n FROM goals')).rows[0].n,80);
  await pool.query(`GRANT ${roles[1]} TO ${roles[0]}`);
  await assert.rejects(assertRuntimeTenantBinding(apps[0]),/RUNTIME_ROLE_MEMBERSHIPS_FORBIDDEN/);
  await pool.query(`REVOKE ${roles[1]} FROM ${roles[0]}`);
  await apps[0].query("SELECT set_config('app.current_org_id',$1,false),set_config('app.current_legal_entity_id',$2,false)",[tenants[1].org,tenants[1].entity]);
  assert.equal((await apps[0].query('SELECT * FROM goals')).rowCount,0);await assert.rejects(assertRuntimeTenantBinding(apps[0]),/RUNTIME_FIXED_TENANT_POLICY_REQUIRED/);
  await apps[0].query("SELECT set_config('app.current_org_id','',false)");await assert.rejects(assertRuntimeTenantBinding(apps[0]),/RUNTIME_TENANT_CONTEXT_REQUIRED/);
  // Reproduce the old admission gap: non-owner/non-bypass plus valid GUCs is
  // insufficient. Without fixed policies a role can spoof the second tenant.
  const unbound='review_unbound_'+process.pid;await role(unbound);
  await pool.query(`GRANT USAGE ON SCHEMA ${schema} TO ${unbound}`);
  await pool.query(`GRANT SELECT ON ${schema}.goals,${schema}.legal_entities TO ${unbound}`);
  const unsafe=await login(unbound,tenants[1]);await assertReleaseDatabaseSafety(unsafe);
  assert.equal((await unsafe.query('SELECT * FROM goals')).rowCount,20);
  await assert.rejects(assertRuntimeTenantBinding(unsafe),/RUNTIME_FIXED_TENANT_POLICY_REQUIRED/);
  console.log(JSON.stringify({check:'parallel fixed-principal workload',tenants:4,rows:80,crossTenantReads:0,ms,thresholdMs:3000,unboundRoleRejected:true}));
 }finally{
  await Promise.all(clients.map(c=>c.end()));
  for(const name of roles){await pool.query(`DROP OWNED BY ${name}`);await pool.query(`DROP ROLE ${name}`);}
 }
 await pool.end();
}
main().catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
