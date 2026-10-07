import assert from "node:assert/strict";
import { createServer } from "node:http";
import { pool } from "../../packages/db/src/client";
import { OpenAIResponsesAdapter } from "../../packages/model-providers/src/openai";
import { AnthropicMessagesAdapter } from "../../packages/model-providers/src/anthropic";
import { GoogleGeminiAdapter } from "../../packages/model-providers/src/google";
import { OpenAICompatibleChatAdapter } from "../../packages/model-providers/src/openaiCompatible";
import { buildStandardModelProvidersFromEnv } from "../../packages/model-providers/src/env";
import { syncProductionModelRegistry } from "../../apps/production/src/modelRegistry";

async function mockServer(){
  const seen:any[]=[];
  const server=createServer(async(req,res)=>{
    const chunks:Buffer[]=[];
    for await(const chunk of req) chunks.push(Buffer.from(chunk));
    const body=JSON.parse(Buffer.concat(chunks).toString("utf8")||"{}");
    seen.push({url:req.url,headers:req.headers,body});

    res.statusCode=200;
    res.setHeader("content-type","application/json");

    if(req.url==="/v1/responses"){
      res.end(JSON.stringify({
        model:"openai-test",
        output:[{content:[{type:"output_text",text:'{"provider":"openai"}'}]}],
        usage:{input_tokens:11,output_tokens:7}
      }));
      return;
    }

    if(req.url==="/v1/messages"){
      res.end(JSON.stringify({
        model:"anthropic-test",
        content:[{type:"text",text:'{"provider":"anthropic"}'}],
        usage:{input_tokens:12,output_tokens:8}
      }));
      return;
    }

    if(req.url?.includes(":generateContent")){
      res.end(JSON.stringify({
        modelVersion:"google-test",
        candidates:[{content:{parts:[{text:'{"provider":"google"}'}]}}],
        usageMetadata:{promptTokenCount:13,candidatesTokenCount:9}
      }));
      return;
    }

    if(req.url==="/deepseek/chat/completions"||req.url==="/qwen/chat/completions"){
      const provider=req.url.startsWith("/deepseek")?"deepseek":"qwen";
      res.end(JSON.stringify({
        model:`${provider}-test`,
        choices:[{message:{content:JSON.stringify({provider})}}],
        usage:{prompt_tokens:14,completion_tokens:10}
      }));
      return;
    }

    res.statusCode=404;
    res.end(JSON.stringify({error:{message:"not found"}}));
  });

  await new Promise<void>((resolve)=>server.listen(0,"127.0.0.1",()=>resolve()));
  const address=server.address();
  if(!address||typeof address==="string") throw new Error("mock address unavailable");
  return {
    server,
    seen,
    base:`http://127.0.0.1:${address.port}`
  };
}

const task={
  task:"executive_planning",
  capability:"planning",
  dataClassification:"INTERNAL" as const,
  input:{objective:"test"},
  maxCostUsd:1
};

async function main(){
  const mock=await mockServer();

  const openai=await new OpenAIResponsesAdapter({
    apiKey:"openai-secret",
    baseUrl:`${mock.base}/v1`
  }).invoke(task,"openai-test");

  const anthropic=await new AnthropicMessagesAdapter({
    apiKey:"anthropic-secret",
    baseUrl:mock.base
  }).invoke(task,"anthropic-test");

  const google=await new GoogleGeminiAdapter({
    apiKey:"google-secret",
    baseUrl:`${mock.base}/google`
  }).invoke(task,"google-test");

  const deepseek=await new OpenAICompatibleChatAdapter("deepseek",{
    apiKey:"deepseek-secret",
    baseUrl:`${mock.base}/deepseek`
  }).invoke(task,"deepseek-test");

  const qwen=await new OpenAICompatibleChatAdapter("qwen",{
    apiKey:"qwen-secret",
    baseUrl:`${mock.base}/qwen`
  }).invoke(task,"qwen-test");

  assert.deepEqual(openai.output,{provider:"openai"});
  assert.deepEqual(anthropic.output,{provider:"anthropic"});
  assert.deepEqual(google.output,{provider:"google"});
  assert.deepEqual(deepseek.output,{provider:"deepseek"});
  assert.deepEqual(qwen.output,{provider:"qwen"});

  assert.equal(openai.usage.inputTokens,11);
  assert.equal(anthropic.usage.outputTokens,8);
  assert.equal(google.usage.outputTokens,9);
  assert.equal(deepseek.usage.outputTokens,10);

  assert.ok(mock.seen.some((r)=>r.headers.authorization==="Bearer openai-secret"));
  assert.ok(mock.seen.some((r)=>r.headers["x-api-key"]==="anthropic-secret"));
  assert.ok(mock.seen.some((r)=>r.headers["x-goog-api-key"]==="google-secret"));
  assert.ok(mock.seen.some((r)=>r.headers.authorization==="Bearer deepseek-secret"));
  assert.ok(mock.seen.some((r)=>r.headers.authorization==="Bearer qwen-secret"));

  const built=buildStandardModelProvidersFromEnv({
    OPENAI_API_KEY:"a",
    OPENAI_MODEL:"om",
    ANTHROPIC_API_KEY:"b",
    ANTHROPIC_MODEL:"am",
    GOOGLE_API_KEY:"c",
    GOOGLE_MODEL:"gm",
    DEEPSEEK_API_KEY:"d",
    DEEPSEEK_MODEL:"dm",
    QWEN_API_KEY:"e",
    QWEN_MODEL:"qm",
    QWEN_BASE_URL:"https://qwen.example/compatible-mode/v1"
  } as NodeJS.ProcessEnv);

  assert.equal(built.adapters.length,5);
  assert.deepEqual(
    built.configs.map((c)=>c.providerId).sort(),
    ["anthropic","deepseek","google","openai","qwen"]
  );
  assert.ok(built.configs.every((c)=>c.privacyClasses.includes("INTERNAL")));
  assert.ok(built.configs.every((c)=>!c.privacyClasses.includes("RESTRICTED")));

  await syncProductionModelRegistry(built.configs);
  const db=await pool.query(
    "SELECT provider_id,models,capabilities,privacy_class_allowed FROM model_providers WHERE provider_id=ANY($1::text[]) ORDER BY provider_id",
    [["openai","anthropic","google","deepseek","qwen"]]
  );
  assert.equal(db.rowCount,5);
  assert.ok(db.rows.every((r)=>r.capabilities.includes("planning")));
  assert.ok(db.rows.every((r)=>r.privacy_class_allowed.includes("INTERNAL")));

  await new Promise<void>((resolve,reject)=>mock.server.close((err)=>err?reject(err):resolve()));

  console.log("PHASE11_REAL_MODEL_ADAPTERS PASS providers=5");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
