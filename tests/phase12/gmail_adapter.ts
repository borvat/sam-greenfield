import assert from "node:assert/strict";
import { createServer } from "node:http";
import { GoogleRefreshTokenProvider } from "../../packages/google-auth/src/refreshToken";
import { GmailApiClient } from "../../packages/gmail/src/client";
import { GmailSendAdapter } from "../../apps/tools/src/gmailSendAdapter";
import { GmailSentVerificationAdapter } from "../../apps/production/src/gmailVerifier";
import { deterministicMessageId } from "../../packages/gmail/src/mime";
import { withGmailFromEnv } from "../../apps/production/src/gmailBundle";
import { validateProductionBundle } from "../../apps/production/src/bundle";

async function mock(){
  const seen:any[]=[];
  let sendCount=0;
  const sentById=new Map<string,any>();
  const sentByMessageId=new Map<string,any>();

  const server=createServer(async(req,res)=>{
    const chunks:Buffer[]=[];
    for await(const chunk of req) chunks.push(Buffer.from(chunk));
    const text=Buffer.concat(chunks).toString("utf8");
    seen.push({url:req.url,method:req.method,headers:req.headers,text});

    res.setHeader("content-type","application/json");

    if(req.url==="/token"){
      assert.equal(req.method,"POST");
      assert.ok(text.includes("grant_type=refresh_token"));
      res.end(JSON.stringify({access_token:"oauth-access",expires_in:3600,token_type:"Bearer"}));
      return;
    }

    if(req.url==="/gmail/v1/users/me/messages/send"){
      assert.equal(req.headers.authorization,"Bearer oauth-access");
      const payload=JSON.parse(text);
      const raw=Buffer.from(
        payload.raw.replace(/-/g,"+").replace(/_/g,"/"),
        "base64"
      ).toString("utf8");
      const match=raw.match(/^Message-ID: (.+)$/mi);
      assert.ok(match);
      assert.match(raw,/^X-SAM-Operation-Key:/mi);
      const item={id:`gmail-${++sendCount}`,threadId:"thread-1"};
      sentById.set(item.id,item);
      sentByMessageId.set(match![1].trim(),item);
      res.end(JSON.stringify(item));
      return;
    }

    if(req.url?.startsWith("/gmail/v1/users/me/messages/")&&req.url.includes("?format=minimal")){
      const id=decodeURIComponent(req.url.split("/messages/")[1].split("?")[0]);
      const item=sentById.get(id);
      if(!item){
        res.statusCode=404;
        res.end(JSON.stringify({error:{message:"not found"}}));
        return;
      }
      res.end(JSON.stringify(item));
      return;
    }

    if(req.url?.startsWith("/gmail/v1/users/me/messages?")){
      const u=new URL(`http://local${req.url}`);
      const query=u.searchParams.get("q")??"";
      const messageId=query.replace(/^rfc822msgid:/,"");
      const item=sentByMessageId.get(messageId);
      res.end(JSON.stringify({messages:item?[item]:[],resultSizeEstimate:item?1:0}));
      return;
    }

    res.statusCode=404;
    res.end(JSON.stringify({error:{message:"unexpected"}}));
  });

  await new Promise<void>((resolve)=>server.listen(0,"127.0.0.1",()=>resolve()));
  const address=server.address();
  if(!address||typeof address==="string") throw new Error("mock unavailable");
  const base=`http://127.0.0.1:${address.port}`;
  return {server,seen,base};
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
  const adapter=new GmailSendAdapter(client,{fromEmail:"sam@example.com"});
  const opKey="tool:queue-1:gmail_send:abc";

  const first=await adapter.execute({
    capabilityId:"gmail_send",
    idempotencyKey:opKey,
    params:{
      to:["supplier@example.com"],
      subject:"Quotation request",
      text:"Please send your current quotation and lead time."
    }
  });

  assert.equal(first.providerReference,"gmail-1");
  assert.equal(first.evidence.rfc822_message_id,deterministicMessageId(opKey));
  assert.equal(deterministicMessageId(opKey),deterministicMessageId(opKey));

  const sendCall=m.seen.find((x)=>x.url==="/gmail/v1/users/me/messages/send");
  const sendPayload=JSON.parse(sendCall.text);
  const sentRaw=Buffer.from(
    sendPayload.raw.replace(/-/g,"+").replace(/_/g,"/"),
    "base64"
  ).toString("utf8");
  assert.ok(sentRaw.includes(`X-SAM-Operation-Key: ${opKey}`));

  const byProvider=await adapter.reconcile({
    capabilityId:"gmail_send",
    providerReference:"gmail-1",
    idempotencyKey:opKey
  });
  assert.equal(byProvider.result,"CONFIRMED");

  const byMessageId=await adapter.reconcile({
    capabilityId:"gmail_send",
    providerReference:null,
    idempotencyKey:opKey
  });
  assert.equal(byMessageId.result,"CONFIRMED");

  const verifier=new GmailSentVerificationAdapter(client);
  const verified=await verifier.verify({
    execution:{
      id:"execution-1",
      capabilityId:"gmail_send",
      params:{},
      evidence:first.evidence,
      operationKeyRef:opKey
    },
    contract:{
      id:"contract-1",
      method:"list_search",
      requiredEvidenceFields:{},
      independentQueryTemplate:{}
    }
  });
  assert.equal(verified.result,"VERIFIED");
  assert.equal(verified.verifier,"gmail-independent-readback");

  const verifiedBySearch=await verifier.verify({
    execution:{
      id:"execution-2",
      capabilityId:"gmail_send",
      params:{},
      evidence:{},
      operationKeyRef:opKey
    },
    contract:{
      id:"contract-1",
      method:"list_search",
      requiredEvidenceFields:{},
      independentQueryTemplate:{}
    }
  });
  assert.equal(verifiedBySearch.result,"VERIFIED");
  assert.equal(
    (verifiedBySearch.evidence as any).method,
    "gmail_rfc822msgid_search"
  );

  let aiWordingBlocked=false;
  try{
    await adapter.execute({
      capabilityId:"gmail_send",
      idempotencyKey:"blocked",
      params:{
        to:"supplier@example.com",
        subject:"Assistant note",
        text:"This was generated by ChatGPT."
      }
    });
  }catch(err){
    aiWordingBlocked=err instanceof Error&&err.message.includes("forbidden");
  }
  assert.equal(aiWordingBlocked,true);

  const baseBundle={
    capabilities:[],
    toolDefinitions:[],
    toolAdapters:[]
  };
  const noEnv=withGmailFromEnv(baseBundle,{} as NodeJS.ProcessEnv);
  assert.equal(noEnv.capabilities.length,0);

  const configured=withGmailFromEnv(baseBundle,{
    GOOGLE_OAUTH_CLIENT_ID:"client",
    GOOGLE_OAUTH_CLIENT_SECRET:"secret",
    GOOGLE_OAUTH_REFRESH_TOKEN:"refresh",
    GOOGLE_OAUTH_TOKEN_URL:`${m.base}/token`,
    GMAIL_API_BASE_URL:`${m.base}/gmail/v1`
  } as NodeJS.ProcessEnv);
  const validated=validateProductionBundle(configured);
  assert.equal(validated.catalog.get("gmail_send").authorityClass,"YELLOW");
  assert.equal(validated.tools.definition("gmail_send").sideEffect,true);
  assert.ok(validated.verifiers.has("gmail_send"));

  const tokenCalls=m.seen.filter((x)=>x.url==="/token");
  assert.equal(tokenCalls.length,1);

  await new Promise<void>((resolve,reject)=>m.server.close((err)=>err?reject(err):resolve()));
  console.log("PHASE12_GMAIL_ADAPTER PASS");
}

main().catch((err)=>{
  console.error(err);
  process.exit(1);
});
