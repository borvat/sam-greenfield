import assert from "node:assert/strict";
import { createServer } from "node:http";
import { pool } from "../../packages/db/src/client";
import { GoogleRefreshTokenProvider } from "../../packages/google-auth/src/refreshToken";
import { GmailApiClient } from "../../packages/gmail/src/client";
import { withGmailFromEnv,GMAIL_READ_VERIFICATION_CONTRACTS } from "../../apps/production/src/gmailBundle";
import { validateProductionBundle } from "../../apps/production/src/bundle";
import { syncVerificationContracts } from "../../apps/production/src/verificationContracts";

async function mock(){
  const seen:any[]=[];
  const server=createServer(async(req,res)=>{
    const chunks:Buffer[]=[];
    for await(const chunk of req) chunks.push(Buffer.from(chunk));
    const text=Buffer.concat(chunks).toString("utf8");
    seen.push({url:req.url,method:req.method,headers:req.headers,text});
    res.setHeader("content-type","application/json");

    if(req.url==="/token"){
      res.end(JSON.stringify({access_token:"gmail-read-access",expires_in:3600}));
      return;
    }

    assert.equal(req.headers.authorization,"Bearer gmail-read-access");

    if(req.url?.startsWith("/gmail/v1/users/me/threads?")){
      const u=new URL(`http://local${req.url}`);
      assert.equal(u.searchParams.get("maxResults"),"500");
      assert.equal(u.searchParams.get("q"),"from:supplier@example.com is:unread");
      assert.equal(u.searchParams.get("includeSpamTrash"),"false");
      assert.deepEqual(u.searchParams.getAll("labelIds"),["INBOX","IMPORTANT"]);
      res.end(JSON.stringify({
        threads:[{id:"t1",snippet:"Supplier reply"}],
        nextPageToken:"next",
        resultSizeEstimate:1
      }));
      return;
    }

    if(req.url==="/gmail/v1/users/me/threads/t1?format=full"){
      res.end(JSON.stringify({
        id:"t1",
        historyId:"10",
        messages:[{id:"m1",threadId:"t1",snippet:"Supplier reply"}]
      }));
      return;
    }

    if(req.url==="/gmail/v1/users/me/messages/m1?format=full"){
      res.end(JSON.stringify({
        id:"m1",
        threadId:"t1",
        snippet:"Supplier reply",
        payload:{headers:[{name:"Subject",value:"Quotation"}]}
      }));
      return;
    }

    res.statusCode=404;
    res.end(JSON.stringify({error:{message:"not found"}}));
  });

  await new Promise<void>((resolve)=>server.listen(0,"127.0.0.1",()=>resolve()));
  const address=server.address();
  if(!address||typeof address==="string") throw new Error("mock unavailable");
  return {server,seen,base:`http://127.0.0.1:${address.port}`};
}

async function main(){
  const m=await mock();
  const tokens=new GoogleRefreshTokenProvider({
    clientId:"client",
    clientSecret:"secret",
    refreshToken:"refresh",
    tokenUrl:`${m.base}/token`
  });
  const client=new GmailApiClient({
    tokens,
    baseUrl:`${m.base}/gmail/v1`
  });

  const search=await client.searchThreads({
    query:"from:supplier@example.com is:unread",
    maxResults:999,
    labelIds:["INBOX","IMPORTANT"],
    includeSpamTrash:false
  });
  assert.equal(search.threads[0].id,"t1");

  const thread=await client.getThread("t1","full");
  assert.equal(thread.messages[0].id,"m1");

  const message=await client.getMessageWithFormat("m1","full");
  assert.equal(message.threadId,"t1");

  const base={capabilities:[],toolDefinitions:[],toolAdapters:[]};
  const configured=withGmailFromEnv(base,{
    GOOGLE_OAUTH_CLIENT_ID:"client",
    GOOGLE_OAUTH_CLIENT_SECRET:"secret",
    GOOGLE_OAUTH_REFRESH_TOKEN:"refresh",
    GOOGLE_OAUTH_TOKEN_URL:`${m.base}/token`,
    GMAIL_API_BASE_URL:`${m.base}/gmail/v1`
  } as NodeJS.ProcessEnv);
  const validated=validateProductionBundle(configured);

  for(const id of ["gmail_search_threads","gmail_get_thread","gmail_get_message"]){
    assert.equal(validated.catalog.get(id).authorityClass,"GREEN");
    assert.equal(validated.tools.definition(id).sideEffect,false);
    assert.ok(validated.verifiers.has(id));
  }
  assert.equal(validated.catalog.get("gmail_send").authorityClass,"YELLOW");
  assert.equal(validated.tools.definition("gmail_send").sideEffect,true);

  await syncVerificationContracts(GMAIL_READ_VERIFICATION_CONTRACTS);
  const expected=["gmail_search_threads","gmail_get_thread","gmail_get_message"];
  const contracts=await pool.query(
    "SELECT capability_id FROM verification_contracts WHERE capability_id=ANY($1::text[]) ORDER BY capability_id",
    [expected]
  );
  assert.equal(contracts.rowCount,3);

  const inputs:any={
    gmail_search_threads:{
      query:"from:supplier@example.com is:unread",
      max_results:500,
      label_ids:["INBOX","IMPORTANT"],
      include_spam_trash:false
    },
    gmail_get_thread:{thread_id:"t1",format:"full"},
    gmail_get_message:{message_id:"m1",format:"full"}
  };

  for(const id of expected){
    const adapter=validated.tools.adapter(id);
    const read=await adapter.execute({
      capabilityId:id,
      params:inputs[id],
      idempotencyKey:"read-only"
    });
    assert.equal(read.evidence.readback,true);

    const verifier=validated.verifiers.get(id)!;
    const verified=await verifier.verify({
      execution:{
        id:`e16-${id}`,
        capabilityId:id,
        params:inputs[id],
        evidence:read.evidence,
        operationKeyRef:null
      },
      contract:{
        id:`c16-${id}`,
        method:"api_readback",
        requiredEvidenceFields:{},
        independentQueryTemplate:{}
      }
    });
    assert.equal(verified.result,"VERIFIED");
  }

  await new Promise<void>((resolve,reject)=>m.server.close((err)=>err?reject(err):resolve()));
  console.log("PHASE16_GMAIL_READ PASS capabilities=3");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
