import {pool} from '../../../packages/db/src/client';
import {assertRuntimeTenantBinding} from '../../../packages/db/src/runtimeAccess';
import {validateLimits} from '../../agents/src/intelligence/contracts';
import {validateOrdinaryLimits} from './ordinaryGoalAllowance';
import {reviewedOutputContractsFor} from './reviewedOutputContracts';
import {NORMALIZED_CONNECTOR_CONTRACTS} from './normalizedConnectorContracts';
import {ordinaryGoalBundle,type OrdinaryAgentSetup} from './ordinaryGoalComposition';
import type {ProductionBundle} from './types';
/** Nonsecret reviewed configuration, never inferred from a goal's business words.
 * Existing connectors/providers retain their existing identities and transports. */
export async function withOrdinaryGeneralAgentFromEnv(bundle:ProductionBundle){
 if(process.env.SAM_ORDINARY_GENERAL_AGENT!=='1')return bundle;
 let setup:OrdinaryAgentSetup;try{setup=JSON.parse(process.env.SAM_ORDINARY_AGENT_CONFIG??'');}catch{throw Error('ORDINARY_AGENT_CONFIG_REQUIRED');}
 if(!setup||Object.keys(setup).some(k=>!['limits','specialists'].includes(k))||!Array.isArray(setup.specialists)||!setup.specialists.length||setup.specialists.length>4)throw Error('ORDINARY_AGENT_CONFIG_INVALID');
 validateOrdinaryLimits(setup.limits);for(const s of setup.specialists)validateLimits(s.limits);
 const tenant=await assertRuntimeTenantBinding(pool);
 const allowed=new Set(bundle.capabilities.filter(c=>{const t=bundle.toolDefinitions.find(t=>t.capabilityId===c.capabilityId);return c.authorityClass==='GREEN'&&(!c.companyScopes||c.companyScopes.includes(tenant.entity))&&t?.authorityClass==='GREEN'&&t.sideEffect===false&&(!t.companyScopes||t.companyScopes.includes(tenant.entity));}).map(c=>c.capabilityId));
 const readOnly={...bundle,capabilities:bundle.capabilities.filter(c=>allowed.has(c.capabilityId)).map(c=>({...c,companyScopes:[tenant.entity]})),
  toolDefinitions:bundle.toolDefinitions.filter(t=>allowed.has(t.capabilityId)).map(t=>({...t,companyScopes:[tenant.entity]})),toolAdapters:bundle.toolAdapters.filter(t=>allowed.has(t.capabilityId)),verificationAdapters:bundle.verificationAdapters?.filter(t=>allowed.has(t.capabilityId))};
 // Do not rebind opaque Google MCP names to native Drive/Gmail contracts.
 const ids=readOnly.capabilities.map(c=>c.capabilityId);
 const contracts=[...reviewedOutputContractsFor(ids),...NORMALIZED_CONNECTOR_CONTRACTS.filter(c=>ids.includes(c.capabilityId))];
 return ordinaryGoalBundle(readOnly,contracts,setup,tenant.entity);
}
