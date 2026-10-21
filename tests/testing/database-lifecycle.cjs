// Real migrator, isolated local database only. No hand-written replacement migrator.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const {Client}=require('pg');
const url=new URL(process.env.DATABASE_URL||'');
assert.equal(url.hostname,'127.0.0.1');assert.equal(url.pathname,'/sam_core_test_lifecycle');
const root=process.cwd(),dir=path.join(root,'packages/db/migrations');
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.sql')).sort();
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const env={PATH:process.env.PATH,HOME:'/tmp',DATABASE_URL:url.href};
function migrate(script='packages/db/src/migrate.js',success=true){
  const r=spawnSync(process.execPath,[script,'--check-deterministic','--apply'],{env,encoding:'utf8',timeout:60000});
  process.stdout.write(r.stdout+r.stderr);assert.ifError(r.error);
  assert.equal(r.status,success?0:1);return r.stdout+r.stderr;
}
async function main(){
 const c=new Client({connectionString:url.href});await c.connect();
 let temp;
 try{
  if(process.argv[2]==='prepare'){
   temp=fs.mkdtempSync(path.join(root,'.verification-migrations-'));
   fs.mkdirSync(path.join(temp,'src'));fs.mkdirSync(path.join(temp,'migrations'));
   fs.copyFileSync('packages/db/src/migrate.js',path.join(temp,'src/migrate.js'));
   // Upgrade the exact historical core baseline using the existing migrator.
   for(const f of files.filter(f=>Number(f.slice(0,5))<=10))fs.copyFileSync(path.join(dir,f),path.join(temp,'migrations',f));
   migrate(path.join(temp,'src/migrate.js'));
   await c.query("INSERT INTO organizations(name) VALUES('Independent verification restart sentinel')");
   migrate();assert(!/^APPLY /m.test(migrate()),'repeat apply must skip every migration');
   // Exercise the real hash guard, then restore the fixture ledger.
   const first=files[0],hash=sha(fs.readFileSync(path.join(dir,first)));
   await c.query('UPDATE sam_schema_migrations SET sha256=$1 WHERE filename=$2',['fixture-hash-mismatch',first]);
   try{assert.match(migrate(undefined,false),/Applied migration hash mismatch/);}
   finally{await c.query('UPDATE sam_schema_migrations SET sha256=$1 WHERE filename=$2',[hash,first]);}
   // The real migrator must roll back both a failing migration's DDL and receipt.
   for(const f of files)fs.copyFileSync(path.join(dir,f),path.join(temp,'migrations',f));
   fs.writeFileSync(path.join(temp,'migrations','99999_verification_failure.sql'),
     'CREATE TABLE verification_must_rollback(id int); SELECT 1/0;');
   assert.match(migrate(path.join(temp,'src/migrate.js'),false),/division by zero/);
   assert.equal((await c.query("SELECT to_regclass('verification_must_rollback') value")).rows[0].value,null);
   assert.equal((await c.query("SELECT count(*)::int n FROM sam_schema_migrations WHERE filename='99999_verification_failure.sql'")).rows[0].n,0);
  }else assert.equal(process.argv[2],'after-restart');
  const rows=(await c.query('SELECT filename,sha256 FROM sam_schema_migrations ORDER BY filename')).rows;
  assert.deepEqual(rows,files.map(f=>({filename:f,sha256:sha(fs.readFileSync(path.join(dir,f)))})));
  assert.equal((await c.query("SELECT count(*)::int n FROM organizations WHERE name='Independent verification restart sentinel'")).rows[0].n,1);
  console.log('DATABASE_LIFECYCLE_PASS',process.argv[2],files.length,'verified receipts; upgrade/repeat/hash guard/rollback; sentinel retained');
 }finally{if(temp)fs.rmSync(temp,{recursive:true,force:true});await c.end();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
