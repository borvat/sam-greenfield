export interface WorkerHeartbeat {
  startedAt?:string|null;lastStartedAt?:string|null;lastFinishedAt?:string|null;
  ticks?:number;errors?:number;dependencyFailures?:number;inFlight?:boolean;
}
export interface LocalAlert {code:string;severity:"WARN"|"ERROR";action:string}
export const FLASH_PEAK_TARIFF={
  inputPerMillionUsd:0.3,outputPerMillionUsd:1.2,verifiedOn:"2026-10-09",
  source:"https://api-docs.deepseek.com/quick_start/pricing",
  basis:"PEAK_CACHE_MISS_UPPER_ESTIMATE_NOT_INVOICE"
} as const;
const flashModels=new Set(["deepseek-flash","deepseek-v4-flash","deepseek-v4-flash-vision-exp"]);
function safeTime(s:unknown):string|null{
  return typeof s==="string"&&/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(s)&&Number.isFinite(Date.parse(s))?s:null;
}
function count(n:unknown):number{return typeof n==="number"&&Number.isSafeInteger(n)&&n>=0?n:0;}
export function projectHeartbeat(raw:WorkerHeartbeat,now=Date.now()){
  const lastFinishedAt=safeTime(raw.lastFinishedAt),lastStartedAt=safeTime(raw.lastStartedAt),startedAt=safeTime(raw.startedAt);
  const timestamp=lastFinishedAt??startedAt;
  const ageSeconds=timestamp?Math.max(0,(now-Date.parse(timestamp))/1000):null;
  return {startedAt,lastStartedAt,lastFinishedAt,ageSeconds,ticks:count(raw.ticks),errors:count(raw.errors),
    dependencyFailures:count(raw.dependencyFailures),inFlight:raw.inFlight===true,
    inFlightSeconds:raw.inFlight===true&&lastStartedAt?Math.max(0,(now-Date.parse(lastStartedAt))/1000):0};
}
export function estimateScopedUsage(rows:{model:string;input_tokens:number|null;output_tokens:number|null;reasoning_tokens:number|null;http_status:number}[]){
  let inputTokens=0,outputTokens=0,reasoningTokens=0,unknownUsage=0,unpriced=0,authRejected=0,rateLimited=0,estimate=0;
  for(const row of rows){
    if(row.http_status===401||row.http_status===403)authRejected++;
    if(row.http_status===429)rateLimited++;
    if(!Number.isSafeInteger(row.input_tokens)||!Number.isSafeInteger(row.output_tokens)||
      row.input_tokens===null||row.output_tokens===null||row.input_tokens<0||row.output_tokens<0){unknownUsage++;continue;}
    inputTokens+=row.input_tokens;outputTokens+=row.output_tokens;
    if(Number.isSafeInteger(row.reasoning_tokens)&&row.reasoning_tokens!==null&&row.reasoning_tokens>=0)reasoningTokens+=row.reasoning_tokens;
    // Reasoning is a subset of completion tokens; never charge it a second time.
    if(!flashModels.has(row.model)){unpriced++;continue;}
    estimate+=(row.input_tokens*FLASH_PEAK_TARIFF.inputPerMillionUsd+row.output_tokens*FLASH_PEAK_TARIFF.outputPerMillionUsd)/1e6;
  }
  return {requests:rows.length,inputTokens,outputTokens,reasoningTokens,unknownUsage,unpriced,
    authRejected,rateLimited,estimatedUpperUsd:unknownUsage||unpriced?null:Number(estimate.toFixed(9)),
    knownPortionEstimatedUpperUsd:Number(estimate.toFixed(9)),billedUsd:null,tariff:FLASH_PEAK_TARIFF};
}
export function localAlerts(input:{
  heartbeat:ReturnType<typeof projectHeartbeat>;ready:number;oldestReadySeconds:number;failed:number;
  expiredLeases:number;provider:ReturnType<typeof estimateScopedUsage>|null;receiptsTruncated?:boolean;
},limits={heartbeatSeconds:45,stuckQueueSeconds:120,maxActSeconds:300}):LocalAlert[]{
  const alerts:LocalAlert[]=[];
  const add=(code:string,severity:LocalAlert["severity"],action:string)=>alerts.push({code,severity,action});
  if(input.heartbeat.ageSeconds===null||input.heartbeat.ageSeconds>limits.heartbeatSeconds)
    add("WORKER_HEARTBEAT_STALE","ERROR","Check the worker process and dependency readiness; do not replay work blindly.");
  if(input.heartbeat.inFlightSeconds>limits.maxActSeconds)
    add("ACT_STALLED","ERROR","Inspect the bounded operation deadline and lease; preserve fencing before recovery.");
  if(input.heartbeat.dependencyFailures>0)add("WORKER_DEPENDENCY_FAILURE","WARN","Inspect database readiness and the last safe failure code.");
  if(input.heartbeat.errors>0)add("WORKER_TICK_FAILED","WARN","Review the sanitized worker failure class; preserve authorization before retrying.");
  if(input.ready>0&&input.oldestReadySeconds>limits.stuckQueueSeconds)
    add("QUEUE_STUCK","WARN","Inspect due work, authorization and worker heartbeat; do not bypass goal guards.");
  if(input.expiredLeases>0)add("LEASE_EXPIRED","WARN","Use native recovery and fencing; do not extend or duplicate the operation manually.");
  if(input.failed>0)add("WORK_FAILED","WARN","Review sanitized execution/verification evidence before any separately authorized retry.");
  if(!input.provider)add("PROVIDER_USAGE_NOT_AVAILABLE","WARN","Install an approved scoped receipt contract before enabling a provider.");
  if(input.provider?.authRejected)add("PROVIDER_AUTH_REJECTED","ERROR","Check the credential through the secrets UI; do not retry a paid request automatically.");
  if(input.provider?.rateLimited)add("PROVIDER_RATE_LIMITED","WARN","Review limits and authorization before any new request.");
  if(input.provider&&(input.provider.unknownUsage||input.provider.unpriced))
    add("COST_UNKNOWN","WARN","Verify token receipts and official tariff; missing cost is not zero.");
  if(input.receiptsTruncated)add("USAGE_WINDOW_TRUNCATED","WARN","Reconcile the complete scoped ledger before relying on the cost total.");
  return alerts;
}
