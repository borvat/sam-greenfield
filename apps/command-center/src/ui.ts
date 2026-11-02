import {buildRevision} from '../../../packages/shared/src/buildRevision';
export const commandCenterHtml=`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>SAM Executive Command Center</title>
<style>
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#111827;background:#f3f4f6}
*{box-sizing:border-box}body{margin:0}.shell{max-width:1400px;margin:auto;padding:28px}.top{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:24px}.brand h1{margin:0;font-size:26px}.brand p{margin:5px 0;color:#4b5563}.badge{padding:8px 12px;border-radius:999px;background:#111827;color:white;font-size:12px}
.grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}.card{background:white;border:1px solid #e5e7eb;border-radius:14px;padding:16px;box-shadow:0 1px 2px rgba(0,0,0,.04)}.metric .n{font-size:28px;font-weight:700}.metric .l{font-size:12px;color:#6b7280;margin-top:4px}
.main{display:grid;grid-template-columns:1.45fr .85fr;gap:16px;margin-top:16px}.section-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.section-title h2{font-size:16px;margin:0}.goal{padding:12px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:9px;cursor:pointer}.goal:hover{border-color:#9ca3af}.row{display:flex;justify-content:space-between;gap:10px}.muted{color:#6b7280;font-size:12px}.state{font-size:11px;padding:4px 8px;border-radius:999px;background:#f3f4f6}.btn{border:0;background:#111827;color:white;border-radius:9px;padding:9px 12px;cursor:pointer}.btn.secondary{background:#e5e7eb;color:#111827}.form input,.form textarea,.form select{width:100%;padding:10px;border:1px solid #d1d5db;border-radius:9px;margin:6px 0 10px;background:white}.form textarea{min-height:105px;resize:vertical}.detail pre{white-space:pre-wrap;overflow:auto;background:#111827;color:#e5e7eb;padding:12px;border-radius:10px;font-size:11px;max-height:420px}.finance{line-height:1.55}.err{color:#b91c1c;font-size:12px}.goal.selected{border-color:#111827;background:#f9fafb;box-shadow:inset 0 0 0 1px #111827}.pill{display:inline-block;font-size:11px;padding:3px 8px;border-radius:999px;background:#eef2f7;color:#111827}.summary{padding:10px 0;border-top:1px solid #eef2f7}.summary p{margin:5px 0;line-height:1.5}.loading{color:#4b5563;font-size:13px}.detail details{margin-top:10px}.detail summary{cursor:pointer;font-size:12px;color:#4b5563}
@media(max-width:900px){.grid{grid-template-columns:repeat(2,1fr)}.main{grid-template-columns:1fr}.shell{padding:16px}}
</style>
</head>
<body><small>Build ${buildRevision().revision??"UNKNOWN"}</small>
<div class="shell">
  <div class="top"><div class="brand"><h1>SAM Executive Command Center</h1><p>Owner view of goals, execution, verification and finance.</p></div><div class="badge" id="status">Connecting…</div></div>
  <div class="card form" id="authPanel" style="margin-bottom:16px">
    <label for="bearerToken">Command Center bearer token</label>
    <input id="bearerToken" type="password" autocomplete="off" placeholder="Enter the existing token for this Command Center service"/>
    <button class="btn" onclick="connect()">Connect</button>
    <p class="muted">Use the existing bearer token configured for this Command Center service. The token is kept only in this browser session; never put it in a URL or chat.</p>
    <div id="authError" class="err"></div>
  </div>
  <div class="grid" id="metrics"></div>
  <div class="main">
    <div class="card">
      <div class="section-title"><h2>Active Goals</h2><button class="btn secondary" onclick="refresh()">Refresh</button></div>
      <div id="goals"></div>
    </div>
    <div>
      <div class="card form">
        <div class="section-title"><h2>Create Executive Goal</h2></div>
        <textarea id="objective" placeholder="Example: Review current bol sales and accounting differences and produce a verified owner brief."></textarea>
        <input id="domain" value="owner_command" placeholder="domain"/>
        <label for="authority">Authority ceiling</label><select id="authority"><option>YELLOW</option><option>GREEN</option></select>
        <label for="priority">Priority (0-100)</label><input id="priority" type="number" min="0" max="100" value="70"/>
        <label for="acceptance">Optional owner acceptance contract (JSON; required by release profile)</label>
        <textarea id="acceptance" placeholder='{"version":1,"constraints":[{"capabilityId":"local.calculate","params":{"operation":"max"},"result":{"field":"value","equals":8}}]}'></textarea>
        <button class="btn" onclick="createGoal()">Create Goal</button>
        <div id="formError" class="err"></div>
      </div>
      <div class="card finance" style="margin-top:16px"><div class="section-title"><h2>Latest Finance Brief</h2></div><div id="finance">No brief yet.</div></div>
    </div>
  </div>
  <div class="main">
    <section class="card form detail" aria-labelledby="owner-memory-title">
      <h2 id="owner-memory-title">Approved owner memory</h2>
      <label for="memory-query">Task to recall relevant decisions</label><input id="memory-query" placeholder="Prepare procurement quotations"/>
      <button class="btn secondary" onclick="recallOwnerMemory()">Recall approved decisions</button><pre id="owner-memory-results">Enter a task to recall its approved decisions.</pre>
      <div data-owner-mutation><label for="memory-statement">Owner decision</label><textarea id="memory-statement"></textarea>
      <label for="memory-context">Task keyword (e.g. procurement)</label><input id="memory-context" placeholder="procurement"/>
      <label for="memory-source">Source reference</label><input id="memory-source" value="command-center-owner-entry"/>
      <label for="memory-date">Source date and time (UTC)</label><input id="memory-date" type="text" placeholder="2026-10-28T10:00:00.000Z"/>
      <label><input id="memory-approved" type="checkbox" style="width:auto"/> I explicitly approve this decision for the current company.</label>
      <p class="muted">Recalled only when the task contains the context keyword. Observations remain unapproved. Saved decisions never expand execution authority.</p>
      <button class="btn" onclick="saveOwnerMemory()">Save approved owner decision</button><div id="memory-error" class="err" role="status"></div></div>
    </section>
    <section class="card detail" aria-labelledby="notifications-title">
      <h2 id="notifications-title">Internal notifications</h2>
      <p class="muted">Polling only. Stored internally and never a claim of ChatGPT push or external delivery. Enablement starts now and does not replay historical events.</p>
      <button data-owner-mutation class="btn secondary" onclick="pollInternalNotifications()">Enable and poll internal notifications</button>
      <div id="notifications-results">Connect to inspect internal notifications.</div><div id="notifications-error" class="err" role="status"></div>
    </section>
  </div>
  <div class="card detail" id="timeline-section" style="margin-top:16px"><div class="section-title"><h2>Golden Chain Timeline</h2><span class="muted" id="timeline-status">Select a goal</span></div><div id="report-result"></div><details id="raw-timeline" hidden><summary>Raw JSON</summary><pre id="timeline">Select a goal.</pre></details></div>
</div>
<script>
let authGeneration=0,refreshGeneration=null,wakeRetry=0;
let token=sessionStorage.getItem("sam_cc_token")||"";
async function connect(){
  const value=document.getElementById("bearerToken").value.trim();
  if(!value){document.getElementById("authError").textContent="Enter a bearer token.";return}
  authGeneration++;wakeRetry=0;token=value;sessionStorage.setItem("sam_cc_token",token);
  document.getElementById("bearerToken").value="";
  document.getElementById("authError").textContent="";
  await refresh();
}
async function api(path,options={}){
  const generation=authGeneration,credential=token;
  const current=()=>{if(generation!==authGeneration)throw Error("Outdated authentication response ignored.")};
  const headers={...(options.headers||{}),Authorization:"Bearer "+token};
  if(options.body) headers["Content-Type"]="application/json";
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  try{
  let r;
  try{r=await fetch(path,{...options,headers,signal:controller.signal})}
  catch{current();const error=Error(controller.signal.aborted?"Service request timed out. Try again.":"Service unavailable. Try again.");error.transport=true;throw error}
  current();
  if(r.status===401){
    let body;try{body=await r.json()}catch{}
    current();
    sessionStorage.removeItem("sam_cc_token");token="";document.getElementById("authPanel").hidden=false;
    let message="Authentication was rejected. Check this Command Center service's existing authentication configuration.";
    if(body&&body.error==="unauthorized"){
      if(body.reason==="missing_authorization")message="Authentication rejected: the service received no Authorization header.";
      if(body.reason==="invalid_bearer_scheme")message="Authentication rejected: the service did not receive the required Bearer scheme.";
      if(body.reason==="bearer_rejected")message="Authentication rejected: the service rejected the Bearer credential. Confirm the existing token configured for this Command Center service.";
    }
    if(typeof body?.request_id==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(body.request_id))message+=" Request ID: "+body.request_id;
    throw new Error(message);
  }
  let body;
  try{body=await r.json()}
  catch{current();throw Error(controller.signal.aborted?"Service request timed out. Try again.":"Service returned an unavailable or invalid response. Try again.")}
  current();
  if(token!==credential)throw Error("Outdated authentication response ignored.");
  if(!r.ok) throw new Error(body.error||"Request failed");
  return body;
  }finally{clearTimeout(timeout)}
}
function metric(label,value){return '<div class="card metric"><div class="n">'+Number(value||0)+'</div><div class="l">'+label+'</div></div>'}
async function refresh(){const generation=authGeneration;
  if(!token){document.getElementById("status").textContent="AUTH REQUIRED";document.getElementById("authPanel").hidden=false;return}
  if(refreshGeneration===generation)return;
  refreshGeneration=generation;
  try{
    const results=await Promise.allSettled([api("/api/overview"),api("/api/goals"),api("/api/finance/latest")]);
    const failed=results.find(result=>result.status==='rejected');
    if(failed)throw failed.reason;
    const [overview,goals,finance]=results.map(result=>result.value);
    if(generation!==authGeneration||!token)return;
    document.getElementById("authPanel").hidden=true;
    document.getElementById("status").textContent=document.body.dataset.developmentSafe?"DEVELOPMENT · CONNECTED":"LIVE";wakeRetry=0;
    const o=overview.data;
    document.getElementById("metrics").innerHTML=[
      metric("Active goals",o.active_goals),metric("Active work",o.active_work),metric("Waiting owner",o.waiting_owner),
      metric("Pending approvals",o.pending_approvals),metric("Unresolved side effects",o.unresolved_side_effects),metric("Failed goals",o.failed_goals)
    ].join("");
    document.getElementById("goals").innerHTML=goals.data.map(g=>'<div class="goal" data-goal-id="'+escapeHtml(g.id)+'"><div class="row"><strong>'+escapeHtml(g.business_id+" · "+g.domain)+'</strong><span class="state">'+escapeHtml(g.state)+'</span></div><div style="margin-top:6px">'+escapeHtml(g.objective)+'</div><div class="muted">Priority '+g.priority+' · '+escapeHtml(g.authority_ceiling||"")+'</div></div>').join("")||'<div class="muted">No goals.</div>';
    document.querySelectorAll("#goals [data-goal-id]").forEach(el=>{el.onclick=()=>timeline(el.dataset.goalId)});markSelected();
    document.getElementById("finance").textContent=finance.data?JSON.stringify(finance.data.after_ref,null,2):"No brief yet.";
    await refreshInternalNotifications();
  }catch(e){if(generation!==authGeneration)return;
    // Free instances take up to a minute to wake. One bounded retry covers the wake
    // window; a rejected credential, an invalid body or a second failure is never retried.
    if(e&&e.transport===true&&wakeRetry<2){wakeRetry++;
      document.getElementById("status").textContent="SERVICE WAKING";
      setTimeout(()=>{if(generation===authGeneration)refresh()},wakeRetry===1?8000:20000);return}
    document.getElementById("status").textContent=token?"ERROR":"AUTH REQUIRED";document.getElementById("formError").textContent=e.message;document.getElementById("authError").textContent=e.message}
  finally{if(refreshGeneration===generation)refreshGeneration=null}
}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
let selectedGoalId=null;
function pill(value){const span=document.createElement("span");span.className="pill";span.textContent=String(value);return span}
function detailLine(label,value){const p=document.createElement("p");const strong=document.createElement("strong");strong.textContent=label+": ";p.appendChild(strong);p.appendChild(document.createTextNode(String(value)));return p}
function markSelected(){document.querySelectorAll("#goals [data-goal-id]").forEach(function(el){if(selectedGoalId&&el.dataset&&el.dataset.goalId===selectedGoalId){el.classList.add("selected")}else{el.classList.remove("selected")}})}
function renderTimeline(target,data){
  const goal=data.goal||{};
  const head=document.createElement("div");head.className="report-head";
  if(goal.business_id)head.appendChild(pill(goal.business_id));
  if(goal.state)head.appendChild(pill(goal.state));
  if(goal.domain)head.appendChild(pill(goal.domain));
  if(goal.authority_ceiling)head.appendChild(pill("authority "+goal.authority_ceiling));
  target.appendChild(head);
  if(goal.objective){const p=document.createElement("p");p.textContent=goal.objective;target.appendChild(p)}
  const counts=document.createElement("p");counts.className="muted";
  counts.textContent="plans "+((data.plans||[]).length)+" · executions "+((data.executions||[]).length)+" · verifications "+((data.verifications||[]).length)+" · reports "+((data.reports||[]).length);
  target.appendChild(counts);
  const reports=data.reports||[];
  if(!reports.length){const p=document.createElement("p");p.className="muted";p.textContent=data.reportsAvailability==="MISSING_INTEGRATION_TABLE"?"No saved report table in this environment.":"No saved report for this goal yet.";target.appendChild(p)}
  reports.forEach(function(r,index){
    const card=document.createElement("div");card.className="summary";
    const title=document.createElement("p");const strong=document.createElement("strong");
    strong.textContent="Saved report "+(index+1);title.appendChild(strong);card.appendChild(title);
    if(r.decision&&r.decision.summary){const p=document.createElement("p");p.textContent=r.decision.summary;card.appendChild(p)}
    card.appendChild(detailLine("Report ID",r.id));
    card.appendChild(detailLine("Hash",r.report_hash));
    const cov=r.decision&&r.decision.report&&r.decision.report.analysisCoverage;
    if(cov)card.appendChild(detailLine("Coverage",typeof cov==="object"?((cov.covered!==undefined?cov.covered:"?")+"/"+(cov.total!==undefined?cov.total:"?")):cov));
    const limits=(r.decision&&r.decision.limitations)||(r.decision&&r.decision.report&&r.decision.report.limitations);
    if(Array.isArray(limits)&&limits.length){const p=document.createElement("p");p.textContent="Limitations: "+limits.join(" · ");card.appendChild(p)}
    const policy=(r.decision&&r.decision.report&&r.decision.report.semanticPolicy)||"HISTORICAL_NARRATIVE_NOT_SEMANTICALLY_VALIDATED";
    card.appendChild(detailLine("Semantic validation",policy));
    card.appendChild(detailLine("Retrieval","SAVED RESULT ONLY · no new execution"));
    target.appendChild(card);
  });
  const diagnostics=(data.audit||[]).filter(function(a){return a.action==="READ_REVIEW_DIAGNOSTIC"});
  if(diagnostics.length){
    const box=document.createElement("details");const summary=document.createElement("summary");
    summary.textContent="Wait diagnostics ("+diagnostics.length+")";box.appendChild(summary);
    const pre=document.createElement("pre");pre.textContent=JSON.stringify(diagnostics.map(function(a){return a.after_ref}),null,2);box.appendChild(pre);
    target.appendChild(box);
  }
}
async function timeline(id){
  const generation=authGeneration;
  const result=document.getElementById("report-result"),raw=document.getElementById("raw-timeline"),status=document.getElementById("timeline-status"),section=document.getElementById("timeline-section");
  selectedGoalId=id;markSelected();
  if(section&&section.setAttribute)section.setAttribute("aria-busy","true");
  if(status)status.textContent="Loading…";
  result.textContent="";
  const loading=document.createElement("p");loading.className="loading";loading.textContent="Loading timeline and saved reports…";result.appendChild(loading);
  if(section&&typeof section.scrollIntoView==="function")section.scrollIntoView({behavior:"smooth",block:"start"});
  try{
    const x=await api("/api/goals/"+encodeURIComponent(id)+"/timeline");
    if(generation!==authGeneration)return;
    document.getElementById("timeline").textContent=JSON.stringify(x.data,null,2);
    if(raw)raw.hidden=false;
    result.textContent="";
    renderTimeline(result,x.data);
    if(status)status.textContent="Saved results only · no new execution";
    if(section&&typeof section.scrollIntoView==="function")section.scrollIntoView({block:"start"});
  }catch(e){
    if(generation!==authGeneration)return;
    result.textContent="";
    const p=document.createElement("p");p.className="err";p.textContent=e.message;result.appendChild(p);
    if(status)status.textContent="Failed";
  }finally{
    if(section&&section.removeAttribute)section.removeAttribute("aria-busy");
  }
}
async function createGoal(){const generation=authGeneration;
  const error=document.getElementById("formError");error.textContent="";
  try{
    const body={objective:document.getElementById("objective").value,domain:document.getElementById("domain").value,authority_ceiling:document.getElementById("authority").value,priority:Number(document.getElementById("priority").value)};
    const acceptance=document.getElementById("acceptance").value.trim();
    if(acceptance)body.acceptance_contract=JSON.parse(acceptance);
    const x=await api("/api/goals",{method:"POST",body:JSON.stringify(body)});if(generation!==authGeneration)return;
    document.getElementById("objective").value="";
    await refresh();if(generation!==authGeneration)return;await timeline(x.data.id);
  }catch(e){if(generation!==authGeneration)return;error.textContent=e.message}
}
let ownerDecisionKey=null;
async function recallOwnerMemory(){const generation=authGeneration;
  try{const x=await api('/api/owner-memory?query='+encodeURIComponent(document.getElementById('memory-query').value));if(generation!==authGeneration)return;document.getElementById('owner-memory-results').textContent=JSON.stringify(x.data,null,2);document.getElementById('memory-error').textContent='';}
  catch(e){if(generation!==authGeneration)return;document.getElementById('memory-error').textContent=e.message;}
}
async function saveOwnerMemory(){const generation=authGeneration;
  try{
    if(!document.getElementById('memory-approved').checked)throw Error('Explicit owner approval is required.');
    if(!ownerDecisionKey)ownerDecisionKey=crypto.randomUUID();
    const body={statement:document.getElementById('memory-statement').value,context_key:document.getElementById('memory-context').value,source:document.getElementById('memory-source').value,source_timestamp:document.getElementById('memory-date').value,idempotency_key:ownerDecisionKey,approved:true};
    const x=await api('/api/owner-memory',{method:'POST',body:JSON.stringify(body)});if(generation!==authGeneration)return;document.getElementById('owner-memory-results').textContent=JSON.stringify(x.data,null,2);ownerDecisionKey=null;document.getElementById('memory-statement').value='';document.getElementById('memory-approved').checked=false;document.getElementById('memory-error').textContent='Saved with explicit approval, source and date.';
  }catch(e){if(generation!==authGeneration)return;document.getElementById('memory-error').textContent=e.message;}
}
function renderInternalNotifications(data){
  const target=document.getElementById('notifications-results');target.textContent='';
  const visible=(data.records||[]).filter(item=>item.status!=='SUPPRESSED');
  const meaning=document.createElement('p');meaning.textContent='Internal polling only; no external delivery. '+(visible.length?'':'No visible notifications.');target.appendChild(meaning);
  for(const item of visible){
    const card=document.createElement('div'),pre=document.createElement('pre');pre.textContent=JSON.stringify({id:item.id,title:item.title,body:item.body,status:item.status,readReceipt:item.readReceipt},null,2);card.appendChild(pre);
    if(!item.readReceipt&&(document.body.dataset.readOnly!=="true"||document.body.dataset.isolatedNotification===item.id)){const button=document.createElement('button');button.className='btn secondary';button.textContent='Mark read internally';button.onclick=()=>acknowledgeInternalNotification(item.id);card.appendChild(button);}target.appendChild(card);
  }
}
async function refreshInternalNotifications(){const generation=authGeneration;try{const x=await api('/api/notifications');if(generation!==authGeneration)return;renderInternalNotifications(x.data);document.getElementById('notifications-error').textContent='';}catch(e){if(generation!==authGeneration)return;document.getElementById('notifications-error').textContent=e.message;}}
async function pollInternalNotifications(){const generation=authGeneration;try{const x=await api('/api/notifications/poll',{method:'POST',body:'{}'});if(generation!==authGeneration)return;renderInternalNotifications(x.data);document.getElementById('notifications-error').textContent='Internal notifications enabled from this first explicit poll. No historical replay or external delivery.';}catch(e){if(generation!==authGeneration)return;document.getElementById('notifications-error').textContent=e.message;}}
async function acknowledgeInternalNotification(id){const generation=authGeneration;try{await api('/api/notifications/'+encodeURIComponent(id)+'/ack',{method:'POST',body:'{}'});if(generation!==authGeneration)return;await refreshInternalNotifications();}catch(e){if(generation!==authGeneration)return;document.getElementById('notifications-error').textContent=e.message;}}
refresh();setInterval(refresh,15000);
</script>
</body></html>`;
