import {z} from 'zod';
import {randomUUID,createHash} from 'node:crypto';
import {sha256Hex,stableStringify} from '../../shared/src/stableJson';

export const FREE_MODEL='poolside/laguna-s-2.1:free';
export type HermesRuntimePolicy=Readonly<{provider:'nous'|'deepseek';model:string;maxCostUsd:number}>;
export const FREE_RUNTIME:HermesRuntimePolicy=Object.freeze({provider:'nous',model:FREE_MODEL,maxCostUsd:0});
// Existing SAM per-request ceiling is 0.25; reserve 0.10 for the separate
// explicitly authorized connection check. This is not a free-model claim.
export const DEEPSEEK_RUNTIME:HermesRuntimePolicy=Object.freeze({provider:'deepseek',model:'deepseek-flash',maxCostUsd:0.15});
export const DEEPSEEK_GUARD_SHA256='dcc4d688be1bc3d0550354b2f59a840c406d670c3fc8d521287b6f67ade6c5f6';
export const taskSchema=z.object({
  task_id:z.uuid(),goal_id:z.uuid(),agent_role:z.enum(['programmer','code_reviewer','researcher','data_analyst','tester']),
  instructions:z.string().min(1).max(16000),allowed_tools:z.array(z.string()).max(0),
  repository_scope:z.array(z.string()).max(0),
  execution_budget:z.object({max_cost_usd:z.number().min(0).max(0.15),max_concurrency:z.literal(1)}).strict(),
  timeout:z.number().int().min(1000).max(120000),created_at:z.iso.datetime()
}).strict();
export type HermesTask=z.infer<typeof taskSchema>;
export type Receipt={taskHash:string;runId?:string;status:string;output?:string;runtime?:unknown};
export interface ReceiptStore {
  load():Promise<Receipt|undefined>;
  save(receipt:Receipt):Promise<void>;
  assertActive():Promise<void>;
}
export class HermesError extends Error {
  constructor(readonly code:string){super(code);this.name='HermesError';}
}
const runId=z.string().regex(/^run_[A-Za-z0-9_-]{1,160}$/);
const runSchema=z.object({run_id:runId,status:z.enum(['started','queued','pending','running','completed','failed','cancelled','interrupted','unknown','waiting_approval']),
  output:z.string().max(65536).optional(),runtime:z.unknown().optional()}).passthrough();
const terminal=new Set(['completed','failed','cancelled','interrupted','unknown']);
const measurementProcess=randomUUID();
export type HermesMeasurement={event:string;at:string;elapsed_ms:number;process_id:string;operation_id:string;
  task_id:string;goal_id:string;task_hash:string;session_id:string;work_created_at:string;absolute_deadline:string;
  run_id?:string;status?:string;attempt?:number;output_sha256?:string};
type MeasurementOptions={write:(event:HermesMeasurement)=>void;monotonic?:()=>number};

/** No caller-supplied tools, provider, URL, key, model, repository or permission fields.
 * This first admission supports a server-enforced EMPTY tool profile only. */
