// Reporting and fail-fast contract tests: no real Docker daemon or registry.
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawnSync,execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const root=path.resolve(__dirname,'../..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'sam-runner-contract-'));
try{
 const repo=path.join(temp,'repo'),bin=path.join(temp,'bin');fs.mkdirSync(repo);fs.mkdirSync(bin);
 fs.mkdirSync(path.join(repo,'scripts/testing'),{recursive:true});
 for(const name of ['verify-full.cjs','verification-images.json'])fs.copyFileSync(path.join(root,'scripts/testing',name),path.join(repo,'scripts/testing',name));
 const git=process.env.PATH.split(path.delimiter).map(d=>path.resolve(d,'git')).find(f=>fs.existsSync(f));
 assert(git,'git prerequisite');fs.symlinkSync(git,path.join(bin,'git'));
 const runGit=args=>execFileSync(git,args,{cwd:repo,stdio:'ignore'});
 runGit(['init']);runGit(['add','.']);runGit(['-c','user.name=Verification Fixture','-c','user.email=verification@example.invalid','commit','-m','fixture']);
 for(const name of ['missing-docker','dirty-checkout','remote-docker']){
  if(name==='dirty-checkout')fs.writeFileSync(path.join(repo,'unexpected.txt'),'fixture');
  else fs.rmSync(path.join(repo,'unexpected.txt'),{force:true});
  const out=path.join(temp,name);
  const env={PATH:bin,HOME:temp};if(name==='remote-docker')env.DOCKER_HOST='tcp://remote.invalid:2375';
  const result=spawnSync(process.execPath,['scripts/testing/verify-full.cjs','--output',out],{cwd:repo,env,encoding:'utf8',timeout:10000});
  assert.equal(result.status,1,result.stdout+result.stderr);
  const report=JSON.parse(fs.readFileSync(path.join(out,'report.json')));
  assert.equal(report.status,'FAIL');assert.equal(report.steps[0].status,'FAIL');
  assert(report.steps.filter(s=>s.kind==='test').every(s=>s.status==='NOT_RUN'));
  assert.match(report.unresolvedDefects[0],name==='dirty-checkout'?/CLEAN_COMMITTED_CHECKOUT_REQUIRED/:name==='remote-docker'?/LOCAL_UNIX_DOCKER_REQUIRED/:/ENOENT/);
  for(const line of fs.readFileSync(path.join(out,'SHA256SUMS'),'utf8').trim().split('\n')){
   const [hash,file]=line.split('  ');assert.equal(createHash('sha256').update(fs.readFileSync(path.join(out,file))).digest('hex'),hash);
  }
  console.log('PASS',name,'fails before tests; NOT_RUN preserved; reports and hashes valid');
 }
}finally{fs.rmSync(temp,{recursive:true,force:true});}
