import { XMLParser } from "fast-xml-parser";

export function escapeXml(value:unknown):string{
  return String(value??"")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&apos;");
}

const parser=new XMLParser({
  ignoreAttributes:false,
  removeNSPrefix:true,
  parseTagValue:false,
  trimValues:true
});

export function parseSoap(xml:string):any{
  return parser.parse(xml);
}

export function findFirst(node:any,key:string):any{
  if(node===null||node===undefined) return undefined;
  if(typeof node!=="object") return undefined;
  if(Object.prototype.hasOwnProperty.call(node,key)) return node[key];
  for(const value of Object.values(node)){
    if(Array.isArray(value)){
      for(const item of value){
        const found=findFirst(item,key);
        if(found!==undefined) return found;
      }
    }else{
      const found=findFirst(value,key);
      if(found!==undefined) return found;
    }
  }
  return undefined;
}

export function normalizeList(value:any):any[]{
  if(value===undefined||value===null||value==="") return [];
  return Array.isArray(value)?value:[value];
}
