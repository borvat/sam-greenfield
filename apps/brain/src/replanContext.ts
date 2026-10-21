import {withTransaction} from '../../../packages/db/src/client';
import {localDevelopment} from '../../development/src/planningPolicy';
import {pilotEnabled} from '../../production/src/syntheticPilotScope';
// Synthetic/development projections keep their existing stricter data boundary.
export async function loadReplanContext(goalId:string){
 if(localDevelopment()||pilotEnabled())return {};
 return withTransaction(async client=>{
  const plan=(await client.query('SELECT version,steps,goal_assumptions,constraints FROM plans WHERE goal_id=$1 ORDER BY version DESC LIMIT 1',[goalId])).rows[0];
  const evidence=(await client.query(`SELECT e.capability_id,e.params,e.result,v.result AS verification_result,v.independent_evidence
   FROM executions e LEFT JOIN verifications v ON v.execution_id=e.id WHERE e.goal_id=$1
   ORDER BY e.finished_at DESC LIMIT 16`,[goalId])).rows;
  const context={previousPlan:plan??null,executionEvidence:evidence};
  if(Buffer.byteLength(JSON.stringify(context))>65536)throw new Error('REPLAN_CONTEXT_TOO_LARGE');
  return context;
 });
}
