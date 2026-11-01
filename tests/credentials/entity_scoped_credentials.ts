// No database needed. Proves the multi-account guarantee end to end through the real
// bundles and API clients (only the network is faked): work for legal entity A runs
// under A's credentials, work for B under B's, concurrent work never mixes them, and a
// missing context / missing secret / unknown entity fails closed instead of falling
// back to somebody else's account.
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import type {CredentialVault} from "../../packages/db/src/credentialVault";
import {CredentialResolver} from "../../packages/credentials/src/resolver";
import {CredentialError,runWithLegalEntity} from "../../packages/credentials/src/entityContext";
import {withBolRetailerFromVault} from "../../apps/production/src/bolBundle";
import {withGmailFromVault} from "../../apps/production/src/gmailBundle";
import {withEBoekhoudenFromVault} from "../../apps/production/src/eboekhoudenBundle";
import type {ProductionBundle} from "../../apps/production/src/types";

const A=randomUUID(),B=randomUUID(),C=randomUUID();
const store=new Map<string,Record<string,string>>();
let vaultReads=0;
const revoked=new Set<string>();
const vault={async get(r:{legalEntityId:string;provider:string;name:string}){
  vaultReads++;return store.get(`${r.legalEntityId}|${r.provider}`)??null;},
  async hasHistory(r:{legalEntityId:string;provider:string}){return revoked.has(`${r.legalEntityId}|${r.provider}`);}} as unknown as CredentialVault;
const key=(e:string,p:string)=>`${e}|${p}`;
store.set(key(A,"bol"),{client_id:"bol-A",client_secret:"sec-A"});
store.set(key(B,"bol"),{client_id:"bol-B",client_secret:"sec-B"});
store.set(key(A,"gmail"),{client_id:"g-cid-A",client_secret:"g-sec-A",refresh_token:"rt-A",from_email:"a@surooh.test"});
store.set(key(B,"gmail"),{client_id:"g-cid-B",client_secret:"g-sec-B",refresh_token:"rt-B",from_email:"b@surooh.test"});
store.set(key(A,"eboekhouden"),{api_token:"eb-A"});
store.set(key(B,"eboekhouden"),{api_token:"eb-B"});
store.set(key(C,"bol"),{client_id:"bol-C"}); // incomplete on purpose

const seen={bolBearer:[] as string[],googleRefresh:[] as string[],gmailAuth:[] as string[],gmailFrom:[] as string[],ebSession:[] as string[]};
const realFetch=globalThis.fetch;
globalThis.fetch=(async(input:any,init:any={})=>{
  const url=String(input?.url??input);
  const json=(o:unknown,status=200)=>new Response(JSON.stringify(o),{status,headers:{"content-type":"application/json"}});
  if(url.includes("login.bol.com")){
    const basic=Buffer.from(String(init.headers.authorization).replace("Basic ",""),"base64").toString();
    return json({access_token:"tok-"+basic.split(":")[0],expires_in:299});
  }
  if(url.includes("bol.com")){seen.bolBearer.push(String(init.headers?.authorization));return json({orders:[]});}
  if(url.includes("oauth2.googleapis.com")){
    const rt=new URLSearchParams(String(init.body)).get("refresh_token")!;seen.googleRefresh.push(rt);
    return json({access_token:"gtok-"+rt,expires_in:3600});
  }
  if(url.includes("gmail.googleapis.com")&&url.includes("/messages/send")){
    seen.gmailAuth.push(String(init.headers.authorization));
    const raw=Buffer.from(JSON.parse(init.body).raw,"base64url").toString("utf8");
    seen.gmailFrom.push(/^From:\s*(.+)$/im.exec(raw)?.[1]?.trim()??"");
    return json({id:"m1",threadId:"t1"});
  }
  if(url.includes("e-boekhouden")&&url.endsWith("/v1/session")){
    const t=JSON.parse(init.body).accessToken;seen.ebSession.push(t);return json({token:"ebtok-"+t,expiresIn:3600});
  }
  if(url.includes("e-boekhouden"))return json({items:[]});
  throw new Error("unexpected network call "+url);
}) as typeof fetch;

const empty=():ProductionBundle=>({capabilities:[],toolDefinitions:[],toolAdapters:[]});
const adapter=(b:ProductionBundle,id:string)=>b.toolAdapters.find(a=>a.capabilityId===id)!;
const req=(capabilityId:string,params:Record<string,unknown>={})=>({capabilityId,params,idempotencyKey:"k-"+randomUUID()});
const code=(e:any)=>e instanceof CredentialError&&e.code;

