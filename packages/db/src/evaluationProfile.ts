import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import type {PoolClient} from 'pg';
import {assertSpecialistAccess} from './specialistProfile';
export function evaluationManifest(){const filename='00108_evaluation_trials.sql',sql=readFileSync('packages/db/evaluation-migrations/'+filename,'utf8');return {filename,sql,sha256:createHash('sha256').update(sql).digest('hex')};}
/** Register only an unused company. Existing operational knowledge is refused;
 * the runtime cannot enroll companies or convert customer data into fixtures. */
export async function enrollEvaluationCompany(c:PoolClient,entityId:string){
 const owner=(await c.query("SELECT current_user=pg_get_userbyid(relowner) permitted FROM pg_class WHERE oid='evaluation_companies'::regclass")).rows[0];
 if(!owner?.permitted)throw Error('EVALUATION_OPERATOR_REQUIRED');
 const used=(await c.query(`SELECT EXISTS(SELECT 1 FROM goals WHERE company_scope=$1)
  OR EXISTS(SELECT 1 FROM world_facts WHERE entity_id=$1 OR scope->>'legal_entity_id'=$1::text)
  OR EXISTS(SELECT 1 FROM memory_records WHERE scope->>'legal_entity_id'=$1::text)
  OR EXISTS(SELECT 1 FROM knowledge_records WHERE legal_entity_id=$1)
  OR EXISTS(SELECT 1 FROM financial_documents WHERE legal_entity_id=$1) used`,[entityId])).rows[0];
 if(used.used)throw Error('EVALUATION_UNUSED_COMPANY_REQUIRED');
 await c.query("INSERT INTO evaluation_companies(legal_entity_id,purpose) VALUES($1,'SYNTHETIC_EVALUATION_ONLY')",[entityId]);
}
export async function applyEvaluationProfile(c:PoolClient){
 const m=evaluationManifest();await c.query('BEGIN');try{
  await c.query("SELECT pg_advisory_xact_lock(hashtext('sam-evaluation-migrations'))");
  await c.query('CREATE TABLE IF NOT EXISTS sam_evaluation_migrations(filename text PRIMARY KEY,sha256 text NOT NULL)');
  const prior=(await c.query('SELECT * FROM sam_evaluation_migrations')).rows;
  if(prior.length>1||prior.some(r=>r.filename!==m.filename||r.sha256!==m.sha256))throw Error('EVALUATION_MIGRATION_HASH_MISMATCH');
  if(!prior.length){await c.query(m.sql);await c.query('INSERT INTO sam_evaluation_migrations VALUES($1,$2)',[m.filename,m.sha256]);}
  await c.query('COMMIT');return {filename:m.filename,sha256:m.sha256};
 }catch(e){await c.query('ROLLBACK');throw e;}
}
/** Operator invocation only; trial creation is NOT granted to the runtime. */
export async function provisionEvaluationAccess(c:PoolClient,p:{schema:string;role:string;orgId:string;legalEntityId:string}){
 if(!/^[a-z_][a-z0-9_]*$/.test(p.schema)||!/^[a-z_][a-z0-9_]*$/.test(p.role)||![p.orgId,p.legalEntityId].every(s=>/^[0-9a-f-]{36}$/.test(s)))throw Error('EVALUATION_PRINCIPAL_INVALID');
 const {schema,role,orgId,legalEntityId:entity}=p;
 await c.query(`GRANT SELECT ON "${schema}".sam_evaluation_migrations TO "${role}"`);
 for(const table of ['evaluation_companies','evaluation_trials','evaluation_events']){
  const scope=table==='evaluation_companies'?`legal_entity_id='${entity}'::uuid`:table==='evaluation_trials'?`legal_entity_id='${entity}'::uuid AND EXISTS(SELECT 1 FROM goals g WHERE g.id=root_goal_id AND g.company_scope='${entity}'::uuid)`:
   `EXISTS(SELECT 1 FROM evaluation_trials t WHERE t.id=trial_id AND t.legal_entity_id='${entity}'::uuid)`;
  const fence=`(${scope}) AND current_org_id()='${orgId}'::uuid AND current_legal_entity_id()='${entity}'::uuid`;
  await c.query(`ALTER TABLE "${schema}".${table} ENABLE ROW LEVEL SECURITY;ALTER TABLE "${schema}".${table} FORCE ROW LEVEL SECURITY`);
  await c.query(`CREATE POLICY "evaluation_base_${role}" ON "${schema}".${table} TO "${role}" USING(${scope}) WITH CHECK(${scope})`);
  await c.query(`CREATE POLICY "evaluation_fence_${role}" ON "${schema}".${table} AS RESTRICTIVE TO "${role}" USING(${fence}) WITH CHECK(${fence})`);
  await c.query(`GRANT SELECT ON "${schema}".${table} TO "${role}"`);
 }
 await c.query(`GRANT INSERT ON "${schema}".evaluation_events TO "${role}"`);
 await c.query(`GRANT UPDATE(used,agent_used,agent_deadlines,cancelled) ON "${schema}".evaluation_trials TO "${role}"`);
}
export async function assertEvaluationAccess(c:PoolClient){
 const tenant=await assertSpecialistAccess(c),m=evaluationManifest();
 const prior=(await c.query('SELECT * FROM sam_evaluation_migrations')).rows;
 if(prior.length!==1||prior[0].filename!==m.filename||prior[0].sha256!==m.sha256)throw Error('EVALUATION_MIGRATION_REQUIRED');
 const rows=(await c.query(`SELECT c.relname,c.relforcerowsecurity,p.polpermissive,pg_get_expr(p.polqual,p.polrelid) qual,pg_get_expr(p.polwithcheck,p.polrelid) chk
  FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relnamespace=to_regnamespace(current_schema()) AND c.relname=ANY($1::text[])
  AND p.polname='evaluation_fence_'||current_user AND p.polcmd='*' AND (SELECT oid FROM pg_roles WHERE rolname=current_user)=ANY(p.polroles)`,[['evaluation_companies','evaluation_trials','evaluation_events']])).rows;
 const norm=(s:string)=>String(s).replace(/[\s()"]/g,'').toLowerCase(),suffix=norm(`AND current_org_id()='${tenant.org}'::uuid AND current_legal_entity_id()='${tenant.entity}'::uuid`);
 if(rows.length!==3||rows.some(r=>!r.relforcerowsecurity||r.polpermissive||/\bOR\b/i.test(r.qual)||norm(r.qual)!==norm(r.chk)||!norm(r.qual).endsWith(suffix)))throw Error('EVALUATION_FIXED_POLICY_REQUIRED');
 return tenant;
}
