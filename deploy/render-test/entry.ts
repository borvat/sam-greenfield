import {createRequire} from 'node:module';
import {openPersistentBinding} from './persistentBinding';
import {readFile,mkdtemp,writeFile,chmod} from 'node:fs/promises';
const require=createRequire(import.meta.url);
async function main(){
 const mode=process.env.SAM_TEST_STORAGE_PROFILE??'disposable';
 if(!['disposable','provisioned-postgres'].includes(mode))throw Error('TEST_STORAGE_PROFILE_INVALID');
 let bindingPath=process.env.SAM_TEST_RESTRICTED_CONFIG_PATH??'';
 // Render-managed Secret Files may be mounted as symlinks/read-only files.
 // Only this exact managed source is admitted; the existing private-file and
 // PostgreSQL principal checks still run on the owner-private materialization.
 if(mode==='provisioned-postgres'&&bindingPath==='/etc/secrets/sam-restricted-connection.json'){
  const data=await readFile(bindingPath);if(data.length<1||data.length>8192)throw Error('PRIVATE_BINDING_FILE_REQUIRED');
  const dir=await mkdtemp('/tmp/sam-bound-storage-');await chmod(dir,0o700);bindingPath=dir+'/restricted.json';
  await writeFile(bindingPath,data,{mode:0o600,flag:'wx'});
 }
 const storage=mode==='provisioned-postgres'?await openPersistentBinding(bindingPath):undefined;
 const {runSandbox}=require('./start.cjs');
 await runSandbox(storage?.binding,storage?.report,storage?storage.leaseDeadline-performance.now():undefined);
}
void main().catch(()=>{console.error('SAM_TEST_STORAGE_START_FAILED; no provisioning or live activation performed');process.exitCode=1;});
