import type { ActiveIncident,IncidentCandidate } from "./types";

export async function loadActiveIncidents(
  client:any,
  actor="operational-supervisor"
):Promise<ActiveIncident[]>{
  const res=await client.query(
    `WITH latest AS (
       SELECT DISTINCT ON (after_ref->>'incident_key')
              action,after_ref,timestamp
         FROM audit_log
        WHERE actor=$1
          AND action IN ('INCIDENT_OPENED','INCIDENT_RESOLVED')
          AND after_ref ? 'incident_key'
        ORDER BY after_ref->>'incident_key',timestamp DESC,id DESC
     )
     SELECT after_ref,timestamp
       FROM latest
      WHERE action='INCIDENT_OPENED'
      ORDER BY timestamp,after_ref->>'incident_key'`,
    [actor]
  );

  return res.rows.map((row:any)=>({
    incidentKey:row.after_ref.incident_key,
    severity:row.after_ref.severity,
    code:row.after_ref.code,
    title:row.after_ref.title,
    detail:row.after_ref.detail ?? {},
    openedAt:row.timestamp
  }));
}

export async function reconcileIncidents(
  client:any,
  candidates:IncidentCandidate[],
  actor="operational-supervisor"
):Promise<{opened:string[];resolved:string[];active:string[]}>{
  const active=await loadActiveIncidents(client,actor);
  const activeByKey=new Map(active.map((i)=>[i.incidentKey,i]));
  const candidatesByKey=new Map(candidates.map((i)=>[i.incidentKey,i]));

  const opened:string[]=[];
  const resolved:string[]=[];

  for(const candidate of candidates){
    if(activeByKey.has(candidate.incidentKey)) continue;

    await client.query(
      `INSERT INTO audit_log(actor,action,entity_type,source,result,after_ref)
       VALUES($1,'INCIDENT_OPENED','runtime','supervisor','OPEN',$2::jsonb)`,
      [
        actor,
        JSON.stringify({
          incident_key:candidate.incidentKey,
          severity:candidate.severity,
          code:candidate.code,
          title:candidate.title,
          detail:candidate.detail
        })
      ]
    );
    opened.push(candidate.incidentKey);
  }

  for(const incident of active){
    if(candidatesByKey.has(incident.incidentKey)) continue;

    await client.query(
      `INSERT INTO audit_log(actor,action,entity_type,source,result,after_ref)
       VALUES($1,'INCIDENT_RESOLVED','runtime','supervisor','RESOLVED',$2::jsonb)`,
      [
        actor,
        JSON.stringify({
          incident_key:incident.incidentKey,
          severity:incident.severity,
          code:incident.code,
          title:incident.title,
          detail:incident.detail
        })
      ]
    );
    resolved.push(incident.incidentKey);
  }

  const finalActive=[
    ...active.filter((i)=>!resolved.includes(i.incidentKey)).map((i)=>i.incidentKey),
    ...opened
  ].sort();

  return {opened,resolved,active:[...new Set(finalActive)]};
}
