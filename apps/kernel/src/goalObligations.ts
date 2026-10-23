import {sha256Hex} from '../../../packages/shared/src/stableJson';

export type ObligationScope=
 |{kind:'enumerated';identities:string[]}
 |{kind:'subset';description:string}
 |{kind:'population';filter:string;query?:{capabilityId:string;params:Record<string,unknown>}}
 |{kind:'unknown'};
export type GoalObligations={version:1;objectiveHash:string;deliverables:{id:string;description:string;fields:string[];scope:ObligationScope;units:string;vat:string;period:string;timeZone:string}[];unresolved:string[]};
const object=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const text=(v:unknown,max=1000):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
const keys=(v:Record<string,any>,allowed:string[])=>Object.keys(v).every(k=>allowed.includes(k));
const invalid=():never=>{throw Error('GOAL_OBLIGATIONS_INVALID');};
/** A bound interpretation, not authorization or evidence. Unknown meanings must
 * be explicit. The original objective remains authoritative at final review. */
export function validateGoalObligations(value:unknown,objective:string):GoalObligations{
 if(!object(value)||!keys(value,['version','objectiveHash','deliverables','unresolved'])||value.version!==1||value.objectiveHash!==sha256Hex(objective)||JSON.stringify(value).length>16000)return invalid();
 if(!Array.isArray(value.deliverables)||!value.deliverables.length||value.deliverables.length>30||!Array.isArray(value.unresolved)||value.unresolved.length>30||value.unresolved.some((v:unknown)=>!text(v)))return invalid();
 const ids=new Set<string>();
 for(const d of value.deliverables){
  if(!object(d)||!keys(d,['id','description','fields','scope','units','vat','period','timeZone'])||!text(d.id,64)||!/^[a-z][a-z0-9_-]*$/.test(d.id)||ids.has(d.id)||!text(d.description)||!Array.isArray(d.fields)||d.fields.length>30||d.fields.some((f:unknown)=>!text(f,100))||new Set(d.fields).size!==d.fields.length)return invalid();
  ids.add(d.id);
  if(['units','vat','period','timeZone'].some(k=>!text(d[k],300)))return invalid();
  const s=d.scope;if(!object(s))return invalid();
  if(s.kind==='unknown'){if(!keys(s,['kind']))return invalid();}
  else if(s.kind==='subset'){if(!keys(s,['kind','description'])||!text(s.description))return invalid();}
  else if(s.kind==='population'){if(!keys(s,['kind','filter','query'])||!text(s.filter))return invalid();if(s.query!==undefined&&(!object(s.query)||!keys(s.query,['capabilityId','params'])||!text(s.query.capabilityId,100)||!object(s.query.params)||JSON.stringify(s.query).length>4000))return invalid();}
  else if(s.kind==='enumerated'){if(!keys(s,['kind','identities'])||!Array.isArray(s.identities)||!s.identities.length||s.identities.length>500||s.identities.some((v:unknown)=>!text(v,300))||new Set(s.identities).size!==s.identities.length)return invalid();}
  else invalid();
 }
 return structuredClone(value) as GoalObligations;
}
/** Carry the initial contract exactly. Refinement is deliberately not supported
 * until a separately validated monotonic refinement protocol exists. */
export function carryGoalObligations(objective:string,previous:unknown,proposed:unknown):GoalObligations|undefined{
 const prior=previous===undefined?undefined:validateGoalObligations(previous,objective);
 const next=proposed===undefined?undefined:validateGoalObligations(proposed,objective);
 if(prior&&next&&sha256Hex(prior)!==sha256Hex(next))throw Error('GOAL_OBLIGATIONS_IMMUTABLE');
 return prior??next;
}
export function assertObligationReview(contract:GoalObligations,review:{requirements:{obligationId?:string}[]}){
 const ids=review.requirements.map(r=>r.obligationId);
 if(ids.length!==contract.deliverables.length||new Set(ids).size!==ids.length||contract.deliverables.some(d=>!ids.includes(d.id)))throw Error('REVIEW_OBLIGATIONS_MISSING');
}

/** Model-visible interpretation contract. The runtime binds objectiveHash; the
 * model cannot select or replace the original objective. */
export const goalObligationProposalSchema = {
 type:'object',additionalProperties:false,required:['version','deliverables','unresolved'],properties:{
  version:{type:'integer',enum:[1]},
  deliverables:{type:'array',minItems:1,maxItems:30,items:{type:'object',additionalProperties:false,
   required:['id','description','fields','scope','units','vat','period','timeZone'],properties:{
    id:{type:'string',minLength:1,maxLength:64},description:{type:'string',minLength:1,maxLength:1000},
    fields:{type:'array',maxItems:30,items:{type:'string',minLength:1,maxLength:100}},
    scope:{oneOf:[
     {type:'object',additionalProperties:false,required:['kind','identities'],properties:{kind:{enum:['enumerated']},identities:{type:'array',minItems:1,maxItems:500,items:{type:'string',minLength:1,maxLength:300}}}},
     {type:'object',additionalProperties:false,required:['kind','description'],properties:{kind:{enum:['subset']},description:{type:'string',minLength:1,maxLength:1000}}},
     {type:'object',additionalProperties:false,required:['kind','filter'],properties:{kind:{enum:['population']},filter:{type:'string',minLength:1,maxLength:1000},query:{type:'object',additionalProperties:false,required:['capabilityId','params'],properties:{capabilityId:{type:'string',minLength:1,maxLength:100},params:{type:'object'}}}}},
     {type:'object',additionalProperties:false,required:['kind'],properties:{kind:{enum:['unknown']}}}]},
    ...Object.fromEntries(['units','vat','period','timeZone'].map(k=>[k,{type:'string',minLength:1,maxLength:300}]))}}},
  unresolved:{type:'array',maxItems:30,items:{type:'string',minLength:1,maxLength:1000}}
 }
};
export function bindProposedObligations(value:unknown,objective:string):GoalObligations{
 if(!object(value)||Object.hasOwn(value,'objectiveHash'))throw Error('GOAL_OBLIGATIONS_PROPOSAL_INVALID');
 return validateGoalObligations({...value,objectiveHash:sha256Hex(objective)},objective);
}