async function main(){
  const resolver=new CredentialResolver({vault,env:{}});
  const bol=adapter(withBolRetailerFromVault(empty(),resolver,{}),"bol_list_orders");
  const gmail=adapter(withGmailFromVault(empty(),resolver,{}),"gmail_send");
  const accounting=adapter(withEBoekhoudenFromVault(empty(),resolver,{}),"eboekhouden_list_ledgers");

  // --- each entity runs under its own account; concurrent work does not mix
  await Promise.all([
    runWithLegalEntity(A,()=>bol.execute(req("bol_list_orders"))),
    runWithLegalEntity(B,()=>bol.execute(req("bol_list_orders"))),
    runWithLegalEntity(A,()=>bol.execute(req("bol_list_orders"))),
    runWithLegalEntity(B,()=>bol.execute(req("bol_list_orders")))
  ]);
  assert.deepEqual([...new Set(seen.bolBearer)].sort(),["Bearer tok-bol-A","Bearer tok-bol-B"]);
  assert.equal(seen.bolBearer.filter(x=>x.endsWith("bol-A")).length,2);
  assert.equal(seen.bolBearer.filter(x=>x.endsWith("bol-B")).length,2);

  // --- Gmail: OAuth credentials AND From address come from the entity
  const mail={to:"klant@example.nl",subject:"Hallo",text:"Test"};
  await runWithLegalEntity(A,()=>gmail.execute(req("gmail_send",mail)));
  await runWithLegalEntity(B,()=>gmail.execute(req("gmail_send",mail)));
  assert.deepEqual(seen.googleRefresh,["rt-A","rt-B"]);
  assert.deepEqual(seen.gmailAuth,["Bearer gtok-rt-A","Bearer gtok-rt-B"]);
  assert(seen.gmailFrom[0].includes("a@surooh.test")&&!seen.gmailFrom[0].includes("b@"));
  assert(seen.gmailFrom[1].includes("b@surooh.test")&&!seen.gmailFrom[1].includes("a@"));

  // --- e-Boekhouden token per entity
  await runWithLegalEntity(A,()=>accounting.execute(req("eboekhouden_list_ledgers")));
  await runWithLegalEntity(B,()=>accounting.execute(req("eboekhouden_list_ledgers")));
  assert.deepEqual(seen.ebSession,["eb-A","eb-B"]);

  // --- fail closed
  await assert.rejects(()=>bol.execute(req("bol_list_orders")),e=>code(e)==="CREDENTIAL_ENTITY_CONTEXT_REQUIRED");
  await assert.rejects(()=>runWithLegalEntity(null,()=>bol.execute(req("bol_list_orders"))),e=>code(e)==="CREDENTIAL_ENTITY_CONTEXT_REQUIRED");
  await assert.rejects(()=>runWithLegalEntity(randomUUID(),()=>bol.execute(req("bol_list_orders"))),e=>code(e)==="CREDENTIAL_NOT_CONFIGURED");
  await assert.rejects(()=>runWithLegalEntity(C,()=>bol.execute(req("bol_list_orders"))),e=>code(e)==="CREDENTIAL_INCOMPLETE");
  await assert.rejects(()=>runWithLegalEntity(A,()=>gmail.execute(req("gmail_send",mail)).then(()=>Promise.reject(new Error("ok")))),/ok/); // A still works after failures
  assert.throws(()=>runWithLegalEntity("not-a-uuid",async()=>{}),e=>code(e)==="CREDENTIAL_ENTITY_INVALID");
  // a provider the entity has no secret for does not borrow another provider's or entity's
  store.delete(key(B,"gmail"));
  await assert.rejects(()=>runWithLegalEntity(B,()=>gmail.execute(req("gmail_send",mail))),e=>code(e)==="CREDENTIAL_NOT_CONFIGURED");

  // --- rotation: a changed secret builds a fresh client (fresh token), no stale account
  const before=seen.bolBearer.length;
  store.set(key(A,"bol"),{client_id:"bol-A2",client_secret:"sec-A2"});
  await runWithLegalEntity(A,()=>bol.execute(req("bol_list_orders")));
  assert.equal(seen.bolBearer[before],"Bearer tok-bol-A2");

  // --- legacy env fallback: ONLY the explicitly named entity, never another one, vault wins
  const legacyEnv={SAM_LEGACY_CREDENTIAL_ENTITY_ID:C.toUpperCase(),BOL_CLIENT_ID:"env-id",BOL_CLIENT_SECRET:"env-secret"};
  const legacy=new CredentialResolver({vault,env:legacyEnv});
  const lbol=adapter(withBolRetailerFromVault(empty(),legacy,{}),"bol_list_orders");
  const D=randomUUID();
  await assert.rejects(()=>runWithLegalEntity(D,()=>lbol.execute(req("bol_list_orders"))),e=>code(e)==="CREDENTIAL_NOT_CONFIGURED","env creds must not leak to other entities");
  store.delete(key(C,"bol"));
  const n=seen.bolBearer.length;
  await runWithLegalEntity(C,()=>lbol.execute(req("bol_list_orders")));
  assert.equal(seen.bolBearer[n],"Bearer tok-env-id","named legacy entity falls back to env");
  await runWithLegalEntity(A,()=>lbol.execute(req("bol_list_orders")));
  assert.equal(seen.bolBearer.at(-1),"Bearer tok-bol-A2","vault takes precedence over env");

  // --- revoking the legacy entity's vault secret must not re-enable the env account
  store.set(key(C,"bol"),{client_id:"bol-C2",client_secret:"sec-C2"});
  await runWithLegalEntity(C,()=>lbol.execute(req("bol_list_orders")));
  store.delete(key(C,"bol"));revoked.add(key(C,"bol"));
  await assert.rejects(()=>runWithLegalEntity(C,()=>lbol.execute(req("bol_list_orders"))),e=>code(e)==="CREDENTIAL_NOT_CONFIGURED","revoked slot must not fall back to env");

  // --- errors never carry secret values
  try{await runWithLegalEntity(D,()=>lbol.execute(req("bol_list_orders")));}
  catch(e:any){assert(!/sec-|env-secret|rt-/.test(String(e.message)+String(e.stack)));}
  console.log("PASS entity_scoped_credentials");
}
main().then(()=>{globalThis.fetch=realFetch;process.exit(0)},e=>{console.error(e);process.exit(1)});
