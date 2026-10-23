// Deliberately bounded contract language, shared by verifier receipts and tests.
export function validateEvidence(fields:Record<string,unknown>,evidence:Record<string,unknown>){
  for(const [key,type] of Object.entries(fields)){
    if(!Object.hasOwn(evidence,key))throw new Error('VERIFICATION_EVIDENCE_MISSING');
    const value=evidence[key],actual=Array.isArray(value)?'array':typeof value;
    if(!['string','number','boolean','object','array'].includes(String(type))||
      value===null||actual!==type||(type==='number'&&!Number.isFinite(value)))throw new Error('VERIFICATION_EVIDENCE_TYPE');
  }
  if(evidence.contentMatch===false||evidence.readback===false)throw new Error('VERIFICATION_EVIDENCE_CONTRADICTION');
}
