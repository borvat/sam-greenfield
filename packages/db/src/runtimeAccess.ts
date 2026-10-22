import type {PoolClient} from 'pg';
import {assertReleaseDatabaseSafety} from './releaseSafety';

export const runtimeTables=['goals','plans','work_queue','executions','verifications','world_facts','memory_records','side_effect_operations','approvals','outbox_events','inbox_events','event_fabric_events','model_calls','audit_log','business_id_sequences'];
export const principalTables=[...runtimeTables,'organizations','legal_entities','model_providers','verification_contracts'];

// Read-only startup admission: ordinary non-owner flags and nonempty GUCs alone
// do not prove an immutable tenant binding. Require the operator's fixed policies.
export async function assertRuntimeTenantBinding(db:{query(text:string,values?:any[]):Promise<{rows:any[]}>}){
  await assertReleaseDatabaseSafety(db);
  const memberships=(await db.query(`SELECT count(*)::int n FROM pg_roles
    WHERE rolname<>current_user AND pg_has_role(current_user,oid,'MEMBER')`)).rows[0];
  if(memberships.n)throw new Error('RUNTIME_ROLE_MEMBERSHIPS_FORBIDDEN');
  const tenant=(await db.query('SELECT current_org_id() org,current_legal_entity_id() entity')).rows[0];
  const uuid=/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
  if(!uuid.test(tenant?.org??'')||!uuid.test(tenant?.entity??''))throw new Error('RUNTIME_TENANT_CONTEXT_REQUIRED');
  const policies=(await db.query(`SELECT c.relname,p.polpermissive,p.polcmd,c.relrowsecurity,
    pg_get_expr(p.polqual,p.polrelid) AS qual,pg_get_expr(p.polwithcheck,p.polrelid) AS check_expr
    FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid
    WHERE c.relnamespace=to_regnamespace(current_schema()) AND c.relname=ANY($1::text[])
    AND (SELECT oid FROM pg_roles WHERE rolname=current_user)=ANY(p.polroles)`,[principalTables])).rows;
  const normalize=(value:string)=>String(value).replace(/[\s()"]/g,'').toLowerCase();
  for(const table of principalTables){
    const expected=normalize(`current_legal_entity_id()='${tenant.entity}'::uuid AND current_org_id()='${tenant.org}'::uuid`+
      (table==='legal_entities'?` AND id='${tenant.entity}'::uuid`:''));
    if(!policies.some(p=>p.relname===table&&p.relrowsecurity&&!p.polpermissive&&p.polcmd==='*'&&
      normalize(p.qual)===expected&&normalize(p.check_expr)===expected))throw new Error('RUNTIME_FIXED_TENANT_POLICY_REQUIRED');
  }
  return tenant as {org:string;entity:string};
}

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
  const tables=runtimeTables;
  await client.query(`GRANT USAGE ON SCHEMA "${input.schema}" TO "${input.role}"`);
  await client.query(`GRANT USAGE,SELECT ON SEQUENCE "${input.schema}".global_event_seq_seq TO "${input.role}"`);
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
