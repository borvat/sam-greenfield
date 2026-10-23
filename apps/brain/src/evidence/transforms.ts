import {sha256Hex} from '../../../../packages/shared/src/stableJson';
export type Column={kind:'text'|'date'|'decimal';unit?:string;vat?:string};
export type Citation={executionId:string;verificationId:string;row:number;sourceHash:string};
export type EvidenceRow={values:Record<string,string|null>;citations:Citation[]};
export type Dataset={columns:Record<string,Column>;rows:EvidenceRow[];coverage:'complete'|'partial'|'unknown';timeZone:string|null;limitations:string[];selections?:string[]};
export type Operation=
 |{op:'save';as:string}
 |{op:'from';source:string}
 |{op:'select';fields:Record<string,string>}
 |{op:'filter';field:string;compare:'eq'|'ne'|'lt'|'lte'|'gt'|'gte';value:string}
 |{op:'derive';as:string;left:string;right:string;operator:'add'|'subtract'|'multiply'|'divide'}
 |{op:'group';keys:string[];aggregates:{as:string;field?:string;fn:'sum'|'count'}[]}
 |{op:'join';right:string;leftKey:string;rightKey:string;kind:'left'|'inner'}
 |{op:'distinct';keys:string[]};
export type TransformPlan={version:1;source:string;operations:Operation[]};
const fail=(code:string):never=>{throw Error('EVIDENCE_'+code);};
const key=(k:string)=>{if(typeof k!=='string'||! /^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(k)||['constructor','prototype','__proto__'].includes(k))fail('FIELD_INVALID');return k;};
const bounded=(v:unknown,n=250000)=>{if(Buffer.byteLength(JSON.stringify(v),'utf8')>n)fail('SIZE_LIMIT');};
const ten=(n:number)=>10n**BigInt(n);
function decimal(v:string){if(typeof v!=='string'||! /^-?(0|[1-9]\d{0,29})(\.\d{1,12})?$/.test(v))fail('DECIMAL_INVALID');const [a,b='']=v.split('.');return {n:BigInt(a+b),scale:b.length};}
function format(n:bigint,scale:number):string{const neg=n<0n;if(neg)n=-n;let s=n.toString().padStart(scale+1,'0');if(scale)s=s.slice(0,-scale)+'.'+s.slice(-scale);s=s.replace(/(\.\d*?)0+$/,'$1').replace(/\.$/,'');const out=(neg&&n!==0n?'-':'')+s;decimal(out);return out;}
export function exactDecimal(a:string,b:string,op:'add'|'subtract'|'multiply'|'divide'){
 const x=decimal(a),y=decimal(b),scale=Math.max(x.scale,y.scale),xn=x.n*ten(scale-x.scale),yn=y.n*ten(scale-y.scale);
 if(op==='add'||op==='subtract')return format(op==='add'?xn+yn:xn-yn,scale);
 if(op==='multiply')return format(x.n*y.n,x.scale+y.scale);
 if(!y.n)fail('DIVIDE_BY_ZERO');const numerator=x.n*ten(y.scale+12),denominator=y.n*ten(x.scale);
 if(numerator%denominator!==0n)fail('ROUNDING_REQUIRED');return format(numerator/denominator,12);
}
function column(d:Dataset,f:string){key(f);if(!Object.hasOwn(d.columns,f))fail('FIELD_MISSING');return d.columns[f];}
function value(r:EvidenceRow,f:string){if(r.values[f]===null||r.values[f]===undefined)fail('VALUE_MISSING');return r.values[f]!;}
const citations=(rows:EvidenceRow[])=>{const m=new Map<string,Citation>();for(const r of rows)for(const c of r.citations)m.set(JSON.stringify(c),c);return [...m.entries()].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([,c])=>c);};
function validate(d:Dataset){
 bounded(d);if(d.rows.length>500||Object.keys(d.columns).length>40)fail('ROW_OR_COLUMN_LIMIT');
 if(!['complete','partial','unknown'].includes(d.coverage))fail('COVERAGE_INVALID');
 for(const [f,c] of Object.entries(d.columns)){key(f);if(!['text','date','decimal'].includes(c.kind))fail('COLUMN_INVALID');}
 for(const r of d.rows){if(!r.citations.length)fail('PROVENANCE_REQUIRED');for(const f of Object.keys(r.values))column(d,f);for(const [f,c] of Object.entries(d.columns)){
  const v=r.values[f];if(v===null)continue;if(typeof v!=='string'||v.length>2000)fail('VALUE_INVALID');if(c.kind==='decimal')decimal(v);
  if(c.kind==='date'&&(!/^\d{4}-\d{2}-\d{2}$/.test(v)||new Date(v).toISOString().slice(0,10)!==v))fail('DATE_INVALID');
 }}
}
function compatible(a:Column,b:Column){if(a.kind!=='decimal'||b.kind!=='decimal'||!a.unit||!b.unit||a.unit!==b.unit||a.vat!==b.vat)fail('UNIT_OR_SEMANTICS_UNKNOWN');}
function deriveColumn(a:Column,b:Column,op:string):Column{
 if(op==='subtract'&&a.kind==='date'&&b.kind==='date')return {kind:'decimal',unit:'calendar_day'};
 if(op==='add'||op==='subtract'){compatible(a,b);return {...a};}
 if(a.kind!=='decimal'||b.kind!=='decimal'||!a.unit||!b.unit)fail('UNIT_OR_SEMANTICS_UNKNOWN');
 if(op==='multiply'){if(b.unit==='1')return {...a};if(a.unit==='1')return {...b};fail('UNIT_COMPOSITION_UNSUPPORTED');}
 if(b.unit==='1')return {...a};compatible(a,b);return {kind:'decimal',unit:'1'};
}
/** Pure bounded interpreter. No eval, dynamic imports, network or database access. */
export function replayTransform(plan:TransformPlan,sources:Record<string,Dataset>){
 bounded(plan,16000);bounded(sources,1000000);
 if(plan.version!==1||!Array.isArray(plan.operations)||plan.operations.length>12||Object.keys(sources).length>8)fail('PLAN_LIMIT');
 for(const d of Object.values(sources))validate(d);
 key(plan.source);if(!Object.hasOwn(sources,plan.source))fail('SOURCE_MISSING');
 const relations:Record<string,Dataset>={...sources};
 let d:Dataset=structuredClone(sources[plan.source]);
 for(const op of plan.operations){
  if(op.op==='save'){key(op.as);if(Object.hasOwn(relations,op.as)||Object.keys(relations).length>=12)fail('RELATION_LIMIT');relations[op.as]=structuredClone(d);
  }else if(op.op==='from'){key(op.source);if(!Object.hasOwn(relations,op.source))fail('SOURCE_MISSING');d=structuredClone(relations[op.source]);
  }else if(op.op==='select'){
   const columns:Record<string,Column>={};for(const [to,from] of Object.entries(op.fields)){key(to);columns[to]=column(d,from);}
   d={...d,columns,rows:d.rows.map(r=>({values:Object.fromEntries(Object.entries(op.fields).map(([to,from])=>[to,r.values[from]])),citations:r.citations}))};
  }else if(op.op==='filter'){
   const c=column(d,op.field);if(!['eq','ne','lt','lte','gt','gte'].includes(op.compare))fail('COMPARISON_INVALID');
   if(typeof op.value!=='string'||op.value.length>2000)fail('VALUE_INVALID');
   if(c.kind==='decimal')decimal(op.value);
   d={...d,rows:d.rows.filter(r=>{if(r.values[op.field]===null)return false;const v=value(r,op.field);let cmp:number;
    if(c.kind==='decimal'){const x=decimal(v),y=decimal(op.value),scale=Math.max(x.scale,y.scale);const diff=x.n*ten(scale-x.scale)-y.n*ten(scale-y.scale);cmp=diff<0n?-1:diff>0n?1:0;}
    else cmp=v<op.value?-1:v>op.value?1:0;
    return {eq:cmp===0,ne:cmp!==0,lt:cmp<0,lte:cmp<=0,gt:cmp>0,gte:cmp>=0}[op.compare];}),selections:[...(d.selections??[]),JSON.stringify(op)],limitations:[...d.limitations,'Filtered subset; source coverage is not evidence of objective-wide coverage']};
  }else if(op.op==='derive'){
   key(op.as);if(Object.hasOwn(d.columns,op.as)||!['add','subtract','multiply','divide'].includes(op.operator))fail('DERIVATION_INVALID');
   const c=deriveColumn(column(d,op.left),column(d,op.right),op.operator);
   if(c.unit==='calendar_day'&&!d.timeZone)fail('TIME_ZONE_UNKNOWN');
   d={...d,columns:{...d.columns,[op.as]:c},rows:d.rows.map(r=>({...r,values:{...r.values,[op.as]:r.values[op.left]===null||r.values[op.right]===null?null:c.unit==='calendar_day'?String((Date.parse(value(r,op.left))-Date.parse(value(r,op.right)))/86400000):exactDecimal(value(r,op.left),value(r,op.right),op.operator)}}))};
  }else if(op.op==='group'||op.op==='distinct'){
   if(!op.keys.length||op.keys.length>8||new Set(op.keys).size!==op.keys.length)fail('GROUP_INVALID');op.keys.forEach(k=>column(d,k));
   const groups=new Map<string,EvidenceRow[]>();for(const r of d.rows){const k=JSON.stringify(op.keys.map(f=>r.values[f]));const rows=groups.get(k)??[];rows.push(r);groups.set(k,rows);}
   const columns:Record<string,Column>=Object.fromEntries(op.keys.map(k=>[k,d.columns[k]]));
   if(op.op==='group'){if(op.aggregates.length>8)fail('GROUP_INVALID');for(const a of op.aggregates){key(a.as);if(Object.hasOwn(columns,a.as))fail('FIELD_COLLISION');
    if(a.fn==='count')columns[a.as]={kind:'decimal',unit:'count'};
    else if(a.fn==='sum'){const c=column(d,a.field!);if(c.kind!=='decimal'||!c.unit)fail('UNIT_OR_SEMANTICS_UNKNOWN');columns[a.as]=c;}else fail('AGGREGATION_INVALID');}}
   d={...d,columns,rows:[...groups.entries()].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([,rows])=>{
    const values:Record<string,string|null>=Object.fromEntries(op.keys.map(k=>[k,rows[0].values[k]]));
    if(op.op==='group')for(const a of op.aggregates)values[a.as]=a.fn==='count'?String(rows.length):rows.reduce((sum,r)=>exactDecimal(sum,value(r,a.field!),'add'),'0');
    return {values,citations:citations(rows)};
   })};
  }else if(op.op==='join'){
   key(op.right);if(!Object.hasOwn(relations,op.right)||!['left','inner'].includes(op.kind))fail('JOIN_INVALID');const right=relations[op.right];
   const a=column(d,op.leftKey),b=column(right,op.rightKey);if(JSON.stringify(a)!==JSON.stringify(b))fail('JOIN_TYPE_MISMATCH');
   const columns={...d.columns};for(const [f,c] of Object.entries(right.columns)){const name=key('right_'+f);if(Object.hasOwn(columns,name))fail('FIELD_COLLISION');columns[name]=c;}
   const rows:EvidenceRow[]=[];let comparisons=0,unmatched=0;
   for(const left of d.rows){let matches=0;for(const rr of right.rows){if(++comparisons>10000)fail('JOIN_WORK_LIMIT');if(left.values[op.leftKey]===null||left.values[op.leftKey]!==rr.values[op.rightKey])continue;
    matches++;rows.push({values:{...left.values,...Object.fromEntries(Object.entries(rr.values).map(([k,v])=>['right_'+k,v]))},citations:citations([left,rr])});if(rows.length>500)fail('ROW_OR_COLUMN_LIMIT');}
    if(!matches){unmatched++;if(op.kind==='left')rows.push({values:{...left.values,...Object.fromEntries(Object.keys(right.columns).map(k=>['right_'+k,null]))},citations:left.citations});}}
   d={columns,rows,coverage:d.coverage==='complete'&&right.coverage==='complete'?'complete':d.coverage==='partial'||right.coverage==='partial'?'partial':'unknown',timeZone:d.timeZone===right.timeZone?d.timeZone:null,
    selections:[...(d.selections??[]),...(right.selections??[])],limitations:[...d.limitations,...right.limitations,`Join ${op.kind}: ${unmatched} unmatched left records; no absence inferred beyond recorded coverage`]};
  }else fail('OPERATION_UNSUPPORTED');
  validate(d);
 }
 return {version:1 as const,planHash:sha256Hex(plan),sourceHash:sha256Hex(sources),outputHash:sha256Hex(d),dataset:d};
}
export type Deliverable={id:string;description:string;fields:string[];completeCoverage:boolean;knownTimeZone:boolean;monetaryFields?:string[]};
/** Structural readiness only, never a replacement for objective review/critique. */
export function assessDeliverables(d:Dataset,deliverables:Deliverable[]){
 if(deliverables.length>20)fail('DELIVERABLE_LIMIT');
 return deliverables.map(r=>{const gaps:string[]=[];for(const f of r.fields){if(!Object.hasOwn(d.columns,f))gaps.push('FIELD_MISSING:'+f);else if(d.rows.some(row=>row.values[f]===null))gaps.push('VALUE_MISSING:'+f);}
  if(r.completeCoverage&&d.selections?.length)gaps.push('FILTERED_SCOPE_REQUIRES_REVIEW');
  if(r.completeCoverage&&d.coverage!=='complete')gaps.push('COVERAGE_'+d.coverage.toUpperCase());if(r.knownTimeZone&&!d.timeZone)gaps.push('TIME_ZONE_UNKNOWN');
  for(const f of r.monetaryFields??[]){const c=d.columns[f];if(c?.kind!=='decimal'||!c.unit||!c.vat||c.vat==='unknown')gaps.push('MONETARY_SEMANTICS_UNKNOWN:'+f);}
  return {id:r.id,description:r.description,structurallyReady:gaps.length===0,gaps,limitations:d.limitations};
 });
}
