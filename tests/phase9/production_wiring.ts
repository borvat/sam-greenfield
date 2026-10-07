import assert from "node:assert/strict";
import { pool } from "../../packages/db/src/client";
import { validateProductionBundle } from "../../apps/production/src/bundle";
import { createKernelProductionDispatcher } from "../../apps/production/src/dispatcher";
import { createProductionComposition } from "../../apps/production/src/composition";
import { createChatGPTToolSurface } from "../../apps/chatgpt-tools/src/surface";

async function legalEntity(){
  const org=await pool.query(
    "INSERT INTO organizations(name) VALUES($1) RETURNING id",
    [`P9-${Date.now()}-${Math.random()}`]
  );
  const le=await pool.query(
    "INSERT INTO legal_entities(org_id,name) VALUES($1,$2) RETURNING id",
    [org.rows[0].id,`P9LE-${Date.now()}-${Math.random()}`]
  );
  return le.rows[0].id as string;
}

async function main(){
  let executed=0;
  await pool.query(
    `INSERT INTO verification_contracts
     (capability_id,description,verification_method,required_evidence_fields,independent_query_template)
     VALUES('p9_green','Phase 9 acceptance verifier','db_query','{"confirmed":"boolean"}'::jsonb,'{"probe":"phase9"}'::jsonb)
     ON CONFLICT(capability_id) DO NOTHING`
  );

  const bundle=validateProductionBundle({
    capabilities:[
      {
        capabilityId:"p9_green",
        authorityClass:"GREEN",
        specialistAgentId:"ops",
        specialistVersion:"9.0.0"
      },
      {
        capabilityId:"p9_yellow",
        authorityClass:"YELLOW",
        specialistAgentId:"ops",
        specialistVersion:"9.0.0"
      }
    ],
    toolDefinitions:[
      {
        capabilityId:"p9_green",
        authorityClass:"GREEN",
        sideEffect:false
      },
      {
        capabilityId:"p9_yellow",
        authorityClass:"YELLOW",
        sideEffect:true
      }
    ],
    toolAdapters:[
      {
        capabilityId:"p9_green",
        async execute(request){
          executed+=1;
          return {
            result:{ok:true,params:request.params},
            evidence:{source:"phase9_acceptance"}
          };
        }
      },
      {
        capabilityId:"p9_yellow",
        async execute(){
          throw new Error("p9_yellow must not execute without approval");
        }
      }
    ],
    verificationAdapters:[{
      capabilityId:"p9_green",
      async verify(){
        return {
          result:"VERIFIED",
          evidence:{confirmed:true,source:"independent_phase9_verifier"},
          verifier:"phase9-independent-verifier"
        };
      }
    }],
    workerLeaseTtlSeconds:30
  });

  const dispatcher=createKernelProductionDispatcher(bundle);
  const surface=createChatGPTToolSurface({dispatcher});
  const entityId=await legalEntity();

  const submitted=await surface.invoke("sam_execute",{
    capability_id:"p9_green",
    legal_entity_id:entityId,
    params:{value:42},
    objective:"Phase 9 direct execution"
  },{
    actor:"phase9-chatgpt",
    systemOwner:true
  });

  assert.equal(submitted.ok,true);
  const data=submitted.data as any;
  assert.equal(data.status,"QUEUED");
  assert.ok(data.goalId);

  const composition=createProductionComposition({
    bundle,
    workerId:"phase9-worker"
  });
  const tick=await composition.runWorkTick() as any;

  assert.equal(tick.execution.processed,true);
  assert.equal(tick.verification.processed,true);
  assert.equal(executed,1);

  const goal=await pool.query("SELECT state FROM goals WHERE id=$1",[data.goalId]);
  assert.equal(goal.rows[0].state,"COMPLETED");

  const yellow=await surface.invoke("sam_execute",{
    capability_id:"p9_yellow",
    legal_entity_id:entityId,
    params:{recipient:"supplier@example.com"},
    objective:"Phase 9 approval-gated action"
  },{
    actor:"phase9-chatgpt",
    systemOwner:true
  });
  assert.equal(yellow.ok,true);
  const yellowData=yellow.data as any;
  assert.equal(yellowData.status,"WAITING_OWNER");
  assert.equal(yellowData.approvalIds.length,1);

  const yellowGoal=await pool.query(
    "SELECT state FROM goals WHERE id=$1",
    [yellowData.goalId]
  );
  assert.equal(yellowGoal.rows[0].state,"WAITING_OWNER");

  const yellowQueue=await pool.query(
    "SELECT COUNT(*)::int AS count FROM work_queue WHERE goal_id=$1",
    [yellowData.goalId]
  );
  assert.equal(Number(yellowQueue.rows[0].count),0);
  assert.equal(executed,1);

  let missingAdapterBlocked=false;
  try{
    validateProductionBundle({
      capabilities:[{
        capabilityId:"missing",
        authorityClass:"GREEN",
        specialistAgentId:"ops",
        specialistVersion:"9.0.0"
      }],
      toolDefinitions:[{
        capabilityId:"missing",
        authorityClass:"GREEN",
        sideEffect:false
      }],
      toolAdapters:[]
    });
  }catch(err){
    missingAdapterBlocked=err instanceof Error && err.message.includes("concrete adapter");
  }
  assert.equal(missingAdapterBlocked,true);

  console.log("PHASE9_PRODUCTION_WIRING PASS");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
