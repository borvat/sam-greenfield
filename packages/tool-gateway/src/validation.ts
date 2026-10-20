import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv=new Ajv({strict:false,allErrors:true,validateFormats:true});
addFormats(ajv);
const validators=new WeakMap<object,ReturnType<typeof ajv.compile>>();

export class InvalidToolParameters extends Error {
  readonly code="INVALID_TOOL_PARAMETERS";
}

function checkResolved(value:unknown,path:string):void{
  if(typeof value==="string" && /\{\{|\$\{/.test(value)){
    throw new InvalidToolParameters(`Unresolved parameter at ${path}`);
  }
  if(Array.isArray(value)) value.forEach((item,index)=>checkResolved(item,`${path}[${index}]`));
  else if(value&&typeof value==="object"){
    for(const [key,item] of Object.entries(value)) checkResolved(item,`${path}.${key}`);
  }
}

export function validateToolParameters(capabilityId:string,params:Record<string,unknown>,schema?:Record<string,unknown>):void{
  checkResolved(params,capabilityId);
  if(capabilityId==="bol_list_orders" && params.latestChangeDate!==undefined){
    const date=params.latestChangeDate;
    if(typeof date!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(date)||
       !Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date){
      throw new InvalidToolParameters(`${capabilityId}.latestChangeDate must be a real ISO date (YYYY-MM-DD)`);
    }
  }
  if(!schema||Object.keys(schema).length===0) return;
  let validate=validators.get(schema);
  if(!validate){validate=ajv.compile(schema);validators.set(schema,validate);}
  if(!validate(params)){
    throw new InvalidToolParameters(`${capabilityId}: ${ajv.errorsText(validate.errors,{separator:"; "})}`);
  }
}
