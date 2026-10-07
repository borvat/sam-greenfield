import assert from "node:assert/strict";
import { createServer } from "node:http";
import { pool } from "../../packages/db/src/client";
import { EBoekhoudenSoapClient } from "../../packages/eboekhouden/src/client";
import { EBoekhoudenInvoicesAdapter,EBoekhoudenMutationsAdapter,EBoekhoudenOpenItemsAdapter } from "../../apps/tools/src/eboekhoudenAdapters";
import { EBoekhoudenInvoicesVerifier,EBoekhoudenMutationsVerifier,EBoekhoudenOpenItemsVerifier } from "../../apps/production/src/eboekhoudenVerifiers";
import { withEBoekhoudenFromEnv,EBOEKHOUDEN_VERIFICATION_CONTRACTS } from "../../apps/production/src/eboekhoudenBundle";
import { validateProductionBundle } from "../../apps/production/src/bundle";
import { syncVerificationContracts } from "../../apps/production/src/verificationContracts";

function envelope(body:string){
  return `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>${body}</soap:Body></soap:Envelope>`;
}

async function mock(){
  const seen:any[]=[];
  let opened=0,closed=0;

  const server=createServer(async(req,res)=>{
    const chunks:Buffer[]=[];
    for await(const chunk of req) chunks.push(Buffer.from(chunk));
    const body=Buffer.concat(chunks).toString("utf8");
    seen.push({headers:req.headers,body});
    res.setHeader("content-type","text/xml; charset=utf-8");

    const action=String(req.headers.soapaction??"").replace(/"/g,"");
    if(action.endsWith("/OpenSession")){
      opened+=1;
      assert.ok(body.includes("<soap:Username>user</soap:Username>"));
      assert.ok(body.includes("<soap:SecurityCode1>code1</soap:SecurityCode1>"));
      assert.ok(body.includes("<soap:SecurityCode2>code2</soap:SecurityCode2>"));
      res.end(envelope('<OpenSessionResponse xmlns="http://www.e-boekhouden.nl/soap"><OpenSessionResult><SessionID>S-123</SessionID></OpenSessionResult></OpenSessionResponse>'));
      return;
    }

    if(action.endsWith("/CloseSession")){
      closed+=1;
      assert.ok(body.includes("<soap:SessionID>S-123</soap:SessionID>"));
      res.end(envelope('<CloseSessionResponse xmlns="http://www.e-boekhouden.nl/soap"><CloseSessionResult>true</CloseSessionResult></CloseSessionResponse>'));
      return;
    }

    assert.ok(body.includes("<soap:SessionID>S-123</soap:SessionID>"));
    assert.ok(body.includes("<soap:SecurityCode2>code2</soap:SecurityCode2>"));

    if(action.endsWith("/GetFacturen")){
      if(body.includes("<soap:Relatiecode>MANY</soap:Relatiecode>")){
        const many=Array.from({length:501},(_,i)=>
          `<cFactuur><Factuurnummer>M-${i+1}</Factuurnummer><Relatiecode>MANY</Relatiecode></cFactuur>`
        ).join("");
        res.end(envelope(`<GetFacturenResponse xmlns="http://www.e-boekhouden.nl/soap"><GetFacturenResult><Facturen>${many}</Facturen></GetFacturenResult></GetFacturenResponse>`));
        return;
      }
      assert.ok(body.includes("<soap:Relatiecode>REL1</soap:Relatiecode>"));
      res.end(envelope('<GetFacturenResponse xmlns="http://www.e-boekhouden.nl/soap"><GetFacturenResult><Facturen><cFactuur><Factuurnummer>F-1</Factuurnummer><Relatiecode>REL1</Relatiecode><TotaalInclBTW>121.00</TotaalInclBTW></cFactuur><cFactuur><Factuurnummer>F-2</Factuurnummer><Relatiecode>REL1</Relatiecode><TotaalInclBTW>242.00</TotaalInclBTW></cFactuur></Facturen></GetFacturenResult></GetFacturenResponse>'));
      return;
    }

    if(action.endsWith("/GetMutaties")){
      if(body.includes("<soap:Factuurnummer>FAIL</soap:Factuurnummer>")){
        res.statusCode=500;
        res.end(envelope('<soap:Fault><faultcode>Server</faultcode><faultstring>forced failure</faultstring></soap:Fault>'));
        return;
      }
      assert.ok(body.includes("<soap:DatumVan>2026-10-01</soap:DatumVan>"));
      res.end(envelope('<GetMutatiesResponse xmlns="http://www.e-boekhouden.nl/soap"><GetMutatiesResult><Mutaties><cMutatie><Mutatienr>100</Mutatienr><Datum>2026-10-01</Datum><Factuurnummer>F-1</Factuurnummer></cMutatie><cMutatie><Mutatienr>101</Mutatienr><Datum>2026-10-02</Datum><Factuurnummer>F-2</Factuurnummer></cMutatie></Mutaties></GetMutatiesResult></GetMutatiesResponse>'));
      return;
    }

    if(action.endsWith("/GetOpenPosten")){
      assert.ok(body.includes("<soap:OpSoort>Debiteuren</soap:OpSoort>"));
      res.end(envelope('<GetOpenPostenResponse xmlns="http://www.e-boekhouden.nl/soap"><GetOpenPostenResult><OpenPosten><cOpenPost><MutFactuur>F-1</MutFactuur><Relcode>REL1</Relcode><Openstaand>121.00</Openstaand></cOpenPost></OpenPosten></GetOpenPostenResult></GetOpenPostenResponse>'));
      return;
    }

    res.statusCode=500;
    res.end(envelope('<soap:Fault><faultcode>unknown</faultcode><faultstring>Unknown action</faultstring></soap:Fault>'));
  });

  await new Promise<void>((resolve)=>server.listen(0,"127.0.0.1",()=>resolve()));
  const address=server.address();
  if(!address||typeof address==="string") throw new Error("mock unavailable");
  return {server,seen,get opened(){return opened},get closed(){return closed},endpoint:`http://127.0.0.1:${address.port}`};
}

async function main(){
  const m=await mock();
  const client=new EBoekhoudenSoapClient({
    credentials:{username:"user",securityCode1:"code1",securityCode2:"code2",source:"SAM"},
    endpoint:m.endpoint
  });

  const invoices=await new EBoekhoudenInvoicesAdapter(client).execute({
    capabilityId:"eboekhouden_get_invoices",
    idempotencyKey:"read-inv",
    params:{relation_code:"REL1",limit:1}
  });
  assert.equal((invoices.result as any).count,1);
  assert.equal((invoices.result as any).items[0].Factuurnummer,"F-1");

  const manyInvoices=await new EBoekhoudenInvoicesAdapter(client).execute({
    capabilityId:"eboekhouden_get_invoices",
    idempotencyKey:"read-many",
    params:{relation_code:"MANY",limit:999}
  });
  assert.equal((manyInvoices.result as any).count,500);
  assert.equal((manyInvoices.result as any).items[499].Factuurnummer,"M-500");

  const mutations=await new EBoekhoudenMutationsAdapter(client).execute({
    capabilityId:"eboekhouden_get_mutations",
    idempotencyKey:"read-mut",
    params:{date_from:"2026-10-01",limit:2}
  });
  assert.equal((mutations.result as any).count,2);
  assert.equal((mutations.result as any).items[0].Mutatienr,"100");

  const openItems=await new EBoekhoudenOpenItemsAdapter(client).execute({
    capabilityId:"eboekhouden_get_open_items",
    idempotencyKey:"read-open",
    params:{kind:"Debiteuren",limit:10}
  });
  assert.equal((openItems.result as any).count,1);
  assert.equal((openItems.result as any).items[0].MutFactuur,"F-1");

  const beforeFailureClose=m.closed;
  let forcedFailure=false;
  try{
    await client.getMutations({invoiceNumber:"FAIL"});
  }catch(err){
    forcedFailure=err instanceof Error&&err.message.includes("HTTP 500");
  }
  assert.equal(forcedFailure,true);
  assert.equal(m.closed,beforeFailureClose+1);

  const invVerify=await new EBoekhoudenInvoicesVerifier(client).verify({
    execution:{id:"e1",capabilityId:"eboekhouden_get_invoices",params:{relation_code:"REL1",limit:1},evidence:{count:1},operationKeyRef:null},
    contract:{id:"c1",method:"api_readback",requiredEvidenceFields:{},independentQueryTemplate:{}}
  });
  assert.equal(invVerify.result,"VERIFIED");

  const mutVerify=await new EBoekhoudenMutationsVerifier(client).verify({
    execution:{id:"e2",capabilityId:"eboekhouden_get_mutations",params:{date_from:"2026-10-01",limit:2},evidence:{count:2},operationKeyRef:null},
    contract:{id:"c2",method:"api_readback",requiredEvidenceFields:{},independentQueryTemplate:{}}
  });
  assert.equal(mutVerify.result,"VERIFIED");

  const openVerify=await new EBoekhoudenOpenItemsVerifier(client).verify({
    execution:{id:"e3",capabilityId:"eboekhouden_get_open_items",params:{kind:"Debiteuren",limit:10},evidence:{count:1},operationKeyRef:null},
    contract:{id:"c3",method:"api_readback",requiredEvidenceFields:{},independentQueryTemplate:{}}
  });
  assert.equal(openVerify.result,"VERIFIED");

  assert.equal(m.opened,m.closed);
  assert.equal(m.opened,8);

  const base={capabilities:[],toolDefinitions:[],toolAdapters:[]};
  const noEnv=withEBoekhoudenFromEnv(base,{} as NodeJS.ProcessEnv);
  assert.equal(noEnv.capabilities.length,0);

  const configured=withEBoekhoudenFromEnv(base,{
    EBOEKHOUDEN_USERNAME:"user",
    EBOEKHOUDEN_SECURITY_CODE1:"code1",
    EBOEKHOUDEN_SECURITY_CODE2:"code2",
    EBOEKHOUDEN_SOAP_ENDPOINT:m.endpoint
  } as NodeJS.ProcessEnv);
  const validated=validateProductionBundle(configured);
  const financeIds=configured.capabilities.map((x)=>x.capabilityId).sort();
  assert.deepEqual(financeIds,[
    "eboekhouden_get_invoices",
    "eboekhouden_get_mutations",
    "eboekhouden_get_open_items"
  ]);
  assert.ok(financeIds.every((id)=>id.startsWith("eboekhouden_get_")));
  assert.ok(configured.toolDefinitions.every((tool)=>tool.sideEffect===false));

  for(const id of ["eboekhouden_get_invoices","eboekhouden_get_mutations","eboekhouden_get_open_items"]){
    assert.equal(validated.catalog.get(id).authorityClass,"GREEN");
    assert.equal(validated.tools.definition(id).sideEffect,false);
    assert.ok(validated.verifiers.has(id));
  }

  await syncVerificationContracts(EBOEKHOUDEN_VERIFICATION_CONTRACTS);
  const contracts=await pool.query(
    "SELECT capability_id FROM verification_contracts WHERE capability_id=ANY($1::text[]) ORDER BY capability_id",
    [["eboekhouden_get_invoices","eboekhouden_get_mutations","eboekhouden_get_open_items"]]
  );
  assert.equal(contracts.rowCount,3);

  await new Promise<void>((resolve,reject)=>m.server.close((err)=>err?reject(err):resolve()));
  console.log("PHASE14_EBOEKHOUDEN_READ PASS capabilities=3");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
