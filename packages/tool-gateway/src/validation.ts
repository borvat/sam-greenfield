type Schema={anyOf?:Schema[];type?:string;properties?:Record<string,Schema>;required?:string[];additionalProperties?:boolean;
  items?:Schema;minItems?:number;maxItems?:number;minLength?:number;maxLength?:number;minimum?:number;maximum?:number;enum?:unknown[]};
export function validateParameters(schema:Record<string,unknown>|undefined,value:unknown):void{
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('TOOL_PARAMETERS_INVALID');
  if(!schema)return; // Existing custom bundles retain their own adapter validation.
  function visit(s:Schema,v:any,depth:number){
    if(depth>16)throw new Error('TOOL_PARAMETERS_DEPTH');
    if(s.anyOf){if(!s.anyOf.some(branch=>{try{visit(branch,v,depth+1);return true;}catch{return false;}}))throw new Error('TOOL_PARAMETER_UNION');}
    const type=Array.isArray(v)?'array':typeof v;
    if(v===null||(s.type&&!(s.type==='integer'?typeof v==='number'&&Number.isSafeInteger(v):type===s.type)))throw new Error('TOOL_PARAMETER_TYPE');
    if(typeof v==='number'&&(!Number.isFinite(v)||(s.minimum!==undefined&&v<s.minimum)||(s.maximum!==undefined&&v>s.maximum)))throw new Error('TOOL_PARAMETER_RANGE');
    if(s.enum&&!s.enum.includes(v))throw new Error('TOOL_PARAMETER_ENUM');
    if(typeof v==='string'&&((s.minLength!==undefined&&v.length<s.minLength)||(s.maxLength!==undefined&&v.length>s.maxLength)))throw new Error('TOOL_PARAMETER_LENGTH');
    if(Array.isArray(v)){
      if((s.minItems!==undefined&&v.length<s.minItems)||(s.maxItems!==undefined&&v.length>s.maxItems))throw new Error('TOOL_PARAMETER_ARRAY');
      if(s.items)for(const x of v)visit(s.items,x,depth+1);
    }else if(type==='object'){
      if((s.required??[]).some(k=>!Object.hasOwn(v,k)))throw new Error('TOOL_PARAMETER_REQUIRED');
      for(const [k,x] of Object.entries(v)){
        if(['__proto__','prototype','constructor'].includes(k)||(s.additionalProperties===false&&!Object.hasOwn(s.properties??{},k)))throw new Error('TOOL_PARAMETER_UNKNOWN');
        if(s.properties?.[k])visit(s.properties[k],x,depth+1);
      }
    }
  }
  visit(schema as Schema,value,0);
}
