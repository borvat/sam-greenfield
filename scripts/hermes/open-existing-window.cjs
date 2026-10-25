// Operator-only: one approved 60-minute window on the EXISTING restricted role.
// Same schema, tenant fences and grants. No old trial/budget is reset.
const {mkdtemp,writeFile}=require('node:fs/promises');
const schema='sam_eval_20261024',role='sam_eval_runtime_20261024';
const org='e61d535d-1b9a-4e1d-b5d1-9578bb54db0e',entity='2796e0d9-1701-4e53-a7ac-d198c0e44c01';
async function openWindow(c,password,ownerConnection){
  if(!/^[a-f0-9]{64}$/.test(password))throw Error('PRIVATE_RANDOM_PASSWORD_REQUIRED');
  await c.query('BEGIN');let committed=false;
  try{
    const identity=(await c.query(`SELECT current_database() db,current_user u,current_setting('log_statement') logs,
      current_setting('pgaudit.log',true) audit`)).rows[0];
    if(identity.db!=='sam_trial_postgres'||identity.u!=='sam_trial_postgres_user'||identity.logs!=='none'||!['none','',null].includes(identity.audit))throw Error('EXISTING_OWNER_POLICY_REQUIRED');
    await c.query("SELECT pg_advisory_xact_lock(hashtext('sam-approved-existing-storage-window'))");
    const r=(await c.query(`SELECT rolsuper,rolcreatedb,rolcreaterole,rolreplication,rolbypassrls,rolinherit,
      rolvaliduntil<=clock_timestamp() expired FROM pg_roles WHERE rolname=$1`,[role])).rows[0];
    if(!r||!r.expired||['rolsuper','rolcreatedb','rolcreaterole','rolreplication','rolbypassrls','rolinherit'].some(k=>r[k]))throw Error('EXISTING_EXPIRED_RESTRICTED_ROLE_REQUIRED');
    if((await c.query('SELECT 1 FROM pg_stat_activity WHERE usename=$1',[role])).rowCount)throw Error('RESTRICTED_ROLE_HAS_ACTIVE_SESSIONS');
    await c.query('SET LOCAL search_path=sam_eval_20261024,pg_catalog,public');
    await c.query("SELECT set_config('app.current_org_id',$1,true),set_config('app.current_legal_entity_id',$2,true)",[org,entity]);
    await c.query(`INSERT INTO verification_contracts(capability_id,description,verification_method,required_evidence_fields,independent_query_template,must_not_trust_execution_result)
      VALUES('hermes.generate_candidate','Independent native PostgreSQL arithmetic probe','external_event',
      '{"candidateHash":"string","independentCheck":"string"}','{"method":"native_postgres_sum_probe"}',true)
      ON CONFLICT(capability_id) DO NOTHING`);
    const contract=(await c.query("SELECT * FROM verification_contracts WHERE capability_id='hermes.generate_candidate'")).rows[0];
    if(!contract?.must_not_trust_execution_result||contract.verification_method!=='external_event'||contract.required_evidence_fields.candidateHash!=='string'||contract.required_evidence_fields.independentCheck!=='string')throw Error('HERMES_CONTRACT_REVIEW_REQUIRED');
    await c.query("SELECT set_config('sam.private_new_role_password',$1,true)",[password]);
    await c.query(`DO $private$ BEGIN
      EXECUTE format('ALTER ROLE %I LOGIN PASSWORD %L VALID UNTIL %L','sam_eval_runtime_20261024',
        current_setting('sam.private_new_role_password'),clock_timestamp()+interval '60 minutes');
      PERFORM set_config('sam.private_new_role_password','',true);
      END $private$`);
    const expiresAt=(await c.query('SELECT rolvaliduntil FROM pg_roles WHERE rolname=$1',[role])).rows[0].rolvaliduntil;
    await c.query('COMMIT');committed=true;
    const u=new URL(ownerConnection);u.username=role;u.password=password;
    u.searchParams.set('options',`-c search_path=${schema},pg_catalog,public -c app.current_org_id=${org} -c app.current_legal_entity_id=${entity}`);
    const b={schema,role,org,entity,connectionString:u.href};
    const directory=await mkdtemp('/tmp/sam-existing-hermes-binding-');
    const path=directory+'/restricted.json';await writeFile(path,JSON.stringify(b),{mode:0o600,flag:'wx'});
    return {status:'EXISTING_WINDOW_OPENED',expiresAt,privateConfigPath:path,scope:{schema,role,org,entity},grantsChanged:false,newScope:false,automaticRenewal:false};
  }catch(e){if(!committed)await c.query('ROLLBACK');throw e;}
}
module.exports={openWindow};
