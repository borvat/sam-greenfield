import assert from "node:assert/strict";
import { createServer } from "node:http";
import { pool } from "../../packages/db/src/client";
import { EBoekhoudenClient } from "../../packages/eboekhouden/src/client";
import { withEBoekhoudenFromEnv,EBOEKHOUDEN_VERIFICATION_CONTRACTS } from "../../apps/production/src/eboekhoudenBundle";
import { validateProductionBundle } from "../../apps/production/src/bundle";
import { syncVerificationContracts } from "../../apps/production/src/verificationContracts";

async function mock(){
  const seen:any[]=[];
  let sessions=0;
  let force401=true;
  const server=createServer(async(req,res)=>{
    const chunks:Buffer[]=[];
    for await(const chunk of req) chunks.push(Buffer.from(chunk));
    const text=Buffer.concat(chunks).toString("utf8");
    seen.push({url:req.url,method:req.method,headers:req.headers,text});
    res.setHeader("content-type","application/json");

    if(req.url==="/v1/session"){
      sessions+=1;
      const body=JSON.parse(text);
      assert.equal(body.accessToken,"api-secret");
      assert.equal(body.source,"SAM");
      res.end(JSON.stringify({token:`session-${sessions}`,expiresIn:3600}));
      return;
    }

    if(force401&&req.url?.startsWith("/v1/mutation?")){
      force401=false;
      assert.equal(req.headers.authorization,"session-1");
      res.statusCode=401;
      res.end(JSON.stringify({message:"expired"}));
      return;
    }

    assert.equal(req.headers.authorization,`session-${sessions}`);

    if(req.url?.startsWith("/v1/mutation/invoice/outstanding?")){
      res.end(JSON.stringify({items:[{id:"o1",amount:42}]}));
      return;
    }
    if(req.url?.startsWith("/v1/mutation?")){
      const u=new URL(`http://local${req.url}`);
      assert.equal(u.searchParams.get("limit"),"100");
      assert.equal(u.searchParams.get("offset"),"0");
      res.end(JSON.stringify({items:[{id:"m1"}]}));
      return;
    }
    if(req.url?.startsWith("/v1/ledger?")){
      res.end(JSON.stringify({items:[{id:"l1",code:"8000"}]}));
      return;
    }
    if(req.url?.startsWith("/v1/relation?")){
      res.end(JSON.stringify({items:[{id:"r1",name:"Customer"}]}));
      return;
    }

    res.statusCode=404;
    res.end(JSON.stringify({message:"not found"}));
  });

  await new Promise<void>((resolve)=>server.listen(0,"127.0.0.1",()=>resolve()));
  const address=server.address();
  if(!address||typeof address==="string") throw new Error("mock unavailable");
  return {server,seen,base:`http://127.0.0.1:${address.port}`,getSessions:()=>sessions};
}

async function main(){
  const m=await mock();
  const client=new EBoekhoudenClient({
    apiToken:"api-secret",
    source:"SAM",
    baseUrl:m.base
  });

  const mutations=await client.listMutations({limit:999,offset:-10});
  assert.equal(mutations.items[0].id,"m1");
  assert.equal(m.getSessions(),2);

  const outstanding=await client.getOutstandingInvoices({limit:25,offset:0});
  assert.equal(outstanding.items[0].id,"o1");
  const ledgers=await client.listLedgers({limit:25,offset:0});
  assert.equal(ledgers.items[0].id,"l1");
  const relations=await client.listRelations({limit:25,offset:0});
  assert.equal(relations.items[0].id,"r1");
  assert.equal(m.getSessions(),2);

  const emptyBase={capabilities:[],toolDefinitions:[],toolAdapters:[]};
  const noToken=withEBoekhoudenFromEnv(emptyBase,{} as NodeJS.ProcessEnv);
  assert.equal(noToken.capabilities.length,0);

  const configured=withEBoekhoudenFromEnv(emptyBase,{
    EBOEKHOUDEN_API_TOKEN:"api-secret",
    EBOEKHOUDEN_SOURCE:"SAM",
    EBOEKHOUDEN_API_BASE_URL:m.base
  } as NodeJS.ProcessEnv);
  const validated=validateProductionBundle(configured);
  for(const id of [
    "eboekhouden_list_mutations",
    "eboekhouden_outstanding_invoices",
    "eboekhouden_list_ledgers",
    "eboekhouden_list_relations"
  ]){
    assert.equal(validated.catalog.get(id).authorityClass,"GREEN");
    assert.equal(validated.tools.definition(id).sideEffect,false);
    assert.ok(validated.verifiers.has(id));
  }

  await syncVerificationContracts(EBOEKHOUDEN_VERIFICATION_CONTRACTS);
  const contracts=await pool.query(
    "SELECT capability_id FROM verification_contracts WHERE capability_id LIKE 'eboekhouden_%' ORDER BY capability_id"
  );
  assert.equal(contracts.rowCount,4);

  const adapter=validated.tools.adapter("eboekhouden_list_ledgers");
  const read=await adapter.execute({
    capabilityId:"eboekhouden_list_ledgers",
    params:{limit:10,offset:0},
    idempotencyKey:"read-only"
  });
  assert.equal((read.result as any).data.items[0].id,"l1");

  const verifier=validated.verifiers.get("eboekhouden_list_ledgers")!;
  const verified=await verifier.verify({
    execution:{
      id:"e14",
      capabilityId:"eboekhouden_list_ledgers",
      params:{limit:10,offset:0},
      evidence:read.evidence,
      operationKeyRef:null
    },
    contract:{id:"c14",method:"api_readback",requiredEvidenceFields:{},independentQueryTemplate:{}}
  });
  assert.equal(verified.result,"VERIFIED");

  await new Promise<void>((resolve,reject)=>m.server.close((err)=>err?reject(err):resolve()));
  console.log("PHASE14_EBOEKHOUDEN_READ PASS capabilities=4");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
