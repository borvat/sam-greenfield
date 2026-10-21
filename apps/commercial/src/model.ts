import { sha256Hex } from '../../../packages/shared/src/stableJson';

export const COST_CATEGORIES = ['purchase','inbound_transport','customs','commission','fulfilment','outbound_shipping','returns_handling','storage','advertising','packaging','overhead','other'] as const;
export type Category = typeof COST_CATEGORIES[number];
export type Ref = { executionId:string; path:string };
export type Evidence = { id:string; capability:string; params:any; result:any; readAt:string; hash:string };
export type ProductInput = {
 sku:string; ean:string; identity:Ref;
 // Ledger period values, not gross order value. No implicit recognition of OPEN orders.
 ledger:Ref;
};
export type AnalysisInput = {
 goalId:string; account:Ref; orders:Ref[]; inventory?:Ref;
 period:{start:string;end:string}; products:ProductInput[];
};
export type Access = { legalEntityId:string; actor:string };
export const enabled = () => process.env.SAM_COMMERCIAL_LEARNING_ENABLED === 'true';
export function requireEnabled(){if(!enabled())throw new Error('COMMERCIAL_DISABLED');}
export function invariant(ok:unknown,label:string):asserts ok {if(!ok)throw new Error(`COMMERCIAL_${label}`);}
export function text(value:any,label:string,max=200):string {
 invariant(typeof value==='string'&&value.trim().length>0&&value.length<=max,label);return value;
}
export function integer(value:any,label:string,signed=false):number {
 invariant(Number.isSafeInteger(value)&&(signed||value>=0),label);return value;
}
export function sum(values:number[]):number {return integer(values.reduce((a,b)=>a+b,0),'AMOUNT_OVERFLOW',true);}
export function day(value:any):number {
 invariant(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value),'DATE');
 const n=Date.parse(value+'T00:00:00Z');invariant(Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===value,'DATE');return n;
}
export function period(value:{start:string;end:string}){
 const start=day(value.start),end=day(value.end);invariant(start<=end&&end-start<366*86400000,'PERIOD');
 return {start:value.start,end:value.end,days:Math.round((end-start)/86400000)+1,timeZone:'Europe/Amsterdam'};
}
// Exact JSON pointers only. Never evaluate source text, templates or property prototypes.
export function pointer(root:any,path:string):any {
 invariant(typeof path==='string'&&path.length<=500&&(path===''||path.startsWith('/')),'POINTER');
 let node=root;
 for(const raw of path===''?[]:path.slice(1).split('/')){
  invariant(!/~(?![01])/.test(raw),'POINTER_ESCAPE');const key=raw.replace(/~1/g,'/').replace(/~0/g,'~');
  invariant(!['__proto__','constructor','prototype'].includes(key)&&node!==null&&typeof node==='object'&&Object.hasOwn(node,key),'MISSING_FIELD');node=node[key];
 }
 return node;
}
export function unwrap(value:any){
 // bol MCP exposes JSON in structuredContent. Text-only output is not parsed by a model.
 return value?.structuredContent??value;
}
export function sourceValue(e:Evidence){
 if(e.capability.startsWith('bol_'))return unwrap(e.result?.data??e.result);
 const raw=unwrap(e.result);const content=typeof raw.result==='string'?raw.result:undefined;
 invariant(content&&content.length<=1024*1024,'STRUCTURED_LEDGER_REQUIRED');
 const marker='--- CONTENT ---\n',index=content.indexOf(marker);
 invariant(index>=0&&content.indexOf(marker,index+marker.length)<0,'LEDGER_CONTENT_MARKER');
 let value:any;try{value=JSON.parse(content.slice(index+marker.length).replace(/^\uFEFF/,''))}catch{throw new Error('COMMERCIAL_LEDGER_JSON_REQUIRED')}
 invariant(value&&typeof value==='object'&&!Array.isArray(value),'LEDGER_ROOT');return value;
}
export function stableId(value:any){return sha256Hex(value);}
