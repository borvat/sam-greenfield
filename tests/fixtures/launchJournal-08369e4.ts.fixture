import {open,mkdir,lstat,readFile,unlink} from 'node:fs/promises';
import {constants} from 'node:fs';
import {hostname} from 'node:os';
import {join,resolve} from 'node:path';
import type {LaunchEvent,LaunchJournal} from './operatorLaunch';
/** Local operator journal, not a runtime database privilege. One writer; durable
 * intent records. Recovery can reclaim only a proven dead local process lock. */
export async function openLaunchJournal(directory:string,recovery=false){
 const dir=resolve(directory);if(!recovery)await mkdir(dir,{mode:0o700});
 const stat=await lstat(dir);if(!stat.isDirectory()||stat.isSymbolicLink())throw Error('LAUNCH_JOURNAL_DIRECTORY_INVALID');
 const lock=join(dir,'operator.lock'),file=join(dir,'events.jsonl');
 if(recovery){
  let owner:any;try{owner=JSON.parse(await readFile(lock,'utf8'));}catch(e){if((e as any).code!=='ENOENT')throw Error('LAUNCH_LOCK_INVALID');}
  if(owner){
   if(owner.host!==hostname()||!Number.isSafeInteger(owner.pid)||owner.pid<=0)throw Error('LAUNCH_LOCK_UNVERIFIED');
   try{process.kill(owner.pid,0);throw Error('LAUNCH_OPERATOR_ACTIVE');}catch(e){if((e as any).code!=='ESRCH')throw e;}
   await unlink(lock);
  }
 }
 const handle=await open(lock,'wx',0o600);await handle.writeFile(JSON.stringify({pid:process.pid,host:hostname()}));await handle.sync();
 const journal:LaunchJournal={
  async read(){let content:string;try{content=await readFile(file,'utf8');}catch(e){if((e as any).code==='ENOENT')return [];throw e;}
   if(Buffer.byteLength(content)>1024*1024||!content.endsWith('\n'))throw Error('LAUNCH_JOURNAL_INVALID');
   return content.trim().split('\n').map(line=>JSON.parse(line) as LaunchEvent);
  },
  async append(event){const fd=await open(file,constants.O_CREAT|constants.O_APPEND|constants.O_WRONLY|constants.O_NOFOLLOW,0o600);
   try{await fd.writeFile(JSON.stringify(event)+'\n');await fd.sync();}finally{await fd.close();}}
 };
 return {journal,async close(){await handle.close();await unlink(lock);}};
}
