import {sha256Hex} from '../../../packages/shared/src/stableJson';
export function compareReadback(original:unknown,fresh:unknown,verifier:string,extra:Record<string,unknown>={}){
  const observable=original!==undefined;
  const contentMatch=observable&&sha256Hex(original)===sha256Hex(fresh);
  return {result:!observable?'INCONCLUSIVE' as const:contentMatch?'VERIFIED' as const:'FAILED' as const,
    evidence:{...extra,readback:true,contentMatch,reason:!observable?'ORIGINAL_RESULT_MISSING':contentMatch?'CONTENT_MATCH':'CONTENT_MISMATCH',
      ...(observable?{originalHash:sha256Hex(original)}:{}),readbackHash:sha256Hex(fresh)},verifier};
}
