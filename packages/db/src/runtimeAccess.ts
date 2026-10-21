import type {PoolClient} from 'pg';

// Operator-only provisioning API. Never called by runtime startup. The caller
// owns its migration transaction and credentials; this function creates neither.
export async function provisionRuntimeAccess(client:PoolClient,input:{schema:string;role:string;orgId:string;legalEntityId:string}){
  const identifier=/^[a-z_][a-z0-9_]{0,62}$/;
  const uuid=/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
  if(!identifier.test(input.schema)||!identifier.test(input.role)||!uuid.test(input.orgId)||!uuid.test(input.legalEntityId))
    throw new Error('RUNTIME_PRINCIPAL_INVALID');
  const role=(await client.query('SELECT rolsuper,rolbypassrls,rolcreatedb,rolcreaterole,rolreplication FROM pg_roles WHERE rolname=$1',[input.role])).rows[0];
  if(!role||Object.values(role).some(Boolean))throw new Error('RUNTIME_ROLE_PRIVILEGED');
  const member=(await client.query(`SELECT count(*)::int n FROM pg_roles WHERE rolname<>$1 AND pg_has_role($1,oid,'MEMBER')`,[input.role])).rows[0];
  if(member.n)throw new Error('RUNTIME_ROLE_MEMBERSHIPS_FORBIDDEN');
  const owner=(await client.query(`SELECT count(*)::int n FROM pg_class WHERE relnamespace=to_regnamespace($1) AND relowner=(SELECT oid FROM pg_roles WHERE rolname=$2)`,[input.schema,input.role])).rows[0];
  if(owner.n)throw new Error('RUNTIME_ROLE_OWNS_OBJECTS');
  const entity=(await client.query(`SELECT id FROM "${input.schema}".legal_entities WHERE id=$1 AND org_id=$2`,[input.legalEntityId,input.orgId])).rows[0];
  if(!entity)throw new Error('RUNTIME_TENANT_MISMATCH');
  const tables=['goals','plans','work_queue','executions','verifications','world_facts','memory_records','side_effect_operations','approvals','outbox_events','inbox_events','event_fabric_events','model_calls','audit_log','business_id_sequences'];
  await client.query(`GRANT USAGE ON SCHEMA "${input.schema}" TO "${input.role}"`);
  await client.query(`GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA "${input.schema}" TO "${input.role}"`);
  for(const table of [...tables,'organizations','legal_entities','model_providers','verification_contracts']){
    // Restrictive policies bind a dedicated LOGIN to one immutable principal;
    // session GUC spoofing cannot switch it to another tenant.
    const policy='runtime_'+input.role;
    await client.query(`CREATE POLICY "${policy}" ON "${input.schema}".${table} AS RESTRICTIVE TO "${input.role}"
      USING(current_legal_entity_id()='${input.legalEntityId}'::uuid AND current_org_id()='${input.orgId}'::uuid ${table==='legal_entities'?`AND id='${input.legalEntityId}'::uuid`:''})
      WITH CHECK(current_legal_entity_id()='${input.legalEntityId}'::uuid AND current_org_id()='${input.orgId}'::uuid ${table==='legal_entities'?`AND id='${input.legalEntityId}'::uuid`:''})`);
    if(tables.includes(table))await client.query(`GRANT SELECT,INSERT,UPDATE ON "${input.schema}".${table} TO "${input.role}"`);
  }
  await client.query(`GRANT SELECT ON "${input.schema}".organizations,"${input.schema}".legal_entities,"${input.schema}".model_providers,"${input.schema}".verification_contracts TO "${input.role}"`);
}
