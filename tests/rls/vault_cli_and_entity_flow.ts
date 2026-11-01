// (1) The operator CLI against a real vault: secrets only via hidden prompt / JSON stdin,
//     validation, and no secret value ever printed.
// (2) The real kernel flow (plan -> specialist tick -> independent verification) runs the
//     tool adapter AND the verifier inside the goal's legal-entity context.
// Needs DATABASE_URL = admin login of a migrated database.
import assert from "node:assert/strict";
import {randomBytes,randomUUID} from "node:crypto";
import {Pool} from "pg";
import {CredentialVault,VaultKeyring} from "../../packages/db/src/credentialVault";
import {runVaultCli,type CliIo} from "../../apps/admin/src/vaultCli";
import {currentLegalEntity} from "../../packages/credentials/src/entityContext";
import {validateProductionBundle} from "../../apps/production/src/bundle";
import {syncVerificationContracts} from "../../apps/production/src/verificationContracts";
import {createToolExecutors} from "../../apps/tools/src/executorFactory";
import {runCatalogSpecialistTick} from "../../apps/agents/src/executiveFlow";
import {persistPlanAndDelegateAtomic} from "../../apps/kernel/src/planning";
import {verifyNextExecution} from "../../apps/production/src/verifier";
import type {ProductionBundle} from "../../apps/production/src/types";

const adminUrl=process.env.DATABASE_URL??"";
if(!adminUrl)throw new Error("DATABASE_URL (admin login) is required");
const pool=new Pool({connectionString:adminUrl});
const tag="CLI_"+randomBytes(4).toString("hex");

function io(opts:{interactive?:boolean;hidden?:string[];stdin?:string}={}){
  const lines:string[]=[],errs:string[]=[],hidden=[...(opts.hidden??[])];
  const o:CliIo={out:l=>lines.push(l),err:l=>errs.push(l),isInteractive:opts.interactive??false,
    readHidden:async()=>{const v=hidden.shift();if(v===undefined)throw new Error("no more input");return v;},
    readStdin:async()=>opts.stdin??""};
  return {o,lines,errs,all:()=>[...lines,...errs].join("\n")};
}

