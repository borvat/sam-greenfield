import {readFileSync} from 'node:fs';
import type {PoolClient} from 'pg';
const profile=()=>readFileSync('packages/db/shared-goal-profile/001_shared_coordinator.sql','utf8');
/** Explicit isolated/operator action. Never run by normal startup or composition. */
export async function applySharedGoalProfile(c:PoolClient){
 const owner=(await c.query("SELECT current_user=pg_get_userbyid(proowner) permitted FROM pg_proc WHERE oid='specialist_execution_live_guard'::regproc")).rows[0];
 if(!owner?.permitted)throw Error('SHARED_PROFILE_OPERATOR_REQUIRED');
 await c.query('BEGIN');try{await c.query(profile());const schema=(await c.query('SELECT current_schema() name')).rows[0].name;if(!/^[a-z_][a-z0-9_]*$/.test(schema))throw Error('SHARED_PROFILE_SCHEMA_INVALID');await c.query(`ALTER FUNCTION specialist_execution_live_guard() SET search_path TO "${schema}",pg_catalog,public,pg_temp`);await c.query('COMMIT');}catch(e){await c.query('ROLLBACK');throw e;}
}
/** Exact source admission rather than assuming a provisioned role is compatible. */
export async function assertSharedGoalProfile(c:PoolClient){
 const body=profile().split('$$')[1];
 const row=(await c.query("SELECT prosrc,prosecdef,proconfig,current_schema() schema FROM pg_proc WHERE oid='specialist_execution_live_guard'::regproc")).rows[0];
 if(!row||row.prosecdef||row.prosrc!==body||!row.proconfig?.includes(`search_path=${row.schema}, pg_catalog, public, pg_temp`))throw Error('SHARED_COORDINATOR_PROFILE_REQUIRED');
}
