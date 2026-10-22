// Local test instrumentation only. Never imported by a goal or release service.
const fs=require("node:fs");
const {execFileSync}=require("node:child_process");
const {performance}=require("node:perf_hooks");
const ticksPerSecond=Number(execFileSync("getconf",["CLK_TCK"],{encoding:"utf8"}).trim());
if(!Number.isFinite(ticksPerSecond)||ticksPerSecond<=0)throw new Error("PROFILE_CLOCK_UNAVAILABLE");
function snapshot(pids){
  let cpuSeconds=0,rssMiB=0,sumHighWaterMiB=0;
  for(const pid of pids){
    if(!Number.isSafeInteger(pid)||pid<1)throw new Error("PROFILE_PID_INVALID");
    const stat=fs.readFileSync(`/proc/${pid}/stat`,"utf8");
    const fields=stat.slice(stat.lastIndexOf(")")+2).trim().split(/\s+/);
    const status=fs.readFileSync(`/proc/${pid}/status`,"utf8");
    const read=name=>{
      const match=status.match(new RegExp(`^${name}:\\s+(\\d+) kB$`,"m"));
      if(!match)throw new Error("PROFILE_MEMORY_UNAVAILABLE");
      return Number(match[1])/1024;
    };
    cpuSeconds+=(Number(fields[11])+Number(fields[12]))/ticksPerSecond;
    rssMiB+=read("VmRSS");sumHighWaterMiB+=read("VmHWM");
  }
  if(![cpuSeconds,rssMiB,sumHighWaterMiB].every(Number.isFinite))throw new Error("PROFILE_SAMPLE_INVALID");
  return {atMs:performance.now(),cpuSeconds,rssMiB,sumHighWaterMiB};
}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function measureIdle({supervisor,base,token,before,seconds=12}){
  const pids=[process.pid,...[...supervisor.state.values()].map(s=>s.child?.pid)];
  const start=snapshot(pids);
  const monitor=async()=>{
    const r=await fetch(base+"/_sam/status",{headers:{authorization:"Bearer "+token},signal:AbortSignal.timeout(2000)});
    if(!r.ok)throw new Error("PROFILE_MONITOR_UNAVAILABLE");
    const v=await r.json();
    if(!v.worker||v.worker.errors||v.worker.dependencyFailures||v.components.some(c=>!c.running||c.restarts))
      throw new Error("PROFILE_WORKER_UNHEALTHY");
    return v.worker;
  };
  const workerBefore=await monitor();
  let previous=start,peakRssMiB=start.rssMiB,peakCpuCores=0,samples=0;
  while(performance.now()-start.atMs<seconds*1000){
    await pause(250);
    if(pids.slice(1).some((pid,i)=>pid!==[...supervisor.state.values()][i].child?.pid))
      throw new Error("PROFILE_PROCESS_RESTARTED");
    const current=snapshot(pids),duration=(current.atMs-previous.atMs)/1000;
    const cpu=(current.cpuSeconds-previous.cpuSeconds)/duration;
    if(cpu<0)throw new Error("PROFILE_CPU_COUNTER_RESET");
    peakCpuCores=Math.max(peakCpuCores,cpu);peakRssMiB=Math.max(peakRssMiB,current.rssMiB);
    previous=current;samples++;
  }
  const workerAfter=await monitor();
  if(workerAfter.ticks<=workerBefore.ticks)throw new Error("PROFILE_NO_HEARTBEAT_PROGRESS");
  const duration=(previous.atMs-start.atMs)/1000;
  let quota="UNKNOWN";try{quota=fs.readFileSync("/sys/fs/cgroup/cpu.max","utf8").trim();}catch{}
  return {
    classification:"LOCAL_NATIVE_RELEASE_FACTORY_IDLE_SYNTHETIC_NOT_PRODUCTION_LOAD",
    checkedAt:new Date().toISOString(),sampleCount:samples,durationSeconds:duration,
    processCount:pids.length,parentIsTestHarness:true,postgresMemoryIncluded:false,
    startupSeconds:(start.atMs-before.atMs)/1000,startupCpuSeconds:start.cpuSeconds-before.cpuSeconds,
    steadyCpuSeconds:previous.cpuSeconds-start.cpuSeconds,
    steadyAverageCpuCores:(previous.cpuSeconds-start.cpuSeconds)/duration,
    sampledPeakCpuCores:peakCpuCores,peakRssMiB,
    sumPerProcessMemoryHighWaterMiB:previous.sumHighWaterMiB,
    cgroupCpuMax:quota,nodeVersion:process.version,
    workerTicksAdvanced:workerAfter.ticks-workerBefore.ticks,workerErrors:workerAfter.errors,
    externalModelCalls:0,externalBusinessCalls:0,
    entrypointFullProductionStart:"NOT_RUN_NATIVE_GUARDS_PRESERVED",
    vmCapacityAcceptance:"NOT_PROVEN_NO_QUOTA_OR_BUSINESS_LOAD_TEST"
  };
}
module.exports={snapshot,measureIdle};
