/** Synthetic HTTP/embedded-script checks only; never connects to a database. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {Script,createContext} from 'node:vm';
import {request} from 'node:http';
import {startCommandCenterHttpServer} from '../../apps/command-center/src/http';
import {commandCenterHtml} from '../../apps/command-center/src/ui';

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const syntheticToken='synthetic-auth-test-only';

test('HTTP rejection classifies transport without serializing caller data; exact bearer and guards remain enforced',async t=>{
  const logs:string[]=[];
  t.mock.method(process.stderr,'write',(value:unknown)=>{logs.push(String(value));return true});
  const service=await startCommandCenterHttpServer({legalEntityId:'synthetic-unused',port:0,host:'127.0.0.1',bearerToken:syntheticToken,allowedHosts:'127.0.0.1',allowedOrigins:'https://synthetic.invalid'});
  t.after(()=>service.close());
  const address=service.server.address();assert.ok(address&&typeof address!=='string');
  const base='http://127.0.0.1:'+address.port;
  const ids=new Set<string>();
  for(const [authorization,reason] of [[undefined,'missing_authorization'],['Basic synthetic-sensitive-header','invalid_bearer_scheme'],['bearer '+syntheticToken,'invalid_bearer_scheme'],['Bearer synthetic-wrong-header','bearer_rejected'],['Bearer '+syntheticToken+'-altered','bearer_rejected'],['Bearer Synthetic-auth-test-only','bearer_rejected']] as const){
    const headers:Record<string,string>={'x-request-id':'synthetic-sensitive-request-id',cookie:'synthetic-sensitive-cookie'};
    if(authorization)headers.authorization=authorization;
    const response=await fetch(base+'/api/owner-memory?query=synthetic-sensitive-query',{headers});
    assert.equal(response.status,401);
    const body=await response.json();
    assert.deepEqual(Object.keys(body).sort(),['error','reason','request_id']);
    assert.equal(body.error,'unauthorized');assert.equal(body.reason,reason);assert.match(body.request_id,UUID);ids.add(body.request_id);
    const event=JSON.parse(logs.at(-1)!);
    assert.deepEqual(event,{event:'command_center_auth_rejected',method:'GET',reason,request_id:body.request_id});
  }
  assert.equal(ids.size,6);
  const arbitrary=await fetch(base+'/synthetic-sensitive-path?secret=synthetic-sensitive-query',{method:'PROPFIND',headers:{authorization:'Basic synthetic-sensitive-header'}});
  assert.equal(arbitrary.status,401);assert.equal(JSON.parse(logs.at(-1)!).method,'OTHER');
  // Use node:http because fetch normalizes Host instead of sending this override.
  const badHost=await new Promise<{status:number|undefined;body:any}>((resolve,reject)=>{
    const call=request(base+'/api/overview',{headers:{host:'other.invalid',authorization:'Bearer '+syntheticToken}},response=>{
      let body='';response.setEncoding('utf8');response.on('data',chunk=>body+=chunk);response.on('end',()=>resolve({status:response.statusCode,body:JSON.parse(body)}));
    });call.on('error',reject);call.end();
  });
  assert.deepEqual(badHost,{status:403,body:{error:'host_not_allowed'}});
  const badOrigin=await fetch(base+'/api/overview',{headers:{origin:'https://other.invalid',authorization:'Bearer '+syntheticToken}});
  assert.equal(badOrigin.status,403);assert.deepEqual(await badOrigin.json(),{error:'origin_not_allowed'});
  // OPTIONS passes the same auth boundary without invoking a business/DB handler.
  const accepted=await fetch(base+'/api/overview',{method:'OPTIONS',headers:{authorization:'Bearer '+syntheticToken,origin:'https://synthetic.invalid'}});
  assert.equal(accepted.status,204);assert.equal(accepted.headers.get('access-control-allow-origin'),'https://synthetic.invalid');
  const serialized=logs.join('');
  for(const value of [syntheticToken,'synthetic-sensitive-header','synthetic-wrong-header','Synthetic-auth-test-only','synthetic-sensitive-query','synthetic-sensitive-request-id','synthetic-sensitive-path','synthetic-sensitive-cookie'])assert.ok(!serialized.includes(value));
  assert.equal(logs.length,7);
});

test('routes that require a configured token retain denial and conservative diagnostics',async t=>{
  const logs:string[]=[];t.mock.method(process.stderr,'write',(value:unknown)=>{logs.push(String(value));return true});
  const service=await startCommandCenterHttpServer({legalEntityId:'synthetic-unused',port:0,host:'127.0.0.1'});t.after(()=>service.close());
  const address=service.server.address();assert.ok(address&&typeof address!=='string');
  const response=await fetch('http://127.0.0.1:'+address.port+'/api/owner-memory',{headers:{authorization:'Bearer synthetic-supplied'}});
  assert.equal(response.status,401);const body=await response.json();
  assert.equal(body.error,'unauthorized');assert.equal(body.reason,'authentication_unavailable');assert.match(body.request_id,UUID);
  assert.deepEqual(JSON.parse(logs[0]),{event:'command_center_auth_rejected',method:'GET',reason:'authentication_unavailable',request_id:body.request_id});
  assert.ok(!logs.join('').includes('synthetic-supplied'));
});

function uiHarness(reply:(path:string)=>Promise<any>){
  const nodes=new Map<string,any>(),storage=new Map<string,string>();
  const node=(id:string)=>{if(!nodes.has(id))nodes.set(id,{value:'',textContent:'',innerHTML:'',hidden:false,children:[],appendChild(value:any){this.children.push(value)}});return nodes.get(id)};
  const requests:{path:string;options:any}[]=[];
  const context=createContext({sessionStorage:{getItem:(key:string)=>storage.get(key)||'',setItem:(key:string,value:string)=>storage.set(key,value),removeItem:(key:string)=>storage.delete(key)},setInterval(){},document:{getElementById:node,querySelectorAll:()=>[],createElement:()=>({textContent:''}),body:{dataset:{}}},fetch:async(path:string,options:any)=>{requests.push({path,options});return reply(path)}});
  new Script(commandCenterHtml.match(/<script>([\s\S]*?)<\/script>/)![1]).runInContext(context);
  return {node,storage,requests,run:(code:string)=>new Script(code).runInContext(context)};
}

test('connect emits exact synthetic Bearer on same-origin API calls before concurrent rejections and clears input/session',async()=>{
  const pending:((value:any)=>void)[]=[];
  const ui=uiHarness(()=>new Promise(resolve=>pending.push(resolve)));
  ui.node('bearerToken').value='  '+syntheticToken+'  ';
  const connecting=ui.run('connect()');
  assert.equal(ui.node('bearerToken').value,'');assert.equal(ui.requests.length,3);
  assert.deepEqual(ui.requests.map(r=>r.path),['/api/overview','/api/goals','/api/finance/latest']);
  for(const {path,options} of ui.requests){assert.equal(options.headers.Authorization,'Bearer '+syntheticToken);assert.ok(!path.includes(syntheticToken));}
  for(const resolve of pending)resolve({status:401,ok:false,json:async()=>({error:'unauthorized',reason:'missing_authorization',request_id:'11111111-1111-4111-8111-111111111111'})});
  await connecting;
  assert.equal(ui.storage.size,0);assert.equal(ui.node('authPanel').hidden,false);assert.equal(ui.node('status').textContent,'AUTH REQUIRED');
  assert.match(ui.node('authError').textContent,/no Authorization header/i);assert.ok(!ui.node('authError').textContent.includes(syntheticToken));
});

test('UI renders bounded classified 401s, tolerates non-JSON proxy 401s, and omits unsafe metadata',async()=>{
  const id='11111111-1111-4111-8111-111111111111';
  for(const [body,pattern] of [
    [{error:'unauthorized',reason:'missing_authorization',request_id:id},/no Authorization header/i],
    [{error:'unauthorized',reason:'invalid_bearer_scheme',request_id:id},/required Bearer scheme/i],
    [{error:'unauthorized',reason:'bearer_rejected',request_id:id},/service rejected the Bearer credential/i],
    [{error:'unauthorized',reason:'authentication_unavailable',request_id:id},/Authentication was rejected/i],
    [{error:'synthetic-secret-error',reason:'synthetic-secret-reason',request_id:'synthetic-secret-id'},/Authentication was rejected/i],
    [null,/Authentication was rejected/i],
  ] as const){
    const ui=uiHarness(async()=>({status:401,ok:false,json:async()=>{if(body===null)throw SyntaxError('synthetic-secret-proxy');return body}}));
    await assert.rejects(ui.run("api('/api/overview')"),(error:any)=>{
      assert.match(error.message,pattern);assert.doesNotMatch(error.message,/correct bearer token|synthetic-secret/i);
      if(body?.request_id===id)assert.ok(error.message.includes(id));
      return true;
    });
  }
});

test('successful connect retains existing UI success behavior with synthetic responses',async()=>{
  const ui=uiHarness(async path=>({status:200,ok:true,json:async()=>({data:path==='/api/goals'?[]:path==='/api/finance/latest'?null:path==='/api/notifications'?{records:[]}:{active_goals:2}})}));
  ui.node('bearerToken').value=syntheticToken;await ui.run('connect()');
  assert.equal(ui.node('status').textContent,'LIVE');assert.equal(ui.node('authPanel').hidden,true);assert.equal(ui.node('bearerToken').value,'');
  assert.equal(ui.requests.at(-1)?.path,'/api/notifications');
});
