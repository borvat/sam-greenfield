// Owner-supplied, opt-in criteria. Never inferred from the executor or model.
export const ACCEPTANCE_PREFIX="sam.acceptance/v1:";
type Scalar=string|number|boolean|null;
export interface GoalAcceptance{
  version:1;
  constraints:{capabilityId:string;params:Record<string,Scalar>;result:{field:string;equals:Scalar}}[];
}
function scalar(v:unknown):v is Scalar{
  return v===null||typeof v==="boolean"||(typeof v==="number"&&Number.isFinite(v))||
    (typeof v==="string"&&v.length<=200&&!/[\u0000-\u001f]/.test(v));
}
function keys(v:any,allowed:string[]){
  return v&&typeof v==="object"&&!Array.isArray(v)&&Object.keys(v).every(k=>allowed.includes(k));
}
export function validateGoalAcceptance(v:any):GoalAcceptance{
  if(!keys(v,["version","constraints"])||v.version!==1||!Array.isArray(v.constraints)||
    v.constraints.length<1||v.constraints.length>16)throw new Error("GOAL_CONTRACT_INVALID");
  for(const c of v.constraints){
    if(!keys(c,["capabilityId","params","result"])||!/[a-zA-Z]/.test(c.capabilityId??"")||
      !/^[a-zA-Z0-9_.-]{1,80}$/.test(c.capabilityId)||!keys(c.params,Object.keys(c.params??{}))||
      Object.keys(c.params).length>16||Object.entries(c.params).some(([k,x])=>
        !/^[a-zA-Z0-9_]{1,80}$/.test(k)||!scalar(x))||
      !keys(c.result,["field","equals"])||!/^([a-zA-Z][a-zA-Z0-9_]{0,79})$/.test(c.result.field??"")||
      ["constructor","prototype","__proto__"].includes(c.result.field)||!scalar(c.result.equals)){
      throw new Error("GOAL_CONTRACT_INVALID");
    }
  }
  if(JSON.stringify(v).length>8192)throw new Error("GOAL_CONTRACT_INVALID");
  return v;
}
export function encodeGoalAcceptance(v:unknown):string{
  return ACCEPTANCE_PREFIX+JSON.stringify(validateGoalAcceptance(v));
}
export function checkGoalAcceptance(definition:string|null,executions:any[]):{passed:boolean;reason:string}{
  if(!definition?.startsWith(ACCEPTANCE_PREFIX)){
    return {passed:process.env.SAM_REQUIRE_GOAL_ACCEPTANCE!=="1",reason:"GOAL_CONTRACT_MISSING"};
  }
  try{
    const contract=validateGoalAcceptance(JSON.parse(definition.slice(ACCEPTANCE_PREFIX.length)));
    const passed=contract.constraints.every(c=>executions.some(e=>
      e.capability_id===c.capabilityId&&Object.entries(c.params).every(([k,v])=>e.params?.[k]===v)&&
      Object.hasOwn(e.result??{},c.result.field)&&e.result[c.result.field]===c.result.equals));
    return {passed,reason:passed?"GOAL_CONTRACT_MATCH":"GOAL_INTENT_MISMATCH"};
  }catch{return {passed:false,reason:"GOAL_CONTRACT_INVALID"};}
}
