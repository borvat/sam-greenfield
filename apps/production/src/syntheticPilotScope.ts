import {createRequire} from "node:module";
const {syntheticPilot}=createRequire(import.meta.url)("../../../scripts/release/synthetic-pilot.cjs");
export function pilotConfiguration(){
  const config=syntheticPilot(process.env);
  if(!config)throw new Error("RELEASE_SYNTHETIC_PILOT_DISABLED");
  return config as {runId:string;expiry:number;input:number;output:number;requests:number;cost:number};
}
export function pilotEnabled(){return process.env.SAM_RELEASE_SYNTHETIC_PLANNER==="1";}
export function numericObjective(text:string){
  if(typeof text!=="string"||Buffer.byteLength(text,"utf8")>4096)
    throw new Error("PILOT_SYNTHETIC_OBJECTIVE_REQUIRED");
  let value:any;try{value=JSON.parse(text);}catch{throw new Error("PILOT_SYNTHETIC_OBJECTIVE_REQUIRED");}
  if(!value||Array.isArray(value)||Object.keys(value).sort().join(",")!=="operation,synthetic,values"||
    value.synthetic!==true||!["sum","mean","min","max","count"].includes(value.operation)||
    !Array.isArray(value.values)||value.values.length<1||value.values.length>16||
    value.values.some((n:unknown)=>!Number.isSafeInteger(n)||Math.abs(n as number)>1000000))
    throw new Error("PILOT_SYNTHETIC_OBJECTIVE_REQUIRED");
  return value as {synthetic:true;operation:string;values:number[]};
}
export async function assertPilotLedgerPrivileges(client:any){
  const row=(await client.query(`SELECT
    has_table_privilege(current_user,'model_calls','SELECT') AS readable,
    has_table_privilege(current_user,'model_calls','INSERT') AS appendable,
    has_column_privilege(current_user,'model_calls','tokens','UPDATE') AND
    has_column_privilege(current_user,'model_calls','success','UPDATE') AND
    has_column_privilege(current_user,'model_calls','verification_result','UPDATE') AS finalizable,
    has_table_privilege(current_user,'model_calls','DELETE') OR
    has_table_privilege(current_user,'model_calls','TRUNCATE') OR
    has_column_privilege(current_user,'model_calls','task','UPDATE') OR
    has_column_privilege(current_user,'model_calls','cost','UPDATE') AS mutable_reservation`)).rows[0];
  if(!row||row.readable!==true||row.appendable!==true||row.finalizable!==true||
    row.mutable_reservation!==false)throw new Error("PILOT_LEDGER_PRIVILEGES_DENIED");
}
export async function authorizePilotGoal(client:any,id:string){
  pilotConfiguration();
  const r=await client.query(`SELECT g.objective FROM goals g JOIN legal_entities e ON e.id=g.company_scope
    WHERE g.id=$1 AND g.company_scope=$2 AND e.org_id=$3
    AND g.domain='release_synthetic' AND g.authority_ceiling='GREEN'`,[
    id,process.env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID,process.env.SAM_RELEASE_ORG_ID]);
  if(r.rowCount!==1)throw new Error("PILOT_GOAL_SCOPE_DENIED");
  return numericObjective(r.rows[0].objective);
}
export function assertPilotStep(objective:{operation:string;values:number[]},capability:string,params:any){
  const statistics=capability==="local.statistics"&&objective.operation==="mean";
  if((capability!=="local.calculate"&&!statistics)||!params||
    Object.keys(params).sort().join(",")!==(statistics?"values":"operation,values")||
    (!statistics&&params.operation!==objective.operation)||
    JSON.stringify(params.values)!==JSON.stringify(objective.values))
    throw new Error("PILOT_PLAN_SCOPE_DENIED");
}
export function pilotContext(entityType:string,entityId:string){
  pilotConfiguration();
  if(entityType!=="legal_entity"||entityId!==process.env.SAM_COMMAND_CENTER_LEGAL_ENTITY_ID)
    throw new Error("PILOT_CONTEXT_SCOPE_DENIED");
  // No facts, memory, users, documents or connected-account query is performed.
  return {entity:{type:entityType,id:entityId},facts:[],memory:[]};
}
