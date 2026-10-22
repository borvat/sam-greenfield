import { withTransaction } from "../../../packages/db/src/client";
import { taskPrompt } from "../../../packages/model-providers/src/common";
import { sha256Hex } from "../../../packages/shared/src/stableJson";
import type { ModelTask } from "../../../packages/model-gateway/src/types";
import { assertSandbox,authorizeSandboxGoal,sandboxContext,sandboxPlanningInput,LOCAL_CAPABILITIES,safeTree } from "./autonomyBoundary";

const registered=new WeakSet<object>();
export function isAutonomyPermit(p:unknown):p is AutonomyPermit{return !!p&&typeof p==="object"&&registered.has(p as object);}
export function autonomyClaimId(task:ModelTask){const id=taskClaims.get(task);if(!id)throw new Error("AUTONOMY_UNCLAIMED_REQUEST");return id;}
export class AutonomyPermit{
  private tasks=new WeakSet<object>();
  constructor(){registered.add(this);}
  planningTask(input:{goalId:string;objective:string;context:any;availableCapabilities?:any[]}):ModelTask{
    const projected=sandboxPlanningInput(input);
    const capabilities=(input.availableCapabilities??[]).filter(c=>LOCAL_CAPABILITIES.includes(c.capabilityId));
    if(capabilities.length!==2)throw new Error("AUTONOMY_CATALOG_REQUIRED");
    const task:ModelTask={task:"executive_planning",capability:"planning",dataClassification:"PUBLIC",
      maxCostUsd:0.01,requiredModels:["deepseek-flash"],preferredProviders:["deepseek"],
      input:{...projected,capabilities,contract:{output:"Return ONLY a JSON object {assumptions:{},constraints:{},dependencies:{},steps:[...]}. The first three fields must be JSON objects, never arrays.",
        steps:"one or two steps only, each {capabilityId,params,priority}; priority is a number 0..100. Select only catalog capabilities and their exact parameters. No other step fields, execution or outside actions.",
        knowledge:"Use knowledge:local_OPERATION in values to reference an available verified fact; never invent facts or emit identifiers."}}};
    safeTree(task.input);this.tasks.add(task);taskGoals.set(task,input.goalId);return task;
  }
  async consume(task:ModelTask){
    if(!this.tasks.has(task))throw new Error("AUTONOMY_TASK_NOT_ISSUED");
    this.tasks.delete(task);
    const prompt=taskPrompt(task);
    if(Buffer.byteLength(prompt,"utf8")>16000)throw new Error("AUTONOMY_INPUT_BUDGET");
    await withTransaction(async client=>{
      await assertSandbox(client);await authorizeSandboxGoal(client,taskGoals.get(task)!);
      const actual=await sandboxContext(client,"legal_entity",process.env.SAM_DEV_LEGAL_ENTITY_ID!);
      const projected=sandboxPlanningInput({objective:(await client.query("SELECT objective FROM goals WHERE id=$1",[taskGoals.get(task)])).rows[0].objective,context:actual});
      const submitted=task.input as any;
      if(submitted.objective!==projected.objective||sha256Hex(submitted.context.facts)!==sha256Hex(projected.context.facts))throw new Error("AUTONOMY_INPUT_PROVENANCE");
      if((await client.query("SELECT 1 FROM model_calls WHERE success=false LIMIT 1")).rowCount)throw new Error("AUTONOMY_PRIOR_PROVIDER_FAILURE");
      const claim=await client.query("INSERT INTO autonomy_model_claims(goal_id,input_hash) VALUES($1,$2) RETURNING id",[taskGoals.get(task),sha256Hex(task.input)]);
      taskClaims.set(task,claim.rows[0].id);
    });
    return task;
  }
}
const taskGoals=new WeakMap<object,string>();
const taskClaims=new WeakMap<object,string>();
