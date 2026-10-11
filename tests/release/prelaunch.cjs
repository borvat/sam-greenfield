// Offline evidence gate ONLY; cannot start services, connect to DB, grant access,
// generate credentials or authorize Publish. Native runtime guards remain intact.
const {validateRelease}=require("../../scripts/release/contract.cjs");
const required=[
  "db_identity","app_login_nonowner_nonbypass","migration_compatibility",
  "tenant_rls_negative_tests","least_privilege_acl","single_public_port",
  "host_origin","capability_allowlist","backup_restore","retention_rpo_rto",
  "monitoring_stop_controls","spending_caps","security_review","frozen_build_acceptance"
];
const settings=[
  "DATABASE_URL","SAM_DB_APP_ROLE","SAM_DB_SCHEMA","SAM_RELEASE_ORG_ID",
  "SAM_COMMAND_CENTER_LEGAL_ENTITY_ID","SAM_COMMAND_CENTER_BEARER_TOKEN",
  "SAM_COMMAND_CENTER_ALLOWED_HOSTS","SAM_COMMAND_CENTER_ALLOWED_ORIGINS",
  "SAM_PRODUCTION_BUNDLE_MODULE","SAM_RELEASE_CAPABILITIES"
];
function evaluate({env,source,records,approvedSourceSha,now=Date.now()}){
  const gates=[];
  const add=(gate,passed,reason)=>gates.push({gate,status:passed?"PASS":"BLOCKED",reason});
  add("source_sha",/^[0-9a-f]{40}$/.test(source.sha)&&source.sha===approvedSourceSha,"OWNER_APPROVED_EXACT_SHA_REQUIRED");
  add("source_clean",source.clean===true,"CLEAN_TREE_REQUIRED");
  add("github_sync",source.remoteSha===source.sha,"DIRECT_REMOTE_SHA_MATCH_REQUIRED");
  for(const key of settings){
    const value=key==="DATABASE_URL"&&env.SAM_RELEASE_DATABASE_URL!==undefined?
      env.SAM_RELEASE_DATABASE_URL:env[key];
    add("required_setting:"+key,typeof value==="string"&&value.trim().length>0,"PRESENCE_ONLY_NOT_PRODUCTION_TARGET_APPROVAL");
  }
  let nativeCode="PASS";
  try{validateRelease(env);}catch(e){
    nativeCode=/^RELEASE_[A-Z0-9_]+$/.test(e.message)?e.message:"RELEASE_CONFIG_REFUSED";
  }
  add("native_release_config",nativeCode==="PASS",nativeCode);
  const keys=Object.keys(records??{});
  add("evidence_schema",keys.every(k=>required.includes(k)),"UNKNOWN_EVIDENCE_FIELDS_REJECTED");
  const declarationChecks=[];
  for(const gate of required){
    const r=records?.[gate];
    const age=r?now-Date.parse(r.checkedAt):NaN;
    const passed=r?.status==="PASS"&&r?.classification==="LIVE_REVIEWED"&&
      r?.sourceSha===source.sha&&r?.ownerReviewed===true&&
      typeof r?.reference==="string"&&/^[a-zA-Z0-9_./-]{1,200}$/.test(r.reference)&&
      !r.reference.includes("..")&&Number.isFinite(age)&&age>=0&&age<=24*60*60*1000;
    declarationChecks.push(passed);
    // A manifest cannot turn its own LIVE label into an independent DB/restore/
    // acceptance observation. This preparation CLI deliberately has no such
    // authorized connection; even well-formed declarations cannot unblock it.
    add(gate,false,passed?"DECLARATION_VALID_INDEPENDENT_VERIFICATION_REQUIRED":
      "RECENT_OWNER_REVIEWED_LIVE_EVIDENCE_FOR_EXACT_BUILD_REQUIRED");
  }
  return {
    status:"BLOCKED",
    declarationsComplete:declarationChecks.every(Boolean)&&
      gates.filter(g=>!required.includes(g.gate)).every(g=>g.status==="PASS"),
    classification:"OFFLINE_CHECKLIST_NOT_INDEPENDENT_PRODUCTION_DB_PROOF",
    publishAuthorized:false,servicesStarted:0,databaseConnections:0,
    secretValuesPrinted:false,gates,
    limitation:"Evidence references/owner attestations are not proof. Even complete declarations remain BLOCKED until independent production verification is separately authorized and performed."
  };
}
module.exports={evaluate,required,settings};
if(require.main===module){
  const fs=require("node:fs"),{execFileSync}=require("node:child_process");
  const git=a=>execFileSync("git",a,{encoding:"utf8",timeout:15000,env:{...process.env,GIT_TERMINAL_PROMPT:"0"}}).trim();
  const sha=git(["rev-parse","HEAD"]);
  let remoteSha=null;try{remoteSha=git(["ls-remote","origin","refs/heads/main"]).split(/\s+/)[0];}catch{}
  const manifest=JSON.parse(fs.readFileSync("docs/release/pilot-requirements.json","utf8"));
  const result=evaluate({env:process.env,source:{sha,remoteSha,clean:git(["status","--porcelain"])===""},
    approvedSourceSha:manifest.approvedSourceSha,records:manifest.records});
  console.log(JSON.stringify({checkedAt:new Date().toISOString(),sourceSha:sha,remoteSha,...result},null,2));
  process.exitCode=result.status==="BLOCKED"?2:0;
}
