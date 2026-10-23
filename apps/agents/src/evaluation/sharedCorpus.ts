import {sha256Hex} from '../../../../packages/shared/src/stableJson';
/** Invented, immutable transport fixture. No expected answers or task plans. */
export const sharedCorpus={id:'shared-records-v1',collections:[
 {id:'ledger-k7',title:'Ledger periods',description:'Invented booked line records; EUR net amounts, UTC dates',records:[
  {id:'line-17',period:'2026-01',amount:'12.10'},
  {id:'line-91',period:'2026-02',amount:'15.35'}]},
 {id:'delivery-r4',title:'Delivery promises',description:'Invented supplier promise and delivery dates, UTC calendar dates',records:[
  {id:'delivery-42',supplier:'Supplier-A',promised:'2026-03-01',delivered:'2026-03-04'},
  {id:'delivery-89',supplier:'Supplier-B',promised:'2026-03-02',delivered:'2026-03-02'}]},
 {id:'documents-z9',title:'Document inventory',description:'Invented independently retrieved document byte hashes',records:[
  {id:'document-58',digest:'a'.repeat(64)},
  {id:'document-73',digest:'a'.repeat(64)},
  {id:'document-96',digest:'b'.repeat(64)}]}
]};
export const sharedCorpusHash=()=>sha256Hex(sharedCorpus);
export function sharedCollectionPage(params:Record<string,unknown>){
 if(Object.keys(params).some(k=>!['query','cursor'].includes(k))||typeof params.query!=='string'||!params.query.trim()||params.query.length>200)throw Error('EVALUATION_DISCOVERY_QUERY_INVALID');
 const words=params.query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
 const matches=sharedCorpus.collections.filter(c=>words.every(w=>(c.title+' '+c.description).toLowerCase().includes(w)));
 if(matches.length!==1)return {collections:matches.map(({records,...metadata})=>metadata),records:[],next:null,coverage:'unknown',timeZone:'UTC',limitations:['Collection selection is absent or ambiguous; narrow the query before drawing conclusions']};
 const collection=matches[0],offset=params.cursor===undefined||params.cursor===null?0:Number(String(params.cursor).replace(/^page:/,''));
 if(!Number.isInteger(offset)||offset<0||offset>=collection.records.length||offset>0&&params.cursor!=='page:'+offset)throw Error('EVALUATION_DISCOVERY_CURSOR_INVALID');
 // Same generic transport rule for every collection: one page contains at most 2 records.
 const records=collection.records.slice(offset,offset+2),next=offset+records.length<collection.records.length?'page:'+(offset+records.length):null;
 return {collections:[{id:collection.id,title:collection.title,description:collection.description}],records,next,coverage:'unknown',timeZone:'UTC',limitations:['Synthetic collection only; query completeness is not global business coverage']};
}
