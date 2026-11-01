// Disposable embedded PostgreSQL parser/constraint proof only; no production or native admission.
const assert=require('node:assert/strict');
const {PGlite}=require('@electric-sql/pglite');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const refs={runtime:'62ccbdbb94e080f22425f64396c894270ee551aa',surfaces:'1e4e21a773c88e2366915edd3bb2e307fddaa157',repair:'8a08e6163516f30f37c65313134170744330c4f4'};
const source=(ref,path)=>execFileSync('git',['show',ref+':'+path],{encoding:'utf8'});
const insert=ref=>{const text=source(ref,'apps/production/src/hermesSourceFollowup.ts');const sql=text.match(/db\.query\(`(INSERT INTO goal_read_reviews[\s\S]*?)`,/);assert(sql,'actual production insert must be found');return sql[1];};
async function main(){
 const db=new PGlite();
 try{
  await db.exec('CREATE TABLE goals(id uuid PRIMARY KEY); CREATE TABLE plans(id uuid PRIMARY KEY);');
  await db.exec(source(refs.repair,'packages/db/integration-migrations/00101_goal_read_reviews.sql'));
  const goal='11111111-1111-4111-8111-111111111111',plan='22222222-2222-4222-8222-222222222222';
  await db.query('INSERT INTO goals VALUES($1)',[goal]);await db.query('INSERT INTO plans VALUES($1)',[plan]);
  const args=[goal,plan,JSON.stringify({status:'blocked',fixture:'original'}),'original-hash'];
  const before=(await db.query(insert(refs.runtime),args)).rows[0];assert(before?.id);
  const migration=source(refs.repair,'packages/db/integration-migrations/00106_read_review_revisions.sql');
  await db.exec(migration);
  const observed=[];
  for(const [name,ref]of Object.entries(refs)){
   try{const result=await db.query(insert(ref),args);observed.push({name,ref,outcome:'SQL_ACCEPTED',returned:result.rows.length});assert.equal(name,'repair');}
   catch(error){if(error.code!=='42P10')throw error;assert.notEqual(name,'repair');observed.push({name,ref,outcome:'ROLLBACK_INCOMPATIBLE',sqlstate:error.code});}
  }
  const retained=(await db.query('SELECT id,report_hash,revision FROM goal_read_reviews WHERE id=$1',[before.id])).rows[0];
  assert.equal(retained.report_hash,'original-hash');assert.equal(retained.revision,1);
  await db.query(`INSERT INTO goal_read_reviews(goal_id,plan_id,round,decision,report_hash,revision,supersedes_report_id)
   VALUES($1,$2,1,'{"status":"complete"}','revision2-hash',2,$3)`,[goal,plan,before.id]);
  assert.equal((await db.query('SELECT count(*)::int n FROM goal_read_reviews')).rows[0].n,2);
  const after=(await db.query('SELECT report_hash FROM goal_read_reviews WHERE id=$1',[before.id])).rows[0];assert.equal(after.report_hash,'original-hash');
  let rejected=false;try{await db.exec('ALTER TABLE goal_read_reviews ADD CONSTRAINT unsafe_old_pair UNIQUE(goal_id,plan_id)');}catch(error){assert.equal(error.code,'23505');rejected=true;}assert(rejected);
  console.log(JSON.stringify({test:'rollback00106-source-SQL-compatibility',status:'PASS_DETECTED_BLOCKER',observed,migrationSha256:createHash('sha256').update(migration).digest('hex'),oldReportRetained:true,revision2Retained:true,readdingPairConstraintRejected:true,productionAccess:false,nativeAdmission:false,scope:'Actual pinned SQL against disposable embedded PostgreSQL; not backup or restore proof'}));
 }finally{await db.close();}
}
main().catch(error=>{console.error(error.code??error.message);process.exitCode=1;});
