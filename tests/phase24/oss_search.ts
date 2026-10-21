import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {lab} from './lab';
import {buildOssStdioReadBundle} from '../../apps/production/src/ossStdioBundle';
import {validateProductionBundle} from '../../apps/production/src/bundle';
import {createToolExecutors} from '../../apps/tools/src/executorFactory';
import {createGoal} from '../../apps/production/src/dispatcher';
import {runCatalogPlanningCycle,runCatalogSpecialistTick} from '../../apps/agents/src/executiveFlow';
import {verifyNextExecution} from '../../apps/production/src/verifier';
const root=process.env.SAM_OSS_LAB_ROOT;

test('installed open-source search runs through actual SAM planning/worker/execution and independent MCP readback', {skip:!root},async()=>{
 const l=await lab();
 const pins=JSON.parse(await readFile('integrations/oss-mcp/reviewed-tools.json','utf8'));
 const env:Record<string,string>={PATH:process.env.PATH!,DDG_SEARCH_BACKEND:'httpx',DDG_CACHE_TTL:'0'};
 for(const key of ['HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','NO_PROXY','http_proxy','https_proxy','all_proxy','no_proxy','SSL_CERT_FILE'])if(process.env[key])env[key]=process.env[key]!;
 if(process.env.SSL_CERT_FILE)env.DDG_CA_CERTS=process.env.SSL_CERT_FILE;
 const expansion=await buildOssStdioReadBundle({capabilities:[],toolDefinitions:[],toolAdapters:[]},[{id:'oss_search',companyId:l.entity,command:resolve(root!,'oss-search-python/bin/duckduckgo-mcp-server'),args:['--search-backend','httpx','--fetch-backend','httpx','--cache-ttl','0'],package:'duckduckgo-mcp-server',version:'0.7.0',repository:'https://github.com/nickclyde/duckduckgo-mcp-server',tools:pins.search.filter((t:any)=>t.name==='search'),parameterConstraints:{search:{query:{type:'string',minLength:1,maxLength:512},max_results:{type:'integer',minimum:1,maximum:3},region:{type:'string',maxLength:10}}}}],env);
 try{
  const bundle=validateProductionBundle(expansion.bundle),cap='research_mcp_oss_search_search',params={query:'Model Context Protocol official documentation',max_results:3};
  const goal=await createGoal({legalEntityId:l.entity,objective:`Read-only use ${cap} only for three public documentation links`,actor:'isolated-owner',authorityCeiling:'GREEN',completionDefinition:'sam.read_report.v1'});
  await runCatalogPlanningCycle({catalog:bundle.catalog,gateway:{invoke:async()=>({result:{output:{steps:[{capabilityId:cap,params}]}}})} as any,goalId:goal.id,dataClassification:'PUBLIC',maxCostUsd:.1});
  const worker=await runCatalogSpecialistTick({catalog:bundle.catalog,executors:createToolExecutors({catalog:bundle.catalog,tools:bundle.tools}),workerInstanceId:'search-isolated',ttlSeconds:90});
  assert.equal(worker.processed,true);
  const execution:any=(await l.db.query('SELECT * FROM executions WHERE goal_id=$1',[goal.id])).rows[0];
  assert.ok(execution,'Search failure is not successful evidence');assert.match(JSON.stringify(execution.result),/Found [1-3] search results/);
  assert.equal((await verifyNextExecution(bundle)).processed,true);
  const v:any=(await l.db.query('SELECT result FROM verifications WHERE execution_id=$1 ORDER BY checked_at DESC',[execution.id])).rows[0];
  await writeFile('docs/acceptance/oss-search-sam.json',JSON.stringify({capturedAt:new Date().toISOString(),provider:'duckduckgo-mcp-server@0.7.0',productionChanged:false,liveModel:false,goalState:(await l.db.query('SELECT state FROM goals WHERE id=$1',[goal.id])).rows[0].state,executionState:execution.status,verification:v.result,receipt:expansion.receipts[0],result:execution.result},null,2)+'\n');
  assert.equal(v.result,'VERIFIED','Changed live results must remain inconclusive, not a claimed pass');
 }finally{await expansion.close();await l.close()}
});
