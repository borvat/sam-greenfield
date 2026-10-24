/** Run with node --import tsx on the authorized test host; restricted connection only. */
const {writeFile,open}=require('node:fs/promises');
const {constants}=require('node:fs');
const {isAbsolute}=require('node:path');
const {Client}=require('pg');
const {collectCheckpoint,compareCheckpoint}=require('./storageCheckpoint.cjs');
async function main(){
 const [mode,goalId,file,...extra]=process.argv.slice(2);
 if(!['capture','compare'].includes(mode)||!goalId||!file||!isAbsolute(file)||extra.length)throw Error('CHECKPOINT_ARGUMENTS_REQUIRED');
 const {openPersistentBinding}=await import('./persistentBinding.ts');
 const storage=await openPersistentBinding(process.env.SAM_TEST_RESTRICTED_CONFIG_PATH??'');
 const c=new Client({connectionString:storage.binding.connectionString,connectionTimeoutMillis:5000,statement_timeout:10000});
 try{
  await c.connect();await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  const current=await collectCheckpoint(c,goalId,storage.binding.entity);
  await c.query('ROLLBACK');
  if(mode==='capture'){
   await writeFile(file,JSON.stringify(current),{mode:0o600,flag:'wx'});
   console.log(JSON.stringify({status:'CAPTURED',scope:'SELECTED_SYNTHETIC_GOAL',notFullBackup:true}));
  }else{
   const handle=await open(file,constants.O_RDONLY|constants.O_NOFOLLOW);
   try{
    const stat=await handle.stat();
    if(!stat.isFile()||(stat.mode&0o077)!==0||stat.uid!==process.getuid?.()||stat.size>16384)throw Error('PRIVATE_CHECKPOINT_REQUIRED');
    const before=JSON.parse(await handle.readFile('utf8'));
    console.log(JSON.stringify(compareCheckpoint(before,current)));
   }finally{await handle.close();}
  }
 }finally{await c.end();}
}
void main().catch(()=>{console.error('STORAGE_CHECKPOINT_FAILED; details withheld');process.exitCode=1;});
