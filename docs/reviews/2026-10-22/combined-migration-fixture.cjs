const {Client}=require('/workspace/sam-greenfield/node_modules/pg');const {execFileSync}=require('child_process');const fs=require('fs'),assert=require('assert/strict');
const root='/workspace/sam-greenfield';process.chdir(root);
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'});
async function main(){const db=new Client({connectionString:'postgres://postgres:phase2-fixture@127.0.0.1:55433/sam_core_test'});await db.connect();
try{
for(const branch of ['oauth','memory','perception','research','multiagent']){
 const schema='review_combo_'+branch;await db.query('CREATE SCHEMA '+schema);await db.query('SET search_path TO '+schema+',public');
 try{
  const map=new Map(fs.readdirSync('packages/db/migrations').filter(x=>x.endsWith('.sql')).map(f=>[f,fs.readFileSync('packages/db/migrations/'+f,'utf8')]));
  const extra=git('ls-tree','-r','--name-only','origin/review-'+branch,'packages/db/migrations').trim().split('\n');
  for(const file of extra){const name=file.split('/').pop(),sql=git('show','origin/review-'+branch+':'+file);if(map.has(name))assert.equal(map.get(name),sql,'shared migration differs '+name);else map.set(name,sql);}
  for(const [name,sql] of [...map].sort())await db.query(sql);
  console.log(JSON.stringify({branch,sha:git('rev-parse','origin/review-'+branch).trim(),migrations:map.size,sqlApply:'PASS',newMigrations:[...map.keys()].filter(x=>!fs.existsSync('packages/db/migrations/'+x))}));
 }finally{await db.query('SET search_path TO public');await db.query('DROP SCHEMA '+schema+' CASCADE');}
}
const schema='review_rollback';await db.query('CREATE SCHEMA '+schema);await db.query('SET search_path TO '+schema+',public');
try{const files=fs.readdirSync('packages/db/migrations').filter(x=>x.endsWith('.sql')).sort();for(const f of files.filter(x=>Number(x.slice(0,5))<=10))await db.query(fs.readFileSync('packages/db/migrations/'+f,'utf8'));
const id=(await db.query("INSERT INTO organizations(name) VALUES('Synthetic rollback sentinel') RETURNING id")).rows[0].id;
await db.query('BEGIN');for(const f of files.filter(x=>Number(x.slice(0,5))>10))await db.query(fs.readFileSync('packages/db/migrations/'+f,'utf8'));await db.query('ROLLBACK');
assert.equal((await db.query("SELECT count(*)::int n FROM information_schema.columns WHERE table_schema=$1 AND table_name='goals' AND column_name='planning_attempts'",[schema])).rows[0].n,0);
assert.equal((await db.query('SELECT id FROM organizations WHERE id=$1',[id])).rowCount,1);
console.log('PASS migration batch transaction rollback preserves baseline schema and sentinel; not a tested production downgrade');
}finally{await db.query('SET search_path TO public');await db.query('DROP SCHEMA '+schema+' CASCADE');}
}finally{await db.end();}}
main().catch(e=>{console.error(e.message);process.exitCode=1});
