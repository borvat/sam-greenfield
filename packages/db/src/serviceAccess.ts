import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import type {PoolClient} from 'pg';
import {principalTables} from './runtimeAccess';
import {provisionIntegrationAccess} from './integrationProfile';
export type ServicePrincipal={schema:string;role:string;kind:'runtime'|'mcp';orgId:string;legalEntityId:string;
 googleOwner:string;googleClient:string;oauthResource:string};
const ident=(s:string)=>{if(!/^[a-z_][a-z0-9_]{0,62}$/.test(s))throw Error('SERVICE_IDENTIFIER_INVALID');return '"'+s+'"';};
const literal=(s:string)=>"'"+s.replaceAll("'","''")+"'";
const uuid=/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
export const oauthTables=['mcp_oauth_clients','mcp_oauth_requests','mcp_oauth_codes','mcp_oauth_refresh_tokens'];
export async function applyServiceProfile(c:PoolClient){
 const filename='00109_service_principals.sql',sql=readFileSync('packages/db/service-migrations/'+filename,'utf8');
 const hash=createHash('sha256').update(sql).digest('hex');
 await c.query('BEGIN');try{
  await c.query("SELECT pg_advisory_xact_lock(hashtext('sam-service-profile'))");
  await c.query('CREATE TABLE IF NOT EXISTS sam_service_migrations(filename text PRIMARY KEY,sha256 text NOT NULL)');
  const rows=(await c.query('SELECT filename,sha256 FROM sam_service_migrations')).rows;
  if(rows.length){if(rows.length!==1||rows[0].filename!==filename||rows[0].sha256!==hash)throw Error('SERVICE_PROFILE_HASH_MISMATCH');}
  else{await c.query(sql);await c.query('INSERT INTO sam_service_migrations VALUES($1,$2)',[filename,hash]);}
  await c.query('COMMIT');return {filename,sha256:hash};
 }catch(e){await c.query('ROLLBACK');throw e;}
}
// Explicit operator API. Caller supplies a transaction and an already-created,
// pristine LOGIN. No credentials, role creation, automatic startup or live calls.
export async function provisionServiceAccess(c:PoolClient,p:ServicePrincipal){
 const schema=ident(p.schema),role=ident(p.role);
 if(p.role.length>39)throw Error("SERVICE_IDENTIFIER_INVALID");
 if(!uuid.test(p.orgId)||!uuid.test(p.legalEntityId)||!['runtime','mcp'].includes(p.kind))throw Error('SERVICE_PRINCIPAL_INVALID');
 for(const value of [p.googleOwner,p.googleClient,p.oauthResource])if(!value||value.length>2048||value.includes('\0'))throw Error('SERVICE_BINDING_INVALID');
 for(const value of [p.googleClient,p.oauthResource]){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash)throw Error('SERVICE_BINDING_INVALID');}
 if((await c.query('SELECT current_schema() s')).rows[0].s!==p.schema)throw Error('SERVICE_SEARCH_PATH_MISMATCH');
 await c.query("SELECT pg_advisory_xact_lock(hashtext('sam-service-provision'))");
 if((await c.query('SELECT 1 FROM sam_service_bindings WHERE role_name=$1',[p.role])).rowCount)throw Error('SERVICE_ROLE_ALREADY_BOUND');
 const roleFlags=(await c.query('SELECT rolcanlogin FROM pg_roles WHERE rolname=$1',[p.role])).rows[0];
 if(!roleFlags?.rolcanlogin)throw Error('SERVICE_LOGIN_REQUIRED');
 // Existing grants must be reviewed, never silently accumulated or revoked.
 const existing=(await c.query(`SELECT count(*)::int n FROM pg_class WHERE relnamespace=to_regnamespace($1) AND relkind IN ('r','p','S')
  AND CASE WHEN relkind='S' THEN has_sequence_privilege($2,oid,'USAGE,SELECT,UPDATE') ELSE has_table_privilege($2,oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') END`,[p.schema,p.role])).rows[0];
 if(existing.n)throw Error('SERVICE_PRISTINE_ROLE_REQUIRED');
 const ddl=(await c.query("SELECT has_schema_privilege($1,$2,'CREATE') s,has_database_privilege($1,current_database(),'CREATE') d",[p.role,p.schema])).rows[0];
 if(ddl.s||ddl.d)throw Error('SERVICE_DDL_ROLE_FORBIDDEN');
 const collision=await c.query(`SELECT 1 FROM sam_service_bindings WHERE
  ((google_owner=$1 AND google_client=$2) OR oauth_resource=$5) AND (org_id<>$3 OR entity_id<>$4)`,[p.googleOwner,p.googleClient,p.orgId,p.legalEntityId,p.oauthResource]);
 if(collision.rowCount)throw Error('SERVICE_CROSS_TENANT_BINDING');
 await provisionIntegrationAccess(c,p);
 for(const table of principalTables)await c.query(`ALTER TABLE ${schema}.${ident(table)} ENABLE ROW LEVEL SECURITY; ALTER TABLE ${schema}.${ident(table)} FORCE ROW LEVEL SECURITY`);
 const context=`current_org_id()='${p.orgId}'::uuid AND current_legal_entity_id()='${p.legalEntityId}'::uuid`;
 // An application may request or consume an approval, never grant itself one.
 await c.query(`REVOKE UPDATE ON ${schema}.approvals FROM ${role};
  GRANT UPDATE(used_count,used_at,status) ON ${schema}.approvals TO ${role}`);
 await c.query(`CREATE POLICY ${ident('svc_pending_'+p.role)} ON ${schema}.approvals AS RESTRICTIVE FOR INSERT TO ${role}
  WITH CHECK(status='PENDING' AND approved_by IS NULL AND used_count=0 AND used_at IS NULL)`);
 await c.query(`CREATE POLICY ${ident('svc_consume_'+p.role)} ON ${schema}.approvals AS RESTRICTIVE FOR UPDATE TO ${role}
  USING(status='APPROVED' AND expiry_at>now() AND used_count<max_uses)
  WITH CHECK(status IN ('APPROVED','USED'))`);
 const fn=ident('svc_consume_'+p.role);
 await c.query(`CREATE FUNCTION ${schema}.${fn}() RETURNS trigger LANGUAGE plpgsql AS $guard$
  BEGIN
   IF current_user=${literal(p.role)} AND (NEW.used_count<>OLD.used_count+1 OR NEW.used_count>OLD.max_uses OR
    NEW.status<>CASE WHEN NEW.used_count=OLD.max_uses THEN 'USED' ELSE 'APPROVED' END OR NEW.used_at IS NULL)
   THEN RAISE EXCEPTION 'SERVICE_APPROVAL_CONSUMPTION_INVALID'; END IF;
   RETURN NEW;
  END $guard$;
  CREATE TRIGGER ${fn} BEFORE UPDATE ON ${schema}.approvals FOR EACH ROW EXECUTE FUNCTION ${schema}.${fn}()`);

 async function protect(table:string,scope:string,grants:string[]){
  const relation=schema+'.'+ident(table),fence=`(${scope}) AND ${context}`;
  await c.query(`ALTER TABLE ${relation} ENABLE ROW LEVEL SECURITY; ALTER TABLE ${relation} FORCE ROW LEVEL SECURITY`);
  await c.query(`CREATE POLICY ${ident('svc_base_'+p.role)} ON ${relation} TO ${role} USING(${scope}) WITH CHECK(${scope})`);
  await c.query(`CREATE POLICY ${ident('svc_fence_'+p.role)} ON ${relation} AS RESTRICTIVE TO ${role} USING(${fence}) WITH CHECK(${fence})`);
  for(const grant of grants)await c.query(`GRANT ${grant} ON ${relation} TO ${role}`);
 }
 const google=`owner_id=${literal(p.googleOwner)} AND client_id=${literal(p.googleClient)}`;
 await protect('sam_google_oauth_tokens',google,['SELECT',
  'UPDATE(refresh_sealed,access_sealed,access_expires_at,updated_at)']);
 if(p.kind==='mcp'){
  await c.query(`GRANT INSERT,UPDATE(discovered_tools) ON ${schema}.sam_google_oauth_tokens TO ${role}`);
  await protect('sam_google_oauth_states',google,['SELECT','INSERT','DELETE']);
  await protect('mcp_oauth_clients',`sam_org_id='${p.orgId}'::uuid AND sam_entity_id='${p.legalEntityId}'::uuid`,['SELECT','INSERT']);
  for(const table of oauthTables.slice(1))await protect(table,
   `resource=${literal(p.oauthResource)} AND EXISTS(SELECT 1 FROM ${schema}.mcp_oauth_clients own WHERE own.client_id=${ident(table)}.client_id AND own.sam_org_id='${p.orgId}'::uuid AND own.sam_entity_id='${p.legalEntityId}'::uuid)`,['SELECT','INSERT','DELETE']);
 }
 await c.query('INSERT INTO sam_service_bindings(role_name,kind,org_id,entity_id,google_owner,google_client,oauth_resource) VALUES($1,$2,$3,$4,$5,$6,$7)',[p.role,p.kind,p.orgId,p.legalEntityId,p.googleOwner,p.googleClient,p.oauthResource]);
}
// Run BEFORE enabling FORCE RLS, with reviewed exact client IDs. Unknown,
// already-mapped or foreign mappings fail; no wildcard/default tenant backfill.
export async function adoptOAuthClients(c:PoolClient,p:{clientIds:string[];orgId:string;legalEntityId:string}){
 if(!uuid.test(p.orgId)||!uuid.test(p.legalEntityId)||!p.clientIds.length||new Set(p.clientIds).size!==p.clientIds.length)throw Error('OAUTH_ADOPTION_INVALID');
 if(!(await c.query('SELECT 1 FROM legal_entities WHERE id=$1 AND org_id=$2',[p.legalEntityId,p.orgId])).rowCount)throw Error('OAUTH_ADOPTION_TENANT_INVALID');
 const updated=await c.query('UPDATE mcp_oauth_clients SET sam_org_id=$1,sam_entity_id=$2 WHERE client_id=ANY($3::text[]) AND sam_org_id IS NULL AND sam_entity_id IS NULL RETURNING client_id',[p.orgId,p.legalEntityId,p.clientIds]);
 if(updated.rowCount!==p.clientIds.length)throw Error('OAUTH_ADOPTION_MAPPING_MISMATCH');
}
