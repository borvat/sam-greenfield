import {sha256Hex} from '../../../packages/shared/src/stableJson';
export const REVIEW_SOURCE_CHARS=24000;
const object=(x:any):x is Record<string,any>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const essential=/^(limitations?|warnings?|coverage|totals?|period|currency|vat|btw|tax|includedOrders|orderItems|candidates)$/i;
export function reviewSourceText(result:any):string{
 const texts=(result?.content??[]).filter((x:any)=>x.type==='text').map((x:any)=>String(x.text));
 for(const a of result?.samArtifacts??[])if(typeof a.text==='string')texts.push(a.text);
 return (texts.length?texts.join('\n'):JSON.stringify(result,null,2)).replace(/https:\/\/[^\s<>]+\/attachments\/[a-f0-9-]{36}/gi,'[temporary artifact; see retrieved content]');
}
function structured(result:any,text:string):any{
 try{return JSON.parse(text);}catch{}
 if(object(result)&&!result.content)return result;
 const parts=[...(result?.content??[]).filter((x:any)=>x.type==='text'),...(result?.samArtifacts??[]).filter((x:any)=>typeof x.text==='string')].map((x:any)=>{try{return JSON.parse(x.text);}catch{return x.text;}});
 return parts.length&&parts.some(object)?{parts:Object.fromEntries(parts.map((part:any,i:number)=>[String(i),part]))}:undefined;
}
/** Keep metadata before sampling detail arrays. Never derive business aggregates. */
export function projectReviewEvidence(result:any,limit=REVIEW_SOURCE_CHARS){
 const original=reviewSourceText(result),data=structured(result,original);
 const omissions:string[]=[],arrays:{path:string;source:any[];target:any}[]=[];
 function skeleton(value:any,path:string,keep=false):any{
  if(Array.isArray(value)){
   if(keep)return value;
   const target={items:[] as any[],totalItems:value.length,omittedItems:value.length};
   arrays.push({path,source:value,target});return target;
  }
  if(object(value))return Object.fromEntries(Object.keys(value).sort((a,b)=>Number(essential.test(b))-Number(essential.test(a))||(a<b?-1:a>b?1:0)).map(k=>[k,skeleton(value[k],path+'.'+k,keep||essential.test(k))]));
  return value;
 }
 let text=original;
 if(original.length>limit){
  if(data===undefined)throw Error('REVIEW_UNSTRUCTURED_EVIDENCE_TOO_LARGE');
  const projected=skeleton(data,'$');
  if(JSON.stringify(projected,null,2).length>limit)throw Error('REVIEW_ESSENTIAL_EVIDENCE_TOO_LARGE');
  // Fair deterministic sampling across arrays; metadata/limitations are never sliced.
  let progress=true;
  while(progress){progress=false;for(const a of arrays){
   const i=a.target.items.length;if(i>=a.source.length)continue;
   a.target.items.push(a.source[i]);a.target.omittedItems--;
   if(JSON.stringify(projected,null,2).length>limit){a.target.items.pop();a.target.omittedItems++;continue;}
   progress=true;
  }}
  for(const a of arrays)if(a.target.omittedItems)omissions.push(`${a.path}: ${a.target.omittedItems} of ${a.source.length} detail items omitted; no aggregate inferred`);
  text=JSON.stringify(projected,null,2);
 }
 const limitations:string[]=[];
 function collect(v:any){if(Array.isArray(v)){v.forEach(collect);return;}if(!object(v))return;for(const [k,x] of Object.entries(v)){
  if(/^(limitations?|warnings?)$/i.test(k)){if(typeof x==='string')limitations.push(x);else if(Array.isArray(x))limitations.push(...x.filter(y=>typeof y==='string'));}
  if(object(x)||Array.isArray(x))collect(x);
 }}
 collect(data);
 if(text.length+JSON.stringify([...new Set(limitations)]).length>REVIEW_SOURCE_CHARS)throw Error("REVIEW_ESSENTIAL_EVIDENCE_TOO_LARGE");
 return {text,truncated:omissions.length>0,omissions,limitations,originalHash:sha256Hex(original),data};
}

/** Conservative monetary completion gate. Settlement invoices are not daily sales. */
export function monetaryEvidenceLimitations(objective:string,sources:{capabilityId:string;data?:any}[]):string[]{
 if(!/\bsales\b|\borders\b|bol\.com|omzet|مبيعات|طلبات/i.test(objective)||! /\b(EUR|VAT|BTW|revenue|turnover|omzet)\b|€|يورو|ضريبة|إيراد/i.test(objective))return [];
 const dates=[...new Set(objective.match(/\b\d{4}-\d{2}-\d{2}\b/g)??[])].sort();
 const supported=sources.some(s=>{
  if(/invoice|factuur|فاتور/i.test(s.capabilityId))return false;
  const r=s.data?.report??s.data?.result?.report??s.data;
  if(!object(r)||!dates.length)return false;
  const period=r.period??{};
  if(period.startDate!==dates[0]||period.endDate!==dates.at(-1))return false;
  const totals=r.totals??r;
  const money=['revenue','grossSales','netSales','salesAmount','totalAmount'].some(k=>typeof totals[k]==='number'&&Number.isFinite(totals[k]));
  const currency=r.currency??totals.currency;
  const vat=r.vat??r.vatStatus??r.taxBasis??totals.vat??totals.vatStatus??totals.taxBasis;
  const vatKnown=typeof vat==='string'&&/^(inclusive|exclusive|included|excluded|gross|net|mixed|including VAT|excluding VAT)$/i.test(vat)||
   object(vat)&&(typeof vat.included==='boolean'||typeof vat.basis==='string'&&/^(inclusive|exclusive|included|excluded)$/i.test(vat.basis));
  const coverage=r.coverage;
  const covered=object(coverage)&&(coverage.complete===true||coverage.pagination==='every requested collection reached an empty terminal page')&&coverage.truncated!==true;
  return money&&currency==='EUR'&&!!vatKnown&&covered;
 });
 return supported?[]:['REVIEW_MONETARY_COVERAGE_UNPROVEN: requested-period sales amount, EUR currency and explicit VAT basis are not established together by verified structured sales evidence. Settlement invoices, including other periods, do not establish daily revenue. Do not invent aggregates.'];
}
