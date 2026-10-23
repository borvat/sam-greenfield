/** Lossless JSON Schema presentation: repeated subtrees become local $defs.
 * Runtime validation still uses the original schema. Existing references are
 * left untouched because moving them could change their resolution scope. */
export function compactSchema<T>(schema:T):T{
 const encoded=JSON.stringify(schema);
 if(!encoded||/"\$(?:ref|id|defs|anchor)"/.test(encoded))return schema;
 const counts=new Map<string,number>();
 function collect(value:any){
  if(!value||typeof value!=='object')return;
  if(!Array.isArray(value)){const key=JSON.stringify(value);if(key.length>=80)counts.set(key,(counts.get(key)??0)+1);}
  for(const child of Object.values(value))collect(child);
 }
 collect(schema);
 const selected=[...counts].filter(([key,n])=>n>=3&&(key.length-30)*(n-1)>100).sort(([a],[b])=>a.length-b.length||a.localeCompare(b)).slice(0,8);
 if(!selected.length)return schema;
 const ids=new Map(selected.map(([key],i)=>[key,'s'+i]));
 function replace(value:any,definition=false):any{
  if(!value||typeof value!=='object')return value;
  if(Array.isArray(value))return value.map(v=>replace(v));
  const id=ids.get(JSON.stringify(value));if(id&&!definition)return {$ref:'#/$defs/'+id};
  return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,replace(v)]));
 }
 const result={...replace(schema),$defs:Object.fromEntries(selected.map(([key])=>[ids.get(key)!,replace(JSON.parse(key),true)]))};
 return JSON.stringify(result).length<encoded.length?result as T:schema;
}
