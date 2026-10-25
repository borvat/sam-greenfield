import {readFile,lstat} from 'node:fs/promises';
import {pool} from '../../../packages/db/src/client';
import {HermesClient,FREE_MODEL} from '../../../packages/hermes/src/client';
import {hermesProbeBundle,prepareHermesProbe,reviewHermesProbe} from '../../production/src/hermesProbe';
import {createProductionComposition} from '../../production/src/composition';
import type {RuntimeComposition} from './service';

export default (async():Promise<RuntimeComposition>=>{
  if(process.env.NODE_ENV!=='development'||process.env.SAM_DEVELOPMENT_SAFE_MODE!=='1'||process.env.SAM_HERMES_PROBE_ENABLED!=='1')throw Error('HERMES_PROBE_DISABLED');
  const path=process.env.SAM_HERMES_TEST_CONFIG_PATH??'';
  if(path!=='/etc/secrets/sam-hermes-test.json')throw Error('HERMES_PROBE_PRIVATE_CONFIG_REQUIRED');
  // This exact path is a Render-managed Secret File, which may be a symlink.
  const meta=await lstat(path);if((!meta.isFile()&&!meta.isSymbolicLink())||meta.size>8192)throw Error('HERMES_PROBE_CONFIG_INVALID');
  const config=JSON.parse(await readFile(path,'utf8'));
  const policy=async()=>{
    if(config.baseUrl!=='https://hermes-isolated-test.onrender.com'||config.model!==FREE_MODEL||config.provider!=='nous'||config.effectiveTools?.length!==0||
      config.maxConcurrency!==1||config.fallbackEnabled!==false||!Number.isFinite(Date.parse(config.expiresAt))||Date.now()>=Date.parse(config.expiresAt)||
      Date.parse(config.expiresAt)-Date.parse(config.activatedAt)>3600000)throw Error('HERMES_PROBE_OPERATOR_POLICY_INVALID');
  };
  await policy();
  const client=new HermesClient({baseUrl:config.baseUrl,apiKey:config.apiKey,assertServerPolicy:policy});await client.preflight();
  const bundle=hermesProbeBundle(client),entity=process.env.SAM_HERMES_PROBE_ENTITY!;
  return {supervisorOptions:{monitorSideEffects:false},supervise:async()=>({probe:'scoped supervisor within composition'}),async runWorkTick(){
    await policy();
    const next=(await pool.query(`SELECT id FROM goals WHERE company_scope=$1 AND domain='hermes_probe' AND created_at>=$2
      AND state IN ('NEW','EXECUTING','VERIFYING') ORDER BY created_at,id LIMIT 1`,[entity,config.activatedAt])).rows[0];
    if(!next)return {processed:false};
    await prepareHermesProbe(bundle,next.id,entity,config.activatedAt);
    const runtime=createProductionComposition({bundle,workerId:'sam-hermes-probe',maintenanceGoalIds:[next.id],verificationGoalId:next.id,
      specialistScopeGoalId:next.id,specialistConcurrency:1,planning:{goalId:next.id},ordinaryFailurePolicy:'record'});
    const work=await runtime.runWorkTick();const review=await reviewHermesProbe(bundle,next.id);return {work,review};
  }};
})();
