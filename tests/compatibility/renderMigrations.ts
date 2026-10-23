import assert from 'node:assert/strict';
import {Client} from 'pg';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {applyIntegrationProfile} from '../../packages/db/src/integrationProfile';
const url=new URL(process.env.DATABASE_URL!);
assert(['localhost','127.0.0.1'].includes(url.hostname)&&url.pathname.startsWith('/sam_core_test'));
const core='packages/db/migrations/',integration='packages/db/integration-migrations/';
const moved=['00011_mcp_internal_oauth.sql','00099_sam_google_oauth.sql','00100_sam_google_oauth_runtime.sql','00101_goal_read_reviews.sql'];
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
async function main(){
 const admin=new Client({connectionString:url.href});await admin.connect();
 try{for(const legacy of [false,true]){
  const schema='compat_'+randomUUID().replaceAll('-','');await admin.query('CREATE SCHEMA '+schema);
  const scoped=new URL(url);scoped.searchParams.set('options','-c search_path='+schema+',public');
  const c=new Client({connectionString:scoped.href});await c.connect();
  const migrate=(ok=true)=>{const r=spawnSync(process.execPath,['packages/db/src/migrate.js','--apply'],{env:{PATH:process.env.PATH,DATABASE_URL:scoped.href},encoding:'utf8',timeout:30000});assert.equal(r.status,ok?0:1,r.stdout+r.stderr);return r.stdout+r.stderr;};
  try{
   if(legacy){
    await c.query('CREATE TABLE sam_schema_migrations(filename text PRIMARY KEY,sha256 text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())');
    for(const filename of [...readdirSync(core).filter(f=>Number(f.slice(0,5))<=10),...moved].sort()){
     const sql=readFileSync((moved.includes(filename)?integration:core)+filename,'utf8');await c.query(sql);
     await c.query('INSERT INTO sam_schema_migrations(filename,sha256) VALUES($1,$2)',[filename,hash(sql)]);
    }
    await c.query("INSERT INTO mcp_oauth_clients(client_id,redirect_uris) VALUES('synthetic-preserved-client',ARRAY['https://fixture.invalid/callback'])");
    await c.query("UPDATE sam_schema_migrations SET sha256='bad-fixture-hash' WHERE filename=$1",[moved[0]]);
    assert.match(migrate(false),/hash mismatch/);
    assert.equal((await c.query("SELECT count(*)::int n FROM sam_schema_migrations WHERE filename='00012_core_reliability.sql'")).rows[0].n,0,'bad legacy hash rejected before any new migration');
    await c.query('UPDATE sam_schema_migrations SET sha256=$1 WHERE filename=$2',[hash(readFileSync(integration+moved[0],'utf8')),moved[0]]);
   }
   migrate();assert(!/^APPLY /m.test(migrate()),'restart never reapplies DDL');
   await applyIntegrationProfile(c);await applyIntegrationProfile(c);
   assert.equal((await c.query('SELECT count(*)::int n FROM sam_schema_migrations')).rows[0].n,legacy?16:12);
   assert.equal((await c.query('SELECT count(*)::int n FROM sam_integration_migrations')).rows[0].n,8);
   if(legacy)assert.equal((await c.query("SELECT count(*)::int n FROM mcp_oauth_clients WHERE client_id='synthetic-preserved-client'")).rows[0].n,1);
   assert(!/^APPLY /m.test(migrate()),'operator restart after profile adoption is idempotent');
   await c.query("UPDATE sam_integration_migrations SET sha256='wrong' WHERE filename=$1",[moved[0]]);
   await assert.rejects(applyIntegrationProfile(c),/INTEGRATION_MIGRATION_HASH_MISMATCH/);
   // Original deployed launcher cannot roll back this ledger: its strict count was 14.
   if(legacy)assert.notEqual((await c.query('SELECT count(*)::int n FROM sam_schema_migrations')).rows[0].n,14);
   console.log('PASS render migration',legacy?'deployed-14 upgrade/adoption/sentinel/restart/hash denial/rollback limit':'fresh bootstrap/profile/restart/hash denial');
  }finally{await c.end();await admin.query('DROP SCHEMA '+schema+' CASCADE');}
 }}finally{await admin.end();}
}
main().catch(e=>{console.error(e);process.exitCode=1});
