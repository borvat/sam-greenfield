import {createRequire} from 'node:module';
import {openPersistentBinding} from './persistentBinding';
const require=createRequire(import.meta.url);
async function main(){
 const mode=process.env.SAM_TEST_STORAGE_PROFILE??'disposable';
 if(!['disposable','provisioned-postgres'].includes(mode))throw Error('TEST_STORAGE_PROFILE_INVALID');
 const storage=mode==='provisioned-postgres'?await openPersistentBinding(process.env.SAM_TEST_RESTRICTED_CONFIG_PATH??''):undefined;
 const {runSandbox}=require('./start.cjs');
 await runSandbox(storage?.binding,storage?.report);
}
void main().catch(()=>{console.error('SAM_TEST_STORAGE_START_FAILED; no provisioning or live activation performed');process.exitCode=1;});
