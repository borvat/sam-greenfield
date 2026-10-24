// Test-service lifecycle only. No renewal, role mutation or credential lookup.
const {performance}=require('node:perf_hooks');
function createStorageLease(remainingMs,onExpired,{now=()=>performance.now(),schedule=setTimeout,cancel=clearTimeout}={}){
 if(!Number.isFinite(remainingMs)||remainingMs<=2000||remainingMs>3600000||typeof onExpired!=='function')throw Error('STORAGE_WINDOW_INVALID');
 // Stop early enough for the sandbox's bounded 1500ms child shutdown.
 const deadline=now()+remainingMs-2000;let ended=false,timer;
 const expire=()=>{if(ended)return;ended=true;if(timer)cancel(timer);onExpired();};
 const expired=()=>{if(!ended&&now()>=deadline)expire();return ended;};
 timer=schedule(expire,remainingMs-2000);timer?.unref?.();
 return {expired,close(){if(timer)cancel(timer);ended=true;}};
}
module.exports={createStorageLease};
