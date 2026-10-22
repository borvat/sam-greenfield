import assert from 'node:assert/strict';
import {createDevelopmentLookups,ids} from '../../packages/public-lookups/src';
const at=Date.parse('2026-10-22T12:00:00Z');
const fx={base:'EUR',quote:'USD',date:'2026-10-22',rate:1.1,providers:['ecb']};
const vat={valid:true,country_code:'DE',vat_number:'000000000'}; // synthetic, never sent
const json=(body:unknown,status=200,headers:Record<string,string>={})=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json',...headers}});
function fixture(response:()=>Promise<Response>|Response){
 let time=at;const calls:{url:string;options:RequestInit|undefined}[]=[];
 const adapters=createDevelopmentLookups({now:()=>time,fetch:(async(url,options)=>{calls.push({url:String(url),options});return response();}) as typeof fetch});
 return {calls,advance:(ms:number)=>time+=ms,run:(kind:'currency'|'vat',params:Record<string,unknown>=kind==='currency'?{base:'EUR',quote:'USD'}:{country:'DE',number:'000000000'})=>adapters[kind==='currency'?0:1].execute({capabilityId:ids[kind],params,idempotencyKey:'fixture'})};
}
async function main(){
 let checks=0;
 for(const params of [{base:'EUR',quote:'USD',url:'https://evil.test'}, {base:'../',quote:'USD'},{base:'EUR',quote:'EUR'},{base:'EUR',quote:'USD',date:'2026-02-30'},{base:'EUR',quote:'USD',date:'2027-01-01'},{base:'EUR',quote:'USD',date:'1947-01-01'}]){
  const f=fixture(()=>json([fx]));await assert.rejects(()=>f.run('currency',params),/INPUT_INVALID/);assert.equal(f.calls.length,0);checks++;
 }
 for(const params of [{country:'GB',number:'000000000'},{country:'DE',number:'https://evil'},{country:'DE',number:'DE000000000'},{country:'DE',number:'123'},{country:'DE',number:'٠٠٠٠٠٠٠٠٠'},{country:'DE',number:'000000000',customer:'private'}]){
  const f=fixture(()=>json(vat));await assert.rejects(()=>f.run('vat',params),/INPUT_INVALID/);assert.equal(f.calls.length,0);checks++;
 }
 const f=fixture(()=>json([fx]));const first=await f.run('currency');assert.equal(first.result.status,'available');assert.equal(first.result.executableBankRate,false);assert.equal(first.evidence.sourceDate,'2026-10-22');
 assert.equal(f.calls[0].url,'https://api.frankfurter.dev/v2/rates?base=EUR&quotes=USD&expand=providers');assert.equal(f.calls[0].options?.redirect,'error');assert.equal(f.calls[0].options?.credentials,'omit');
 f.advance(100);first.result.rate=999;const cached=await f.run('currency');assert.equal(cached.result.rate,1.1);assert.equal(cached.evidence.cached,true);assert.equal(f.calls.length,1);assert.notEqual(cached.evidence.observedAt,cached.evidence.retrievedAt);
 f.advance(3600000);await f.run('currency');assert.equal(f.calls.length,2);checks++;
 const stale=await fixture(()=>json([{...fx,date:'2026-10-01'}])).run('currency');assert.equal(stale.result.stale,true);checks++;
 const historical=await fixture(()=>json([{...fx,date:'2024-05-17'}])).run('currency',{base:'eur',quote:'usd',date:'2024-05-18'});assert.equal(historical.result.dateMatchesRequest,false);assert.equal(historical.evidence.sourceDate,'2024-05-17');checks++;
 for(const body of [[],[fx,fx],[{...fx,base:'GBP'}],[{...fx,date:'2026-10-23'}],[{...fx,rate:0}],[{...fx,rate:'1.1'}],[{...fx,date:'bad'}],{error:'oops'}]){
  assert.equal((await fixture(()=>json(body)).run('currency')).result.status,'unavailable');checks++;
 }
 for(const status of [400,404,422,429,500,503])for(const kind of ['currency','vat'] as const){
  const g=fixture(()=>json({detail:'TIMEOUT'},status));const out=await g.run(kind);assert.equal(out.result.status,kind==='vat'?'unknown':'unavailable');assert.equal(g.calls.length,1);checks++;
 }
 for(const valid of [true,false]){
  const g=fixture(()=>json({...vat,valid}));const out=await g.run('vat',{country:' de ',number:'000-000 000'});
  assert.equal(out.result.status,valid?'valid':'invalid');assert.equal(out.evidence.sourceDate,null);assert.equal(JSON.stringify(out).includes('000000000'),false);assert.equal(g.calls[0].url,'https://api.vatcomply.com/vat?vat_number=DE000000000');
  g.advance(1000);await g.run('vat');assert.equal(g.calls.length,2);checks++;
 }
 const greek=await fixture(()=>json({...vat,country_code:'EL'})).run('vat',{country:'GR',number:'000000000'});assert.equal(greek.result.status,'valid');checks++;
 for(const body of [{...vat,valid:'false'},{...vat,country_code:'NL'},{...vat,vat_number:'999999999'},{valid:false},{error:'MS_UNAVAILABLE'},{...vat,valid:false,detail:'TIMEOUT'}]){assert.equal((await fixture(()=>json(body)).run('vat')).result.status,'unknown');checks++;}
 const throttle=fixture(()=>json([fx]));await throttle.run('currency');assert.equal((await throttle.run('currency',{base:'EUR',quote:'GBP'})).result.reason,'rate_limited');assert.equal(throttle.calls.length,1);checks++;
 for(const retry of ['120','Thu, 22 Oct 2026 12:02:00 GMT']){
  const g=fixture(()=>json({},429,{'retry-after':retry}));await g.run('vat');g.advance(60000);assert.equal((await g.run('vat')).result.status,'unknown');assert.equal(g.calls.length,1);g.advance(61000);await g.run('vat');assert.equal(g.calls.length,2);checks++;
 }
 for(const response of [()=>{throw Error('https://private-id');},()=>new Response('html'),()=>new Response('{',{headers:{'content-type':'application/json'}}),()=>json('x'.repeat(20000))]){
  const out=await fixture(response).run('vat');assert.equal(out.result.status,'unknown');assert.equal(JSON.stringify(out).includes('private-id'),false);checks++;
 }
 const slow=fixture(()=>new Promise(()=>{}));const start=Date.now();assert.equal((await slow.run('vat')).result.reason,'timeout');assert.ok(Date.now()-start<6500);assert.equal(slow.calls[0].options?.signal?.aborted,true);checks++;
 const stream=fixture(()=>new Response(new ReadableStream({start(){}}),{headers:{'content-type':'application/json'}}));assert.equal((await stream.run('currency')).result.reason,'timeout');checks++;
 let clock=at,count=0;
 const cacheTest=createDevelopmentLookups({now:()=>clock,fetch:(async(input)=>{count++;const u=new URL(String(input));return json([{...fx,date:u.searchParams.get('date')}]);}) as typeof fetch})[0];
 const runDate=(date:string)=>cacheTest.execute({capabilityId:ids.currency,params:{base:'EUR',quote:'USD',date},idempotencyKey:'fixture'});
 for(let i=0;i<101;i++){clock+=1000;await runDate(new Date(Date.parse('2024-01-01')+i*86400000).toISOString().slice(0,10));}
 clock+=1000;await runDate('2024-01-01');assert.equal(count,102);checks++;
 const missingCache=fixture(()=>json([],200));await missingCache.run('currency');missingCache.advance(1000);await missingCache.run('currency');assert.equal(missingCache.calls.length,2);checks++;
 console.log(`PASS ${checks} adapter scenarios (synthetic fixtures only; zero live VAT calls)`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
