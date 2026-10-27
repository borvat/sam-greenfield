import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {pool} from '../../packages/db/src/client';
import {specialistManifest,specialistMigrationManifest,applySpecialistProfile} from '../../packages/db/src/specialistProfile';
async function main(){
 const c=await pool.connect();try{
  const original=specialistManifest();await c.query('BEGIN');await c.query(original.sql);
  await c.query('CREATE TABLE sam_specialist_migrations(filename text PRIMARY KEY,sha256 text NOT NULL)');
  await c.query('INSERT INTO sam_specialist_migrations VALUES($1,$2)',[original.filename,original.sha256]);await c.query('COMMIT');
  const org=(await c.query("INSERT INTO organizations(name) VALUES('Provenance upgrade fixture') RETURNING id")).rows[0].id;
  const entity=(await c.query("INSERT INTO legal_entities(org_id,name) VALUES($1,'Fixture') RETURNING id",[org])).rows[0].id;
  const goal=(await c.query("INSERT INTO goals(business_id,company_scope,objective,state) VALUES($1,$2,'Provenance sentinel','PLANNING') RETURNING id",[randomUUID(),entity])).rows[0].id;
  const execution=(await c.query(`INSERT INTO executions(goal_id,plan_hash,execution_hash,capability_id,result,evidence,fencing_token,actor,finished_at)
   VALUES($1,'fixture-plan','fixture-execution','source.read','{"value":"27"}','{}',1,'fixture',now()) RETURNING id`,[goal])).rows[0].id;
  const verification=(await c.query(`INSERT INTO verifications(execution_id,verifier,method,independent_evidence,result,plan_hash,execution_hash)
   VALUES($1,'fixture-independent','api_readback','{}','VERIFIED','fixture-plan','fixture-execution') RETURNING id`,[execution])).rows[0].id;
  // Reproduce the published SQL weakness before upgrading: serialized JSON key
  // accepted as an observation although it is not a primitive source value.
  const bad=(await c.query(`INSERT INTO specialist_learning(legal_entity_id,goal_id,kind,statement,execution_id,verification_id,expires_at)
   VALUES($1,$2,'OBSERVATION','value',$3,$4,now()+interval '1 day') RETURNING id`,[entity,goal,execution,verification])).rows[0].id;
  await assert.rejects(()=>applySpecialistProfile(c),/LEGACY_LEARNING_REVIEW_REQUIRED/);
  assert.equal((await c.query('SELECT count(*)::int n FROM sam_specialist_migrations')).rows[0].n,1,'failed upgrade has no receipt or partial guard');
  // Operator-only fixture cleanup, never automatic migration data modification.
  await c.query('DELETE FROM specialist_learning WHERE id=$1',[bad]);
  await c.query(`INSERT INTO specialist_learning(legal_entity_id,goal_id,kind,statement,expires_at)
   VALUES($1,$2,'MODEL_INFERENCE','untrusted sentinel',now()+interval '1 day'),($1,$2,'HYPOTHESIS','legacy untrusted hypothesis',now()+interval '1 day')`,[entity,goal]);
  const applied=await applySpecialistProfile(c);assert.equal(applied.migrations.length,2);assert.deepEqual(await applySpecialistProfile(c),applied);
  assert.equal((await c.query('SELECT count(*)::int n FROM specialist_learning')).rows[0].n,2,'legacy untrusted records preserved, never promoted');
  await assert.rejects(()=>c.query(`INSERT INTO specialist_learning(legal_entity_id,goal_id,kind,statement,execution_id,verification_id,expires_at)
   VALUES($1,$2,'OBSERVATION','value',$3,$4,now()+interval '1 day')`,[entity,goal,execution,verification]),/VERIFIED_QUOTE_REQUIRED/);
  await c.query("INSERT INTO sam_specialist_migrations VALUES('unknown.sql','unknown')");await assert.rejects(()=>applySpecialistProfile(c),/HASH_MISMATCH/);
  await c.query("DELETE FROM sam_specialist_migrations WHERE filename='unknown.sql'");
  await c.query('DELETE FROM sam_specialist_migrations WHERE filename=$1',[original.filename]);await assert.rejects(()=>applySpecialistProfile(c),/HASH_MISMATCH/);
  await c.query('INSERT INTO sam_specialist_migrations VALUES($1,$2)',[original.filename,original.sha256]);
  assert.deepEqual((await c.query('SELECT filename,sha256 FROM sam_specialist_migrations ORDER BY filename')).rows,specialistMigrationManifest().map(({filename,sha256})=>({filename,sha256})));
  assert.equal((await c.query('SELECT count(*)::int n FROM sam_schema_migrations')).rows[0].n,12);
  console.log(JSON.stringify({suite:'specialist-provenance-upgrade',status:'PASS',checks:['published key/value defect reproduced','malformed legacy trusted record blocks atomic upgrade','old guard rollback and receipt preserved','core12+specialist2 upgrade','untrusted legacy data preserved','repeat/checksum/unknown/gap refusal','primitive value admission']}));
 }finally{c.release();await pool.end();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
