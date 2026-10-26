// Actual local PGlite SQL engine only. Not a native multi-session PostgreSQL
// server, Render storage or live publisher acceptance. All data is synthetic.
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {PGlite}=require('@electric-sql/pglite');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {PublisherPgJournal,BINDING}=require('../../deploy/hermes-coding/publisher_pg_journal.cjs');
const {REPO}=require('../../deploy/hermes-coding/bounded_publisher.cjs');
const ROUND='00000000-0000-4000-8000-000000000001',JOB='00000000-0000-4000-8000-000000000002',GOAL='00000000-0000-4000-8000-000000000003',DIGEST='a'.repeat(64);
function pool(db){return {async connect(){return {query:(sql,args)=>db.query(sql,args),release(){}}}}}
async function setup(directory){
 const db=new PGlite(directory);
 await db.exec(`CREATE SCHEMA ${BINDING.schema};CREATE ROLE ${BINDING.role} NOINHERIT;
  CREATE TABLE ${BINDING.schema}.legal_entities(id uuid PRIMARY KEY);
  INSERT INTO ${BINDING.schema}.legal_entities VALUES('${BINDING.entity}');
  SET search_path TO ${BINDING.schema},pg_catalog,public;`);
 const migration=fs.readFileSync(path.join(__dirname,'../../packages/db/migrations/00004_outbox_and_side_effect.sql'),'utf8');
 // Exact existing table definition; no schema change is added to the project.
 const table=migration.slice(migration.indexOf('CREATE TABLE side_effect_operations'),migration.indexOf('CREATE TABLE work_queue'));
 await db.exec(table+`GRANT USAGE ON SCHEMA ${BINDING.schema} TO ${BINDING.role};
  GRANT SELECT,INSERT,UPDATE ON side_effect_operations TO ${BINDING.role};
  CREATE POLICY synthetic_journal_scope ON side_effect_operations TO ${BINDING.role}
  USING (legal_entity_id=current_setting('app.current_legal_entity_id')::uuid)
  WITH CHECK (legal_entity_id=current_setting('app.current_legal_entity_id')::uuid);`);
 await scope(db);return db;
}
async function scope(db){await db.exec(`SET ROLE ${BINDING.role};SET search_path TO ${BINDING.schema},pg_catalog,public;SET app.current_org_id TO '${BINDING.org}';SET app.current_legal_entity_id TO '${BINDING.entity}';`)}
const journal=db=>new PublisherPgJournal({pool:pool(db),roundId:ROUND,goalId:GOAL});
async function complete(j){for(const [stage,value]of [['SCOPE_VERIFIED',{}],['WRITE_INTENT',{}],['COMMIT_CREATED',{sha:'b'.repeat(40)}],['BRANCH_CREATED',{branch:'SYNTHETIC'}],['DRAFT_CREATED',{number:1000}]])await j.save(JOB,stage,value);const r={kind:'BOUNDED_DRAFT_PR_PUBLISHED',jobId:JOB,repository:REPO,tokenRevoked:true,draft:true,syntheticOnly:true};await j.save(JOB,'COMPLETE',r);return r}

test('existing table stores one durable claim; uncertain claim cannot replay',async()=>{
 const db=await setup();try{const j=journal(db);assert.equal(await j.begin(JOB,DIGEST),null);await assert.rejects(j.begin(JOB,DIGEST),/RECONCILE_REQUIRED/);assert.equal((await db.query('SELECT count(*)::int n FROM side_effect_operations')).rows[0].n,1)}finally{await db.close()}
});
test('completed receipt survives SQL-engine close/reopen without an additional claim',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sam-journal-sql-'));let db;
 try{db=await setup(dir);const j=journal(db);await j.begin(JOB,DIGEST);const expected=await complete(j);await db.close();db=new PGlite(dir);await scope(db);assert.deepEqual(await journal(db).begin(JOB,DIGEST),expected);assert.equal((await db.query('SELECT count(*)::int n FROM side_effect_operations')).rows[0].n,1)}finally{await db?.close();fs.rmSync(dir,{recursive:true,force:true})}
});
test('different source/job cannot consume the same round or read its receipt',async()=>{
 const db=await setup();try{const j=journal(db);await j.begin(JOB,DIGEST);await assert.rejects(j.begin(JOB,'b'.repeat(64)),/CONFLICT/);await assert.rejects(j.begin(ROUND,DIGEST),/CONFLICT/)}finally{await db.close()}
});
test('wrong tenant is denied before any journal insert or update',async()=>{
 const db=await setup();try{await db.exec("SET app.current_legal_entity_id TO '00000000-0000-4000-8000-000000000099'");await assert.rejects(journal(db).begin(JOB,DIGEST),/SCOPE_DENIED/);await scope(db);assert.equal((await db.query('SELECT count(*)::int n FROM side_effect_operations')).rows[0].n,0)}finally{await db.close()}
});
test('duplicate stage, absent draft evidence or incomplete revocation cannot complete',async()=>{
 const db=await setup();try{const j=journal(db);await j.begin(JOB,DIGEST);await assert.rejects(j.save(JOB,'DRAFT_CREATED',{number:1000}),/STAGE_ORDER_DENIED/);await j.save(JOB,'SCOPE_VERIFIED',{});await j.save(JOB,'WRITE_INTENT',{});await assert.rejects(j.save(JOB,'WRITE_INTENT',{}),/STAGE_REPLAY_DENIED/);await assert.rejects(j.save(JOB,'COMPLETE',{kind:'BOUNDED_DRAFT_PR_PUBLISHED',jobId:JOB,repository:REPO,tokenRevoked:false,draft:true}),/RECEIPT_DENIED/);assert.equal((await db.query('SELECT state FROM side_effect_operations')).rows[0].state,'SENT')}finally{await db.close()}
});
