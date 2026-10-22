import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import type {PoolClient} from 'pg';
import {provisionRuntimeAccess,assertRuntimeTenantBinding} from './runtimeAccess';
export const integrationTables=['knowledge_records','goal_read_reviews','entity_capability_bindings','perception_sources','perception_polls','perception_observations','owner_notifications','notification_event_receipts'];
export async function assertIntegrationAccess(c:PoolClient){
 const tenant=await assertRuntimeTenantBinding(c);
 const rows=(await c.query(`SELECT c.relname,c.relrowsecurity,c.relforcerowsecurity,p.polpermissive,
  pg_get_expr(p.polqual,p.polrelid) qual,pg_get_expr(p.polwithcheck,p.polrelid) check_expr
  FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid
  WHERE c.relnamespace=to_regnamespace(current_schema()) AND c.relname=ANY($1::text[])
  AND p.polname='integration_fence_'||current_user AND p.polcmd='*'
  AND (SELECT oid FROM pg_roles WHERE rolname=current_user)=ANY(p.polroles)`,[integrationTables])).rows;
 const normalize=(s:string)=>String(s).replace(/[\s()"]/g,'').toLowerCase();
 const suffix=normalize(`AND current_org_id()='${tenant.org}'::uuid AND current_legal_entity_id()='${tenant.entity}'::uuid`);
 for(const table of integrationTables){
  const row=rows.find(r=>r.relname===table);
  if(!row||!row.relrowsecurity||!row.relforcerowsecurity||row.polpermissive||/\bOR\b/i.test(row.qual)||
   !normalize(row.qual).endsWith(suffix)||normalize(row.qual)!==normalize(row.check_expr))throw Error('INTEGRATION_FIXED_POLICY_REQUIRED');
 }
 return tenant;
}
export const integrationDirectory=resolve('packages/db/integration-migrations');
export function integrationManifest(){return readdirSync(integrationDirectory).filter(f=>f.endsWith('.sql')).sort().map(filename=>{
 const sql=readFileSync(resolve(integrationDirectory,filename),'utf8');return {filename,sql,sha256:createHash('sha256').update(sql).digest('hex')};
});}
// Operator API only. Not called at runtime or by any production startup hook.
export async function applyIntegrationProfile(c:Pick<PoolClient,'query'>){
 const manifest=integrationManifest();if(manifest.length!==8)throw Error('INTEGRATION_MANIFEST_REVIEW_REQUIRED');
 await c.query('BEGIN');
 try{
  await c.query("SELECT pg_advisory_xact_lock(hashtext('sam-integration-migrations'))");
  await c.query('CREATE TABLE IF NOT EXISTS sam_integration_migrations(filename text PRIMARY KEY,sha256 text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())');
  for(const m of manifest){
   const prior=(await c.query('SELECT sha256 FROM sam_integration_migrations WHERE filename=$1',[m.filename])).rows[0];
   if(prior){if(prior.sha256!==m.sha256)throw Error('INTEGRATION_MIGRATION_HASH_MISMATCH');continue;}
   const legacyTable=(await c.query("SELECT to_regclass('sam_schema_migrations') present")).rows[0]?.present;
   const legacy=legacyTable?(await c.query('SELECT sha256 FROM sam_schema_migrations WHERE filename=$1',[m.filename])).rows[0]:undefined;
   if(legacy&&legacy.sha256!==m.sha256)throw Error('INTEGRATION_LEGACY_HASH_MISMATCH');
   if(!legacy)await c.query(m.sql);
   await c.query('INSERT INTO sam_integration_migrations(filename,sha256) VALUES($1,$2)',[m.filename,m.sha256]);
  }
  await c.query('COMMIT');
 }catch(e){await c.query('ROLLBACK');throw e;}
 return manifest.map(({filename,sha256})=>({filename,sha256}));
}
// Add immutable role-specific fences to the feature tables. This is explicitly
// invoked by the operator on a nominated tenant; ordinary runtime ACLs are intact.
export async function provisionIntegrationAccess(c:PoolClient,input:{schema:string;role:string;orgId:string;legalEntityId:string}){
 await provisionRuntimeAccess(c,input);
 const {schema,role,orgId,legalEntityId:entity}=input; // validated by core provisioner
 const relations:Record<string,string>={
  knowledge_records:`kind='SOURCE_FACT' AND legal_entity_id='${entity}'::uuid AND EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id AND g.company_scope='${entity}'::uuid)`,
  goal_read_reviews:`EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id AND g.current_plan_id=plan_id AND g.company_scope='${entity}'::uuid)`,
  entity_capability_bindings:`legal_entity_id='${entity}'::uuid`,
  perception_sources:`legal_entity_id='${entity}'::uuid`,
  perception_polls:`EXISTS(SELECT 1 FROM perception_sources s WHERE s.id=source_id AND s.legal_entity_id='${entity}'::uuid) AND EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id AND g.company_scope='${entity}'::uuid)`,
  perception_observations:`EXISTS(SELECT 1 FROM perception_sources s WHERE s.id=source_id AND s.legal_entity_id='${entity}'::uuid) AND EXISTS(SELECT 1 FROM executions e JOIN goals g ON g.id=e.goal_id WHERE e.id=execution_id AND g.company_scope='${entity}'::uuid) AND EXISTS(SELECT 1 FROM verifications v WHERE v.id=verification_id AND v.execution_id=perception_observations.execution_id)`,
  owner_notifications:`legal_entity_id='${entity}'::uuid AND EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id AND g.company_scope='${entity}'::uuid)`,
  notification_event_receipts:`EXISTS(SELECT 1 FROM outbox_events o WHERE o.id=event_id) AND CASE WHEN notification_id IS NULL THEN true ELSE EXISTS(SELECT 1 FROM owner_notifications n WHERE n.id=notification_id AND n.legal_entity_id='${entity}'::uuid) END`
 };
 for(const [table,scope] of Object.entries(relations)){
  await c.query(`ALTER TABLE "${schema}".${table} ENABLE ROW LEVEL SECURITY; ALTER TABLE "${schema}".${table} FORCE ROW LEVEL SECURITY`);
  const fence=`(${scope}) AND current_org_id()='${orgId}'::uuid AND current_legal_entity_id()='${entity}'::uuid`;
  // Base visibility plus a separate immutable restrictive fence. Existing GUC
  // policies can never broaden this role's nominated principal.
  await c.query(`CREATE POLICY "integration_base_${role}" ON "${schema}".${table} TO "${role}" USING(${scope}) WITH CHECK(${scope})`);
  await c.query(`CREATE POLICY "integration_fence_${role}" ON "${schema}".${table} AS RESTRICTIVE TO "${role}" USING(${fence}) WITH CHECK(${fence})`);
  await c.query(`GRANT SELECT ON "${schema}".${table} TO "${role}"`);
 }
 for(const table of ['knowledge_records','goal_read_reviews','perception_polls','perception_observations','owner_notifications','notification_event_receipts'])
  await c.query(`GRANT INSERT ON "${schema}".${table} TO "${role}"`);
 await c.query(`GRANT UPDATE(supersedes,superseded_at) ON "${schema}".knowledge_records TO "${role}"`);
 await c.query(`GRANT UPDATE(next_poll_at,last_hash,last_observed_at) ON "${schema}".perception_sources TO "${role}"`);
 await c.query(`GRANT UPDATE(status,last_error_code,updated_at) ON "${schema}".owner_notifications TO "${role}"`);
 await c.query(`GRANT SELECT ON "${schema}".notification_settings TO "${role}"`);
 await c.query(`CREATE OR REPLACE FUNCTION "${schema}".integration_knowledge_source_guard() RETURNS trigger LANGUAGE plpgsql AS $guard$
  BEGIN
   IF NEW.kind<>'SOURCE_FACT' OR NOT EXISTS(
    SELECT 1 FROM "${schema}".executions e JOIN "${schema}".goals g ON g.id=e.goal_id
    JOIN LATERAL(SELECT id,result FROM "${schema}".verifications v WHERE v.execution_id=e.id ORDER BY checked_at DESC,id DESC LIMIT 1)v ON true
    WHERE e.id=NEW.execution_id AND e.goal_id=NEW.goal_id AND g.company_scope=NEW.legal_entity_id
      AND v.id=NEW.verification_id AND v.result='VERIFIED' AND strpos(e.result::text,NEW.statement)>0
   ) THEN RAISE EXCEPTION 'KNOWLEDGE_PROVENANCE_DENIED'; END IF;
   RETURN NEW;
  END $guard$`);
 await c.query(`DROP TRIGGER IF EXISTS integration_knowledge_source_guard ON "${schema}".knowledge_records;
  CREATE TRIGGER integration_knowledge_source_guard BEFORE INSERT ON "${schema}".knowledge_records
   FOR EACH ROW EXECUTE FUNCTION "${schema}".integration_knowledge_source_guard()`);
 // No OAuth/token store, notification-delivery, capability-grant or DDL access.
}
