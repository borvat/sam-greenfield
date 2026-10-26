'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const launcher=require('../../deploy/hermes-coding/auth_only_launcher.cjs');
const base=path.resolve(__dirname,'../../deploy/hermes-coding');
const env={SAM_GITHUB_PUBLISHER_ENABLED:'0',SAM_MODAL_OPERATOR_TOKEN_ID:'SYNTHETIC_MODAL_ID',
  SAM_MODAL_OPERATOR_TOKEN_SECRET:'SYNTHETIC_MODAL_SECRET','sam-github-publisher.pem':'SYNTHETIC_GITHUB_KEY'};
const commit='a'.repeat(40);
function downloader(url){
  const prefix='https://raw.githubusercontent.com/borvat/sam-greenfield/'+commit+'/deploy/hermes-coding/';
  assert.ok(url.startsWith(prefix));return fs.readFileSync(path.join(base,url.slice(prefix.length)));
}
test('fixed source manifest rejects any changed file before execution',()=>{
  for(const name of Object.keys(launcher.ARTIFACTS)){
    const bytes=fs.readFileSync(path.join(base,name));
    assert.equal(launcher.verifyArtifact(name,bytes),bytes);
    assert.throws(()=>launcher.verifyArtifact(name,Buffer.concat([bytes,Buffer.from(' ')])),/SOURCE_HASH_DENIED/);
  }
  assert.throws(()=>launcher.verifyArtifact('../../other',Buffer.from('')),/SOURCE_HASH_DENIED/);
});
test('unbound or expired operator window cannot download/install/run',async()=>{
  const called=()=>{throw Error('MUST_NOT_RUN')};
  await assert.rejects(launcher.prepare(commit,Date.now()-1,env,{download:called}),/OPERATOR_WINDOW_DENIED/);
  await assert.rejects(launcher.prepare(commit,Date.now()+600000,{...env,SAM_GITHUB_PUBLISHER_ENABLED:'1'},{download:called}),/PUBLICATION_MUST_REMAIN_DISABLED/);
  await assert.rejects(launcher.prepare(commit,Date.now()+600000,{}, {download:called}),/PUBLICATION_MUST_REMAIN_DISABLED/);
});
test('npm receives no credential or inherited config; reviewed installer flags are mandatory',async()=>{
  let temporary;
  const result=await launcher.prepare(commit,Date.now()+600000,env,{
    download:downloader,
    install:(bin,args,options)=>{
      assert.equal(bin,'npm');assert.ok(args.includes('--ignore-scripts'));assert.ok(args.includes('--omit=optional'));
      assert.deepEqual(Object.keys(options.env).sort(),['HOME','PATH','TMPDIR']);
      assert.ok(!JSON.stringify(options).includes('SYNTHETIC'));
      temporary=path.dirname(options.cwd);
      assert.equal(fs.statSync(temporary).mode&0o777,0o700);
      return {status:0};
    },check:()=>({syntheticOnly:true})
  });
  assert.deepEqual(result,{syntheticOnly:true});assert.equal(fs.existsSync(temporary),false);
});
test('install failure stops checks and cleans all temporary source/dependencies',async()=>{
  let temporary,checked=false;
  await assert.rejects(launcher.prepare(commit,Date.now()+600000,env,{
    download:downloader,install:(bin,args,options)=>{temporary=path.dirname(options.cwd);return {status:1}},
    check:()=>{checked=true}
  }),/SDK_INSTALL_FAILED/);
  assert.equal(checked,false);assert.equal(fs.existsSync(temporary),false);
});
test('authentication failure also cleans temporary source/dependencies',async()=>{
  let temporary;
  await assert.rejects(launcher.prepare(commit,Date.now()+600000,env,{
    download:downloader,install:(bin,args,options)=>{temporary=path.dirname(options.cwd);return {status:0}},
    check:()=>{throw Error('SYNTHETIC_AUTH_FAILURE')}
  }),/SYNTHETIC_AUTH_FAILURE/);
  assert.equal(fs.existsSync(temporary),false);
});
test('restoring the original entrypoint cannot retain any vault credential',()=>{
  const original={...env,SAM_TEST_BEARER_TOKEN:'SYNTHETIC_SAM_ONLY'};
  launcher.scrubVault(original);
  for(const key of launcher.VAULT_KEYS)assert.equal(original[key],undefined);
  assert.equal(original.SAM_TEST_BEARER_TOKEN,'SYNTHETIC_SAM_ONLY');
});
test('operator health cannot be mistaken for SAM readiness or expose authentication evidence',async()=>{
  const server=launcher.startDiagnostic(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  try{
    const origin='http://127.0.0.1:'+server.address().port;
    const health=await fetch(origin+'/_operator/health');
    assert.equal(health.status,200);
    assert.deepEqual(await health.json(),{kind:'TRUSTED_OPERATOR_HEALTH',applicationReady:false,executionEnabled:false,guestCreations:0,modelCalls:0});
    assert.equal((await fetch(origin+'/readyz')).status,503);
    assert.equal((await fetch(origin+'/api/goals')).status,503);
    assert.equal((await fetch(origin+'/_operator/health',{method:'POST'})).status,405);
  }finally{await new Promise(resolve=>server.close(resolve))}
});
