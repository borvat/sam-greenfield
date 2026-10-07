import assert from "node:assert/strict";
import {createServer} from "node:http";
import {pool} from "../../packages/db/src/client";
import {withFinanceReconciliationFromEnv,FINANCE_RECONCILIATION_CONTRACTS} from "../../apps/production/src/financeReconciliationBundle";
import {validateProductionBundle} from "../../apps/production/src/bundle";
import {syncVerificationContracts} from "../../apps/production/src/verificationContracts";
import {reconcileExactReferences,outstandingSnapshot} from "../../apps/finance/src/reconciliation";

async function mockBol(){
 let tokens=0;
 const server=createServer(async(req,res)=>{
  res.setHeader("content-type","application/json");
  if(req.url==="/token"){tokens++;res.end(JSON.stringify({access_token:"bt",expires_in:299}));return;}
  if(req.url?.startsWith("/retailer/invoices")){
    assert.equal(req.headers.authorization,"Bearer bt");
    res.end(JSON.stringify({invoiceListItems:[
      {invoiceId:"INV-100",amount:100},
      {invoiceId:"INV-200",amount:50},
      {invoiceId:"DUP",amount:10},
      {invoiceId:"DUP",amount:20}
    ]}));return;
  }
  res.statusCode=404;res.end(JSON.stringify({title:"not found"}));
 });
 await new Promise<void>(r=>server.listen(0,"127.0.0.1",()=>r()));
 const a=server.address();if(!a||typeof a==="string")throw new Error("bol mock");
 return {server,base:`http://127.0.0.1:${a.port}`,tokens:()=>tokens};
}
async function mockE(){
 let sessions=0;
 const server=createServer(async(req,res)=>{
  res.setHeader("content-type","application/json");
  if(req.url==="/v1/session"){sessions++;res.end(JSON.stringify({token:"et",expiresIn:3600}));return;}
  assert.equal(req.headers.authorization,"et");
  if(req.url?.startsWith("/v1/mutation/invoice/outstanding")){
    res.end(JSON.stringify({items:[{id:"O1",amount:42.5},{id:"O2",amount:"7.50"},{id:"O3"}]}));return;
  }
  if(req.url?.startsWith("/v1/mutation?")){
    res.end(JSON.stringify({items:[
      {id:"M1",invoiceNumber:"INV-100"},
      {id:"M2",invoiceNumber:"INV-300"},
      {id:"M3",invoiceNumber:"DUP"}
    ]}));return;
  }
  res.statusCode=404;res.end(JSON.stringify({message:"not found"}));
 });
 await new Promise<void>(r=>server.listen(0,"127.0.0.1",()=>r()));
 const a=server.address();if(!a||typeof a==="string")throw new Error("e mock");
 return {server,base:`http://127.0.0.1:${a.port}`,sessions:()=>sessions};
}

async function main(){
 const exact=reconcileExactReferences(
  {invoiceListItems:[{invoiceId:"A"},{invoiceId:"B"},{invoiceId:"D"},{invoiceId:"D"}]},
  {items:[{invoiceNumber:"A"},{invoiceNumber:"C"},{invoiceNumber:"D"}]}
 );
 assert.equal(exact.counts.matched,1);
 assert.equal(exact.counts.ambiguous,1);
 assert.equal(exact.counts.bolOnly,1);
 assert.equal(exact.counts.accountingOnly,1);

 const os=outstandingSnapshot({items:[{amount:10},{amount:"2.50"},{x:1}]});
 assert.deepEqual({count:os.count,total:os.totalKnownAmount,known:os.knownAmountRows},{count:3,total:12.5,known:2});

 const b=await mockBol(),e=await mockE();
 const env={
  BOL_CLIENT_ID:"id",BOL_CLIENT_SECRET:"secret",BOL_TOKEN_URL:`${b.base}/token`,BOL_RETAILER_BASE_URL:`${b.base}/retailer`,
  EBOEKHOUDEN_API_TOKEN:"api",EBOEKHOUDEN_API_BASE_URL:e.base,EBOEKHOUDEN_SOURCE:"SAM"
 } as NodeJS.ProcessEnv;
 const base={capabilities:[],toolDefinitions:[],toolAdapters:[]};
 assert.equal(withFinanceReconciliationFromEnv(base,{} as NodeJS.ProcessEnv).capabilities.length,0);
 assert.equal(withFinanceReconciliationFromEnv(base,{BOL_CLIENT_ID:"x",BOL_CLIENT_SECRET:"y"} as NodeJS.ProcessEnv).capabilities.length,0);

 const bundle=withFinanceReconciliationFromEnv(base,env);
 const v=validateProductionBundle(bundle);
 for(const id of ["finance_reconciliation_preview","finance_outstanding_snapshot"]){
  assert.equal(v.catalog.get(id).authorityClass,"GREEN");
  assert.equal(v.tools.definition(id).sideEffect,false);
  assert.ok(v.verifiers.has(id));
 }
 await syncVerificationContracts(FINANCE_RECONCILIATION_CONTRACTS);
 const q=await pool.query("SELECT capability_id FROM verification_contracts WHERE capability_id=ANY($1::text[])",[["finance_reconciliation_preview","finance_outstanding_snapshot"]]);
 assert.equal(q.rowCount,2);

 const preview=await v.tools.adapter("finance_reconciliation_preview").execute({
  capabilityId:"finance_reconciliation_preview",
  params:{period_start_date:"2026-09-01",period_end_date:"2026-09-30",limit:100,offset:0},
  idempotencyKey:"read"
 });
 const p=(preview.result as any).preview;
 assert.equal(p.counts.matched,1);
 assert.equal(p.counts.ambiguous,1);
 assert.equal(p.counts.bolOnly,1);
 assert.equal(p.counts.accountingOnly,1);
 assert.equal(preview.evidence.matching_policy,"exact_reference_only");

 const snapshot=await v.tools.adapter("finance_outstanding_snapshot").execute({
  capabilityId:"finance_outstanding_snapshot",params:{limit:100,offset:0},idempotencyKey:"read2"
 });
 assert.equal((snapshot.result as any).snapshot.count,3);
 assert.equal((snapshot.result as any).snapshot.totalKnownAmount,50);

 for(const [id,params] of [
  ["finance_reconciliation_preview",{period_start_date:"2026-09-01",period_end_date:"2026-09-30",limit:100,offset:0}],
  ["finance_outstanding_snapshot",{limit:100,offset:0}]
 ] as const){
  const vr=await v.verifiers.get(id)!.verify({execution:{id:`e-${id}`,capabilityId:id,params:{...params},evidence:{},operationKeyRef:null},contract:{id:`c-${id}`,method:"api_readback",requiredEvidenceFields:{},independentQueryTemplate:{}}});
  assert.equal(vr.result,"VERIFIED");
 }
 assert.equal(b.tokens(),1);
 assert.equal(e.sessions(),1);
 await new Promise<void>((resolve,reject)=>b.server.close(err=>err?reject(err):resolve()));
 await new Promise<void>((resolve,reject)=>e.server.close(err=>err?reject(err):resolve()));
 console.log("PHASE17_FINANCE_RECONCILIATION PASS capabilities=2");
 await pool.end();
}
main().catch(async e=>{console.error(e);await pool.end();process.exit(1);});
