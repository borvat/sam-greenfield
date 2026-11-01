import type {PoolClient} from 'pg';
import {createHash} from 'node:crypto';

type Client=Pick<PoolClient,'query'>;
export interface OwnerNotificationDeliveryPrincipal {schema:string;role:'sam_runtime_app';orgId:string;legalEntityId:string}
const notificationColumns=['channel','recipient_ref','attempt','lease_until','receipt_id','next_attempt_at','accepted_at','confirmed_at'];
const attemptSelect=['notification_id','attempt'],attemptInsert=['notification_id','attempt','outcome'],attemptUpdate=['outcome','receipt_id','error_code','finished_at'];
const normalize=(value:string)=>String(value).replace(/[\s()"]/g,'').toLowerCase();
const normalizePolicy=(value:string,schema:string)=>normalize(value).replaceAll(schema.toLowerCase()+'.current_org_id','current_org_id').replaceAll(schema.toLowerCase()+'.current_legal_entity_id','current_legal_entity_id');
function validate(input:OwnerNotificationDeliveryPrincipal){
 if(input.role!=='sam_runtime_app'||!/^[a-z_][a-z0-9_]{0,62}$/.test(input.schema)||
  ![input.orgId,input.legalEntityId].every(x=>/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(x)))
  throw Error('OWNER_DELIVERY_PRINCIPAL_INVALID');
}
/** Read-only operator preflight; grants neither the migration nor activation consent. */
export async function preflightOwnerNotificationDeliveryAccess(c:Client,input:OwnerNotificationDeliveryPrincipal){
 validate(input);
 const {schema,role,orgId,legalEntityId:entity}=input;
 const principal=(await c.query(`SELECT rolsuper,rolbypassrls,rolcreatedb,rolcreaterole,rolreplication,rolcanlogin,
  has_schema_privilege(oid,$2,'CREATE') schema_create,
  EXISTS(SELECT 1 FROM pg_auth_members WHERE member=pg_roles.oid) membership,
  EXISTS(SELECT 1 FROM pg_class WHERE relnamespace=to_regnamespace($2) AND relowner=pg_roles.oid) owns_object
  FROM pg_roles WHERE rolname=$1`,[role,schema])).rows[0];
 if(!principal?.rolcanlogin||Object.entries(principal).some(([k,v])=>k!=='rolcanlogin'&&v))throw Error('OWNER_DELIVERY_RESTRICTED_RUNTIME_REQUIRED');
 const policy=(await c.query(`SELECT c.relrowsecurity,c.relforcerowsecurity,p.polpermissive,
  pg_get_expr(p.polqual,p.polrelid) qual,pg_get_expr(p.polwithcheck,p.polrelid) check_expr
  FROM pg_class c JOIN pg_policy p ON p.polrelid=c.oid
  WHERE c.relnamespace=to_regnamespace($1) AND c.relname='owner_notifications'
   AND p.polname=$2 AND p.polcmd='*' AND p.polroles=ARRAY[(SELECT oid FROM pg_roles WHERE rolname=$3)]`,
 [schema,'integration_fence_'+role,role])).rows[0];
 const suffix=normalize(`AND current_org_id()='${orgId}'::uuid AND current_legal_entity_id()='${entity}'::uuid`);
 if(!policy?.relrowsecurity||!policy.relforcerowsecurity||policy.polpermissive||/\bOR\b/i.test(policy.qual)||
  !normalizePolicy(policy.qual,schema).endsWith(suffix)||normalizePolicy(policy.qual,schema)!==normalizePolicy(policy.check_expr,schema)||
  !normalizePolicy(policy.qual,schema).includes(normalize(`legal_entity_id='${entity}'::uuid`)))throw Error('OWNER_DELIVERY_EXISTING_TENANT_FENCE_REQUIRED');
 const attempts=(await c.query(`SELECT relrowsecurity,relforcerowsecurity FROM pg_class
  WHERE oid=to_regclass($1)`,[schema+'.notification_delivery_attempts'])).rows[0];
 if(!attempts?.relrowsecurity||!attempts.relforcerowsecurity)throw Error('OWNER_DELIVERY_00107_REQUIRED');
 const broad=(await c.query(`SELECT has_table_privilege($1,$2,'UPDATE') notification_update,
  has_table_privilege($1,$3,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') attempts_broad`,
 [role,schema+'.owner_notifications',schema+'.notification_delivery_attempts'])).rows[0];
 if(broad.notification_update||broad.attempts_broad)throw Error('OWNER_DELIVERY_BROAD_EXISTING_GRANTS_REFUSED');
 return {schema,role,orgId,legalEntityId:entity,preflight:'READY_FOR_SEPARATELY_APPROVED_OPERATOR_PROVISIONING' as const};
}
/** Explicit operator-only transaction. Never called by generic provisioning or startup. */
export async function provisionOwnerNotificationDeliveryAccess(c:Client,input:OwnerNotificationDeliveryPrincipal){
 validate(input);
 const {schema,role,orgId,legalEntityId:entity}=input;
 await c.query('BEGIN');
 try{
  await c.query("SET LOCAL lock_timeout='5s'");
  await c.query("SET LOCAL statement_timeout='15s'");
  await c.query('SELECT pg_advisory_xact_lock(hashtext($1))',['owner-notification-delivery-access:'+schema+':'+role]);
  await preflightOwnerNotificationDeliveryAccess(c,input);
  const scope=`EXISTS(SELECT 1 FROM "${schema}".owner_notifications n JOIN "${schema}".goals g ON g.id=n.goal_id
   WHERE n.id=notification_delivery_attempts.notification_id AND n.legal_entity_id='${entity}'::uuid AND g.company_scope='${entity}'::uuid)`;
  const fence=`(${scope}) AND "${schema}".current_org_id()='${orgId}'::uuid AND "${schema}".current_legal_entity_id()='${entity}'::uuid`;
  for(const kind of ['base','fence']){
   const name='owner_delivery_'+kind+'_'+role;
   await c.query(`DROP POLICY IF EXISTS "${name}" ON "${schema}".notification_delivery_attempts`);
   const expression=kind==='base'?scope:fence;
   await c.query(`CREATE POLICY "${name}" ON "${schema}".notification_delivery_attempts ${kind==='fence'?'AS RESTRICTIVE ':''}
    TO "${role}" USING(${expression}) WITH CHECK(${expression})`);
  }
  await c.query(`GRANT UPDATE(${notificationColumns.join(',')}) ON "${schema}".owner_notifications TO "${role}"`);
  await c.query(`GRANT SELECT(${attemptSelect.join(',')}) ON "${schema}".notification_delivery_attempts TO "${role}"`);
  await c.query(`GRANT INSERT(${attemptInsert.join(',')}) ON "${schema}".notification_delivery_attempts TO "${role}"`);
  await c.query(`GRANT UPDATE(${attemptUpdate.join(',')}) ON "${schema}".notification_delivery_attempts TO "${role}"`);
  const policy=(await c.query(`SELECT c.relrowsecurity,c.relforcerowsecurity,p.polpermissive,
   pg_get_expr(p.polqual,p.polrelid) qual,pg_get_expr(p.polwithcheck,p.polrelid) check_expr
   FROM pg_class c JOIN pg_policy p ON p.polrelid=c.oid WHERE c.oid=to_regclass($1)
   AND p.polname=$2 AND p.polroles=ARRAY[(SELECT oid FROM pg_roles WHERE rolname=$3)] AND p.polcmd='*'`,
  [schema+'.notification_delivery_attempts','owner_delivery_fence_'+role,role])).rows[0];
  if(!policy?.relrowsecurity||!policy.relforcerowsecurity||policy.polpermissive||
   normalizePolicy(policy.qual,schema)!==normalizePolicy(policy.check_expr,schema)||!normalizePolicy(policy.qual,schema).endsWith(normalize(`AND current_org_id()='${orgId}'::uuid AND current_legal_entity_id()='${entity}'::uuid`)))
   throw Error('OWNER_DELIVERY_SCOPE_VERIFICATION_FAILED');
  for(const [table,privilege,columns] of [
   ['owner_notifications','UPDATE',[...notificationColumns,'status','last_error_code','updated_at']],
   ['notification_delivery_attempts','SELECT',attemptSelect],['notification_delivery_attempts','INSERT',attemptInsert],
   ['notification_delivery_attempts','UPDATE',attemptUpdate]
  ] as const){
   for(const column of columns)if(!(await c.query('SELECT has_column_privilege($1,$2,$3,$4) allowed',[role,schema+'.'+table,column,privilege])).rows[0]?.allowed)
    throw Error('OWNER_DELIVERY_COLUMN_GRANT_MISSING');
  }
  await preflightOwnerNotificationDeliveryAccess(c,input);
  const receipt={schema,role,orgId,legalEntityId:entity,notificationUpdateColumns:[...notificationColumns,'status','last_error_code','updated_at'],
   attemptSelectColumns:attemptSelect,attemptInsertColumns:attemptInsert,attemptUpdateColumns:attemptUpdate,
   forcedRls:true,scope:'FIXED_COMPANY_AND_ORG_WITH_PARENT_NOTIFICATION_GOAL',otherRolesChanged:false,publicGrants:false,
   ownerConsentRecorded:false,deliveryActivated:false,providerInvoked:false};
  await c.query('COMMIT');
  return {...receipt,sha256:createHash('sha256').update(JSON.stringify(receipt)).digest('hex')};
 }catch(error){await c.query('ROLLBACK');throw error;}
}
