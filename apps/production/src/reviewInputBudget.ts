import {taskPrompt} from '../../../packages/model-providers/src/common';
// Character allocation controls evidence projection; UTF-8 bytes bound the entire
// serialized provider task prompt, including its wrapper, schemas, provenance, history and critique.
// Neither unit is a model token count or a guarantee of provider latency.
export const REVIEW_EVIDENCE_CHARS=16000;
export const REVIEW_INPUT_BYTES=48000;
export function reviewSourceAllowance(sourceCount:number){
 if(!Number.isSafeInteger(sourceCount)||sourceCount<1||sourceCount>20)throw Error('REVIEW_SOURCE_BUDGET_EXCEEDED');
 return Math.floor(REVIEW_EVIDENCE_CHARS/sourceCount);
}
export function assertReviewInputBudget(input:unknown){
 const bytes=Buffer.byteLength(taskPrompt({task:'executive_planning',capability:'planning',input,dataClassification:'INTERNAL'}),'utf8');
 if(bytes>REVIEW_INPUT_BYTES)throw Error('REVIEW_INPUT_BUDGET_EXCEEDED');
 return bytes;
}

/** Remove documentation only at JSON Schema positions; property names and const/enum data stay intact. */
export function reviewCatalogProjection(descriptors:any[]){
 const annotations=new Set(['description','title','examples','$comment']);
 const maps=new Set(['properties','patternProperties','$defs','definitions','dependentSchemas']);
 const schemas=new Set(['items','additionalItems','additionalProperties','unevaluatedItems','unevaluatedProperties','contains','propertyNames','not','if','then','else','contentSchema']);
 const lists=new Set(['allOf','anyOf','oneOf','prefixItems']);
 function schema(value:any):any{
  if(!value||typeof value!=='object'||Array.isArray(value))return value;
  return Object.fromEntries(Object.entries(value).filter(([k])=>!annotations.has(k)).map(([k,v]:[string,any])=>[
   k,maps.has(k)&&v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([name,child])=>[name,schema(child)])):
    schemas.has(k)?(Array.isArray(v)?v.map(schema):schema(v)):lists.has(k)&&Array.isArray(v)?v.map(schema):v
  ]));
 }
 return descriptors.map(({parameters,...descriptor})=>({...descriptor,parameters:schema(parameters)}));
}
