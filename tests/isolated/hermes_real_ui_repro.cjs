// Independent reproduction only: no patch, browser, network, server or credentials.
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {test}=require('node:test');

test('switching goals must immediately replace the previous final report and evidence',()=>{
  const source=readFileSync(join(__dirname,'../../apps/command-center/src/ui.ts'),'utf8');
  const html=vm.runInNewContext(source.replace('export const commandCenterHtml=','const commandCenterHtml=')+';commandCenterHtml');
  const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const elements=new Map();
  const element=id=>{
    if(!elements.has(id)){
      let text='',markup='';
      elements.set(id,{get textContent(){return text},set textContent(value){text=String(value);markup=text},
        get innerHTML(){return markup},set innerHTML(value){markup=String(value)},hidden:false,disabled:true});
    }
    return elements.get(id);
  };
  element('finalReport').textContent='Report from goal A';
  element('finalReport').innerHTML='<p>Report from goal A</p>';
  element('timeline').textContent='Evidence from goal A';
  const context={document:{getElementById:element,body:{dataset:{}}},
    sessionStorage:{getItem:()=>'',removeItem:()=>{},setItem:()=>{}},
    setInterval:()=>0,fetch:()=>{throw Error('NETWORK_FORBIDDEN_IN_REPRO');}};
  vm.runInNewContext(script+"\napi=async()=>new Promise(()=>{}); timeline('goal-B');",context);
  assert.equal(element('goalProgress').textContent,'Loading goal evidence…');
  assert.notEqual(element('finalReport').innerHTML,'<p>Report from goal A</p>',
    'the selected goal is B but its final-report panel still displays goal A');
  assert.notEqual(element('timeline').textContent,'Evidence from goal A');
});
