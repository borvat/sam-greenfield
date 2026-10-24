/** Startup provisioning for the NEW disposable local sandbox only. */
import {Client} from 'pg';
import {applyIntegrationProfile} from '../../packages/db/src/integrationProfile';
async function main(){
 const u=new URL(process.env.DATABASE_URL??'');
 if(u.hostname!=='127.0.0.1'||u.pathname!=='/sam_synthetic')throw Error('LOCAL_SANDBOX_REQUIRED');
 const c=new Client({connectionString:u.href});
 try{await c.connect();await applyIntegrationProfile(c);console.log('SANDBOX_INTEGRATION_PROFILE_APPLIED');}finally{await c.end();}
}
void main().catch(()=>{console.error('SANDBOX_PROFILE_FAILED');process.exitCode=1;});
