/** PostgreSQL SQL/crypto tests on local PGlite WASM. No production database.
 * Does not claim to test PostgreSQL network/TLS or multiple OS processes.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {PGlite} from "@electric-sql/pglite";
import {readFile,mkdtemp,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {randomBytes} from "node:crypto";
import {PostgresSamGoogleOauthStore} from "../../apps/production/src/samGoogleOauthPostgres";
import {hashState} from "../../apps/production/src/samGoogleOauthState";

test("PostgreSQL SQL: encrypted persistence, one-use state, refresh rotation, cache and rollback",async()=>{
 const directory=await mkdtemp(join(tmpdir(),"sam-google-pglite-")),key=randomBytes(32);
 let db=new PGlite(directory);
 const pool:any={query:(q:string,args?:any[])=>db.query(q,args),connect:async()=>({query:(q:string,args?:any[])=>db.query(q,args),release(){}})};
 const original=globalThis.fetch;
 try{
  await db.exec(await readFile("packages/db/migrations/00099_sam_google_oauth.sql","utf8"));
  await db.exec(await readFile("packages/db/migrations/00100_sam_google_oauth_runtime.sql","utf8"));
  const store=new PostgresSamGoogleOauthStore(pool,key);
  const state="test-state",id=hashState(state);
  await store.put(id,{stateHash:id,verifier:"private-verifier",createdAt:Date.now(),redirectUri:"https://sam.example.com/cb",ownerId:"owner",clientId:"client"});
  const row=(await db.query("SELECT * FROM sam_google_oauth_states")).rows[0];
  assert.equal(JSON.stringify(row).includes("private-verifier"),false);
  assert.equal((await store.take(id))!.ownerId,"owner");assert.equal(await store.take(id),undefined);
  await store.saveRefresh({ownerId:"owner",clientId:"client",refreshToken:"refresh-1"});
  assert.equal(await store.loadRefresh("other","client"),undefined);
  const stored=(await db.query("SELECT * FROM sam_google_oauth_tokens")).rows[0];
  assert.equal(JSON.stringify(stored).includes("refresh-1"),false);
  let calls=0;
  globalThis.fetch=(async(_u:any,init:any)=>{
   calls++;assert.equal(init.body.get("refresh_token"),"refresh-1");
   return new Response(JSON.stringify({access_token:"access-1",refresh_token:"refresh-2",expires_in:3600}),{status:200,headers:{"content-type":"application/json"}});
  }) as typeof fetch;
  assert.equal(await store.accessToken("owner","client"),"access-1");assert.equal(calls,1);
  assert.equal(await store.loadRefresh("owner","client"),"refresh-2");
  await store.saveTools("owner","client",[{name:"search_gmail_messages",inputSchema:{type:"object"},annotations:{readOnlyHint:true}}]);
  await db.close();db=new PGlite(directory);
  const rebuilt=new PostgresSamGoogleOauthStore(pool,key);
  assert.equal(await rebuilt.accessToken("owner","client"),"access-1");assert.equal(calls,1);
  assert.equal((await rebuilt.tools("owner","client")).length,1);
  await rebuilt.invalidateAccess("owner","client");
  globalThis.fetch=(async()=>new Response("provider error with secret",{status:401})) as typeof fetch;
  await assert.rejects(rebuilt.accessToken("owner","client"),/REAUTH_REQUIRED/);
  assert.equal(await rebuilt.loadRefresh("owner","client"),"refresh-2");
  await assert.rejects(new PostgresSamGoogleOauthStore(pool,randomBytes(32)).loadRefresh("owner","client"),/DECRYPT_FAILED/);
 }finally{globalThis.fetch=original;await db.close();await rm(directory,{recursive:true,force:true})}
});
