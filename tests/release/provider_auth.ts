import assert from "node:assert/strict";
import {createServer} from "node:http";
import {OpenAICompatibleChatAdapter} from "../../packages/model-providers/src/openaiCompatible";
import {ProviderHttpError} from "../../packages/model-providers/src/common";
async function main(){
  let status=401,count=0;
  const sentinel="fixture-upstream-echo-must-not-leak";
  const server=createServer((req,res)=>{
    count++;res.writeHead(status,{"content-type":"application/json"});
    res.end(JSON.stringify({error:{message:sentinel}}));
  });
  await new Promise<void>(r=>server.listen(0,"127.0.0.1",r));
  try{
    const adapter=new OpenAICompatibleChatAdapter("deepseek",{
      apiKey:"fixture-only-not-live",baseUrl:`http://127.0.0.1:${(server.address() as any).port}`,timeoutMs:1000});
    for(const code of [401,403,429,503]){
      status=code;const before=count;
      await assert.rejects(()=>adapter.invoke({task:"UNIT synthetic",input:{synthetic:true}} as any,"unit-model"),error=>{
        assert(error instanceof ProviderHttpError);
        assert.equal(error.status,code);
        assert(!error.message.includes(sentinel));return true;
      });
      assert.equal(count-before,1); // No automatic HTTP retry.
    }
    console.log("PROVIDER_AUTH PASS: local HTTP 401/403/429/503 fixtures, one request per case, typed redacted errors; not a live-provider authentication test.");
  }finally{await new Promise<void>(r=>server.close(()=>r()));}
}
main().catch(()=>{console.error("PROVIDER_AUTH FAIL (details withheld)");process.exitCode=1;});
