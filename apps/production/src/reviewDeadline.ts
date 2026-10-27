/** Cancellation reaches ModelTask.signal and the provider's fetch transport. */
export async function invokeReviewWithinDeadline<T>(invoke:(signal:AbortSignal)=>Promise<T>,deadlineMs:number,parent?:AbortSignal):Promise<T>{
 const controller=new AbortController();
 const signal=parent?AbortSignal.any([parent,controller.signal]):controller.signal;
 signal.throwIfAborted();
 let onAbort:()=>void=()=>{};
 const timer=setTimeout(()=>controller.abort(),deadlineMs);
 try{
  const cancelled=new Promise<never>((_,reject)=>{onAbort=()=>reject(Error('REVIEW_MODEL_DEADLINE'));signal.addEventListener('abort',onAbort,{once:true});});
  const result=await Promise.race([invoke(signal),cancelled]);
  signal.throwIfAborted();return result;
 }finally{clearTimeout(timer);signal.removeEventListener('abort',onAbort);controller.abort();}
}
