/** Local native-Postgres fixture only. No model, provider or ambient connection. */
import {openPersistentBinding} from '../../deploy/render-test/persistentBinding';
async function main(){
 const {binding}=await openPersistentBinding(process.argv[2]);
 const u=new URL(binding.connectionString);if(u.hostname!=='127.0.0.1'||u.pathname!=='/sam_core_test')throw Error('LOCAL_TEST_ONLY');
 process.env.DATABASE_URL=binding.connectionString;process.env.SAM_COMMAND_CENTER_READ_ONLY='1';process.env.SAM_REQUIRE_GOAL_ACCEPTANCE='1';
 const {startCommandCenterHttpServer}=await import('../../apps/command-center/src/http');
 const server=await startCommandCenterHttpServer({legalEntityId:binding.entity,host:'127.0.0.1',port:0,bearerToken:'local-fixture-unused-externally',allowedHosts:'127.0.0.1'});
 const addr=server.server.address();if(!addr||typeof addr==='string')throw Error('LOCAL_SERVER_REQUIRED');
 console.log(JSON.stringify({ready:true,port:addr.port}));
}
void main().catch(()=>{console.error('PERSISTENCE_CHILD_FAILED');process.exitCode=1;});
