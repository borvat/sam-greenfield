import {test} from "node:test";
import assert from "node:assert/strict";
import {MemoryOAuthTxnStore,createOpaqueState,hashState,consumeOAuthTxn} from "../../apps/production/src/samGoogleOauthState";
test("oauth state succeeds once only and blocks replay",async()=>{
 const state=createOpaqueState(),store=new MemoryOAuthTxnStore(),now=Date.now();
 await store.put(hashState(state),{stateHash:hashState(state),verifier:"pkce",createdAt:now,redirectUri:"https://example.com/oauth/callback"});
 assert.equal((await consumeOAuthTxn({store,state,now})).verifier,"pkce");
 await assert.rejects(consumeOAuthTxn({store,state,now}),/OAUTH_STATE_INVALID/);
});
test("expired oauth state fails closed",async()=>{
 const state=createOpaqueState(),store=new MemoryOAuthTxnStore(),now=Date.now();
 await store.put(hashState(state),{stateHash:hashState(state),verifier:"pkce",createdAt:now-610_000,redirectUri:"https://example.com/oauth/callback"});
 await assert.rejects(consumeOAuthTxn({store,state,now}),/OAUTH_STATE_EXPIRED/);
});
