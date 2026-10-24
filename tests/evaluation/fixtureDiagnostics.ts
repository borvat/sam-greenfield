/** Fixture-only progress diagnostics. Never logs parameters or response bodies. */
import {Client} from 'pg';
export function fixtureDiagnostics(label:string){
 let queries=0,pending=0,last='none';const original=Client.prototype.query;
 (Client.prototype as any).query=function(...args:any[]){
  queries++;pending++;last=String(args[0]?.text??args[0]).replace(/'(?:[^']|'')*'/g,'?').replace(/\s+/g,' ').slice(0,140);
  let result:any;try{result=(original as any).apply(this,args);}catch(e){pending--;throw e;}
  if(!result?.then){pending--;return result;}
  return result.then((value:any)=>{pending--;return value;},(error:any)=>{pending--;throw error;});
 };
 const timer=setInterval(()=>console.log(label+'_HEARTBEAT',JSON.stringify({queries,pending,last,rss:process.memoryUsage().rss})),5000);timer.unref();
}
