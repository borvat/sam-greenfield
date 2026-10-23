/** Model-visible and runtime-validated grammar. No hidden expression language. */
const identifier={type:'string',pattern:'^[A-Za-z][A-Za-z0-9_]{0,63}$',not:{enum:['constructor','prototype','__proto__']}};
const keys={type:'array',items:identifier,minItems:1,maxItems:8,uniqueItems:true};
const operation=(op:string,properties:Record<string,unknown>)=>({type:'object',additionalProperties:false,required:['op',...Object.keys(properties)],properties:{op:{enum:[op]},...properties}});
const aggregate=(fn:string,properties:Record<string,unknown>)=>({type:'object',additionalProperties:false,required:['fn','as',...Object.keys(properties)],properties:{fn:{enum:[fn]},as:identifier,...properties}});
export const TRANSFORM_PLAN_SCHEMA={type:'object',additionalProperties:false,required:['version','source','operations'],properties:{
 version:{type:'integer',enum:[1]},source:identifier,
 operations:{type:'array',maxItems:12,items:{anyOf:[
  operation('save',{as:identifier}),
  operation('from',{source:identifier}),
  operation('select',{fields:{type:'object',minProperties:1,maxProperties:40,propertyNames:identifier,additionalProperties:identifier}}),
  operation('filter',{field:identifier,compare:{enum:['eq','ne','lt','lte','gt','gte']},value:{type:'string',maxLength:2000}}),
  operation('derive',{as:identifier,left:identifier,right:identifier,operator:{enum:['add','subtract','multiply','divide']}}),
  operation('group',{keys,aggregates:{type:'array',minItems:1,maxItems:8,items:{anyOf:[aggregate('sum',{field:identifier}),aggregate('count',{})]}}}),
  operation('join',{right:identifier,leftKey:identifier,rightKey:identifier,kind:{enum:['left','inner']}}),
  operation('union',{right:identifier}),
  operation('distinct',{keys})
 ]}}
}};
export const DERIVE_PARAMETERS={type:'object',additionalProperties:false,required:['sources','plan'],properties:{
 sources:{type:'object',minProperties:1,maxProperties:8,propertyNames:identifier,additionalProperties:{type:'object',additionalProperties:false,required:['executionId','contractId'],properties:{executionId:{type:'string',format:'uuid'},contractId:{type:'string',minLength:1,maxLength:100}}}},
 plan:TRANSFORM_PLAN_SCHEMA
}};
