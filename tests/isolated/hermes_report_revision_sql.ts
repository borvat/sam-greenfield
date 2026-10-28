import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';

test('followup report insert remains idempotent after revision migration, with no provider invocation',async()=>{
 const db=new PGlite();
 try{
  await db.exec('CREATE TABLE goals(id UUID PRIMARY KEY);CREATE TABLE plans(id UUID PRIMARY KEY);');
  for(const migration of ['00101_goal_read_reviews.sql','00106_read_review_revisions.sql'])await db.exec(await readFile(new URL('../../packages/db/integration-migrations/'+migration,import.meta.url),'utf8'));
  const goal='11111111-1111-4111-8111-111111111111',plan='22222222-2222-4222-8222-222222222222';
  await db.query('INSERT INTO goals VALUES($1)',[goal]);await db.query('INSERT INTO plans VALUES($1)',[plan]);
  // Exercise the exact production statement without entering any source/model execution path.
  const source=await readFile(new URL('../../apps/production/src/hermesSourceFollowup.ts',import.meta.url),'utf8');
  const insert=source.match(/const saved=\(await db\.query\(`(INSERT INTO goal_read_reviews[\s\S]*?)`,/);
  assert(insert,'Production report INSERT must be present');
  const args=[goal,plan,JSON.stringify({status:'complete',summary:'Synthetic saved report'}),'immutable-first-hash'];
  const first=await db.query<any>(insert[1],args);assert.equal(first.rows.length,1);
  assert.equal((await db.query(insert[1],args)).rows.length,0,'Exact retry is deduplicated');
  const original=(await db.query<any>('SELECT * FROM goal_read_reviews')).rows[0];assert.equal(original.revision,1);assert.equal(original.report_hash,args[3]);
  await db.query('INSERT INTO goal_read_reviews(goal_id,plan_id,round,decision,report_hash,revision,supersedes_report_id) VALUES($1,$2,1,$3::jsonb,$4,2,$5)',[goal,plan,JSON.stringify({status:'complete'}),'immutable-revision-hash',original.id]);
  assert.equal((await db.query(insert[1],args)).rows.length,0,'Revision2 does not allow another original report');
  const reports=(await db.query<any>('SELECT * FROM goal_read_reviews ORDER BY revision')).rows;assert.equal(reports.length,2);assert.deepEqual(reports[0],original);assert.equal(reports[1].supersedes_report_id,original.id);
 }finally{await db.close();}
});
