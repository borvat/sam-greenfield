/** PUBLIC RFC 8032 test vector, never a credential or an owner trust root. */
import {createPrivateKey,createPublicKey,sign} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createRenderLaunchAdministration} from '../../apps/agents/src/evaluation/renderTransport';
import {sha256Hex,stableStringify} from '../../packages/shared/src/stableJson';
import type {LaunchRequest,TrialReceipt} from '../../apps/agents/src/evaluation/operatorLaunch';
const vector=createPrivateKey({key:Buffer.from('302e020100300506032b6570042204209d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60','hex'),format:'der',type:'pkcs8'});
export const fixtureSigner={authority:'fixture-only' as const,publicKey:createPublicKey(vector).export({format:'pem',type:'spki'}).toString(),async sign(payload:Record<string,unknown>){return sign(null,Buffer.from(stableStringify(payload)),vector).toString('base64');}};
const opened=new Set<()=>Promise<void>>();
export async function closeFixtureBindings(){for(const close of [...opened])await close();}
export async function createLaunchBindings(request:LaunchRequest){
 if(request.spec.mode!=='fixture')throw Error('FIXTURE_ONLY');
 const dir=process.env.RENDER_BINDING_FIXTURE_DIRECTORY!;const cfg=JSON.parse(await readFile(join(dir,'fixture.json'),'utf8'));
 const url=new URL(cfg.baseUrl);if(url.hostname!=='127.0.0.1'||url.protocol!=='http:')throw Error('FIXTURE_ONLY');
 const receiptPath=join(dir,'trial.json');
 async function lookup(){try{const r=JSON.parse(await readFile(receiptPath,'utf8'));return {...r,observedAt:new Date().toISOString()};}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e;}}
 const db={mode:'fixture' as const,async preflight(){},async create(){if(await lookup())throw Error('FIXTURE_DUPLICATE_TRIAL');const createdAt=new Date().toISOString();const r:TrialReceipt={id:'11111111-2222-4333-8444-555555555555',rootGoalId:request.rootGoalId,companyId:request.spec.companyId,specHash:sha256Hex(request.spec),createdAt,deadline:new Date(Date.parse(createdAt)+300000).toISOString(),observedAt:createdAt,cancelled:false,sealed:false};await writeFile(receiptPath,JSON.stringify(r),{mode:0o600});return r;},lookup,
  async observe(t:TrialReceipt){return {outcome:'blocked' as const,trialId:t.id,commit:request.spec.commit};},
  async cancelAndCapture(){const r=await lookup();if(r)await writeFile(receiptPath,JSON.stringify({...r,cancelled:true,sealed:true}));},
  async assertStopped(signal:AbortSignal){const p=await (await fetch(new URL('/probe',url),{signal})).json();if(p.instances!==0)throw Error('FIXTURE_STILL_RUNNING');},
  async verifyRuntime(i:{commit:string;trialId?:string;restored:boolean},signal:AbortSignal){const p=await(await fetch(new URL('/probe',url),{signal})).json();if(p.instances!==1||p.commit!==i.commit||(i.trialId&&p.trialId!==i.trialId))throw Error('FIXTURE_RUNTIME_MISMATCH');}
 };
 const admin=await createRenderLaunchAdministration({serviceId:'srv-fixture',allowedServiceIds:['srv-fixture'],workspaceId:'tea-fixture',directory:join(dir,'private'),request,preparedBuildId:'bld-prepared',environment:{DATABASE_URL:'synthetic-only',SAM_COMPOSITION_MODULE:'apps/runtime/src/boundedEvaluationCompositionModule.ts'},credential:async()=> 'PUBLIC_SIMULATION_TOKEN',simulation:{baseUrl:cfg.baseUrl},pollMs:5},db);
 const close=async()=>{await admin.close();opened.delete(close);};opened.add(close);return {admin,signer:fixtureSigner,close};
}
