const {Client}=require('/workspace/sam-greenfield/node_modules/pg');
const fs=require('fs'),crypto=require('crypto'),assert=require('assert/strict'),{spawnSync}=require('child_process');
const root='/workspace/sam-greenfield';
const base='postgres://postgres:phase2-fixture@127.0.0.1:55433/';
const name='sam_core_test_upgrade';
async function main(){
let c=new Client({connectionString:base+'sam_core_test'});await c.connect();await c.query('CREATE DATABASE '+name);await c.end();
c=new Client({connectionString:base+name});await c.connect();
await c.query('CREATE TABLE sam_schema_migrations(filename text PRIMARY KEY,sha256 text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())');
const files=fs.readdirSync(root+'/packages/db/migrations').filter(x=>x.endsWith('.sql')).sort();
for(const f of files.filter(x=>Number(x.slice(0,5))<=10)){
 const sql=fs.readFileSync(root+'/packages/db/migrations/'+f,'utf8');await c.query('BEGIN');await c.query(sql);await c.query('INSERT INTO sam_schema_migrations(filename,sha256) VALUES($1,$2)',[f,crypto.createHash('sha256').update(sql).digest('hex')]);await c.query('COMMIT');
}
const marker=(await c.query("INSERT INTO organizations(name) VALUES('Migration restart sentinel') RETURNING id")).rows[0].id;
console.log('PASS baseline migrations 00001–00010; pre-upgrade sentinel',marker);
await c.end();
function migrate(){const r=spawnSync(process.execPath,['packages/db/src/migrate.js','--check-deterministic','--apply'],{cwd:root,env:{PATH:process.env.PATH,DATABASE_URL:base+name},encoding:'utf8'});process.stdout.write(r.stdout+r.stderr);assert.equal(r.status,0);return r.stdout;}
const first=migrate();assert(first.includes('APPLY 00012'));assert(first.includes('APPLY 00013'));
const second=migrate();assert(!/^APPLY /m.test(second));console.log('PASS upgrade and repeat apply');
fs.writeFileSync('/tmp/sam-phase2-sentinel.json',JSON.stringify({marker,count:files.length}));
}
main().catch(e=>{console.error(e);process.exitCode=1});