async function main(){
  const org=randomUUID(),e1=randomUUID(),e2=randomUUID();
  await pool.query("INSERT INTO organizations(id,name) VALUES ($1,$2)",[org,tag]);
  await pool.query("INSERT INTO legal_entities(id,org_id,name) VALUES ($1,$3,$4),($2,$3,$5)",[e1,e2,org,tag+"1",tag+"2"]);
  const vault=new CredentialVault(pool,VaultKeyring.fromEnv({SAM_VAULT_KEYS:"1:"+randomBytes(32).toString("hex"),SAM_VAULT_ACTIVE_KEY_VERSION:"1"}),{cacheTtlMs:0});
  const SECRET="topsecret-"+randomBytes(8).toString("hex");

  // ---------- CLI
  let r=io({stdin:JSON.stringify({client_id:"cid",client_secret:SECRET})});
  assert.equal(await runVaultCli(["put","--entity",e1,"--provider","bol","--json-stdin"],r.o,vault,"operator:test"),0);
  assert(r.all().includes("version 1")&&!r.all().includes(SECRET));
  assert.equal((await vault.get({legalEntityId:e1,provider:"bol",name:"default",actor:"t"}))?.client_secret,SECRET);

  r=io({interactive:true,hidden:["rid","rsec","rtoken","from@x.test",""]});
  assert.equal(await runVaultCli(["put","--entity",e2,"--provider","gmail","--name","support"],r.o,vault,"operator:test"),0);
  assert.equal((await vault.get({legalEntityId:e2,provider:"gmail",name:"support",actor:"t"}))?.from_email,"from@x.test");

  r=io({stdin:"{}"});
  assert.equal(await runVaultCli(["put","--entity",e1,"--provider","bol"],r.o,vault,"o"),1);
  assert(/non-interactive/.test(r.errs.join()),"secrets are never read from a piped stdin without --json-stdin");
  r=io({stdin:JSON.stringify({client_id:"x"})});
  assert.equal(await runVaultCli(["put","--entity",e1,"--provider","bol","--json-stdin"],r.o,vault,"o"),1);
  assert(/missing required/.test(r.errs.join()));
  r=io({stdin:JSON.stringify({client_id:"x",client_secret:SECRET,evil:"1"})});
  assert.equal(await runVaultCli(["put","--entity",e1,"--provider","bol","--json-stdin"],r.o,vault,"o"),1);
  assert(/unknown field/.test(r.errs.join())&&!r.all().includes(SECRET));
  r=io();assert.equal(await runVaultCli(["put","--entity",e1,"--provider","amazon","--json-stdin"],r.o,vault,"o"),1);
  r=io();assert.equal(await runVaultCli(["put","--entity","nope","--provider","bol","--json-stdin"],r.o,vault,"o"),1);
  r=io();assert.equal(await runVaultCli(["put","--entity",e1,"--provider","bol","--client_secret",SECRET],r.o,vault,"o"),1,"secret values as arguments are rejected");
  assert(!r.all().includes(SECRET));

  r=io();assert.equal(await runVaultCli(["check","--entity",e1,"--provider","bol"],r.o,vault,"o"),0);
  assert(r.lines[0].includes("client_id, client_secret")&&!r.all().includes(SECRET));
  r=io();assert.equal(await runVaultCli(["check","--entity",e2,"--provider","bol"],r.o,vault,"o"),2);
  r=io();assert.equal(await runVaultCli(["list","--entity",e1],r.o,vault,"o"),0);
  assert(r.lines.some(l=>l.includes("bol")&&l.includes("ACTIVE"))&&!r.all().includes(SECRET));
  r=io();assert.equal(await runVaultCli(["rotate-keys"],r.o,vault,"o"),0);
  r=io();assert.equal(await runVaultCli(["revoke","--entity",e1,"--provider","bol"],r.o,vault,"o"),0);
  r=io();assert.equal(await runVaultCli(["check","--entity",e1,"--provider","bol"],r.o,vault,"o"),2);
  r=io();assert.equal(await runVaultCli(["bogus"],r.o,vault,"o"),64);

  // ---------- kernel flow: adapter and verifier both run in the goal's entity context
  const cap="probe_entity_"+tag.toLowerCase();
  const observed:{exec:Array<string|null>;verify:Array<string|null>}={exec:[],verify:[]};
  const tryEntity=()=>{try{return currentLegalEntity();}catch{return null;}};
  const bundle:ProductionBundle={
    capabilities:[{capabilityId:cap,authorityClass:"GREEN",specialistAgentId:"probe",specialistVersion:"1.0.0"}],
    toolDefinitions:[{capabilityId:cap,authorityClass:"GREEN",sideEffect:false}],
    toolAdapters:[{capabilityId:cap,async execute(){observed.exec.push(tryEntity());return {result:{ok:true},evidence:{readback:true}};}}],
    verificationAdapters:[{capabilityId:cap,async verify(){observed.verify.push(tryEntity());
      return {result:"VERIFIED" as const,evidence:{readback:true},verifier:"probe-independent-verifier"};}}]
  };
  const validated=validateProductionBundle(bundle);
  await syncVerificationContracts([{capabilityId:cap,description:"probe",verificationMethod:"api_readback",
    requiredEvidenceFields:{readback:"boolean"},independentQueryTemplate:{}}]);
  const executors=createToolExecutors({catalog:validated.catalog,tools:validated.tools});
  const seed=async(scope:string|null)=>{
    const id=(await pool.query(`INSERT INTO goals(business_id,company_scope,domain,objective,state,authority_ceiling)
      VALUES($1,$2,'probe','probe','PLANNING','GREEN') RETURNING id`,[tag+"-"+randomUUID(),scope])).rows[0].id;
    await persistPlanAndDelegateAtomic({goalId:id,steps:[{capabilityId:cap,params:{}}]});
    return id as string;
  };
  const run=async()=>{
    await runCatalogSpecialistTick({catalog:validated.catalog,workerInstanceId:"flow-test",ttlSeconds:30,executors});
    return verifyNextExecution(validated);
  };
  const g1=await seed(e1);const v1=await run();
  assert.equal(v1.processed,true);
  assert.deepEqual(observed,{exec:[e1],verify:[e1]},"entity E1 context reaches adapter and verifier");
  const g2=await seed(e2);await run();
  assert.deepEqual(observed,{exec:[e1,e2],verify:[e1,e2]});
  const g3=await seed(null);await run();
  assert.deepEqual(observed,{exec:[e1,e2,null],verify:[e1,e2,null]},"a goal without an entity gets no context (credentialed clients then fail closed)");
  for(const g of [g1,g2,g3])
    assert.equal((await pool.query("SELECT state FROM goals WHERE id=$1",[g])).rows[0].state,"COMPLETED");
  console.log("PASS vault_cli_and_entity_flow");
}
main().then(()=>process.exit(0),e=>{console.error(e);process.exit(1)});
