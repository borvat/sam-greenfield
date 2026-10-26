// Immutable SAM verifier for the real UI task. No network, credentials or packages.
// Run this controller-owned file in the independent guest against /workspace/ui.ts.
// Locally it defaults to the untouched pinned repository source (known failure).
'use strict';
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {test}=require('node:test');
const sourcePath=process.env.SAM_UI_SOURCE_PATH??join(__dirname,'../../apps/command-center/src/ui.ts');
const source=readFileSync(sourcePath,'utf8');
function harness(){
  const html=vm.runInNewContext(source.replace('export const commandCenterHtml=','const commandCenterHtml=')+';commandCenterHtml',{}, {timeout:1000});
  const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.equal(typeof script,'string');
  const elements=new Map(),calls=[];
  function element(id){
    if(!elements.has(id)){
      let text='',markup='';
      elements.set(id,{get textContent(){return text},set textContent(value){text=String(value);markup=text},
        get innerHTML(){return markup},set innerHTML(value){markup=String(value)},hidden:false,disabled:true});
    }
    return elements.get(id);
  }
  const context=vm.createContext({document:{getElementById:element,body:{dataset:{}}},
    sessionStorage:{getItem:()=>'',removeItem:()=>{},setItem:()=>{}},setInterval:()=>0,
    fetch:()=>{throw Error('NETWORK_FORBIDDEN_IN_ACCEPTANCE');},calls});
  vm.runInContext(script+"\napi=path=>new Promise((resolve,reject)=>calls.push({path,resolve,reject}));",context,{timeout:1000});
  element('finalReport').innerHTML='<p>Old goal A report</p>';
  element('timeline').textContent='Old goal A raw evidence';
  return {element,calls,select:id=>vm.runInContext('timeline('+JSON.stringify(id)+')',context,{timeout:1000})};
}
function response(id){
  return {data:{goal:{id},progress:{displayState:'VERIFIED',startedAt:'synthetic',lastProgressAt:'synthetic',
    currentPlanId:id,attempts:1,executedCount:1,verifiedCount:1,tools:[],blockedReason:[],
    finalReport:{summary:'Report '+id,findings:[],limitations:[]}},budget:null}};
}
test('selection immediately replaces the previous final report with a loading state',async()=>{
  const h=harness(),pending=h.select('B');
  assert.notEqual(h.element('finalReport').innerHTML,'<p>Old goal A report</p>');
  assert.match(h.element('finalReport').textContent,/loading/i);
  h.calls[0].resolve(response('B'));await pending;
});
test('selection immediately replaces previous raw evidence with a loading state',async()=>{
  const h=harness(),pending=h.select('B');
  assert.notEqual(h.element('timeline').textContent,'Old goal A raw evidence');
  assert.match(h.element('timeline').textContent,/loading/i);
  h.calls[0].resolve(response('B'));await pending;
});
test('successful response renders the selected report and its raw evidence',async()=>{
  const h=harness(),pending=h.select('B');
  assert.equal(h.calls[0].path,'/api/goals/B/timeline');
  h.calls[0].resolve(response('B'));await pending;
  assert.match(h.element('finalReport').innerHTML,/Report B/);
  assert(!h.element('finalReport').innerHTML.includes('Old goal A'));
  assert.equal(JSON.parse(h.element('timeline').textContent).goal.id,'B');
});
test('failed response removes old report and presents unavailable evidence',async()=>{
  const h=harness(),pending=h.select('B');h.calls[0].reject(Error('synthetic failure'));await pending;
  assert.equal(h.element('finalReport').textContent,'Unavailable');
  assert.match(h.element('goalProgress').textContent,/Evidence unavailable/);
  assert.equal(h.element('timeline').textContent,'synthetic failure');
});
test('late success or failure for A cannot overwrite the already selected B',async()=>{
  for(const rejectOld of [false,true]){
    const h=harness(),a=h.select('A'),b=h.select('B');
    h.calls[1].resolve(response('B'));await b;
    const before={report:h.element('finalReport').innerHTML,raw:h.element('timeline').textContent,
      progress:h.element('goalProgress').innerHTML};
    if(rejectOld)h.calls[0].reject(Error('late A error'));else h.calls[0].resolve(response('A'));
    await a;
    assert.deepEqual({report:h.element('finalReport').innerHTML,raw:h.element('timeline').textContent,
      progress:h.element('goalProgress').innerHTML},before);
  }
});
