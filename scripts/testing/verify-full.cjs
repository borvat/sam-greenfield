#!/usr/bin/env node
// Independent, fail-closed verification. Only Node builtins on the host.
// No GitHub API, Docker socket mount, production env file, or remote DB input.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const crypto=require('node:crypto'),dns=require('node:dns').promises;
const {spawn,execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const pins=require('./verification-images.json');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const now=()=>new Date().toISOString();
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const args=process.argv.slice(2);
if(args.includes('--help')){
 console.log('npm run verify:full [-- --output NEW_DIRECTORY]\nRequires clean committed checkout, Node >=22, Linux x64, local Docker/BuildKit, git, curl, tar.\nAll checks required; no skip or external-database options. Reports default to .local/verification/RUN_ID/.');
 process.exit(0);
}
if(args.length&&!(args.length===2&&args[0]==='--output'))throw Error('Use --help; unsupported verification option');
const id='sam-verify-'+Date.now()+'-'+crypto.randomBytes(4).toString('hex');
const output=path.resolve(root,args[1]||'.local/verification/'+id);
fs.mkdirSync(path.dirname(output),{recursive:true});fs.mkdirSync(output,{mode:0o700});
fs.mkdirSync(path.join(output,'logs'));
// Host tools get only transport/runtime configuration. Tests get a smaller env.
const env={};
for(const key of ['PATH','HOME','TMPDIR','LANG','TZ','HTTP_PROXY','HTTPS_PROXY','NO_PROXY',
 'http_proxy','https_proxy','no_proxy','NODE_EXTRA_CA_CERTS','SSL_CERT_FILE','SSL_CERT_DIR',
 'CURL_CA_BUNDLE','DOCKER_CONFIG','DOCKER_HOST','DOCKER_CONTEXT','XDG_RUNTIME_DIR'])
 if(process.env[key])env[key]=process.env[key];
env.GIT_TERMINAL_PROMPT='0';
const report={schemaVersion:1,runId:id,startedAt:now(),completedAt:null,status:'RUNNING',
 classification:'INDEPENDENT_LOCAL_SYNTHETIC_ACCEPTANCE_NOT_HOSTED_OR_PRODUCTION',
 source:{sha:null,tree:null,clean:false},host:{node:process.version,platform:process.platform,arch:process.arch},
 pins,images:[],steps:[],excludedChecks:[
  {name:'GitHub-hosted execution and effective merge governance',status:'SKIP',reason:'Not performed; account restriction and rules remain external gates'},
  {name:'Staging, production, live providers, paid model calls and customer data',status:'SKIP',reason:'Outside authorization; no readiness claim'}
 ],unresolvedDefects:[],safety:{publishedPorts:0,productionCredentialsInherited:false,remoteDatabaseInputAccepted:false,
 githubStatusChecksWritten:false,merge:false,deployment:false,billingChanges:false},artifacts:{}};
let temp,source,db,network,active,interrupted=false;
const containers=new Set();
const label='sam.verification.run='+id;
const tag='sam-verification:'+id;
const quote=s=>/^[a-zA-Z0-9_./:@=,+-]+$/.test(s)?s:"'"+s.replaceAll("'","'\\''")+"'";
function add(name,kind='test'){const step={name,kind,status:'NOT_RUN',startedAt:null,completedAt:null,commands:[],log:'logs/'+String(report.steps.length+1).padStart(2,'0')+'-'+name+'.log'};report.steps.push(step);return step;}
const plan={};
for(const name of ['preflight','snapshot','images','isolated-postgres','node-dependencies','python-dependencies','runtime-versions','workflow-tool','workflow-validation','configuration-validation','typecheck','regression','core-reliability',
 'provider-auth','postgres-tls','contracts','synthetic-pilot','managed-schema','local-bundle','closed-setup','database-contract','prelaunch-gate',
 'integration-migrations','integration-oauth-mcp','integration-orchestration','specialist-reasoning','specialist-gateway','specialist-provenance','specialist-evaluation','evaluation-budget','evaluation-adapter','evaluation-orchestration','migration-upgrade-rollback','specialist-restart-prepare','evaluation-restart-prepare','postgres-restart','migration-after-restart','specialist-restart-check','evaluation-restart-check','phase0-migrations','phase0-acceptance','phase0-postgres','tenant-isolation','fail-closed-security','clean-image','image-contract','application-startup-restart','source-integrity','cleanup'])
 plan[name]=add(name,['preflight','snapshot','images','isolated-postgres','node-dependencies','python-dependencies','runtime-versions','workflow-tool','cleanup'].includes(name)?'infrastructure':'test');
function save(){
 report.artifacts={};
 for(const folder of ['logs','metadata']){
  const d=path.join(output,folder);if(!fs.existsSync(d))continue;
  for(const f of fs.readdirSync(d).sort()){const relative=folder+'/'+f;report.artifacts[relative]=hash(fs.readFileSync(path.join(output,relative)));}
 }
 fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
 const lines=['# Independent SAM verification','',`Status: **${report.status}**`,
  `Source: \`${report.source.sha||'UNAVAILABLE'}\` (clean: ${report.source.clean})`,
  `Started: ${report.startedAt}; completed: ${report.completedAt||'running'}`,
  '',report.classification,'','| Check | Result | Log |','| --- | --- | --- |',
  ...report.steps.map(s=>`| ${s.name} | ${s.status} | ${fs.existsSync(path.join(output,s.log))?'[log]('+s.log+')':'not executed'} |`),'',
  '## Unresolved defects / blockers','',...(report.unresolvedDefects.length?report.unresolvedDefects.map(x=>'- '+x):['- No required local check failed. Hosted/governance and deployment gates remain separate.']),
  '','## Excluded checks','',...report.excludedChecks.map(x=>`- ${x.name}: ${x.status} — ${x.reason}`),'',
  '## Runtime versions','', '```json',JSON.stringify(report.runtimes||{},null,2),'```','',
  '## Container images','',...report.images.map(i=>'- '+i.role+': `'+i.ref+'`; ID `'+i.id+'`'),'',
  '## Commands and suite outcomes','',...report.steps.flatMap(s=>[
   '### '+s.name+' — '+s.status,'',`${s.startedAt||'not started'} → ${s.completedAt||'not completed'}`,'',
   ...s.commands.flatMap(c=>['```sh',c.argv.map(quote).join(' '),'```',
    `Exit: ${c.exitCode??'unavailable'}; signal: ${c.signal||'none'}; ${c.startedAt} → ${c.completedAt||'not completed'}`,'']),
   ...(s.suiteResults?.results||[]).map(r=>`- ${r.test}: ${r.passed?'PASS':'FAIL'}; ${r.startedAt||'see parent command'} → ${r.completedAt||'see parent command'}`),''
  ]),
  'Exact structured commands, suite results and evidence hashes: [report.json](report.json).',
  'No GitHub status was posted. A local pass cannot satisfy a required hosted check or authorize merge/deployment.',''];
 fs.writeFileSync(path.join(output,'report.md'),lines.join('\n'));
 const artifacts={...report.artifacts,'report.json':hash(fs.readFileSync(path.join(output,'report.json'))),'report.md':hash(fs.readFileSync(path.join(output,'report.md')))};
 fs.writeFileSync(path.join(output,'SHA256SUMS'),Object.entries(artifacts).map(([f,h])=>h+'  '+f).join('\n')+'\n');
}
async function command(step,exe,argv,{cwd=root,timeout=120000,allowFailure=false}={}){
 if(interrupted&&step.name!=='cleanup')throw Error('INTERRUPTED');
 const record={argv:[exe,...argv],cwd,startedAt:now(),completedAt:null,exitCode:null,signal:null};
 step.commands.push(record);
 const logfile=path.join(output,step.log);
 fs.appendFileSync(logfile,'$ '+[exe,...argv].map(quote).join(' ')+'\n');
 let captured='';const fd=fs.openSync(logfile,'a');
 try{
  const child=spawn(exe,argv,{cwd,env,stdio:['ignore','pipe','pipe']});active=child;
  const capture=data=>{fs.writeSync(fd,data);captured+=data.toString();};
  child.stdout.on('data',capture);child.stderr.on('data',capture);
  let timedOut=false;
  const timer=setTimeout(()=>{timedOut=true;child.kill('SIGKILL');},timeout);
  const result=await new Promise(resolve=>{child.once('error',error=>resolve({code:null,error}));child.once('close',(code,signal)=>resolve({code,signal}));});
  clearTimeout(timer);active=null;
  record.completedAt=now();record.exitCode=result.code;record.signal=result.signal||null;
  if(result.error)record.error=result.error.code||'SPAWN_ERROR';if(timedOut)record.error='TIMEOUT';
  if(!allowFailure&&(result.code!==0||result.error||timedOut))throw Error(`${step.name}: ${record.error||'exit '+result.code} (see ${step.log})`);
  return {text:captured,...record};
 }finally{fs.closeSync(fd);}
}
async function step(name,fn){const s=plan[name];s.startedAt=now();s.status='RUNNING';save();console.log('RUN',name);
 try{await fn(s);s.status='PASS';}
 catch(error){s.status='FAIL';s.reason=error.message;throw error;}
 finally{s.completedAt=now();save();console.log(s.status,name);}}
const uid=String(process.getuid()),gid=String(process.getgid());
const mount=(src,dst,readonly=false)=>['--mount',`type=bind,src=${src},dst=${dst}${readonly?',readonly':''}`];
const mounts=()=>[...mount(source,'/app'),'--workdir','/app','--user',uid+':'+gid,'--env','HOME=/tmp'];
function runArgs(image,cmd,{install=false,extra=[]}={}){
 const name=id+'-job-'+containers.size;containers.add(name);
 return ['run','--rm','--name',name,'--label',label,'--init',
  ...(install?[]:['--network','container:'+db]),...mounts(),...extra,image,...cmd];
}
async function node(s,cmd,extra=[]){return command(s,'docker',runArgs(pins.node,cmd,{extra}),{timeout:600000});}
const coreEnv=()=>['--env','SAM_CORE_TEST_DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test','--env','SAM_VERIFICATION_SOURCE_SHA='+report.source.sha];
const evaluationEvidence=()=>['--mount','type=bind,source='+path.join(output,'metadata')+',target=/evidence','--env','SAM_EVALUATION_ARTIFACT_DIR=/evidence'];
async function suite(s,file,extra=[]){
 const r=await node(s,['node','scripts/testing/core-reliability.cjs','--suite',file],[...coreEnv(),...extra]);
 const result=r.text.split('\n').flatMap(l=>{try{const j=JSON.parse(l);return Array.isArray(j.results)?[j]:[];}catch{return [];}}).at(-1);
 if(!result||result.failed||result.passed!==1)throw Error('SUITE_RESULT_MISSING_OR_FAILED');s.suiteResults=result;
}
async function ready(s){
 for(let i=0;i<30;i++){
  const r=await command(s,'docker',['exec',db,'pg_isready','-U','postgres','-d','sam_core_test'],{allowFailure:true,timeout:3000});
  if(r.exitCode===0)return;await pause(500);
 }throw Error('DISPOSABLE_POSTGRES_NOT_READY');
}
async function cleanup(s){
 let failed=false;
 for(const name of containers){
  const found=await command(s,'docker',['inspect','--format','{{index .Config.Labels "sam.verification.run"}}',name],{allowFailure:true,timeout:10000});
  if(found.exitCode!==0){
   if(!/No such (?:object|container)/i.test(found.text))failed=true;
   continue; // --rm jobs are already gone; daemon errors are not success.
  }
  if(found.text.trim()!==id){failed=true;continue;}
  const removed=await command(s,'docker',['rm','--force','--volumes',name],{allowFailure:true,timeout:20000});if(removed.exitCode!==0)failed=true;
 }
 if(network){
  const found=await command(s,'docker',['network','inspect','--format','{{index .Labels "sam.verification.run"}}',network],{allowFailure:true,timeout:10000});
  if(found.exitCode===0){
   if(found.text.trim()!==id)failed=true;
   else if((await command(s,'docker',['network','rm',network],{allowFailure:true,timeout:10000})).exitCode!==0)failed=true;
  }else if(!/not found|No such network/i.test(found.text))failed=true;
 }
 if(temp)fs.rmSync(temp,{recursive:true,force:true});
 if(failed)throw Error('OWNED_RESOURCE_CLEANUP_FAILED; inspect cleanup log; no global prune attempted');
}
async function main(){
 try{
  await step('preflight',async s=>{
   if(Number(process.versions.node.split('.')[0])<22||process.platform!=='linux'||process.arch!=='x64')throw Error('REQUIRES_NODE_22_OR_NEWER_LINUX_X64');
   report.source.sha=(await command(s,'git',['rev-parse','HEAD'])).text.trim();
   report.source.tree=(await command(s,'git',['rev-parse','HEAD^{tree}'])).text.trim();
   const status=(await command(s,'git',['status','--porcelain=v1','--untracked-files=normal'])).text;
   if(status.trim())throw Error('CLEAN_COMMITTED_CHECKOUT_REQUIRED; commit/review changes first');report.source.clean=true;
   if(env.DOCKER_HOST&&!env.DOCKER_HOST.startsWith('unix://'))throw Error('LOCAL_UNIX_DOCKER_REQUIRED');
   const context=JSON.parse((await command(s,'docker',['context','inspect'])).text)[0];
   if(!context.Endpoints.docker.Host.startsWith('unix://'))throw Error('LOCAL_UNIX_DOCKER_REQUIRED');
   const version=(await command(s,'docker',['version','--format','{{json .}}'])).text;report.host.docker=JSON.parse(version);
   report.host.compose=(await command(s,'docker',['compose','version','--short'])).text.trim();
   await command(s,'docker',['buildx','version']);
   const info=(await command(s,'docker',['info','--format','{{.OSType}}/{{.Architecture}}'])).text.trim();
   if(!['linux/x86_64','linux/amd64'].includes(info))throw Error('LOCAL_LINUX_AMD64_DOCKER_REQUIRED');
   await command(s,'git',['--version']);await command(s,'curl',['--version']);await command(s,'tar',['--version']);
  });
  await step('snapshot',async s=>{
   temp=fs.mkdtempSync(path.join(os.tmpdir(),'sam-verify-'));source=path.join(temp,'source');fs.mkdirSync(source);
   await command(s,'git',['archive','--format=tar','--output',path.join(temp,'source.tar'),report.source.sha]);
   await command(s,'tar',['-xf',path.join(temp,'source.tar'),'-C',source]);
   const names=execFileSync('git',['ls-tree','-r','--name-only','-z',report.source.sha],{cwd:root,env}).toString().split('\0').filter(Boolean).sort();
   const manifest=Object.fromEntries(names.map(n=>{
    const target=path.join(source,n);
    if(!fs.lstatSync(target).isFile())throw Error('TRACKED_NONREGULAR_FILE_REQUIRES_REVIEW: '+n);
    return [n,hash(fs.readFileSync(target))];
   }));
   fs.mkdirSync(path.join(output,'metadata'));fs.writeFileSync(path.join(output,'metadata/source-files.json'),JSON.stringify(manifest,null,2)+'\n');
   report.source.fileManifestHash=hash(fs.readFileSync(path.join(output,'metadata/source-files.json')));
   const implementation=Object.fromEntries(Object.entries(manifest).filter(([f])=>!f.startsWith('docs/')));
   report.source.implementationDigest=hash(JSON.stringify(implementation));
   // Detect HEAD changes while exporting; no dirty source is silently tested.
   if(execFileSync('git',['rev-parse','HEAD'],{cwd:root,env}).toString().trim()!==report.source.sha)throw Error('SOURCE_HEAD_CHANGED');
  });
  await step('images',async s=>{
   for(const [role,ref] of Object.entries(pins).filter(([k])=>['node','productionBase','postgres','python'].includes(k))){
    if(!/^.+@sha256:[a-f0-9]{64}$/.test(ref))throw Error('DIGEST_PIN_REQUIRED');
    const found=await command(s,'docker',['image','inspect',ref],{allowFailure:true});
    if(found.exitCode!==0)await command(s,'docker',['pull','--platform',pins.platform,ref],{timeout:300000});
    const image=JSON.parse((await command(s,'docker',['image','inspect',ref])).text)[0];
    if(image.Os!=='linux'||image.Architecture!=='amd64')throw Error('PINNED_IMAGE_PLATFORM_MISMATCH: '+role);
    report.images.push({role,ref,id:image.Id,repoDigests:image.RepoDigests,os:image.Os,architecture:image.Architecture});
   }
  });
  await step('isolated-postgres',async s=>{
   network=id+'-net';await command(s,'docker',['network','create','--internal','--label',label,network]);
   db=id+'-pg';containers.add(db);
   await command(s,'docker',['run','--detach','--name',db,'--label',label,'--network',network,
    '--env','POSTGRES_DB=sam_core_test','--env','POSTGRES_PASSWORD=verification-fixture',pins.postgres]);
   await ready(s);
   for(const name of ['sam_core_test_lifecycle','sam_core_test_application','sam_greenfield'])
    await command(s,'docker',['exec',db,'psql','-U','postgres','-d','sam_core_test','-v','ON_ERROR_STOP=1','-c','CREATE DATABASE '+name]);
  });
  const transport=[];
  // Explicit transport allowlist is used only during dependency installation.
  for(const key of ['HTTP_PROXY','HTTPS_PROXY','NO_PROXY','http_proxy','https_proxy','no_proxy'])if(env[key])transport.push('--env',key);
  const hosts=new Set();for(const key of ['HTTP_PROXY','HTTPS_PROXY','http_proxy','https_proxy'])if(env[key])hosts.add(new URL(env[key]).hostname);
  for(const host of hosts){const {address}=await dns.lookup(host,{family:4});transport.push('--add-host',host+':'+address);}
  if(env.NODE_EXTRA_CA_CERTS){fs.accessSync(env.NODE_EXTRA_CA_CERTS);transport.push(...mount(env.NODE_EXTRA_CA_CERTS,'/tmp/verification-ca.pem',true),'--env','NODE_EXTRA_CA_CERTS=/tmp/verification-ca.pem','--env','PIP_CERT=/tmp/verification-ca.pem');}
  await step('node-dependencies',s=>command(s,'docker',runArgs(pins.node,['npm','ci','--include=dev','--cache','/tmp/npm-cache','--fetch-retries=1','--fetch-timeout=20000'],{install:true,extra:transport}),{timeout:300000}));
  const pythonSite=path.join(temp,'python');fs.mkdirSync(pythonSite);
  await step('python-dependencies',s=>command(s,'docker',runArgs(pins.python,['python','-m','pip','install','--target','/fixtures/site','--cache-dir','/tmp/pip-cache','--retries','1','--timeout','20','--only-binary=:all:','--require-hashes','--requirement','scripts/testing/requirements-verification.txt'],{install:true,extra:[...transport,...mount(pythonSite,'/fixtures')]}),{timeout:180000}));
  await step('runtime-versions',async s=>{
   report.runtimes={node:(await node(s,['node','--version'])).text.trim(),npm:(await node(s,['npm','--version'])).text.trim(),openssl:(await node(s,['openssl','version'])).text.trim(),
    python:(await command(s,'docker',runArgs(pins.python,['python','--version']))).text.trim(),
    postgres:(await command(s,'docker',['exec',db,'psql','-U','postgres','-d','sam_core_test','-Atc','SELECT version()'])).text.trim()};
  });
  await step('workflow-tool',async s=>{
   const archive=path.join(temp,'actionlint.tar.gz');
   await command(s,'curl',['--fail','--location','--silent','--show-error','--max-time','60','--output',archive,pins.actionlint.url]);
   if(hash(fs.readFileSync(archive))!==pins.actionlint.sha256)throw Error('ACTIONLINT_CHECKSUM_MISMATCH');
   await command(s,'tar',['-xzf',archive,'-C',temp,'actionlint']);
   report.runtimes.actionlint=(await command(s,path.join(temp,'actionlint'),['--version'])).text.trim();
  });
  await step('workflow-validation',s=>{
   const files=fs.readdirSync(path.join(source,'.github/workflows')).filter(f=>/\.ya?ml$/.test(f)).sort();
   if(!files.length)throw Error('NO_WORKFLOWS_FOUND');
   s.scope='actionlint YAML/Actions semantic validation; optional shellcheck/pyflakes not installed or claimed';
   return command(s,path.join(temp,'actionlint'),['-no-color','-shellcheck=','-pyflakes=',...files.map(f=>'.github/workflows/'+f)],{cwd:source});
  });
  await step('configuration-validation',async s=>{
   await command(s,process.execPath,['tests/testing/runner-contract.cjs'],{cwd:source});
   for(const file of ['docker-compose.yml','docker-compose.production.yml','deploy/production/docker-compose.live.yml','deploy/staging/docker-compose.integration.yml'])
    await command(s,'docker',['compose','--file',file,'config','--quiet','--no-interpolate','--no-env-resolution'],{cwd:source});
   await node(s,['node','tests/release/build_configuration.cjs']);
   await node(s,['node','tests/release/preparation.cjs']);
   await node(s,['node','packages/db/src/migrate.js','--check-deterministic']);
  });
  await step('typecheck',s=>node(s,['npm','run','typecheck']));
  for(const [name,script] of [['regression','test:core-regression'],['core-reliability','test:core-reliability']])await step(name,async s=>{
   const r=await node(s,['npm','run',script],coreEnv());
   const result=r.text.split('\n').flatMap(l=>{try{const j=JSON.parse(l);return Array.isArray(j.results)?[j]:[];}catch{return [];}}).at(-1);
   if(!result||!result.results.length||result.failed||result.results.some(x=>!x.passed||x.exit!==0))throw Error('SUITE_RESULTS_MISSING_OR_FAILED');s.suiteResults=result;
  });
  for(const [name,file] of Object.entries({'provider-auth':'provider_auth.ts','postgres-tls':'postgres_tls.ts','contracts':'contracts.ts','synthetic-pilot':'synthetic_pilot.ts','managed-schema':'managed_schema_source.cjs','local-bundle':'local_bundle.ts','closed-setup':'setup.ts','database-contract':'database_check.ts','prelaunch-gate':'prelaunch.ts'}))
   await step(name,s=>suite(s,'tests/release/'+file));
  const life=['--env','DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_lifecycle'];
  for(const [name,file] of [['integration-migrations','migrations.ts'],['integration-oauth-mcp','oauth-mcp.ts'],['integration-orchestration','orchestration.ts']])
   await step(name,s=>suite(s,'tests/integration/'+file));
  await step('specialist-reasoning',s=>suite(s,'tests/specialists/acceptance.ts'));
  await step('specialist-gateway',s=>suite(s,'tests/specialists/gateway.ts'));
  await step('specialist-provenance',s=>suite(s,'tests/specialists/provenance.ts'));
  await step('specialist-evaluation',s=>node(s,['node','--import','tsx','tests/specialists/evaluation.ts']));
  await step('evaluation-budget',s=>suite(s,'tests/evaluation/budgets.ts',evaluationEvidence()));
  await step('evaluation-adapter',s=>suite(s,'tests/evaluation/adapters.ts'));
  await step('evaluation-orchestration',s=>suite(s,'tests/evaluation/orchestration.ts',evaluationEvidence()));
  await step('migration-upgrade-rollback',s=>node(s,['node','tests/testing/database-lifecycle.cjs','prepare'],life));
  await step('specialist-restart-prepare',s=>node(s,['node','--import','tsx','tests/specialists/restart.ts','prepare'],life));
  await step('evaluation-restart-prepare',s=>node(s,['node','--import','tsx','tests/evaluation/restart.ts','prepare'],[...life,'--env','SAM_VERIFICATION_SOURCE_SHA='+report.source.sha]));
  await step('postgres-restart',async s=>{await command(s,'docker',['restart','--time','10',db]);await ready(s);});
  await step('migration-after-restart',s=>node(s,['node','tests/testing/database-lifecycle.cjs','after-restart'],life));
  await step('specialist-restart-check',s=>node(s,['node','--import','tsx','tests/specialists/restart.ts','after-restart'],life));
  await step('evaluation-restart-check',s=>node(s,['node','--import','tsx','tests/evaluation/restart.ts','after-restart'],life));
  await step('phase0-migrations',async s=>{
   // Preserve the Phase 0 workflow's SQL-only profile (no ledger table/RLS drift).
   await command(s,'docker',['cp',path.join(source,'packages/db/migrations'),db+':/migrations']);
   await command(s,'docker',['exec',db,'sh','-ec',`psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -c 'CREATE EXTENSION IF NOT EXISTS vector;'; for f in /migrations/*.sql; do echo "Applying $f"; psql -U postgres -d sam_greenfield -v ON_ERROR_STOP=1 -f "$f"; done`]);
   report.runtimes.postgresExtensions=(await command(s,'docker',['exec',db,'psql','-U','postgres','-d','sam_greenfield','-Atc','SELECT extname,extversion FROM pg_extension ORDER BY extname'])).text.trim();
  });
  for(const [name,file] of Object.entries({'phase0-acceptance':'tests/phase0/phase0_acceptance.py','phase0-postgres':'tests/phase0_postgres/real_postgres_test.py','tenant-isolation':'tests/phase0_postgres/test_rls_tenant_isolation.py','fail-closed-security':'tests/phase0_postgres/test_rls_fail_closed_security.py'}))
   await step(name,s=>command(s,'docker',runArgs(pins.python,['python',file],{extra:[...mount(pythonSite,'/fixtures',true),'--env','PYTHONPATH=/fixtures/site','--env','DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_greenfield','--env','DATABASE_URL_APP=postgres://app_tenant_test:test_password@127.0.0.1:5432/sam_greenfield']}),{timeout:120000}));
  await step('clean-image',async s=>{
   const original=fs.readFileSync(path.join(source,'Dockerfile'),'utf8');
   if(!/^FROM node:22-alpine\n/.test(original))throw Error('PRODUCTION_BASE_PIN_REVIEW_REQUIRED');
   const generated=original.replace(/^FROM node:22-alpine/m,'FROM '+pins.productionBase);
   fs.writeFileSync(path.join(source,'Dockerfile.verification'),generated);
   report.generatedDockerfile={originalSha256:hash(original),generatedSha256:hash(generated),onlyChange:'FROM digest pin; original Dockerfile unchanged'};
   await command(s,process.execPath,['scripts/development/build-image.cjs',tag,'Dockerfile.verification'],{cwd:source,timeout:600000});
  });
  await step('image-contract',async s=>{
   const image=JSON.parse((await command(s,'docker',['image','inspect',tag])).text)[0];
   if(image.Config.User!=='node')throw Error('IMAGE_NONROOT_USER_REQUIRED');
   if(image.Config.Env.some(v=>/^(?:https?_proxy|node_extra_ca_certs|database_url|openai_api_key|deepseek_api_key)=/i.test(v)))throw Error('IMAGE_SENSITIVE_ENV_FORBIDDEN');
   report.images.push({role:'clean-application',ref:tag,id:image.Id,os:image.Os,architecture:image.Architecture});
  });
  await step('application-startup-restart',async s=>{
   const name=id+'-application';containers.add(name);
   // Never mask image apps/packages/dependencies with the installed source tree.
   await command(s,'docker',['run','--rm','--init','--name',name,'--label',label,'--network','container:'+db,
    ...mount(path.join(source,'tests'),'/app/tests',true),'--workdir','/app',
    '--env','DATABASE_URL=postgres://postgres:verification-fixture@127.0.0.1:5432/sam_core_test_application',
    tag,'node','tests/testing/application-restart.cjs'],{timeout:180000});
  });
  await step('source-integrity',async s=>{
   const manifest=JSON.parse(fs.readFileSync(path.join(output,'metadata/source-files.json')));
   for(const [file,expected] of Object.entries(manifest))
    if(hash(fs.readFileSync(path.join(source,file)))!==expected)throw Error('SNAPSHOT_SOURCE_CHANGED: '+file);
   fs.writeFileSync(path.join(output,s.log),'PASS: all '+Object.keys(manifest).length+' tracked source files retain the archived SHA256; generated Dockerfile recorded separately.\n');
  });
 }catch(error){report.unresolvedDefects.push(error.message);console.error('VERIFY_FAILED:',error.message);}
 finally{
  try{await step('cleanup',cleanup);}catch(error){report.unresolvedDefects.push(error.message);}
  if(interrupted)report.unresolvedDefects.push('INTERRUPTED: partial results are not acceptance');
  report.completedAt=now();report.status=!interrupted&&report.steps.every(s=>s.status==='PASS')?'PASS':'FAIL';save();
  console.log('VERIFICATION',report.status,report.source.sha||'SHA_UNAVAILABLE','report:',path.join(output,'report.md'));
  process.exitCode=report.status==='PASS'?0:1;
 }
}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{interrupted=true;if(active)active.kill('SIGTERM');});
main().catch(error=>{console.error('VERIFICATION_REPORT_FAILURE',error.message);process.exitCode=1;});
