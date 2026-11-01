import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createContext,Script} from 'node:vm';
import {commandCenterHtml} from '../../apps/command-center/src/ui';
import {COMPANY_ROSTER} from '../../apps/agents/src/company';
function harness(){
 const nodes=new Map<string,any>(),requests:{path:string;options:any}[]=[],storage=new Map();let current=Date.now(),refreshFails=false;
 const make=(tag:string)=>{const node:any={tag,children:[],dataset:{},value:'',hidden:false,className:'',_text:'',appendChild(child:any){this.children.push(child);return child;}};Object.defineProperty(node,'textContent',{get(){return this._text+this.children.map((c:any)=>c.textContent).join('');},set(value){this._text=String(value??'');this.children=[];}});return node;};
 const get=(id:string)=>{if(!nodes.has(id))nodes.set(id,make('div'));return nodes.get(id);};
 const collect=(node:any):any[]=>[node,...node.children.flatMap(collect)];
 const data={companyId:'synthetic-company',generatedAt:new Date(current).toISOString(),availability:'PERSISTED_WORK',staleAfterMs:45000,incidents:[],profiles:COMPANY_ROSTER.map(profile=>({...profile,state:profile.id==='marketplace'?'WORKING':'UNCONFIGURED',lastUpdated:null,cost:{status:'UNKNOWN',amount:null},skills:profile.id==='marketplace'?[{id:'skill-id',state:'ADOPTED',source_commit:'pinned-commit',source_hash:'pinned-hash',reviewCurrent:true,execution:'NOT_INSTALLED'}]:[],performance:{label:'لم يُقيّم',verified:0,failed:0},work:profile.id==='marketplace'?[{goal_id:'goal-id',queue_id:'task-id',plan_id:'plan-id',execution_id:'execution-id',verification_id:'verification-id',capability_id:'bol_get_offer',state:'WORKING',progress:{verified:0,total:1},cost:{status:'UNKNOWN',amount:null},result:{untrusted:'<img src=x onerror=alert(1)>'},evidence:{source:'persisted-evidence'}}]:[]}))};
 const reportData={availability:'AVAILABLE',settings:{enabled:false,timezone:'Asia/Damascus',daily_time:'08:00',weekly_time:'08:00',weekly_day:0},records:[{id:'report-id',report_type:'DAILY',period_key:'2026-11-01',status:'BLOCKED',artifact_hash:'saved-hash',receipt_id:null,artifact:{coverage:{sales:'UNKNOWN'}}}]};
 const body={dataset:{} as Record<string,string>};
 const context=createContext({Date:class extends Date{static now(){return current;}},sessionStorage:{getItem:(k:string)=>storage.get(k),setItem:(k:string,v:string)=>storage.set(k,v),removeItem:(k:string)=>storage.delete(k)},setInterval(){},document:{body,getElementById:get,createElement:make,querySelectorAll:(selector:string)=>selector==='#office-profiles [data-office-state]'?collect(get('office-profiles')).filter(n=>n.dataset.officeState):[]},fetch:async(path:string,options:any)=>{requests.push({path,options});if(refreshFails)throw Error('SYNTHETIC_REFRESH_FAILED');return {status:200,ok:true,json:async()=>({data:path==='/api/company/office'?data:path==='/api/company/reports'?reportData:path.includes('/timeline')?{reports:[],audit:[]}:[]})};}});
 new Script(commandCenterHtml.match(/<script>([\s\S]*?)<\/script>/)![1]).runInContext(context);
 return {get,collect,body,requests,data,failRefresh:(value=true)=>{refreshFails=value;},advance:(ms:number)=>{current+=ms;},run:(code:string)=>new Script(code).runInContext(context)};
}
test('existing office UI is opt-in, authenticated, evidence linked, RTL and stale-safe without HTML injection',async()=>{
 const ui=harness();await ui.run('refreshCompanyOffice()');assert.equal(ui.requests.length,0);
 ui.body.dataset.companyEnabled='true';await ui.run('refreshCompanyOffice()');assert.equal(ui.requests.length,0);assert.match(ui.get('office-status').textContent,/مصادقة/);
 await ui.run("token='synthetic-office-token';refreshCompanyOffice()");
 assert.equal(ui.requests[0].path,'/api/company/office');assert.equal(ui.requests[1].path,'/api/company/reports');assert.match(ui.get('office-reports').textContent,/report-id/);assert.match(ui.get('office-reports').textContent,/BLOCKED/);assert.match(ui.get('office-report-status').textContent,/غير مفعّلة/);assert.equal(ui.requests[0].options.headers.Authorization,'Bearer synthetic-office-token');
 const cards=ui.get('office-profiles').children;assert.equal(cards.length,15);assert.match(cards[5].textContent,/يعمل/);assert.match(cards[5].textContent,/execution-id/);assert.match(cards[5].textContent,/verification-id/);assert.match(cards[5].textContent,/UNKNOWN/);assert.match(cards[5].textContent,/NOT_INSTALLED/);assert.match(cards[5].textContent,/pinned-hash/);
 assert.equal(cards[5].innerHTML,undefined);assert.match(cards[5].textContent,/<img src=x onerror=alert\(1\)>/);
 const drill=ui.collect(cards[5]).find(n=>n.tag==='button');assert.ok(drill);await drill.onclick();assert.equal(ui.requests.at(-1)?.path,'/api/goals/goal-id/timeline');
 ui.failRefresh();await ui.run('refreshCompanyOffice()');
 for(const summary of ui.collect(ui.get('office-profiles')).filter(n=>n.tag==='summary'))assert.doesNotMatch(summary.textContent,/يعمل/);
 assert.match(ui.get('office-profiles').textContent,/task-id/);
 ui.failRefresh(false);await ui.run('refreshCompanyOffice()');assert.match(ui.get('office-profiles').textContent,/يعمل/);
 ui.advance(45001);ui.run('markOfficeStale()');assert.match(ui.get('office-status').textContent,/قديمة/);
 for(const node of ui.collect(ui.get('office-profiles')).filter(n=>n.dataset.officeState))assert.match(node.textContent,/غير معروف/);
 for(const summary of ui.collect(ui.get('office-profiles')).filter(n=>n.tag==='summary'))assert.doesNotMatch(summary.textContent,/يعمل/);
 assert.match(commandCenterHtml,/lang="ar" dir="rtl"/);assert.match(commandCenterHtml,/office-grid\{display:grid/);assert.match(commandCenterHtml,/focus-visible/);
});
