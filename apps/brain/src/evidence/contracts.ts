import {sha256Hex} from '../../../../packages/shared/src/stableJson';
import type {ExtractionContract} from './verifiedSources';
/** Application-reviewed configuration, never model-supplied schemas. */
export type OutputContract={id:string;capabilityId:string;extraction:ExtractionContract;description:string};
export type OutputContracts=readonly OutputContract[];
export function freezeOutputContracts(entries:OutputContracts):OutputContracts{
 const copy=structuredClone(entries);const ids=new Set<string>();
 for(const c of copy){
  if(!/^[a-zA-Z0-9_.-]{1,100}$/.test(c.id)||ids.has(c.id)||!c.capabilityId||!c.extraction.version||!c.description)throw Error('EVIDENCE_CONTRACT_INVALID');
  ids.add(c.id);if(Object.keys(c.extraction.columns).length>40)throw Error('EVIDENCE_CONTRACT_INVALID');
 }
 function freeze(v:any):any{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
 return freeze(copy);
}
export const contractDigest=(c:OutputContract)=>sha256Hex(c);
