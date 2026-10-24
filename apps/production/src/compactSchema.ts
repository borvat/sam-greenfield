/** Lossless presentation of schema nodes only. Literal/annotation objects and
 * property-name maps are data, never schemas to replace with a $ref. */
export function compactSchema<T>(schema:T):T{
 const encoded=JSON.stringify(schema);
 if(!encoded||/"\$(?:ref|id|defs|anchor|dynamicRef|dynamicAnchor|recursiveRef|recursiveAnchor)"/.test(encoded))return schema;
 const singles=new Set(['not','if','then','else','contains','additionalProperties','unevaluatedProperties','propertyNames','additionalItems','unevaluatedItems','contentSchema']);
 const lists=new Set(['allOf','anyOf','oneOf','prefixItems']);
 const maps=new Set(['properties','patternProperties','dependentSchemas','definitions']);
 const object=(v:any):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 function children(node:any,visit:(v:any)=>any){
  return Object.fromEntries(Object.entries(node).map(([key,value])=>{
   if(singles.has(key))return [key,visit(value)];
   if(key==='items')return [key,Array.isArray(value)?value.map(visit):visit(value)];
   if(lists.has(key)&&Array.isArray(value))return [key,value.map(visit)];
   if((maps.has(key)||key==='dependencies')&&object(value))return [key,Object.fromEntries(Object.entries(value).map(([name,v])=>[name,object(v)||typeof v==='boolean'?visit(v):v]))];
   return [key,value];
  }));
 }
 const counts=new Map<string,number>();
 function collect(node:any):any{
  if(!object(node))return node;
  const key=JSON.stringify(node);if(key.length>=80)counts.set(key,(counts.get(key)??0)+1);
  children(node,collect);return node;
 }
 collect(schema);
 const selected=[...counts].filter(([key,n])=>n>=3&&(key.length-30)*(n-1)>100).sort(([a],[b])=>a.length-b.length||a.localeCompare(b)).slice(0,8);
 if(!selected.length)return schema;
 const ids=new Map(selected.map(([key],i)=>[key,'s'+i]));
 function replace(node:any,definition=false):any{
  if(!object(node))return node;
  const id=ids.get(JSON.stringify(node));if(id&&!definition)return {$ref:'#/$defs/'+id};
  return children(node,v=>replace(v));
 }
 const result={...replace(schema),$defs:Object.fromEntries(selected.map(([key])=>[ids.get(key)!,replace(JSON.parse(key),true)]))};
 return JSON.stringify(result).length<encoded.length?result as T:schema;
}
