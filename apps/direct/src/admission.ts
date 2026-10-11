import {pool,withTenantTransaction} from "../../../packages/db/src/client";
import {assertReleaseDatabaseSafety} from "../../../packages/db/src/releaseSafety";
import {assertPilotLedgerPrivileges} from "../../production/src/syntheticPilotScope";
import type {ValidatedProductionBundle} from "../../production/src/bundle";
import type {DirectBudget} from "./bundle";
import {sha256Hex} from "../../../packages/shared/src/stableJson";
export async function admitDirectDatabase(config:{orgId:string;entityId:string;schema:string;role:string;budget:DirectBudget;capabilities:string[]},bundle:ValidatedProductionBundle){
  const connection=await pool.connect();
  try{
    const identity=(await connection.query(`SELECT current_schema() schema,current_user role,session_user login,
      (SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()) ssl`)).rows[0];
    if(identity.schema!==config.schema||identity.role!==config.role||identity.login!==config.role||identity.ssl!==true)
      throw new Error("DIRECT_DATABASE_IDENTITY_REFUSED");
    await assertReleaseDatabaseSafety(connection);await assertPilotLedgerPrivileges(connection);
  }finally{connection.release();}
  return withTenantTransaction({orgId:config.orgId,legalEntityId:config.entityId},async client=>{
    const installation=(await client.query("SELECT metadata FROM sam_installation WHERE org_id=$1 AND entity_id=$2",[config.orgId,config.entityId])).rows[0]?.metadata;
    if(!installation||installation.schema!==config.schema||installation.role!==config.role||
      sha256Hex(installation.budget)!==sha256Hex(config.budget)||
      JSON.stringify([...installation.capabilities].sort())!==JSON.stringify([...config.capabilities].sort()))throw new Error("DIRECT_INSTALLATION_MISMATCH");
    const catalog=(await client.query("SELECT capability_id FROM verification_contracts WHERE must_not_trust_execution_result=true")).rows.map(r=>r.capability_id).sort();
    if(JSON.stringify(catalog)!==JSON.stringify([...config.capabilities].sort()))throw new Error("DIRECT_VERIFICATION_CATALOG_MISMATCH");
    const expected=bundle.raw.modelProviderConfigs??[];
    const actual=(await client.query(`SELECT provider_id,models,privacy_class_allowed,cost_per_1k_input,cost_per_1k_output FROM model_providers`)).rows;
    if(actual.length!==expected.length||expected.some(p=>{
      const row=actual.find(s=>s.provider_id===p.providerId);
      return !row||JSON.stringify(row.models)!==JSON.stringify(p.models)||
        JSON.stringify(row.privacy_class_allowed)!==JSON.stringify(p.privacyClasses)||
        Number(row.cost_per_1k_input)!==p.costPer1kInput||Number(row.cost_per_1k_output)!==p.costPer1kOutput;
    }))throw new Error("DIRECT_MODEL_CATALOG_MISMATCH");
    if(expected.length!==installation.providers.length||expected.some(p=>{
      const seeded=installation.providers.find((s:any)=>s.providerId===p.providerId);
      return !seeded||JSON.stringify(seeded.models)!==JSON.stringify(p.models)||
        seeded.costPer1kInput!==p.costPer1kInput||seeded.costPer1kOutput!==p.costPer1kOutput||
        JSON.stringify(seeded.privacyClasses)!==JSON.stringify(p.privacyClasses);
    }))throw new Error("DIRECT_MODEL_REGISTRY_MISMATCH");
    const entity=(await client.query("SELECT id FROM legal_entities WHERE id=$1 AND org_id=$2 AND status='ACTIVE'",[config.entityId,config.orgId])).rows;
    if(entity.length!==1)throw new Error("DIRECT_ENTITY_NOT_ACTIVE");
    const rls=(await client.query(`SELECT count(*)::int n FROM pg_class WHERE relnamespace=to_regnamespace($1)
      AND relkind='r' AND relrowsecurity AND relforcerowsecurity`,[config.schema])).rows[0].n;
    if(rls!==23)throw new Error("DIRECT_FORCED_RLS_REQUIRED");
    // Prove missing and foreign context cannot read application records, on the actual LOGIN.
    for(const [org,entity] of [["",""],[config.orgId,""],["00000000-0000-4000-8000-000000000001",config.entityId]]){
      await client.query("SELECT set_config('app.current_org_id',$1,true),set_config('app.current_legal_entity_id',$2,true)",[org,entity]);
      for(const table of ["legal_entities","goals","plans","work_queue","executions","verifications","sam_installation"])
        if((await client.query(`SELECT count(*)::int n FROM ${table}`)).rows[0].n!==0)throw new Error("DIRECT_RLS_NEGATIVE_FAILED");
    }
    return {restrictedLogin:true,forcedRls:true,catalogReady:true};
  });
}
