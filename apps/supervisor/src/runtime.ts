import { withTransaction } from "../../../packages/db/src/client";
import { captureHealthSnapshot } from "./health";
import { evaluateHealth,DEFAULT_SUPERVISOR_POLICY,type SupervisorPolicy } from "./policies";
import { reconcileIncidents,loadActiveIncidents } from "./incidents";

export async function runOperationalSupervisorTick(input:{
  policy?:SupervisorPolicy;
  staleGoalMinutes?:number;
  staleVerificationMinutes?:number;
  oldOutboxMinutes?:number;
  modelLookbackMinutes?:number;
  actor?:string;
  monitorSideEffects?:boolean;
}={}){
  return withTransaction(async(client)=>{
    const snapshot=await captureHealthSnapshot(client,{
      staleGoalMinutes:input.staleGoalMinutes,
      staleVerificationMinutes:input.staleVerificationMinutes,
      oldOutboxMinutes:input.oldOutboxMinutes,
      modelLookbackMinutes:input.modelLookbackMinutes,
      monitorSideEffects:input.monitorSideEffects
    });

    const candidates=evaluateHealth(snapshot,input.policy ?? DEFAULT_SUPERVISOR_POLICY);
    const actor=input.actor ?? "operational-supervisor";
    const incidentDelta=await reconcileIncidents(client,candidates,actor);
    const activeIncidents=await loadActiveIncidents(client,actor);

    return {
      snapshot,
      candidates,
      incidentDelta,
      ownerBrief:{
        coverage:snapshot.excludedMetrics?.length?"PARTIAL":"FULL",
        generatedAt:new Date().toISOString(),
        overallStatus:activeIncidents.some((i)=>i.severity==="CRITICAL")
          ? "CRITICAL"
          : activeIncidents.some((i)=>i.severity==="ERROR")
            ? "ERROR"
            : activeIncidents.some((i)=>i.severity==="WARN")
              ? "WARN"
              : "HEALTHY",
        activeIncidents:activeIncidents.map((i)=>({
          incidentKey:i.incidentKey,
          severity:i.severity,
          code:i.code,
          title:i.title,
          detail:i.detail
        })),
        metrics:snapshot
      }
    };
  });
}
