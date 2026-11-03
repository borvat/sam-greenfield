import { Pool } from 'pg';
import { createPublicKey } from 'node:crypto';
import { authenticateSamModelToken } from '../../packages/ai-infrastructure/src/samIdentity';
import { PostgresModelLedger } from '../../packages/ai-infrastructure/src/durableLedger';

// Synthetic test material arrives only on private IPC, never argv/env/logs.
process.once('message',async(message:any)=>{
  try {
    const pool=new Pool({connectionString:message.url});
    const config={...message.config,keys:new Map([['fixture',createPublicKey(message.publicKeyPem)]])};
    const identity=authenticateSamModelToken(message.token,config),ledger=new PostgresModelLedger(pool);
    const ticket=await ledger.reserve({identity,context:message.context},message.task,{providerId:'deepseek',model:'requested-model'});
    if(message.phase==='after-send'){
      await ledger.dispatch(ticket);
      const url=new URL(message.syntheticEndpoint);
      if(url.hostname!=='127.0.0.1'||url.protocol!=='http:')throw Error('SYNTHETIC_ENDPOINT_REQUIRED');
      await fetch(url,{method:'POST',body:'synthetic provider request'});
    }
    process.send?.({phase:message.phase,id:ticket.id});
    setInterval(()=>{},1000); // Parent SIGKILLs after committed checkpoint.
  } catch { process.send?.({error:'DURABLE_CRASH_FIXTURE_FAILED'});process.exitCode=1; }
});
