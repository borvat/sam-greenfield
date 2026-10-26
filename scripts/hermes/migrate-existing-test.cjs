// Operator-only, additive migration of the existing disposable SAM test intake.
// Owner connection is supplied in memory by the non-echoing operator session.
const {Client}=require('pg');
const {createHash}=require('node:crypto');
const schema='sam_eval_20261024',entity='2796e0d9-1701-4e53-a7ac-d198c0e44c01',org='e61d535d-1b9a-4e1d-b5d1-9578bb54db0e';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
async function migrate(c){
  const identity=(await c.query('SELECT current_database() db,current_user u')).rows[0];
  if(identity.db!=='sam_trial_postgres'||identity.u!=='sam_trial_postgres_user')throw Error('EXISTING_TEST_DATABASE_OWNER_REQUIRED');
  const source=new Client({host:'/var/run/postgresql',user:'postgres',database:'sam_synthetic'});await source.connect();
  let begun=false;
  try{
    await source.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const counts=(await source.query(`SELECT (SELECT count(*) FROM plans)::int plans,(SELECT count(*) FROM work_queue)::int work,
      (SELECT count(*) FROM executions)::int executions,(SELECT count(*) FROM verifications)::int verifications`)).rows[0];
    if(Object.values(counts).some(Number))throw Error('SOURCE_NOT_IDLE_INTAKE_ONLY');
    const goals=(await source.query('SELECT * FROM goals ORDER BY id')).rows;
    const audits=(await source.query('SELECT * FROM audit_log ORDER BY id')).rows;
    if(!goals.length||goals.length>10||goals.some(g=>g.state!=='NEW'||g.current_plan_id))throw Error('SOURCE_GOAL_SCOPE_DENIED');
    const original={goals,audits},sourceHash=hash(original);
    await c.query('BEGIN');begun=true;
    await c.query("SELECT pg_advisory_xact_lock(hashtext('sam-existing-test-storage-20261024'))");
    await c.query('SET LOCAL search_path=sam_eval_20261024,pg_catalog,public');
    await c.query("SELECT set_config('app.current_org_id',$1,true),set_config('app.current_legal_entity_id',$2,true)",[org,entity]);
    if((await c.query('SELECT 1 FROM legal_entities WHERE id=$1 AND org_id=$2',[entity,org])).rowCount!==1)throw Error('EXISTING_TENANT_MISMATCH');
    const prior=(await c.query("SELECT after_ref FROM audit_log WHERE action='SAM_VOLATILE_INTAKE_MIGRATED' AND after_ref->>'sourceHash'=$1",[sourceHash])).rows[0];
    if(prior){await c.query('ROLLBACK');begun=false;await source.query('ROLLBACK');return {status:'ALREADY_MIGRATED',sourceHash,...prior.after_ref.mapping};}
    const columns={};
    for(const table of ['goals','audit_log'])columns[table]=new Set((await c.query('SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2',[schema,table])).rows.map(r=>r.column_name));
    const insert=async(table,row)=>{
      const keys=Object.keys(row);if(keys.some(k=>!columns[table].has(k)||!/^[a-z_]+$/.test(k)))throw Error('MIGRATION_COLUMN_REVIEW_REQUIRED');
      await c.query(`INSERT INTO ${table}(${keys.map(k=>'"'+k+'"').join(',')}) VALUES(${keys.map((_,i)=>'$'+(i+1)).join(',')})`,keys.map(k=>row[k]));
    };
    const mapping={goalIds:[],tenantMapping:{source:[...new Set(goals.map(g=>g.company_scope))],target:entity},renamedBusinessIds:[]};
    for(const goal of goals){
      if((await c.query('SELECT 1 FROM goals WHERE id=$1',[goal.id])).rowCount)throw Error('MIGRATION_EXISTING_ID_REVIEW_REQUIRED');
      const next={...goal,company_scope:entity};
      if((await c.query('SELECT 1 FROM goals WHERE business_id=$1',[goal.business_id])).rowCount){next.business_id='MIGRATED-'+goal.business_id+'-'+goal.id.slice(0,8);mapping.renamedBusinessIds.push({id:goal.id,from:goal.business_id,to:next.business_id});}
      await insert('goals',next);mapping.goalIds.push(goal.id);
    }
    const sourceEntities=new Set(goals.map(g=>g.company_scope));
    for(const audit of audits){
      if(audit.goal_id&&!mapping.goalIds.includes(audit.goal_id))throw Error('MIGRATION_AUDIT_SCOPE_DENIED');
      const next={...audit};if(audit.entity_type==='legal_entity'&&sourceEntities.has(audit.entity_id))next.entity_id=entity;
      await insert('audit_log',next);
    }
    // Preserve complete original rows alongside the explicit tenant/display-ID mapping.
    // This private database evidence is never printed or committed to GitHub.
    await c.query(`INSERT INTO audit_log(actor,goal_id,action,entity_type,entity_id,after_ref,source,authority_class,result)
      VALUES('sam-storage-operator',$1,'SAM_VOLATILE_INTAKE_MIGRATED','goal',$1,$2,'existing_test_storage','GREEN','PRESERVED')`,
      [goals[0].id,{sourceHash,source:original,mapping}]);
    const readback=(await c.query('SELECT id FROM goals WHERE id=ANY($1::uuid[]) ORDER BY id',[mapping.goalIds])).rows;
    if(readback.length!==goals.length)throw Error('MIGRATION_READBACK_FAILED');
    await c.query('COMMIT');begun=false;await source.query('ROLLBACK');
    return {status:'MIGRATED_AND_READ_BACK',goals:goals.length,audits:audits.length,sourceHash,...mapping};
  }catch(e){if(begun)await c.query('ROLLBACK');throw e;}
  finally{await source.end();}
}
module.exports={migrate};
