import {commandCenterStrings} from "./ui.i18n";

/** Browser runtime. Kept as one classic script so the login gate works with inline handlers. */
export function renderClientScript(): string {
  return `<script>
const STRINGS=${JSON.stringify(commandCenterStrings)};
let lang=sessionStorage.getItem("sam_cc_lang")||"ar";
function t(key){const d=STRINGS[lang]||STRINGS.ar;return d[key]!==undefined?d[key]:(STRINGS.ar[key]!==undefined?STRINGS.ar[key]:key)}
function esc(v){return String(v===null||v===undefined?"":v).replace(/[&<>"']/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]})}
function n(value){return Number(value||0)}
let authGeneration=0,refreshGeneration=null,wakeRetry=0,selectedGoalId=null;
let token=sessionStorage.getItem("sam_cc_token")||"";
const state={exec:null,goals:[],finance:null,timeline:null,view:"overview",goalId:null,query:"",filter:"all",brief:null};

async function connect(){
  const input=document.getElementById("bearerToken");
  const value=(input&&input.value?input.value:"").trim();
  if(!value){setErr("authError",t("gate.field"));return}
  authGeneration++;wakeRetry=0;token=value;
  sessionStorage.setItem("sam_cc_token",token);
  if(input)input.value="";
  setErr("authError","");
  await refresh();
}
function setErr(id,message){const el=document.getElementById(id);if(el)el.textContent=message}
function setStatus(text,cls){
  const el=document.getElementById("status");
  if(!el)return;
  el.textContent=text;
  el.className="pill"+(cls?" "+cls:"");
}
function setAuthUI(connected){
  const wrap=document.getElementById("gateWrap"),dash=document.getElementById("dashboard"),panel=document.getElementById("authPanel");
  if(wrap)wrap.hidden=connected;
  if(panel)panel.hidden=connected;
  if(dash)dash.hidden=!connected;
}
async function api(path,options){
  options=options||{};
  const generation=authGeneration,credential=token;
  const current=function(){if(generation!==authGeneration)throw Error("Outdated authentication response ignored.")};
  const headers=Object.assign({},options.headers||{},{Authorization:"Bearer "+token});
  if(options.body)headers["Content-Type"]="application/json";
  const deadline=options.timeout||15000;const controller=new AbortController(),timeout=setTimeout(function(){controller.abort()},deadline);
  try{
    let r;
    try{r=await fetch(path,Object.assign({},options,{headers:headers,signal:controller.signal}))}
    catch(e){current();const error=Error(controller.signal.aborted?"Service request timed out. Try again.":"Service unavailable. Try again.");error.transport=true;throw error}
    current();
    if(r.status===401){
      let body;try{body=await r.json()}catch(e){}
      current();
      sessionStorage.removeItem("sam_cc_token");token="";
      setAuthUI(false);
      let message="Authentication was rejected. Check this Command Center service's existing authentication configuration.";
      if(body&&body.error==="unauthorized"){
        if(body.reason==="missing_authorization")message="Authentication rejected: the service received no Authorization header.";
        if(body.reason==="invalid_bearer_scheme")message="Authentication rejected: the service did not receive the required Bearer scheme.";
        if(body.reason==="bearer_rejected")message="Authentication rejected: the service rejected the Bearer credential. Confirm the existing token configured for this Command Center service.";
      }
      if(typeof(body&&body.request_id)==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(body.request_id))message+=" Request ID: "+body.request_id;
      throw Error(message);
    }
    let parsed;
    try{parsed=await r.json()}
    catch(e){current();const error=Error(controller.signal.aborted?"Service request timed out. Try again.":"Service returned an unavailable or invalid response. Try again.");error.transport=true;throw error}
    current();
    if(token!==credential)throw Error("Outdated authentication response ignored.");
    if(!r.ok)throw Error(parsed.error||"Request failed");
    return parsed;
  }finally{clearTimeout(timeout)}
}

async function refresh(){
  const generation=authGeneration;
  if(!token){setStatus("AUTH REQUIRED","");setAuthUI(false);return}
  if(refreshGeneration===generation)return;
  refreshGeneration=generation;
  try{
    const results=await Promise.allSettled([api("/api/executive"),api("/api/goals"),api("/api/finance/latest")]);
    const failed=results.find(function(r){return r.status==="rejected"});
    if(failed)throw failed.reason;
    const exec=results[0].value,goals=results[1].value,finance=results[2].value;
    if(generation!==authGeneration||!token)return;
    state.exec=exec.data||null;
    state.goals=Array.isArray(goals.data)?goals.data:[];
    state.finance=finance.data||null;
    setAuthUI(true);
    document.getElementById("status").textContent=document.body.dataset.developmentSafe?"DEVELOPMENT · CONNECTED":"LIVE";
    document.getElementById("status").className="pill live";
    wakeRetry=0;
    renderAll();
    void loadBriefing(false);
    await refreshInternalNotifications();
  }catch(e){
    if(generation!==authGeneration)return;
    if(e&&e.transport===true&&wakeRetry<2){wakeRetry++;
      setStatus("SERVICE WAKING","warn");
      setTimeout(function(){if(generation===authGeneration)refresh()},wakeRetry===1?8000:20000);return}
    setStatus(token?"ERROR":"AUTH REQUIRED","bad");
    setErr("formError",e.message);setErr("authError",e.message);
  }finally{if(refreshGeneration===generation)refreshGeneration=null}
}

function renderAll(){
  const c=(state.exec&&state.exec.counts)?state.exec.counts:{};
  renderKpis(c);
  renderBriefing();
  renderOverviewDecisions();
  renderGoalsPreview();
  renderTrend();
  renderAgentsMini();
  renderAlerts();
  renderLatestReports();
  renderDecisionsView();
  renderGoalList();
  renderAgentsTable();
  renderReportsView();
  renderFinance();
  const waiting=n(c.waiting_owner)+n(c.pending_approvals);
  const badge=(typeof document.querySelector==="function")?document.querySelector('[data-badge="decisions"]'):null;
  if(badge){badge.textContent=String(waiting);badge.hidden=waiting===0}
  if(state.view==="goal"&&state.goalId)openGoal(state.goalId,true);
}

function kpiCard(label,value,cls,hint){
  return '<div class="kpi '+(cls||"")+'"><div class="label">'+esc(label)+'</div><div class="value">'+esc(value)+'</div>'+(hint?'<div class="hint">'+esc(hint)+'</div>':"")+'</div>'
}
function renderKpis(c){
  const target=document.getElementById("metrics");if(!target)return;
  const reports=(state.exec&&state.exec.reports&&typeof state.exec.reports.total==="number")?state.exec.reports.total:null;
  target.innerHTML=[
    kpiCard(t("kpi.active"),n(c.active_goals)),
    kpiCard(t("kpi.waiting"),n(c.waiting_owner)+n(c.pending_approvals),"accent",n(c.pending_approvals)+" "+t("kpi.approvals")),
    kpiCard(t("kpi.failed"),n(c.failed_goals),n(c.failed_goals)?"bad":""),
    kpiCard(t("kpi.completed"),n(c.completed_goals)),
    kpiCard(t("kpi.work"),n(c.active_work)),
    kpiCard(t("kpi.reports"),reports===null?t("misc.unavailable"):reports)
  ].join("");
}
function numBlock(value,label){return '<div><b>'+n(value)+'</b><span>'+esc(label)+'</span></div>'}
function topDecision(){
  const list=collectDecisions();
  const rank={approval:0,blocked:1,waiting:2,failed:3};
  return list.slice().sort(function(a,b){return (rank[a.kind]===undefined?9:rank[a.kind])-(rank[b.kind]===undefined?9:rank[b.kind])})[0]||null;
}
function stateBadge(value){
  const raw=String(value||"");
  const cls=raw==="COMPLETED"?"ok":(raw==="FAILED"?"bad":(raw==="WAITING_OWNER"||raw==="BLOCKED"?"warn":""));
  return '<span class="badge '+cls+'">'+esc(t("state."+raw))+'</span>'
}
function timeAgo(iso){
  if(!iso)return "";
  const d=new Date(iso).getTime();
  if(!isFinite(d))return "";
  const mins=Math.max(0,Math.round((Date.now()-d)/60000));
  if(mins<60)return mins+t("misc.minutes");
  const hours=Math.round(mins/60);
  if(hours<48)return hours+t("misc.hours");
  return Math.round(hours/24)+t("misc.days");
}
function dayLabel(iso){try{return new Date(iso).toLocaleDateString(lang==="ar"?"ar-NL":"en-GB",{day:"2-digit",month:"2-digit"})}catch(e){return ""}}

function goalRow(g){
  return '<div class="row-item goal'+(selectedGoalId===g.id?" is-selected":"")+'" data-goal-id="'+esc(g.id)+'">'+
    '<div class="row-main"><div class="row-title">'+esc(g.business_id||"")+' '+stateBadge(g.state)+'</div>'+
    '<div class="row-sub">'+esc(g.objective||"")+'</div>'+
    '<div class="row-meta"><span>'+esc(g.domain||"")+'</span><span>'+esc(t("goal.priority.short"))+" "+n(g.priority)+'</span>'+(g.authority_ceiling?'<span>'+esc(g.authority_ceiling)+'</span>':"")+'<span>'+esc(timeAgo(g.updated_at))+'</span></div></div></div>'
}
function activeGoals(){return state.goals.filter(function(g){return ["NEW","MODELING","PLANNING","EXECUTING","WAITING_EXTERNAL","WAITING_OWNER","BLOCKED","VERIFYING","REPLANNING"].indexOf(g.state)>=0})}
function renderGoalsPreview(){
  const target=document.getElementById("goals");if(!target)return;
  const list=activeGoals().slice(0,4);
  target.innerHTML=list.length?list.map(goalRow).join(""):'<div class="empty">'+esc(t("sec.goals.empty"))+'</div>';
  bindGoalRows(target);
}
function renderGoalList(){
  const target=document.getElementById("goal-list");if(!target)return;
  const q=(state.query||"").trim().toLowerCase(),f=state.filter||"all";
  const list=state.goals.filter(function(g){
    if(f==="active"&&activeGoals().indexOf(g)<0)return false;
    if(f==="waiting"&&g.state!=="WAITING_OWNER")return false;
    if(f==="completed"&&g.state!=="COMPLETED")return false;
    if(f==="failed"&&g.state!=="FAILED")return false;
    if(!q)return true;
    return ((g.business_id||"")+" "+(g.objective||"")+" "+(g.domain||"")).toLowerCase().indexOf(q)>=0;
  });
  target.innerHTML=list.length?list.map(goalRow).join(""):'<div class="empty">'+esc(t("goal.empty"))+'</div>';
  bindGoalRows(target);
}
function bindGoalRows(scope){
  if(!scope||!scope.querySelectorAll)return;
  const nodes=scope.querySelectorAll("[data-goal-id]");
  for(let i=0;i<nodes.length;i++){(function(el){el.onclick=function(){go("goal",el.getAttribute("data-goal-id"))}})(nodes[i])}
}
function decisionCard(item){
  return '<div class="decision '+(item.severity==="high"?"sev-high":"sev-wait")+'">'+
    '<div class="decision-head"><span class="badge '+(item.badgeCls||"")+'">'+esc(item.kindLabel)+'</span><span class="decision-title">'+esc(item.title)+'</span></div>'+
    '<div class="row-sub" style="margin-top:6px">'+esc(item.why)+'</div>'+
    '<div class="row-meta"><span>'+esc(item.businessId||"")+'</span><span>'+esc(t("decision.since")+" "+timeAgo(item.since))+'</span>'+(item.extra?'<span>'+esc(item.extra)+'</span>':"")+'</div>'+
    '<div class="muted" style="margin-top:8px">'+esc(t("sit.next."+(item.kind||"waiting")))+'</div>'+
    '<div class="decision-actions"><button class="btn small" type="button" data-open-goal="'+esc(item.goalId)+'">'+esc(t("decision.open"))+'</button></div></div>'
}
function collectDecisions(){
  const out=[];
  const d=(state.exec&&state.exec.decisions)?state.exec.decisions:{approvals:[],waiting:[],failed:[]};
  (d.approvals||[]).forEach(function(a){
    out.push({kind:"approval",severity:"high",badgeCls:"warn",kindLabel:t("decision.approval"),title:a.capability_id,why:t("decision.why.approval"),goalId:a.goal_id,businessId:a.business_id,since:a.created_at,extra:a.authority_class})
  });
  (d.waiting||[]).forEach(function(g){
    out.push({kind:g.state==="BLOCKED"?"blocked":"waiting",severity:g.state==="BLOCKED"?"high":"",badgeCls:g.state==="BLOCKED"?"bad":"warn",kindLabel:t(g.state==="BLOCKED"?"decision.blocked":"decision.waiting"),title:g.objective,why:g.replan_reason||t(g.state==="BLOCKED"?"decision.why.blocked":"decision.why.waiting"),goalId:g.id,businessId:g.business_id,since:g.updated_at})
  });
  (d.failed||[]).forEach(function(g){
    out.push({kind:"failed",severity:"",badgeCls:"bad",kindLabel:t("decision.failed"),title:g.objective,why:g.replan_reason||t("decision.why.failed"),goalId:g.id,businessId:g.business_id,since:g.updated_at})
  });
  return out;
}
function bindDecisionButtons(scope){
  if(!scope||!scope.querySelectorAll)return;
  const nodes=scope.querySelectorAll("[data-open-goal]");
  for(let i=0;i<nodes.length;i++){(function(el){el.onclick=function(){go("goal",el.getAttribute("data-open-goal"))}})(nodes[i])}
}
function renderOverviewDecisions(){
  const target=document.getElementById("overview-decisions");if(!target)return;
  const list=collectDecisions();
  target.innerHTML=list.length?list.slice(0,5).map(decisionCard).join(""):'<div class="empty">'+esc(t("sec.decisions.empty"))+'</div>';
  bindDecisionButtons(target);
}
function renderDecisionsView(){
  const target=document.getElementById("decisions-list");if(!target)return;
  const list=collectDecisions();
  target.innerHTML=list.length?list.map(decisionCard).join(""):'<div class="empty">'+esc(t("sec.decisions.empty"))+'</div>';
  bindDecisionButtons(target);
}
function briefOf(){
  const b=state.brief;
  if(b&&b.analysis)return {data:b.analysis,mode:"MODEL",receipt:b.receipt,reason:null,facts:b.facts};
  if(b&&b.deterministic)return {data:b.deterministic,mode:b.mode,receipt:b.receipt||null,reason:b.reason||null,facts:b.facts};
  const top=topDecision();
  return {data:{headline:top?(top.kindLabel+": "+(top.businessId||"")):t("sit.nothing"),
    problem:{what:top?top.title:t("sit.nothing"),why:top?(top.why||""):"",evidence:top?[top.goalId]:[]},
    impact:{statement:"",basis:[]},options:[],samCan:[],ownerMust:[],
    nextStep:top?t("sit.next."+top.kind):t("sit.none")},mode:null,receipt:null,reason:null,facts:null};
}
async function loadBriefing(force){
  try{
    const x=await api("/api/briefing"+(force?"?refresh=1":""),{timeout:60000});
    state.brief=x.data;
    renderBriefing();
  }catch(e){
    if(!state.brief)renderBriefing();
  }
}
function renderBriefing(){
  const b=briefOf();
  const a=(state.exec&&state.exec.activity)?state.exec.activity:null;
  const what=document.getElementById("sit-what");
  if(what)what.innerHTML=a?('<div class="muted">'+esc(t("sit.window"))+'</div><div class="sit-nums">'+
      numBlock(a.executions_24h,t("sit.exec"))+numBlock(a.verified_24h,t("sit.verified"))+numBlock(a.goals_24h,t("sit.goals"))+'</div>'):"";
  const focus=document.getElementById("sit-focus");
  if(focus)focus.textContent=b.data.headline||"";
  const problem=document.getElementById("brief-problem");if(problem)problem.textContent=b.data.problem?.what||"";
  const why=document.getElementById("brief-why");if(why)why.textContent=b.data.problem?.why||"";
  const impact=document.getElementById("brief-impact");if(impact)impact.textContent=b.data.impact?.statement||"";
  const next=document.getElementById("sit-next");if(next)next.textContent=b.data.nextStep||"";

  const facts=b.facts;
  const bizOf={};
  if(facts){for(const d of (facts.decisions||[]))bizOf[d.id]=d;for(const r of (facts.savedReports||[]))bizOf[r.id]=r;}
  const ev=document.getElementById("brief-evidence");
  if(ev){
    const ids=(b.data.problem?.evidence||[]);
    ev.innerHTML=ids.length?ids.map(function(id){
      const f=bizOf[id]||{};
      const label=f.businessId||(String(id).slice(0,8)+"…");
      const goal=f.goalId||id;
      return '<button class="chip" type="button" data-open-goal="'+esc(goal)+'">'+esc(label)+'</button>';
    }).join(""):'<span class="muted">'+esc(t("misc.noData"))+'</span>';
    bindDecisionButtons(ev);
  }
  const opts=document.getElementById("brief-options");
  if(opts){
    opts.innerHTML=(b.data.options||[]).length?b.data.options.map(function(o){
      const cls=o.authority==="GREEN"?"ok":o.authority==="YELLOW"?"warn":"bad";
      return '<div class="opt"><span class="badge '+cls+'">'+esc(o.authority)+'</span><div><b>'+esc(o.title)+'</b><div class="muted">'+esc(o.risk)+'</div></div></div>';
    }).join(""):'<span class="muted">'+esc(t("misc.noData"))+'</span>';
  }
  const can=document.getElementById("brief-can");
  if(can)can.innerHTML=(b.data.samCan||[]).map(function(x){return '<li>'+esc(x)+'</li>'}).join("")||('<li class="muted">'+esc(t("misc.noData"))+'</li>');
  const owner=document.getElementById("brief-owner");
  if(owner)owner.innerHTML=(b.data.ownerMust||[]).map(function(x){return '<li>'+esc(x)+'</li>'}).join("")||('<li class="muted">'+esc(t("misc.noData"))+'</li>');

  const openBtn=document.getElementById("brief-open");
  const top=topDecision();
  if(openBtn){
    if(top){openBtn.style.display="";openBtn.textContent=t("decision.open");openBtn.onclick=function(){go("goal",top.goalId)}}
    else{openBtn.style.display="none";openBtn.onclick=null}
  }

  const modeEl=document.getElementById("brief-mode");
  if(modeEl){
    if(!b.mode){modeEl.className="prov loading";modeEl.textContent=t("brief.mode.loading")}
    else{const mode=b.mode;
    modeEl.className="prov "+(mode==="MODEL"?"real":(mode==="MODEL_REJECTED"?"derived":"unavailable"));
    modeEl.textContent=t(mode==="MODEL"?"brief.mode.model":(mode==="MODEL_REJECTED"?"brief.mode.rejected":"brief.mode.unavailable"))}
  }

  const receipt=document.getElementById("brief-receipt");
  if(receipt){
    const r=b.receipt;
    receipt.innerHTML='<div class="card-head"><h3>'+esc(t("brief.receipt"))+'</h3></div>'+
      (!b.mode?('<div class="muted">'+esc(t("brief.mode.loading"))+'</div>'):"")+
      (r?('<dl class="kv"><dt>'+esc(t("brief.model"))+'</dt><dd>'+esc(r.model)+'</dd>'+
        '<dt>'+esc(t("brief.tokens"))+'</dt><dd>'+n(r.inputTokens)+' → '+n(r.outputTokens)+'</dd>'+
        '<dt>'+esc(t("brief.cost"))+'</dt><dd>$'+Number(r.costUsd||0).toFixed(4)+'</dd>'+
        '<dt>'+esc(t("brief.latency"))+'</dt><dd>'+Math.round(n(r.latencyMs)/1000)+'s</dd>'+
        '<dt>'+esc(t("brief.factsHash"))+'</dt><dd>'+esc(String(r.factsHash).slice(0,12))+'…</dd></dl>')
        :('<div class="muted">'+esc(b.reason||t("brief.mode.unavailable"))+'</div>'))+
      '<div class="muted" style="margin-top:10px">'+esc(t("brief.refreshNote"))+'</div>';
  }

  const outcome=document.getElementById("brief-outcome");
  if(outcome){
    const reps=(facts&&facts.savedReports)||[];
    const execs=(facts&&facts.recentExecutions)||[];
    let html='<div class="card-head"><h3>'+esc(t("brief.outcome"))+'</h3><span class="prov real">'+esc(t("prov.real"))+'</span></div>';
    if(reps.length){const r=reps[0];html+='<div class="row-sub">'+esc(r.summary||"")+'</div><div class="row-meta"><span>'+esc(r.businessId||"")+'</span><span>'+esc(new Date(r.at).toISOString().slice(0,16).replace("T"," "))+'</span></div><div class="decision-actions"><button class="btn small" type="button" data-open-goal="'+esc(r.goalId)+'">'+esc(t("decision.open"))+'</button></div>'}
    else if(execs.length){html+=execs.slice(0,2).map(function(e){return '<div class="row-sub">'+esc(e.actor)+' · '+esc(e.capability)+' · '+esc(e.result)+'</div>'}).join("")}
    else{html+='<div class="empty">'+esc(t("brief.noOutcome"))+'</div>'}
    outcome.innerHTML=html;
    bindDecisionButtons(outcome);
  }
}
function renderTrend(){
  const target=document.getElementById("trend");if(!target)return;
  const created=(state.exec&&state.exec.trend&&state.exec.trend.created)||[];
  const completed=(state.exec&&state.exec.trend&&state.exec.trend.completed)||[];
  if(!created.length&&!completed.length){target.innerHTML='<div class="empty">'+esc(t("sec.trend.empty"))+'</div>';return}
  const days=[],map1={},map2={};
  for(let i=13;i>=0;i--){const d=new Date(Date.now()-i*86400000);const key=d.toISOString().slice(0,10);days.push(key);map1[key]=0;map2[key]=0}
  created.forEach(function(r){if(map1[r.day]!==undefined)map1[r.day]=n(r.created)});
  completed.forEach(function(r){if(map2[r.day]!==undefined)map2[r.day]=n(r.completed)});
  const max=Math.max(1,Math.max.apply(null,days.map(function(d){return Math.max(map1[d],map2[d])})));
  const bars=days.map(function(d){
    const v1=map1[d],v2=map2[d];
    const h1=v1?Math.round((v1/max)*100):0,h2=v2?Math.round((v2/max)*100):0;
    return '<div class="bar" title="'+esc(d)+' · '+v1+'/'+v2+'"><span class="b1" style="height:'+h1+'%"></span><span class="b2" style="height:'+h2+'%"></span></div>'
  }).join("");
  const axis=days.map(function(d,i){return '<span>'+(i%2===0?dayLabel(d):"")+'</span>'}).join("");
  target.innerHTML='<div class="chart-wrap"><div class="chart-max">'+max+'</div><div class="chart-grid"><i></i><i></i><i></i></div><div class="chart">'+bars+'</div></div><div class="chart-x">'+axis+'</div><div class="legend"><span class="l1"><i></i>'+esc(t("legend.created"))+'</span><span class="l2"><i></i>'+esc(t("legend.completed"))+'</span></div>';
}

function agentState(a){
  if(n(a.running)>0)return {label:t("agent.running"),cls:"ok"};
  if(n(a.failed)>0)return {label:t("agent.attention"),cls:"warn"};
  return {label:t("agent.idle"),cls:""};
}
function renderAgentsMini(){
  const target=document.getElementById("agents-mini");if(!target)return;
  const list=(state.exec&&state.exec.agents)||[];
  if(!list.length){target.innerHTML='<div class="empty">'+esc(t("sec.agents.empty"))+'</div>';return}
  target.innerHTML=list.slice(0,4).map(function(a){
    const s=agentState(a);
    return '<div class="agent"><div class="avatar">'+esc(String(a.actor||"?").slice(0,2).toUpperCase())+'</div><div><div class="name">'+esc(a.actor)+'</div><div class="meta">'+n(a.executions)+' · '+esc(t("agent.last"))+' '+esc(timeAgo(a.last_at))+'</div></div><span class="badge '+s.cls+'">'+esc(s.label)+'</span></div>'
  }).join("");
}
function renderAgentsTable(){
  const target=document.getElementById("agents-body");if(!target)return;
  const list=(state.exec&&state.exec.agents)||[];
  if(!list.length){target.innerHTML='<tr><td colspan="6"><div class="empty">'+esc(t("sec.agents.empty"))+'</div></td></tr>';return}
  target.innerHTML=list.map(function(a){
    const s=agentState(a);
    return '<tr><td><b>'+esc(a.actor)+'</b><div class="muted">'+esc(a.last_capability||"")+'</div></td><td><span class="badge '+s.cls+'">'+esc(s.label)+'</span></td><td class="num">'+n(a.executions)+'</td><td class="num">'+n(a.verified)+'</td><td class="num">'+n(a.failed)+'</td><td class="muted">'+esc(timeAgo(a.last_at))+'</td></tr>'
  }).join("");
}

function reportCard(r,compact){
  const dec=r.decision||{};
  const rep=dec.report||{};
  const cov=rep.analysisCoverage;
  const covText=cov&&typeof cov==="object"?(n(cov.covered)+"/"+n(cov.total)):(cov?String(cov):"—");
  const limits=(Array.isArray(dec.limitations)&&dec.limitations.length)?dec.limitations:(Array.isArray(rep.limitations)?rep.limitations:[]);
  const summary=dec.summary||"";
  return '<div class="report"><h4>'+esc(t("report.saved"))+' · '+esc(r.business_id||"")+'</h4>'+
    (summary?'<div class="row-sub">'+esc(summary)+'</div>':'')+
    '<dl class="kv"><dt>'+esc(t("report.id"))+'</dt><dd>'+esc(r.id)+'</dd>'+
    '<dt>'+esc(t("report.hash"))+'</dt><dd>'+esc(String(r.report_hash||"").slice(0,16))+'…</dd>'+
    '<dt>'+esc(t("report.coverage"))+'</dt><dd>'+esc(covText)+'</dd>'+
    '<dt>'+esc(t("report.semantic"))+'</dt><dd>'+esc(rep.semanticPolicy||"HISTORICAL_NARRATIVE_NOT_SEMANTICALLY_VALIDATED")+'</dd>'+
    '<dt>'+esc(t("report.retrieval"))+'</dt><dd>'+esc(t("report.retrieval.value"))+'</dd></dl>'+
    (limits.length?'<div class="row-meta"><span>'+esc(t("report.limits"))+': '+esc(limits.join(" · "))+'</span></div>':"")+
    (compact?"":'<div class="decision-actions"><button class="btn small" type="button" data-open-goal="'+esc(r.goal_id)+'">'+esc(t("decision.open"))+'</button></div>')+'</div>'
}
function reportList(){
  const r=(state.exec&&state.exec.reports)?state.exec.reports:{available:false,items:[]};
  return Array.isArray(r.items)?r.items:[]
}
function renderLatestReports(){
  const target=document.getElementById("latest-reports");if(!target)return;
  const items=reportList();
  target.innerHTML=items.length?items.slice(0,3).map(function(r){return reportCard(r,true)}).join(""):'<div class="empty">'+esc(t("sec.reports.empty"))+'</div>';
  bindDecisionButtons(target);
}
function renderReportsView(){
  const target=document.getElementById("reports-list");if(!target)return;
  const items=reportList();
  target.innerHTML=items.length?items.map(function(r){return reportCard(r,false)}).join(""):'<div class="empty">'+esc(t("sec.reports.empty"))+'</div>';
  bindDecisionButtons(target);
  const side=document.getElementById("decisions-reports");
  if(side){side.innerHTML=items.length?items.slice(0,2).map(function(r){return reportCard(r,true)}).join(""):'<div class="empty">'+esc(t("sec.reports.empty"))+'</div>';bindDecisionButtons(side)}
}

function renderAlerts(){
  const target=document.getElementById("alerts");if(!target)return;
  const c=(state.exec&&state.exec.counts)||{};
  const items=[];
  if(n(c.failed_goals)>0)items.push({cls:"bad",label:t("alert.failed"),value:n(c.failed_goals)});
  if(n(c.unresolved_side_effects)>0)items.push({cls:"warn",label:t("alert.unresolved"),value:n(c.unresolved_side_effects)});
  if(n(c.waiting_owner)>0)items.push({cls:"warn",label:t("alert.waiting"),value:n(c.waiting_owner)});
  target.innerHTML=items.length?items.map(function(i){return '<div class="agent"><div><div class="name">'+esc(i.label)+'</div></div><span class="badge '+i.cls+'">'+esc(String(i.value))+'</span></div>'}).join(""):'<div class="empty">'+esc(t("alert.none"))+'</div>';
}

function renderFinance(){
  const brief=document.getElementById("finance-brief"),usage=document.getElementById("finance-usage"),history=document.getElementById("finance-history");
  if(history){
    const h=(state.exec&&state.exec.finance&&state.exec.finance.history)?state.exec.finance.history:[];
    history.innerHTML='<div class="card-head"><h3>'+esc(t("fin.history"))+'</h3><span class="prov real">'+esc(t("prov.real"))+'</span><span class="meta">'+h.length+'</span></div>'+
      (h.length?'<table class="tbl"><thead><tr><th>'+esc(t("report.id"))+'</th><th>'+esc(t("decision.since"))+'</th><th>'+esc(t("decision.open"))+'</th></tr></thead><tbody>'+
        h.map(function(r){return '<tr><td class="muted">'+esc(String(r.id).slice(0,8))+'…</td><td class="muted">'+esc(new Date(r.timestamp).toISOString().slice(0,16).replace("T"," "))+'</td><td><button class="btn small" type="button" data-open-goal="'+esc(r.goal_id||"")+'">'+esc(t("decision.open"))+'</button></td></tr>'}).join("")+
        '</tbody></table>':'<div class="empty">'+esc(t("fin.briefEmpty"))+'</div>');
    bindDecisionButtons(history);
  }
  const b=state.finance||(state.exec&&state.exec.finance?state.exec.finance.brief:null);
  if(brief){
    brief.innerHTML='<div class="card-head"><h3>'+esc(t("finance.brief"))+'</h3><span class="prov real">'+esc(t("prov.real"))+'</span></div>'+
      (b?'<dl class="kv"><dt>'+esc(t("report.id"))+'</dt><dd>'+esc(b.id)+'</dd><dt>'+esc(t("agent.last"))+'</dt><dd>'+esc(new Date(b.timestamp).toISOString())+'</dd></dl><details><summary>'+esc(t("report.raw"))+'</summary><pre>'+esc(JSON.stringify(b.after_ref,null,2))+'</pre></details>':'<div class="empty">'+esc(t("fin.briefEmpty"))+'</div>')
  }
  if(usage){
    usage.innerHTML='<div class="card-head"><h3>'+esc(t("finance.usage"))+'</h3><span class="prov unavailable">'+esc(t("prov.unavailable"))+'</span></div>'+
      '<div class="empty" style="text-align:start"><b>'+esc(t("fin.blocked"))+'</b>'+
      '<div class="muted" style="margin-top:6px">'+esc(t("fin.blockedWhy"))+'</div>'+
      '<div class="muted" style="margin-top:6px">'+esc(t("fin.blockedNext"))+'</div></div>'
  }}

async function openGoal(id,quiet){
  if(!id)return;
  state.view="goal";state.goalId=id;selectedGoalId=id;
  showView("goal",true);
  const head=document.getElementById("goal-detail-head");
  const g=state.goals.filter(function(x){return x.id===id})[0];
  if(head&&g)head.innerHTML='<div class="card-head"><h3>'+esc(g.business_id||"")+' '+stateBadge(g.state)+'</h3><span class="meta">'+esc(g.domain||"")+'</span></div><div class="row-sub">'+esc(g.objective||"")+'</div>';
  const result=document.getElementById("report-result");
  if(result)result.innerHTML='<div class="skeleton" style="width:60%"></div><div class="skeleton" style="width:90%;margin-top:8px"></div>';
  const status=document.getElementById("timeline-status");if(status)status.textContent=t("misc.loading")||"…";
  try{
    const x=await api("/api/goals/"+encodeURIComponent(id)+"/timeline");
    state.timeline=x.data;
    const raw=document.getElementById("raw-timeline"),pre=document.getElementById("timeline");
    if(pre)pre.textContent=JSON.stringify(x.data,null,2);
    if(raw)raw.hidden=false;
    if(result)result.innerHTML=timelineHtml(x.data);
    renderEvidence(x.data);
    if(status)status.textContent=t("misc.savedOnly");
    if(!quiet){const section=document.getElementById("timeline-section");if(section&&section.scrollIntoView)section.scrollIntoView({behavior:"smooth",block:"start"})}
  }catch(e){
    if(result)result.innerHTML='<p class="err">'+esc(e.message)+'</p>';
    if(status)status.textContent=t("top.error");
  }
}
function timelineHtml(data){
  const g=data.goal||{};
  const reports=Array.isArray(data.reports)?data.reports:[];
  const head='<div class="card-head"><h3 style="margin:0">'+esc(g.business_id||"")+'</h3>'+stateBadge(g.state)+'</div><div class="row-sub">'+esc(g.objective||"")+'</div>'+
    '<div class="row-meta"><span>'+esc(t("goal.plans"))+": "+((data.plans||[]).length)+'</span><span>'+esc(t("goal.executions"))+": "+((data.executions||[]).length)+'</span><span>'+esc(t("goal.verifications"))+": "+((data.verifications||[]).length)+'</span><span>'+esc(t("goal.reports"))+": "+reports.length+'</span></div>';
  const body=reports.length?reports.map(function(r){return reportCard(Object.assign({goal_id:g.id,business_id:g.business_id},r),false)}).join(""):'<div class="empty">'+esc(t(data.reportsAvailability==="MISSING_INTEGRATION_TABLE"?"goal.reportsUnavailable":"goal.noReports"))+'</div>';
  return head+body;
}
function renderEvidence(data){
  const target=document.getElementById("goal-evidence");if(!target)return;
  const execs=Array.isArray(data.executions)?data.executions:[];
  const vers=Array.isArray(data.verifications)?data.verifications:[];
  const audit=Array.isArray(data.audit)?data.audit:[];
  const items=execs.map(function(e){
    const v=vers.filter(function(x){return x.execution_id===e.id})[0];
    const ok=v&&v.result==="VERIFIED";
    return '<div class="tl-item '+(ok?"ok":"")+'"><div class="tl-when">'+esc(e.started_at?new Date(e.started_at).toLocaleString(lang==="ar"?"ar-NL":"en-GB"):"")+'</div><div class="tl-what">'+esc(e.capability_id||"")+'</div><div class="tl-detail">'+esc(e.actor||"")+' · '+esc(v?v.result:(e.status||""))+'</div></div>'
  }).join("");
  target.innerHTML='<div class="card-head"><h3>'+esc(t("goal.executions"))+'</h3><span class="meta">'+execs.length+'</span></div>'+(items?'<div class="timeline-list">'+items+'</div>':'<div class="empty">'+esc(t("misc.noData"))+'</div>')+
    '<details style="margin-top:12px"><summary>'+esc(t("report.raw"))+'</summary><pre>'+esc(JSON.stringify({plans:data.plans||[],executions:execs,verifications:vers,audit:audit.slice(0,40)},null,2))+'</pre></details>'
}

function showView(view,jump){
  state.view=view;
  const views=document.querySelectorAll(".view");
  for(let i=0;i<views.length;i++)views[i].classList.toggle("is-active",views[i].id==="view-"+view);
  const navs=document.querySelectorAll(".nav-item,[data-view]");
  for(let i=0;i<navs.length;i++){const v=navs[i].getAttribute("data-view");navs[i].classList.toggle("is-active",v===view)}
  const titles={overview:"nav.overview",decisions:"nav.decisions",goals:"nav.goals",agents:"nav.agents",reports:"nav.reports",finance:"nav.finance",goal:"goal.detail.title"};
  const title=document.getElementById("pageTitle"),sub=document.getElementById("pageSub");
  if(title)title.textContent=t(titles[view]||"nav.overview");
  if(sub)sub.textContent=t("top.sub");
  const side=document.getElementById("sidebar");if(side)side.classList.remove("is-open");
  if(jump&&window.scrollTo)window.scrollTo({top:0,behavior:"smooth"});
}
function go(view,id){
  const hash=id?("#/"+view+"/"+id):("#/"+view);
  if(location.hash!==hash)location.hash=hash;else route();
}
function route(){
  let raw=(location.hash||"").replace(/^#/,"");
  if(raw.charAt(0)==="/")raw=raw.slice(1);
  const parts=raw.split("/");
  const view=parts[0]||"overview";
  if(view==="goal"&&parts[1]){openGoal(parts[1],true);return}
  showView(["overview","decisions","goals","agents","reports","finance"].indexOf(view)>=0?view:"overview");
}

function applyLang(next){
  lang=next==="en"?"en":"ar";
  sessionStorage.setItem("sam_cc_lang",lang);
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==="ar"?"rtl":"ltr";
  const nodes=document.querySelectorAll("[data-i18n]");
  for(let i=0;i<nodes.length;i++){const key=nodes[i].getAttribute("data-i18n");nodes[i].textContent=t(key)}
  const phs=document.querySelectorAll("[data-i18n-ph]");
  for(let i=0;i<phs.length;i++){const key=phs[i].getAttribute("data-i18n-ph");phs[i].setAttribute("placeholder",t(key))}
  const buttons=document.querySelectorAll("[data-lang]");
  for(let i=0;i<buttons.length;i++)buttons[i].classList.toggle("is-active",buttons[i].getAttribute("data-lang")===lang)
  if(state.exec)renderAll();
  const title=document.getElementById("pageTitle");
  const map={overview:"nav.overview",decisions:"nav.decisions",goals:"nav.goals",agents:"nav.agents",reports:"nav.reports",finance:"nav.finance",goal:"goal.detail.title"};
  if(title)title.textContent=t(map[state.view]||"nav.overview");
}

async function recallOwnerMemory(){
  const generation=authGeneration;
  try{
    const q=document.getElementById("memory-query");
    const x=await api("/api/owner-memory?query="+encodeURIComponent(q?q.value:""));
    if(generation!==authGeneration)return;
    const out=document.getElementById("owner-memory-results");
    if(out)out.textContent=JSON.stringify(x.data,null,2);
    setErr("memory-error","");
  }catch(e){if(generation!==authGeneration)return;setErr("memory-error",e.message)}
}
let ownerDecisionKey=null;
async function saveOwnerMemory(){
  const generation=authGeneration;
  try{
    const approved=document.getElementById("memory-approved");
    if(!approved||!approved.checked)throw Error("Explicit owner approval is required.");
    if(!ownerDecisionKey)ownerDecisionKey=crypto.randomUUID();
    const body={statement:document.getElementById("memory-statement").value,context_key:document.getElementById("memory-context").value,source:document.getElementById("memory-source").value,source_timestamp:document.getElementById("memory-date").value,idempotency_key:ownerDecisionKey,approved:true};
    const x=await api("/api/owner-memory",{method:"POST",body:JSON.stringify(body)});
    if(generation!==authGeneration)return;
    const out=document.getElementById("owner-memory-results");
    if(out)out.textContent=JSON.stringify(x.data,null,2);
    ownerDecisionKey=null;
    document.getElementById("memory-statement").value="";
    document.getElementById("memory-approved").checked=false;
    setErr("memory-error","Saved with explicit approval, source and date.");
  }catch(e){if(generation!==authGeneration)return;setErr("memory-error",e.message)}
}
function renderInternalNotifications(data){
  const target=document.getElementById("notifications-results");if(!target)return;
  target.textContent="";
  const visible=(data.records||[]).filter(function(item){return item.status!=="SUPPRESSED"});
  const meaning=document.createElement("p");meaning.className="muted";
  meaning.textContent="Internal polling only; no external delivery. "+(visible.length?"":"No visible notifications.");
  target.appendChild(meaning);
  visible.forEach(function(item){
    const card=document.createElement("div"),pre=document.createElement("pre");
    pre.textContent=JSON.stringify({id:item.id,title:item.title,body:item.body,status:item.status,readReceipt:item.readReceipt},null,2);
    card.appendChild(pre);
    if(!item.readReceipt&&(document.body.dataset.readOnly!=="true"||document.body.dataset.isolatedNotification===item.id)){
      const button=document.createElement("button");button.className="btn small";button.textContent="Mark read internally";
      button.onclick=function(){acknowledgeInternalNotification(item.id)};card.appendChild(button);
    }
    target.appendChild(card);
  });
}
async function refreshInternalNotifications(){
  const generation=authGeneration;
  try{
    const x=await api("/api/notifications");
    if(generation!==authGeneration)return;
    renderInternalNotifications(x.data);
    setErr("notifications-error","");
  }catch(e){if(generation!==authGeneration)return;setErr("notifications-error",e.message)}
}
async function pollInternalNotifications(){
  const generation=authGeneration;
  try{
    const x=await api("/api/notifications/poll",{method:"POST",body:"{}"});
    if(generation!==authGeneration)return;
    renderInternalNotifications(x.data);
    setErr("notifications-error","Internal notifications enabled from this first explicit poll. No historical replay or external delivery.");
  }catch(e){if(generation!==authGeneration)return;setErr("notifications-error",e.message)}
}
async function acknowledgeInternalNotification(id){
  const generation=authGeneration;
  try{await api("/api/notifications/"+encodeURIComponent(id)+"/ack",{method:"POST",body:"{}"});if(generation!==authGeneration)return;await refreshInternalNotifications()}
  catch(e){if(generation!==authGeneration)return;setErr("notifications-error",e.message)}
}
async function createGoal(){
  if(document.body.dataset.readOnly==="true")return;
  const generation=authGeneration;
  setErr("formError","");
  try{
    const body={objective:document.getElementById("objective").value,domain:document.getElementById("domain").value,authority_ceiling:document.getElementById("authority").value,priority:Number(document.getElementById("priority").value)};
    const acceptance=document.getElementById("acceptance").value.trim();
    if(acceptance)body.acceptance_contract=JSON.parse(acceptance);
    const x=await api("/api/goals",{method:"POST",body:JSON.stringify(body)});
    if(generation!==authGeneration)return;
    document.getElementById("objective").value="";
    await refresh();
    if(generation!==authGeneration)return;
    openGoal(x.data.id,false);
  }catch(e){if(generation!==authGeneration)return;setErr("formError",e.message)}
}

function boot(){
  applyLang(lang);
  const navs=document.querySelectorAll("[data-view]");
  for(let i=0;i<navs.length;i++){(function(el){el.addEventListener("click",function(){go(el.getAttribute("data-view"))})})(navs[i])}
  const links=document.querySelectorAll("[data-nav]");
  for(let i=0;i<links.length;i++){(function(el){el.addEventListener("click",function(ev){ev.preventDefault();go(el.getAttribute("data-nav"))})})(links[i])}
  const langBtns=document.querySelectorAll("[data-lang]");
  for(let i=0;i<langBtns.length;i++){(function(el){el.addEventListener("click",function(){applyLang(el.getAttribute("data-lang"))})})(langBtns[i])}
  const reload=document.getElementById("reloadBtn");if(reload)reload.addEventListener("click",function(){refresh()});
  const briefRefresh=document.getElementById("brief-refresh");if(briefRefresh)briefRefresh.addEventListener("click",function(){loadBriefing(true)});
  const menu=document.getElementById("menuBtn");if(menu)menu.addEventListener("click",function(){const s=document.getElementById("sidebar");if(s)s.classList.toggle("is-open")});
  const search=document.getElementById("goalSearch");if(search)search.addEventListener("input",function(){state.query=search.value;renderGoalList()});
  const filter=document.getElementById("goalFilter");if(filter)filter.addEventListener("change",function(){state.filter=filter.value;renderGoalList()});
  const createToggle=document.querySelector("[data-toggle-create]");if(createToggle)createToggle.addEventListener("click",function(){const w=document.getElementById("create-wrap");if(w)w.hidden=!w.hidden});
  window.addEventListener("hashchange",route);
  route();
  refresh();
  setInterval(refresh,15000);
}
if(document.body&&document.body.dataset&&document.body.dataset.samShell==="2"){boot()}
</script>`;
}
