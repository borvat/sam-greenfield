import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,mkdirSync,copyFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {pool} from '../../packages/db/src/client';
import {applyIntegrationProfile,integrationManifest} from '../../packages/db/src/integrationProfile';
async function main(){
 const c=await pool.connect();let dir:string|undefined;
 try{
  const schema=(await c.query('SELECT current_schema() s')).rows[0].s;assert(/^core_[0-9_]+$/.test(schema));
  await c.query("INSERT INTO organizations(name) VALUES('Integration upgrade sentinel')");
  const manifest=await applyIntegrationProfile(c);assert.equal(manifest.length,8);assert.deepEqual(await applyIntegrationProfile(c),manifest);
  const refused=spawnSync(process.execPath,['--import','tsx','scripts/release/integration-migrate.ts','--apply'],{env:{PATH:process.env.PATH},encoding:'utf8',timeout:5000});
  assert.equal(refused.status,1);assert.match(refused.stderr,/STAGING_MIGRATION_REFUSED/);
  const plaintext=spawnSync(process.execPath,['--import','tsx','scripts/release/staging-service.ts','worker'],{
   env:{PATH:process.env.PATH,DATABASE_URL:process.env.DATABASE_URL!,NODE_ENV:'production',SAM_DATABASE_TARGET:'staging',SAM_INTEGRATION_PROFILE:'synthetic-local'},encoding:'utf8',timeout:5000});
  assert.equal(plaintext.status,1);assert.match(plaintext.stderr,/STAGING_SERVICE_REFUSED/);
  assert.equal((await c.query('SELECT count(*)::int n FROM sam_schema_migrations')).rows[0].n,12);
  await c.query("UPDATE sam_integration_migrations SET sha256='tampered' WHERE filename=$1",[manifest[0].filename]);
  await assert.rejects(()=>applyIntegrationProfile(c),/HASH_MISMATCH/);
  await c.query('UPDATE sam_integration_migrations SET sha256=$2 WHERE filename=$1',[manifest[0].filename,manifest[0].sha256]);
  const fresh=schema+'_fresh';await c.query('CREATE SCHEMA '+fresh);
  try{
   // Fresh globally sorted profile through the actual core migrator, not a second algorithm.
   dir=mkdtempSync(join(process.cwd(),'.verification-profile-'));mkdirSync(join(dir,'src'));mkdirSync(join(dir,'migrations'));
   copyFileSync('packages/db/src/migrate.js',join(dir,'src/migrate.js'));
   for(const row of (await c.query('SELECT filename FROM sam_schema_migrations')).rows)copyFileSync('packages/db/migrations/'+row.filename,join(dir,'migrations',row.filename));
   for(const m of integrationManifest())copyFileSync('packages/db/integration-migrations/'+m.filename,join(dir,'migrations',m.filename));
   const target=new URL(process.env.DATABASE_URL!);target.searchParams.set('options','-c search_path='+fresh+',public');
   const run=spawnSync(process.execPath,[join(dir,'src/migrate.js'),'--apply'],{env:{PATH:process.env.PATH,DATABASE_URL:target.href},encoding:'utf8',timeout:30000});
   assert.equal(run.status,0,run.stdout+run.stderr);assert.match(run.stdout,/Applied migrations recorded: 20/);
   const columns=async(s:string)=>(await c.query('SELECT table_name,column_name,data_type FROM information_schema.columns WHERE table_schema=$1 AND table_name NOT IN(\'sam_schema_migrations\',\'sam_integration_migrations\') ORDER BY table_name,ordinal_position',[s])).rows;
   assert.deepEqual(await columns(schema),await columns(fresh));
   assert.equal((await c.query("SELECT count(*)::int n FROM organizations WHERE name='Integration upgrade sentinel'")).rows[0].n,1);
  }finally{await c.query('DROP SCHEMA '+fresh+' CASCADE');}
  console.log('INTEGRATION_MIGRATIONS PASS: core12+feature8, late 00011 after 00013, globally sorted fresh20 column parity, repeat receipts, checksum refusal, upgrade sentinel preserved');
 }finally{if(dir)rmSync(dir,{recursive:true,force:true});c.release();await pool.end();}
}
main().catch(async e=>{console.error(e);await pool.end();process.exitCode=1;});
