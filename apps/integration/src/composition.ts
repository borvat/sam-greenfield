import {createProductionComposition} from '../../production/src/composition';
import {reviewNextReadGoal} from '../../production/src/readGoalReview';
import {safePerceptionTick} from '../../perception/src/monitor';
import {runOwnerNotificationTick} from '../../notifications/src/center';
import {authorizeClaimedAction} from '../../perception/src/policy';
import {withTransaction} from '../../../packages/db/src/client';
import type {ValidatedProductionBundle} from '../../production/src/bundle';
import {assertRuntimeTenantBinding} from '../../../packages/db/src/runtimeAccess';
import {assertIntegrationAccess} from '../../../packages/db/src/integrationProfile';

// Explicit factory only: no production/default-bundle/HTTP registration.
export async function createIntegrationComposition(input:{bundle:ValidatedProductionBundle;workerId:string}){
 if(process.env.SAM_INTEGRATION_ENABLED!=='1')throw Error('INTEGRATION_DISABLED');
 const tenant=await withTransaction(c=>assertIntegrationAccess(c));
 for(const d of input.bundle.catalog.planningDescriptors()){
  const t=input.bundle.tools.definition(d.capabilityId);
  if(t.sideEffect||t.authorityClass!=='GREEN'||d.sideEffect!==false)throw Error('INTEGRATION_READ_ONLY_PROFILE_REQUIRED');
  if(t.companyScopes?.length!==1||d.companyScopes?.length!==1||t.companyScopes[0]!==tenant.entity||d.companyScopes[0]!==tenant.entity)throw Error('INTEGRATION_PROVIDER_BINDING_REQUIRED');
 }
 const base=createProductionComposition({...input,authorizeWork:async work=>{
  await authorizeClaimedAction(work,input.bundle.tools.definition(work.capabilityId));
 },operationalTick:async()=>{
  const review=await reviewNextReadGoal(input.bundle);
  const perception=await safePerceptionTick(input.bundle);
  const notifications=await runOwnerNotificationTick();
  if('errorCode' in perception||'errorCode' in notifications)console.error(JSON.stringify({event:'INTEGRATION_FEATURE_FAILED',perception:'errorCode' in perception?perception.errorCode:null,notifications:'errorCode' in notifications?notifications.errorCode:null}));
  return {review,perception,notifications};
 }});
 return base;
}
