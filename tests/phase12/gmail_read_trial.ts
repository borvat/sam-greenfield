import assert from "node:assert/strict";
import { GmailApiClient } from "../../packages/gmail/src/client";
import { withGmailReadFromEnv } from "../../apps/production/src/gmailReadBundle";
import { validateProductionBundle } from "../../apps/production/src/bundle";

async function main(){
  const calls:string[]=[];
  const client=new GmailApiClient({tokens:{async getAccessToken(){return "unit-test-token"}},fetchImpl:async(url,init)=>{
    assert.equal(init?.method??"GET","GET");
    const u=new URL(String(url)); calls.push(u.pathname);
    if(u.pathname.endsWith("/messages")){
      assert.equal(u.searchParams.get("maxResults"),"5");
      assert.equal(u.searchParams.get("q"),"in:inbox");
      return new Response(JSON.stringify({messages:[{id:"test-message"}]}));
    }
    assert.equal(u.searchParams.get("format"),"metadata");
    assert.deepEqual(u.searchParams.getAll("metadataHeaders"),["From","To","Subject","Date"]);
    return new Response(JSON.stringify({id:"test-message",payload:{headers:[]}}));
  }});
  assert.equal((await client.listMessages({query:"in:inbox",limit:5})).messages[0].id,"test-message");
  assert.equal((await client.getMessageMetadata("test-message")).id,"test-message");
  assert.throws(()=>client.listMessages({limit:21}));
  assert.throws(()=>client.getMessageMetadata(""));
  assert.equal(calls.length,2);
  const empty={capabilities:[],toolDefinitions:[],toolAdapters:[]};
  assert.equal(withGmailReadFromEnv(empty,{}),empty);
  assert.throws(()=>withGmailReadFromEnv(empty,{GOOGLE_OAUTH_CLIENT_ID:"test"}));
  const env={GOOGLE_OAUTH_CLIENT_ID:"test-client",GOOGLE_OAUTH_CLIENT_SECRET:"test-secret",GOOGLE_OAUTH_REFRESH_TOKEN:"test-refresh"};
  const readBundle=validateProductionBundle(withGmailReadFromEnv(empty,env));
  assert.equal(readBundle.raw.capabilities.length,2);
  assert.ok(readBundle.raw.toolDefinitions.every(d=>!d.sideEffect&&d.authorityClass==="GREEN"));
  Object.assign(process.env,env,{SAM_GOOGLE_READ_ONLY:"true"});
  const bundle=(await import("../../apps/production/src/defaultBundleModule")).default;
  validateProductionBundle(bundle);
  assert.ok(bundle.capabilities.some(c=>c.capabilityId==="gmail_list_messages"));
  assert.ok(bundle.capabilities.some(c=>c.capabilityId==="drive_search"));
  assert.ok(bundle.toolDefinitions.every(d=>!d.sideEffect&&d.authorityClass==="GREEN"));
  assert.ok(!bundle.capabilities.some(c=>["gmail_send","drive_create_folder"].includes(c.capabilityId)));
  console.log("GOOGLE_READ_TRIAL_UNIT PASS: metadata GET, bounded reads, missing credentials blocked, writes excluded; no live Google calls");
}
main().catch(err=>{console.error(err);process.exit(1)});
