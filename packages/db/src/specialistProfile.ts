import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import type {PoolClient} from 'pg';
import {assertRuntimeTenantBinding} from './runtimeAccess';
export const specialistTables=['specialist_budgets','specialist_sessions','specialist_delegations','specialist_learning'];
export function specialistManifest(){
 const filename='00106_specialist_intelligence.sql',sql=readFileSync('packages/db/specialist-migrations/'+filename,'utf8');
 return {filename,sql,sha256:createHash('sha256').update(sql).digest('hex')};
}
/** Operator invocation only; never runs on application startup. */
export async function applySpecialistProfile(c:PoolClient){
 const m=specialistManifest();await c.query('BEGIN');
 try{
  await c.query("SELECT pg_advisory_xact_lock(hashtext('sam-specialist-migrations'))");
  await c.query('CREATE TABLE IF NOT EXISTS sam_specialist_migrations(filename text PRIMARY KEY,sha256 text NOT NULL)');
  const prior=(await c.query('SELECT * FROM sam_specialist_migrations')).rows;
  if(prior.length>1||prior.some(p=>p.filename!==m.filename||p.sha256!==m.sha256))throw Error('SPECIALIST_MIGRATION_HASH_MISMATCH');
  if(!prior.length){await c.query(m.sql);await c.query('INSERT INTO sam_specialist_migrations VALUES($1,$2)',[m.filename,m.sha256]);}
  await c.query('COMMIT');return {filename:m.filename,sha256:m.sha256};
 }catch(e){await c.query('ROLLBACK');throw e;}
}
export async function provisionSpecialistAccess(c:PoolClient,input:{schema:string;role:string;orgId:string;legalEntityId:string}){
 // Base runtime provisioning is separate and must already have been reviewed.
 const {schema,role,orgId,legalEntityId:entity}=input;
 if(!/^[a-z_][a-z0-9_]*$/.test(schema)||!/^[a-z_][a-z0-9_]*$/.test(role)||![orgId,entity].every(s=>/^[0-9a-f-]{36}$/.test(s)))throw Error('SPECIALIST_PRINCIPAL_INVALID');
 const relations:Record<string,string>={
 specialist_budgets:`EXISTS(SELECT 1 FROM work_queue w JOIN goals g ON g.id=w.goal_id WHERE w.id=root_queue_id AND g.company_scope=legal_entity_id)`,
 specialist_sessions:`EXISTS(SELECT 1 FROM work_queue w JOIN goals g ON g.id=w.goal_id WHERE w.id=queue_id AND g.company_scope=legal_entity_id) AND EXISTS(SELECT 1 FROM specialist_budgets b WHERE b.root_queue_id=specialist_sessions.root_queue_id AND b.legal_entity_id=specialist_sessions.legal_entity_id)`,
 specialist_delegations:`EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id AND g.company_scope=legal_entity_id) AND EXISTS(SELECT 1 FROM specialist_sessions s WHERE s.queue_id=parent_queue_id AND s.root_queue_id=specialist_delegations.root_queue_id AND s.legal_entity_id=specialist_delegations.legal_entity_id)`,
 specialist_learning:`EXISTS(SELECT 1 FROM goals g WHERE g.id=goal_id AND g.company_scope=legal_entity_id)`};
 for(const table of specialistTables){
  const scope=`legal_entity_id='${entity}'::uuid AND (${relations[table]})`;
  const fence=`(${scope}) AND current_org_id()='${orgId}'::uuid AND current_legal_entity_id()='${entity}'::uuid`;
  await c.query(`ALTER TABLE "${schema}".${table} ENABLE ROW LEVEL SECURITY;ALTER TABLE "${schema}".${table} FORCE ROW LEVEL SECURITY`);
  await c.query(`CREATE POLICY "specialist_base_${role}" ON "${schema}".${table} TO "${role}" USING(${scope}) WITH CHECK(${scope})`);
  await c.query(`CREATE POLICY "specialist_fence_${role}" ON "${schema}".${table} AS RESTRICTIVE TO "${role}" USING(${fence}) WITH CHECK(${fence})`);
  await c.query(`GRANT SELECT,INSERT ON "${schema}".${table} TO "${role}"`);
 }
 await c.query(`GRANT UPDATE(used,cancelled) ON "${schema}".specialist_budgets TO "${role}"`);
 await c.query(`GRANT UPDATE(state,used,updated_at) ON "${schema}".specialist_sessions TO "${role}"`);
}
export async function assertSpecialistAccess(c:PoolClient){
 const tenant=await assertRuntimeTenantBinding(c);
 const rows=(await c.query(`SELECT c.relname,c.relrowsecurity,c.relforcerowsecurity,p.polpermissive,
  pg_get_expr(p.polqual,p.polrelid) qual,pg_get_expr(p.polwithcheck,p.polrelid) chk FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid
  WHERE c.relnamespace=to_regnamespace(current_schema()) AND c.relname=ANY($1::text[])
  AND p.polname='specialist_fence_'||current_user AND p.polcmd='*' AND (SELECT oid FROM pg_roles WHERE rolname=current_user)=ANY(p.polroles)`,[specialistTables])).rows;
 const norm=(s:string)=>String(s).replace(/[\s()"]/g,'').toLowerCase();
 const suffix=norm(`AND current_org_id()='${tenant.org}'::uuid AND current_legal_entity_id()='${tenant.entity}'::uuid`);
 for(const table of specialistTables){const r=rows.find(r=>r.relname===table);
  if(!r||!r.relrowsecurity||!r.relforcerowsecurity||r.polpermissive||/\bOR\b/i.test(r.qual)||!norm(r.qual).endsWith(suffix)||norm(r.qual)!==norm(r.chk))throw Error('SPECIALIST_FIXED_POLICY_REQUIRED');}
 return tenant;
}
