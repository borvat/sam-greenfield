import {sha256Hex} from '../../../../packages/shared/src/stableJson';
/** Reviewed extraction configuration; never accepted from a model/tool response. */
export type CollectionContract={cursorParameter:string;nextCursorPath:string[];identityPath:string[];requiredFalsePath?:string[]};
export type CollectionReceipt={version:1;executionId:string;executionHash:string;queryHash:string;query?:{capabilityId:string;params:Record<string,unknown>};requestCursor:string|null;nextCursor:string|null;identities:string[];terminal:boolean;gaps?:string[]};
function at(value:any,path:string[]){
 if(!Array.isArray(path)||!path.length||path.length>8||path.some(k=>typeof k!=='string'||['__proto__','constructor','prototype'].includes(k)))throw Error('EVIDENCE_COLLECTION_CONTRACT_INVALID');
 for(const key of path){if(!value||typeof value!=='object'||!Object.hasOwn(value,key))throw Error('EVIDENCE_COLLECTION_METADATA_MISSING');value=value[key];}return value;
}
const cursor=(v:unknown)=>v===null||typeof v==='string'&&v.length>0&&v.length<=2000;
/** Called only after execution hash/current verification/goal/tenant checks. Absence
 * of a next-page field is NOT a terminal signal. Identity collisions stay visible. */
export function collectionReceipt(row:{id:string;execution_hash:string;capability_id:string;params:Record<string,unknown>;result:unknown},records:unknown[],contract:CollectionContract):CollectionReceipt{
 if(!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(contract.cursorParameter)||['constructor','prototype','__proto__'].includes(contract.cursorParameter))throw Error('EVIDENCE_COLLECTION_CONTRACT_INVALID');
 const requestCursor=row.params[contract.cursorParameter]??null,nextCursor=at(row.result,contract.nextCursorPath);
 if(!cursor(requestCursor)||!cursor(nextCursor)||records.length>500)throw Error('EVIDENCE_COLLECTION_METADATA_INVALID');
 const identities=records.map(record=>at(record,contract.identityPath));
 if(identities.some(id=>typeof id!=='string'||!id.length||id.length>300))throw Error('EVIDENCE_COLLECTION_IDENTITY_INVALID');
 const gaps:string[]=[];if(contract.requiredFalsePath){let value:unknown;try{value=at(row.result,contract.requiredFalsePath);}catch{}if(value!==false)gaps.push('SEARCH_COMPLETENESS_UNPROVEN');}
 const params=Object.fromEntries(Object.entries(row.params).filter(([key])=>key!==contract.cursorParameter));
 return {version:1,executionId:row.id,executionHash:row.execution_hash,queryHash:sha256Hex({capabilityId:row.capability_id,params,contract}),query:{capabilityId:row.capability_id,params},requestCursor:requestCursor as string|null,nextCursor:nextCursor as string|null,identities,terminal:nextCursor===null,...(gaps.length?{gaps}:{})};
}
/** Receipt coverage applies only to the exact bound query, never the whole goal.
 * No timeout, missing page, duplicate identity or cursor loop proves completeness. */
export function assessCollection(receipts:CollectionReceipt[]){
 if(!receipts.length||receipts.length>8)throw Error('EVIDENCE_COLLECTION_LIMIT');
 const gaps=new Set<string>(),first=receipts[0],pages=new Map<string|null,CollectionReceipt>();
 const ids=new Set<string>(),executions=new Set<string>();
 for(const r of receipts){
  for(const gap of r.gaps??[])gaps.add(gap);
  if(r.version!==1||r.queryHash!==first.queryHash)gaps.add('QUERY_MISMATCH');
  if(executions.has(r.executionId))gaps.add('REPEATED_EXECUTION');executions.add(r.executionId);
  if(pages.has(r.requestCursor))gaps.add('AMBIGUOUS_PAGE');pages.set(r.requestCursor,r);
  for(const id of r.identities){if(ids.has(id))gaps.add('DUPLICATE_IDENTITY');ids.add(id);}
 }
 const visited=new Set<string|null>();let next:string|null=null,terminal=false;
 while(!visited.has(next)){
  visited.add(next);const page=pages.get(next);if(!page){gaps.add('PAGE_MISSING');break;}
  if(page.nextCursor===null){terminal=page.terminal;if(!terminal)gaps.add('TERMINAL_UNPROVEN');break;}
  if(page.terminal)gaps.add('TERMINAL_CONTRADICTION');next=page.nextCursor;
  if(visited.has(next))gaps.add('CURSOR_CYCLE');
 }
 if(visited.size!==pages.size)gaps.add('DISCONNECTED_PAGE');
 if(!terminal)gaps.add('TERMINAL_UNPROVEN');
 return {queryHash:first.queryHash,complete:gaps.size===0,identities:[...ids].sort(),gaps:[...gaps].sort(),receiptHash:sha256Hex([...receipts].sort((a,b)=>a.executionId.localeCompare(b.executionId)))};
}
