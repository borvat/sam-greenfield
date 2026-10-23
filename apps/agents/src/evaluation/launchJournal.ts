import {open,mkdir,lstat,readFile} from 'node:fs/promises';
import {constants} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawn} from 'node:child_process';
import type {LaunchEvent,LaunchJournal} from './operatorLaunch';
// The helper owns the inherited open file description. flock's subprocess locks
// that same description. Both parent and keeper retain it, so unexpected keeper
// death cannot release exclusivity before the parent observes lease loss. Parent
// death closes stdin; the keeper exits and releases the final descriptor.
const keeper=`const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const r=spawnSync('/usr/bin/flock',['--exclusive','--nonblock','--conflict-exit-code','73','3'],{stdio:['ignore','ignore','ignore',3]});
if(r.status!==0)process.exit(r.status===73?73:74);
fs.ftruncateSync(3,0);fs.writeFileSync(3,JSON.stringify({pid:process.ppid,keeperPid:process.pid,host:require('node:os').hostname()}));fs.fsyncSync(3);
process.stdin.resume();process.stdin.once('end',()=>process.exit(0));process.stdout.write('LOCKED\\n');`;
/** Linux local-filesystem operator journal. The lock inode is never unlinked or
 * reclaimed. Kernel exclusion, not stale PID metadata, determines ownership. */
export async function openLaunchJournal(directory:string,recovery=false){
 const dir=resolve(directory);if(!recovery)await mkdir(dir,{mode:0o700});
 const stat=await lstat(dir);if(!stat.isDirectory()||stat.isSymbolicLink())throw Error('LAUNCH_JOURNAL_DIRECTORY_INVALID');
 const lock=join(dir,'operator.lock'),file=join(dir,'events.jsonl');
 const fd=await open(lock,constants.O_CREAT|constants.O_RDWR|constants.O_NOFOLLOW,0o600);
 let child:ReturnType<typeof spawn>;
 try{child=spawn(process.execPath,['-e',keeper],{stdio:['pipe','pipe','ignore',fd.fd]});}catch(e){await fd.close();throw e;}
 const lease=new AbortController();let closing=false,closed=false;
 const exited=new Promise<void>(resolve=>child.once('close',()=>{closed=true;lease.abort();resolve();}));
 try{await new Promise<void>((accept,reject)=>{
  let text='';const timer=setTimeout(()=>{child.kill('SIGKILL');reject(Error('LAUNCH_FILE_LOCK_UNAVAILABLE'));},5000);
  child.once('error',()=>{clearTimeout(timer);reject(Error('LAUNCH_FILE_LOCK_UNAVAILABLE'));});
  child.once('exit',code=>{clearTimeout(timer);reject(Error(code===73?'LAUNCH_OPERATOR_ACTIVE':'LAUNCH_FILE_LOCK_UNAVAILABLE'));});
  child.stdout!.on('data',chunk=>{text+=chunk;if(text==='LOCKED\n'){clearTimeout(timer);accept();}});
 });}catch(e){child.stdin!.end();if(!closed)child.kill('SIGKILL');await exited;await fd.close();throw e;}
 const active=()=>{if(closing||closed||lease.signal.aborted)throw Error('LAUNCH_JOURNAL_LEASE_LOST');};
 const pending=new Set<Promise<unknown>>();
 const tracked=async<T>(fn:()=>Promise<T>):Promise<T>=>{active();const result=fn();pending.add(result);void result.then(()=>pending.delete(result),()=>pending.delete(result));return result;};
 const journal:LaunchJournal={signal:lease.signal,
  read(){return tracked(async()=>{active();let content:string;try{content=await readFile(file,'utf8');}catch(e){if((e as any).code==='ENOENT')return [];throw e;}
   active();if(Buffer.byteLength(content)>1024*1024||!content.endsWith('\n'))throw Error('LAUNCH_JOURNAL_INVALID');
   return content.trim().split('\n').map(line=>JSON.parse(line) as LaunchEvent);
  });},
  append(event){return tracked(async()=>{active();const handle=await open(file,constants.O_CREAT|constants.O_APPEND|constants.O_WRONLY|constants.O_NOFOLLOW,0o600);
   try{active();await handle.writeFile(JSON.stringify(event)+'\n');await handle.sync();active();}finally{await handle.close();}});}
 };
 return {journal,async close(){if(closing){await exited;return;}closing=true;await Promise.allSettled([...pending]);child.stdin!.end();const timer=setTimeout(()=>child.kill('SIGKILL'),5000);try{await exited;}finally{clearTimeout(timer);await fd.close();}}};
}
