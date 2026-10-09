export const commandCenterHtml=`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>SAM Executive Command Center</title>
<style>
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#111827;background:#f3f4f6}
*{box-sizing:border-box}body{margin:0}.shell{max-width:1400px;margin:auto;padding:28px}.top{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:24px}.brand h1{margin:0;font-size:26px}.brand p{margin:5px 0;color:#6b7280}.badge{padding:8px 12px;border-radius:999px;background:#111827;color:white;font-size:12px}
.grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}.card{background:white;border:1px solid #e5e7eb;border-radius:14px;padding:16px;box-shadow:0 1px 2px rgba(0,0,0,.04)}.metric .n{font-size:28px;font-weight:700}.metric .l{font-size:12px;color:#6b7280;margin-top:4px}
.main{display:grid;grid-template-columns:1.45fr .85fr;gap:16px;margin-top:16px}.section-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.section-title h2{font-size:16px;margin:0}.goal{padding:12px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:9px;cursor:pointer}.goal:hover{border-color:#9ca3af}.row{display:flex;justify-content:space-between;gap:10px}.muted{color:#6b7280;font-size:12px}.state{font-size:11px;padding:4px 8px;border-radius:999px;background:#f3f4f6}.btn{border:0;background:#111827;color:white;border-radius:9px;padding:9px 12px;cursor:pointer}.btn.secondary{background:#e5e7eb;color:#111827}.form input,.form textarea,.form select{width:100%;padding:10px;border:1px solid #d1d5db;border-radius:9px;margin:6px 0 10px;background:white}.form textarea{min-height:105px;resize:vertical}.detail pre{white-space:pre-wrap;overflow:auto;background:#111827;color:#e5e7eb;padding:12px;border-radius:10px;font-size:11px;max-height:420px}.finance{line-height:1.55}.err{color:#b91c1c;font-size:12px}
@media(max-width:900px){.grid{grid-template-columns:repeat(2,1fr)}.main{grid-template-columns:1fr}.shell{padding:16px}}
</style>
</head>
<body>
<div class="shell">
  <div class="top"><div class="brand"><h1>SAM Executive Command Center</h1><p>Owner view of goals, execution, verification and finance.</p></div><div class="badge" id="status">Connecting…</div></div>
  <div class="card form" id="authPanel" style="margin-bottom:16px">
    <label for="bearerToken">Command Center bearer token</label>
    <input id="bearerToken" type="password" autocomplete="off" placeholder="Enter your token from Replit Secrets"/>
    <button class="btn" onclick="connect()">Connect</button>
    <p class="muted">Authentication is required. The token is kept only in this browser session; never put it in a URL or chat.</p>
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
        <select id="authority"><option>YELLOW</option><option>GREEN</option></select>
        <input id="priority" type="number" min="0" max="100" value="70"/>
        <label for="acceptance">Optional owner acceptance contract (JSON; required by release profile)</label>
        <textarea id="acceptance" placeholder='{"version":1,"constraints":[{"capabilityId":"local.calculate","params":{"operation":"max"},"result":{"field":"value","equals":8}}]}'></textarea>
        <button class="btn" onclick="createGoal()">Create Goal</button>
        <div id="formError" class="err"></div>
      </div>
      <div class="card finance" style="margin-top:16px"><div class="section-title"><h2>Latest Finance Brief</h2></div><div id="finance">No brief yet.</div></div>
    </div>
  </div>
  <div class="card detail" style="margin-top:16px"><div class="section-title"><h2>Golden Chain Timeline</h2></div><pre id="timeline">Select a goal.</pre></div>
</div>
<script>
let token=sessionStorage.getItem("sam_cc_token")||"";
async function connect(){
  const value=document.getElementById("bearerToken").value.trim();
  if(!value){document.getElementById("authError").textContent="Enter a bearer token.";return}
  token=value;sessionStorage.setItem("sam_cc_token",token);
  document.getElementById("bearerToken").value="";
  document.getElementById("authError").textContent="";
  await refresh();
}
async function api(path,options={}){
  const headers={...(options.headers||{}),Authorization:"Bearer "+token};
  if(options.body) headers["Content-Type"]="application/json";
  const r=await fetch(path,{...options,headers});
  if(r.status===401){sessionStorage.removeItem("sam_cc_token");token="";document.getElementById("authPanel").hidden=false;throw new Error("Unauthorized. Enter the correct bearer token.");}
  const body=await r.json();
  if(!r.ok) throw new Error(body.error||"Request failed");
  return body;
}
function metric(label,value){return '<div class="card metric"><div class="n">'+Number(value||0)+'</div><div class="l">'+label+'</div></div>'}
async function refresh(){
  if(!token){document.getElementById("status").textContent="AUTH REQUIRED";document.getElementById("authPanel").hidden=false;return}
  try{
    const [overview,goals,finance]=await Promise.all([api("/api/overview"),api("/api/goals"),api("/api/finance/latest")]);
    document.getElementById("authPanel").hidden=true;
    document.getElementById("status").textContent=document.body.dataset.developmentSafe?"DEVELOPMENT · CONNECTED":"LIVE";
    const o=overview.data;
    document.getElementById("metrics").innerHTML=[
      metric("Active goals",o.active_goals),metric("Active work",o.active_work),metric("Waiting owner",o.waiting_owner),
      metric("Pending approvals",o.pending_approvals),metric("Unresolved side effects",o.unresolved_side_effects),metric("Failed goals",o.failed_goals)
    ].join("");
    document.getElementById("goals").innerHTML=goals.data.map(g=>'<div class="goal" data-goal-id="'+escapeHtml(g.id)+'"><div class="row"><strong>'+escapeHtml(g.business_id+" · "+g.domain)+'</strong><span class="state">'+escapeHtml(g.state)+'</span></div><div style="margin-top:6px">'+escapeHtml(g.objective)+'</div><div class="muted">Priority '+g.priority+' · '+escapeHtml(g.authority_ceiling||"")+'</div></div>').join("")||'<div class="muted">No goals.</div>';
    document.querySelectorAll("#goals [data-goal-id]").forEach(el=>{el.onclick=()=>timeline(el.dataset.goalId)});
    document.getElementById("finance").textContent=finance.data?JSON.stringify(finance.data.after_ref,null,2):"No brief yet.";
  }catch(e){document.getElementById("status").textContent=token?"ERROR":"AUTH REQUIRED";document.getElementById("formError").textContent=e.message;document.getElementById("authError").textContent=e.message}
}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
async function timeline(id){try{const x=await api("/api/goals/"+encodeURIComponent(id)+"/timeline");document.getElementById("timeline").textContent=JSON.stringify(x.data,null,2)}catch(e){document.getElementById("timeline").textContent=e.message}}
async function createGoal(){
  const error=document.getElementById("formError");error.textContent="";
  try{
    const body={objective:document.getElementById("objective").value,domain:document.getElementById("domain").value,authority_ceiling:document.getElementById("authority").value,priority:Number(document.getElementById("priority").value)};
    const acceptance=document.getElementById("acceptance").value.trim();
    if(acceptance)body.acceptance_contract=JSON.parse(acceptance);
    const x=await api("/api/goals",{method:"POST",body:JSON.stringify(body)});
    document.getElementById("objective").value="";
    await refresh();await timeline(x.data.id);
  }catch(e){error.textContent=e.message}
}
refresh();setInterval(refresh,15000);
</script>
</body></html>`;
