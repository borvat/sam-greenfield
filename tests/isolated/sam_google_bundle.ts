import {test} from "node:test";
import assert from "node:assert/strict";
import {withSamGoogleConnection} from "../../apps/production/src/samGoogleBundle";
import {validateProductionBundle} from "../../apps/production/src/bundle";
import {sha256Hex} from "../../packages/shared/src/stableJson";
const result={content:[{type:"text",text:"a real-shaped read result"}]};
test("only discovered read tools register with specialist, schema, adapter and fresh verifier",async()=>{
 let reads=0,changed=false;
 const connection:any={config:{ownerId:"owner",clientId:"client",store:{tools:async()=>[
 {name:"search_gmail_messages",description:"Read Gmail",inputSchema:{type:"object",properties:{query:{type:"string"}},required:["query"]},annotations:{readOnlyHint:true}},
 {name:"send_gmail_message",annotations:{readOnlyHint:false}},
 {name:"get_drive_file_content",annotations:{readOnlyHint:false}}]}},read:async()=>{reads++;return changed?{different:true}:result}};
 const bundle=await withSamGoogleConnection({capabilities:[],toolDefinitions:[],toolAdapters:[]},connection);
 validateProductionBundle(bundle);assert.equal(bundle.capabilities.length,1);assert.equal(bundle.capabilities[0].specialistAgentId,"communications");assert.equal(bundle.toolDefinitions[0].sideEffect,false);
 const execution=await bundle.toolAdapters[0].execute({capabilityId:bundle.capabilities[0].capabilityId,params:{query:"in:inbox"},idempotencyKey:"test"});
 assert.equal(execution.evidence.responseHash,sha256Hex(result));assert.equal(reads,1);
 const input:any={execution:{id:"test",capabilityId:bundle.capabilities[0].capabilityId,params:{query:"in:inbox"},evidence:execution.evidence,operationKeyRef:null},contract:{}};
 assert.equal((await bundle.verificationAdapters![0].verify(input)).result,"VERIFIED");assert.equal(reads,2);
 changed=true;assert.equal((await bundle.verificationAdapters![0].verify(input)).result,"INCONCLUSIVE");
});
test("unapproved connection registers no Google capabilities",async()=>{
 const bundle=await withSamGoogleConnection({capabilities:[],toolDefinitions:[],toolAdapters:[]},{config:{ownerId:"owner",clientId:"client",store:{tools:async()=>[]}}} as any);
 assert.equal(bundle.capabilities.length,0);
});
