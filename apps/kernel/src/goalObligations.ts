import {sha256Hex} from '../../../packages/shared/src/stableJson';

export type ObligationScope=
 |{kind:'enumerated';identities:string[]}
 |{kind:'subset';description:string}
 |{kind:'population';filter:string}
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
  else if(s.kind==='population'){if(!keys(s,['kind','filter'])||!text(s.filter))return invalid();}
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
