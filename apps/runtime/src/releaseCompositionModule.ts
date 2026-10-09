import {pool} from "../../../packages/db/src/client";
import {loadProductionBundle} from "../../production/src/loadBundle";
import {createProductionComposition} from "../../production/src/composition";

// No DDL, migration, GRANT, registry mutation, or external operational loop here.
export default (async()=>{
const login=(await pool.query("SELECT current_user=session_user same_login")).rows[0];
if(!login.same_login)throw new Error("RELEASE_APPLICATION_LOGIN_REQUIRED");
const role=(await pool.query(`SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user`)).rows[0];
if(!role||role.rolsuper||role.rolbypassrls)throw new Error("RELEASE_APPLICATION_ROLE_UNSAFE");
const ownership=(await pool.query(`SELECT count(*)::int n FROM pg_class
  WHERE relnamespace=to_regnamespace(current_schema()) AND relkind IN ('r','p')
    AND relowner=(SELECT oid FROM pg_roles WHERE rolname=current_user)`)).rows[0];
if(ownership.n>0)throw new Error("RELEASE_APPLICATION_TABLE_OWNER_FORBIDDEN");
const rls=(await pool.query(`SELECT count(*)::int n,bool_and(relrowsecurity) protected FROM pg_class
  WHERE relnamespace=to_regnamespace(current_schema())
    AND relname=ANY($1::text[])`,[["goals","plans","work_queue","executions","verifications","world_facts"]])).rows[0];
if(rls.n!==6||!rls.protected)throw new Error("RELEASE_RLS_REQUIRED");
const bundle=await loadProductionBundle(process.env.SAM_PRODUCTION_BUNDLE_MODULE??"");
const approved=new Set((process.env.SAM_RELEASE_CAPABILITIES??"").split(","));
if(bundle.raw.capabilities.some(c=>!approved.has(c.capabilityId))||
  bundle.raw.toolDefinitions.some(t=>t.sideEffect)||
  (bundle.raw.modelAdapters?.length??0)>0){
  throw new Error("RELEASE_UNAPPROVED_CAPABILITY_OR_MODEL");
}
const composition=createProductionComposition({bundle,workerId:process.env.SAM_WORKER_ID??"sam-release-worker"});
composition.supervisorOptions={monitorSideEffects:false};
return composition;
})();
