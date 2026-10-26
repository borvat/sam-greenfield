import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {pool} from '../../../packages/db/src/client';
import {HermesClient,FREE_MODEL} from '../../../packages/hermes/src/client';
import {hermesCodingBundle,prepareHermesCoding,reviewHermesCoding} from '../../production/src/hermesCodingProbe';
import {createProductionComposition} from '../../production/src/composition';
import type {RuntimeComposition} from './service';
const {probeWindow,assertProbeRoleDeadline}=createRequire(import.meta.url)('../../../packages/hermes/src/probeWindow.cjs');
export default (async():Promise<RuntimeComposition>=>{
 if(process.env.NODE_ENV!=='development'||process.env.SAM_DEVELOPMENT_SAFE_MODE!=='1'||process.env.SAM_HERMES_CODING_PROBE_ENABLED!=='1'||process.env.SAM_HERMES_TEST_CONFIG_PATH!=='/etc/secrets/sam-hermes-test.json')throw Error('CODING_DISABLED');
 const config=JSON.parse(await readFile(process.env.SAM_HERMES_TEST_CONFIG_PATH,'utf8')),window=probeWindow(config);
 const policy=async()=>{
  if(config.baseUrl!=='https://hermes-isolated-test.onrender.com'||config.model!==FREE_MODEL||config.provider!=='nous'||config.effectiveTools?.length!==0||config.maxConcurrency!==1||config.fallbackEnabled!==false)throw Error('CODING_OPERATOR_POLICY_DENIED');
  probeWindow(window,{},Date.now());const role=(await pool.query('SELECT rolvaliduntil FROM pg_roles WHERE rolname=current_user')).rows[0];assertProbeRoleDeadline(window,role?.rolvaliduntil);
 };
 const client=new HermesClient({baseUrl:config.baseUrl,apiKey:config.apiKey,assertServerPolicy:policy,requireNativeModelLock:true});
 const bundle=hermesCodingBundle(client,async(id,artifact)=>{
  await policy();const response=await fetch(new URL('/sam/coding/verify',config.baseUrl),{method:'POST',redirect:'error',signal:AbortSignal.timeout(155000),headers:{Authorization:'Bearer '+config.apiKey,'Content-Type':'application/json'},body:JSON.stringify({jobId:id,artifact})});
  if(!response.ok)throw Error('CODING_BROKER_UNAVAILABLE');const raw=await response.text();if(raw.length>32768)throw Error('CODING_BROKER_RESPONSE_SIZE');return JSON.parse(raw);
 }),entity=process.env.SAM_HERMES_PROBE_ENTITY!;
 await policy();
 return {supervisorOptions:{monitorSideEffects:false},supervise:async()=>({probe:'scoped coding'}),async runWorkTick(){
  await policy();const next=(await pool.query(`SELECT id FROM goals WHERE company_scope=$1 AND domain='hermes_coding_probe' AND created_at>=$2 AND state IN ('NEW','EXECUTING','VERIFYING') ORDER BY created_at,id LIMIT 1`,[entity,window.activatedAt])).rows[0];
  if(!next)return {processed:false};await prepareHermesCoding(bundle,next.id,entity,window.activatedAt);
  const runtime=createProductionComposition({bundle,workerId:'sam-hermes-coding-probe',maintenanceGoalIds:[next.id],verificationGoalId:next.id,specialistScopeGoalId:next.id,specialistConcurrency:1,planning:{goalId:next.id},ordinaryFailurePolicy:'record'});
  const work=await runtime.runWorkTick();const review=await reviewHermesCoding(bundle,next.id);return {work,review};
 }};
})();
