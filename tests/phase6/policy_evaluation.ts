import assert from "node:assert/strict";
import { evaluateHealth,DEFAULT_SUPERVISOR_POLICY } from "../../apps/supervisor/src/policies";

async function main(){
  const base={
    capturedAt:new Date().toISOString(),
    queuedReady:0,
    expiredLeases:0,
    staleActiveGoals:0,
    staleVerifications:0,
    oldPendingOutbox:0,
    unresolvedSideEffects:0,
    downProviders:0,
    recentModelCalls:10,
    recentModelFailures:7,
    recentModelFailureRate:0.7
  };

  const incidents=evaluateHealth(base,DEFAULT_SUPERVISOR_POLICY);
  const failure=incidents.find((i)=>i.incidentKey==="runtime:model_failure_rate");
  assert.ok(failure);
  assert.equal(failure?.severity,"ERROR");

  const below=evaluateHealth(
    {...base,recentModelFailures:2,recentModelFailureRate:0.2},
    DEFAULT_SUPERVISOR_POLICY
  );
  assert.ok(!below.some((i)=>i.incidentKey==="runtime:model_failure_rate"));

  const insufficient=evaluateHealth(
    {...base,recentModelCalls:3,recentModelFailures:3,recentModelFailureRate:1},
    DEFAULT_SUPERVISOR_POLICY
  );
  assert.ok(!insufficient.some((i)=>i.incidentKey==="runtime:model_failure_rate"));

  console.log("PHASE6_POLICY_EVALUATION PASS");
}
main();
