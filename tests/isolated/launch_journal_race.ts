import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import {tmpdir,hostname} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {Script} from 'node:vm';
import ts from 'typescript';
import {openLaunchJournal} from '../../apps/agents/src/evaluation/launchJournal';
const require=createRequire(__filename);
const barrier=()=>{let release!:()=>void;const promise=new Promise<void>(r=>release=r);return {promise,release};};
async function stale(){const dir=await fs.mkdtemp(join(tmpdir(),'sam-journal-race-'));await fs.writeFile(join(dir,'operator.lock'),JSON.stringify({pid:2147483647,host:hostname()}),{mode:0o600});return dir;}

test('independent exact old-function reproduction: stale unlink replaces a live owner',async()=>{
 const dir=await stale(),path=join(dir,'operator.lock'),readers=barrier(),opened=barrier();let reads=0,unlinks=0,opens=0;
 const source=await fs.readFile('tests/fixtures/launchJournal-08369e4.ts.fixture','utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const scheduled={...fs,
  async readFile(p:any,...args:any[]){const result=await (fs.readFile as any)(p,...args);if(p===path){if(++reads===2)readers.release();await readers.promise;}return result;},
  async unlink(p:any){if(p===path&&++unlinks===2)await opened.promise;return fs.unlink(p);},
  async open(p:any,...args:any[]){const result=await (fs.open as any)(p,...args);if(p===path&&args[0]==='wx'&&++opens===1)opened.release();return result;}
 };
 const module={exports:{} as any};new Script('(function(require,module,exports){'+code+'\n})').runInThisContext()((name:string)=>name==='node:fs/promises'?scheduled:require(name),module,module.exports);
 const owners=await Promise.allSettled([module.exports.openLaunchJournal(dir,true),module.exports.openLaunchJournal(dir,true)]);
 try{assert.equal(owners.filter(o=>o.status==='fulfilled').length,2);console.log(JSON.stringify({case:'OLD_STALE_LOCK_RACE_REPRODUCED',sourceCommit:'08369e4e0d11b6cb0d22fc7596c82db18b59bd8c',sourceSha256:createHash('sha256').update(source).digest('hex'),concurrentOwners:2}));}
 finally{await Promise.allSettled(owners.filter(o=>o.status==='fulfilled').map(o=>(o as PromiseFulfilledResult<any>).value.close()));await fs.rm(dir,{recursive:true,force:true});}
});

test('two concurrent stale recoverers have exactly one kernel-lock owner; close never unlinks its successor',async()=>{
 for(let iteration=0;iteration<8;iteration++){
  const dir=await stale(),inode=(await fs.stat(join(dir,'operator.lock'))).ino;
  const attempts=await Promise.allSettled([openLaunchJournal(dir,true),openLaunchJournal(dir,true)]);
  const owners=attempts.filter(o=>o.status==='fulfilled') as PromiseFulfilledResult<Awaited<ReturnType<typeof openLaunchJournal>>>[];
  try{assert.equal(owners.length,1);assert.match(String((attempts.find(o=>o.status==='rejected') as PromiseRejectedResult).reason),/LAUNCH_OPERATOR_ACTIVE/);
   const owner=owners[0].value;await owner.close();await assert.rejects(owner.journal.read(),/LEASE_LOST/);
   const successor=await openLaunchJournal(dir,true);try{await owner.close();assert.equal((await fs.stat(join(dir,'operator.lock'))).ino,inode);await assert.rejects(openLaunchJournal(dir,true),/LAUNCH_OPERATOR_ACTIVE/);}finally{await successor.close();}
  }finally{await Promise.allSettled(owners.map(o=>o.value.close()));await fs.rm(dir,{recursive:true,force:true});}
 }
 console.log(JSON.stringify({case:'CONCURRENT_STALE_RECOVERY',iterations:8,ownersPerIteration:1,persistentInode:true}));
});

test('unexpected lock keeper death aborts the lease and fences further journal use',async()=>{
 const dir=await stale();const owner=await openLaunchJournal(dir,true);
 try{const keeper=JSON.parse(await fs.readFile(join(dir,'operator.lock'),'utf8'));assert.equal(keeper.pid,process.pid);assert(Number.isInteger(keeper.keeperPid));
  const aborted=new Promise<void>(r=>owner.journal.signal!.addEventListener('abort',()=>r(),{once:true}));process.kill(keeper.keeperPid,'SIGKILL');await aborted;
  await assert.rejects(owner.journal.append({phase:'INVALID',requestHash:'x',at:new Date().toISOString()}),/LEASE_LOST/);
  await assert.rejects(openLaunchJournal(dir,true),/LAUNCH_OPERATOR_ACTIVE/);await owner.close();
  const successor=await openLaunchJournal(dir,true);try{await owner.close();await assert.rejects(openLaunchJournal(dir,true),/LAUNCH_OPERATOR_ACTIVE/);}finally{await successor.close();}
 }finally{await owner.close();await fs.rm(dir,{recursive:true,force:true});}
});
