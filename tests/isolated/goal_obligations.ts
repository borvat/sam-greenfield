import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sha256Hex} from '../../packages/shared/src/stableJson';
import {carryGoalObligations,validateGoalObligations,assertObligationReview,type GoalObligations} from '../../apps/kernel/src/goalObligations';
const objective='Compare the supplied records; explicitly state missing units and periods.';
const contract:GoalObligations={version:1,objectiveHash:sha256Hex(objective),deliverables:[{id:'comparison',description:'Compare the supplied records',fields:['value'],scope:{kind:'subset',description:'Only supplied records'},units:'UNKNOWN',vat:'UNKNOWN',period:'UNKNOWN',timeZone:'UNKNOWN'}],unresolved:['Unit and period are not established']};
test('obligations bind the original objective and survive omitted continuation assumptions',()=>{
 assert.deepEqual(carryGoalObligations(objective,contract,undefined),contract);
 assert.notEqual(carryGoalObligations(objective,contract,undefined),contract);
 assert.throws(()=>validateGoalObligations(contract,'Different objective'),/INVALID/);
 for(const update of [{...contract,unresolved:[]},{...contract,deliverables:[{...contract.deliverables[0],scope:{kind:'unknown'}}]}])assert.throws(()=>carryGoalObligations(objective,contract,update),/IMMUTABLE/);
 assert.throws(()=>validateGoalObligations({...contract,deliverables:[contract.deliverables[0],contract.deliverables[0]]},objective),/INVALID/);
});
test('review must account for each bound deliverable exactly once',()=>{
 assertObligationReview(contract,{requirements:[{obligationId:'comparison'}]});
 for(const requirements of [[],[{}],[{obligationId:'other'}],[{obligationId:'comparison'},{obligationId:'comparison'}]])assert.throws(()=>assertObligationReview(contract,{requirements}),/MISSING/);
});