export class HermesClient {
  private base:URL;
  private selected:HermesRuntimePolicy;
  constructor(private config:{baseUrl:string;apiKey:string;assertServerPolicy:()=>Promise<void>;transport?:typeof fetch;pollMs?:number;clock?:()=>number;requireNativeModelLock?:boolean;measurement?:MeasurementOptions;runtimePolicy?:HermesRuntimePolicy}){
    const selected=config.runtimePolicy??FREE_RUNTIME;
    if(![FREE_RUNTIME,DEEPSEEK_RUNTIME].some(r=>r.provider===selected.provider&&r.model===selected.model&&r.maxCostUsd===selected.maxCostUsd))
      throw new HermesError('HERMES_RUNTIME_POLICY_DENIED');
    this.selected=Object.freeze({...selected});
    this.base=new URL(config.baseUrl);
    const local=['127.0.0.1','localhost','[::1]'].includes(this.base.hostname);
    if(this.base.username||this.base.password||this.base.search||this.base.hash||this.base.pathname!=='/'||
      !(this.base.protocol==='https:'||local&&this.base.protocol==='http:')||config.apiKey.length<32)
      throw new HermesError('HERMES_CONFIG_INVALID');
  }
  private now(){return (this.config.clock??Date.now)();}
  private async request(path:string,method='GET',body?:unknown,key?:string,deadline=this.now()+10000):Promise<any>{
    try{
      const response=await (this.config.transport??fetch)(new URL(path,this.base),{
        method,redirect:'error',signal:AbortSignal.timeout(Math.max(1,Math.min(10000,deadline-this.now()))),
        headers:{Authorization:`Bearer ${this.config.apiKey}`,'Content-Type':'application/json',...(key?{'Idempotency-Key':key}:{})},
        ...(body===undefined?{}:{body:stableStringify(body)})
      });
      if(!response.ok){await response.body?.cancel();throw new HermesError(`HERMES_HTTP_${response.status}`);}
      const reader=response.body?.getReader();if(!reader)throw new HermesError('HERMES_EMPTY_RESPONSE');
      const chunks:Uint8Array[]=[];let size=0;
      for(;;){const r=await reader.read();if(r.done)break;size+=r.value.length;
        if(size>131072){await reader.cancel();throw new HermesError('HERMES_RESPONSE_TOO_LARGE');}chunks.push(r.value);}
      return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    }catch(e){if(e instanceof HermesError)throw e;throw new HermesError('HERMES_TRANSPORT_UNCERTAIN');}
  }
  async preflight(){
    // Operator-side check must cover the effective runtime tools (including MCP),
    // pinned Nous free model, disabled fallback/routing, and server concurrency=1.
    // /v1/toolsets alone does not expose all those settings in Hermes 0.22.5.
    await this.config.assertServerPolicy();
    const caps=await this.request('/v1/capabilities');
    const f=caps?.features;
    if(caps?.auth?.required!==true||caps.auth.type!=='bearer'||f?.run_submission!==true||f.run_status!==true||f.run_stop!==true||
      f.runs_idempotency?.durable!==true||f.runs_idempotency.retention_seconds<86400)
      throw new HermesError('HERMES_REQUIRED_CAPABILITIES_MISSING');
    const tools=await this.request('/v1/toolsets');
    if(!Array.isArray(tools?.data)||tools.data.some((t:any)=>typeof t?.enabled!=='boolean'||t.enabled))
      throw new HermesError('HERMES_SERVER_TOOL_SCOPE_EXCESSIVE');
    return {durableIdempotency:true,serverTools:[]};
  }
  async status(id:string,deadline?:number){
    const run=runSchema.parse(await this.request(`/v1/runs/${runId.parse(id)}`,'GET',undefined,undefined,deadline));
    // Hermes' durable readback after gateway replacement nests the committed
    // served metadata under usage.runtime instead of the live top-level field.
    if(run.runtime===undefined&&typeof run.usage==='object'&&run.usage!==null&&'runtime' in run.usage)
      return {...run,runtime:run.usage.runtime};
    return run;
  }
  async stop(id:string){await this.request(`/v1/runs/${runId.parse(id)}/stop`,'POST',{});}
  async execute(raw:HermesTask,store:ReceiptStore):Promise<Receipt>{
    const parsed=taskSchema.safeParse(raw);if(!parsed.success)throw new HermesError('HERMES_TASK_SCOPE_DENIED');
    if(parsed.data.execution_budget.max_cost_usd!==this.selected.maxCostUsd)throw new HermesError('HERMES_TASK_BUDGET_DENIED');
    const task=parsed.data,hash=sha256Hex(task),start=Date.parse(task.created_at);
    // Separate observational clock: never used for admission, expiry or replay.
    const measure=this.config.measurement,mono=()=>{try{return (measure?.monotonic??(()=>performance.now()))();}catch{return 0;}};
    const origin=measure?mono():0,operation=measure?randomUUID():'';
    const mark=(event:string,fields:{run_id?:string;status?:string;attempt?:number}={})=>{
      if(!measure)return;
      try{measure.write({event,at:new Date(this.now()).toISOString(),elapsed_ms:Math.max(0,mono()-origin),
        process_id:measurementProcess,operation_id:operation,task_id:task.task_id,goal_id:task.goal_id,task_hash:hash,
        session_id:`sam_${task.task_id}`,work_created_at:task.created_at,absolute_deadline:new Date(start+task.timeout).toISOString(),
        ...(fields.run_id&&runId.safeParse(fields.run_id).success?{run_id:fields.run_id}:{}),
        ...(fields.status?{status:runSchema.shape.status.safeParse(fields.status).success||fields.status==='TIMEOUT_UNCONFIRMED'?fields.status:'unknown'}:{}),
        ...(fields.attempt===undefined?{}:{attempt:fields.attempt}),
        ...(event==='sam_terminal'&&receipt?.status==='completed'&&typeof receipt.output==='string'?
          {output_sha256:createHash('sha256').update(receipt.output,'utf8').digest('hex')}:{})});}catch{}
    };
    const stop=async(id:string)=>{mark('sam_stop_requested',{run_id:id});
      try{await this.stop(id);mark('sam_stop_acknowledged',{run_id:id});}
      catch(e){mark('sam_stop_uncertain',{run_id:id});throw e;}};
    // Expired keys MUST NOT become fresh work after Hermes prunes its 24-hour ledger.
    await store.assertActive();
    let receipt=await store.load();
    if(receipt&&receipt.taskHash!==hash)throw new HermesError('HERMES_TASK_ID_CONFLICT');
    if(receipt&&terminal.has(receipt.status))return receipt;
    if(receipt?.runId)mark('sam_resumed',{run_id:receipt.runId,status:receipt.status});
    if(start>this.now()+1000||this.now()-start>=23*3600000)throw new HermesError('HERMES_REPLAY_WINDOW_CLOSED');
    await this.preflight();
    const deadline=start+task.timeout;
    if(this.now()>=deadline){if(receipt?.runId)await stop(receipt.runId).catch(()=>{});throw new HermesError('HERMES_TASK_TIMEOUT');}
    const body={input:stableStringify({task_id:task.task_id,goal_id:task.goal_id,agent_role:task.agent_role,instructions:task.instructions}),
      instructions:'Return a candidate result to SAM. Only SAM can verify it. Do not claim verification or additional authority.',
      model:this.selected.model,provider:this.selected.provider};
    if(!receipt?.runId){
      // Save the claim BEFORE dispatch. Retries keep the identical key/body/identity.
      receipt={taskHash:hash,status:'SUBMITTING'};await store.save(receipt);
      if(this.config.requireNativeModelLock){
        // Native Hermes session lock makes the served pair part of the committed
        // turn outcome. Stable empty-session identity is independent of retries.
        const sessionId=`sam_${task.task_id}`,selection={model:this.selected.model,provider:this.selected.provider,require_model_lock:true};
        await store.assertActive();
        try{await this.request('/api/sessions','POST',{id:sessionId,...selection},undefined,deadline);}
        catch(e){if(!(e instanceof HermesError)||e.code!=='HERMES_HTTP_409')throw e;}
        const lock=await this.request(`/api/sessions/${sessionId}/model`,'POST',selection,undefined,deadline);
        if(lock?.session_id!==sessionId||lock.runtime?.model!==this.selected.model||lock.runtime?.provider!==this.selected.provider||lock.runtime?.model_lock!=='accepted')
          throw new HermesError('HERMES_MODEL_LOCK_DENIED');
        Object.assign(body,{session_id:sessionId});
      }
      let accepted:any;
      for(let attempt=0;attempt<2;attempt++){
        await store.assertActive();
        mark('sam_send',{attempt:attempt+1});
        try{accepted=runSchema.parse(await this.request('/v1/runs','POST',body,`sam-hermes:${task.task_id}`,deadline));
          mark('sam_accepted',{run_id:accepted.run_id,status:accepted.status,attempt:attempt+1});break;}
        catch(e){if(!(e instanceof HermesError)||!['HERMES_TRANSPORT_UNCERTAIN','HERMES_HTTP_503','HERMES_HTTP_429'].includes(e.code)||attempt===1)throw e;}
      }
      receipt={taskHash:hash,runId:accepted.run_id,status:accepted.status};
      try{await store.save(receipt);}catch{
        await stop(receipt.runId!).catch(()=>{});
        throw new HermesError('HERMES_WORK_NO_LONGER_AUTHORIZED');
      }
    }
    while(this.now()<deadline){
      try{await store.assertActive();}catch{await stop(receipt.runId!).catch(()=>{});throw new HermesError('HERMES_WORK_NO_LONGER_AUTHORIZED');}
      let polled;
      try{polled=await this.status(receipt.runId!,deadline);}catch(e){
        if(!(e instanceof HermesError)||!['HERMES_TRANSPORT_UNCERTAIN','HERMES_HTTP_503','HERMES_HTTP_429'].includes(e.code))throw e;
        await new Promise(r=>setTimeout(r,this.config.pollMs??1000));continue;
      }
      if(polled.run_id!==receipt.runId)throw new HermesError('HERMES_RUN_ID_MISMATCH');
      mark('sam_poll',{run_id:polled.run_id,status:polled.status});
      // A poll can start inside the budget and finish outside it. Never accept
      // late output or give a resumed task a fresh deadline.
      if(this.now()>=deadline)break;
      receipt={taskHash:hash,runId:polled.run_id,status:polled.status,...(polled.output===undefined?{}:{output:polled.output}),runtime:polled.runtime};
      try{await store.save(receipt);}catch{
        await stop(receipt.runId!).catch(()=>{});
        throw new HermesError('HERMES_WORK_NO_LONGER_AUTHORIZED');
      }
      if(terminal.has(receipt.status)){mark('sam_terminal',{run_id:receipt.runId,status:receipt.status});return receipt;}
      await new Promise(r=>setTimeout(r,this.config.pollMs??1000));
    }
    // A stop acknowledgement is not proof that every remote side effect stopped.
    await stop(receipt.runId!).catch(()=>{});
    await store.save({...receipt,status:'TIMEOUT_UNCONFIRMED'});
    mark('sam_terminal',{run_id:receipt.runId,status:'TIMEOUT_UNCONFIRMED'});
    throw new HermesError('HERMES_TASK_TIMEOUT');
  }
}
