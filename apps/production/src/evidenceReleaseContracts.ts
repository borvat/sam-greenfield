import type {ValidatedProductionBundle} from './bundle';
import {DERIVE_CAPABILITY} from '../../brain/src/evidence/artifacts';
import {DERIVED_VERIFICATION_CONTRACT} from './verifiedEvidenceBundle';
import {DERIVE_PARAMETERS} from '../../brain/src/evidence/planSchema';
import {sha256Hex} from '../../../packages/shared/src/stableJson';
/** Startup validation only: no registration, grants, configuration or transport.
 * Production syncVerificationContracts checks the operator-provisioned row.
 */
export function evidenceReleaseContracts(bundle:ValidatedProductionBundle){
 const present=bundle.raw.capabilities.some(c=>c.capabilityId===DERIVE_CAPABILITY);
 const contracts=bundle.raw.verifiedEvidenceContracts;
 if(!present){if(contracts)throw Error('EVIDENCE_RELEASE_CONFIGURATION_INVALID');return [];}
 const tool=bundle.tools.definition(DERIVE_CAPABILITY);
 if(!contracts?.length||!bundle.verifiers.has(DERIVE_CAPABILITY)||tool.authorityClass!=='GREEN'||tool.sideEffect||
  sha256Hex(tool.inputSchema)!==sha256Hex(DERIVE_PARAMETERS))throw Error('EVIDENCE_RELEASE_CONFIGURATION_INVALID');
 for(const contract of contracts){
  const source=bundle.tools.definition(contract.capabilityId);
  if(source.authorityClass!=='GREEN'||source.sideEffect)throw Error('EVIDENCE_RELEASE_CONFIGURATION_INVALID');
 }
 return [DERIVED_VERIFICATION_CONTRACT];
}
