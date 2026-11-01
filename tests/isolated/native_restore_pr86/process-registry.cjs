'use strict';
const {spawn}=require('node:child_process');
class ProcessRegistry{
 constructor(){this.entries=[];}
 spawn(command,args,options,label){
  const child=spawn(command,args,options),entry={child,label,pid:child.pid??null,closed:false,result:null};
  entry.completion=new Promise(resolve=>{child.once('error',()=>{entry.spawnError=true;});child.once('close',(code,signal)=>{entry.closed=true;entry.result={label,pid:entry.pid,exitCode:code,signal,spawnError:!!entry.spawnError};resolve(entry.result);});});
  this.entries.push(entry);return child;
 }
 entry(child){const found=this.entries.find(entry=>entry.child===child);if(!found)throw Error('UNREGISTERED_CHILD');return found;}
 async wait(child,ms){const entry=this.entry(child);let timer;try{return await Promise.race([entry.completion,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('REGISTERED_CHILD_WAIT_TIMEOUT')),ms);})]);}finally{clearTimeout(timer);}}
 async stop(child,graceMs=10000,killMs=5000){
  const entry=this.entry(child);if(entry.closed)return {...entry.result,escalated:!!entry.escalated};
  child.kill('SIGTERM');
  try{return {...await this.wait(child,graceMs),escalated:false};}
  catch(error){if(error.message!=='REGISTERED_CHILD_WAIT_TIMEOUT')throw error;entry.escalated=true;child.kill('SIGKILL');return {...await this.wait(child,killMs),escalated:true};}
 }
 async stopAll(graceMs=10000,killMs=5000){
  const results=[];for(const entry of [...this.entries].reverse())try{results.push(await this.stop(entry.child,graceMs,killMs));}catch{results.push({label:entry.label,pid:entry.pid,cleanup:'UNCONFIRMED_AFTER_SIGKILL',failed:true});}
  return {allRegisteredChildrenClosed:this.entries.every(entry=>entry.closed),children:results};
 }
}
module.exports={ProcessRegistry};
