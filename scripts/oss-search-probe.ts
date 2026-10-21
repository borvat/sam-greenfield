import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
async function main(){
const root=process.env.SAM_OSS_LAB_ROOT!;if(!root)throw new Error('lab root required');
const env:Record<string,string>={PATH:process.env.PATH!,DDG_SEARCH_BACKEND:'httpx',DDG_FETCH_BACKEND:'httpx',DDG_CACHE_TTL:'0'};
for(const key of ['HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','NO_PROXY','http_proxy','https_proxy','all_proxy','no_proxy','SSL_CERT_FILE'])if(process.env[key])env[key]=process.env[key]!;
if(process.env.SSL_CERT_FILE)env.DDG_CA_CERTS=process.env.SSL_CERT_FILE;
const client=new Client({name:'sam-search-probe',version:'1'});const t=new StdioClientTransport({command:resolve(root,'oss-search-python/bin/duckduckgo-mcp-server'),args:['--search-backend','httpx','--fetch-backend','httpx','--cache-ttl','0'],env,stderr:'pipe'});t.stderr?.on('data',()=>{});
const results:any[]=[];
try{await client.connect(t,{timeout:15000});const tools=await client.listTools();await writeFile(resolve(root,'search-tools.json'),JSON.stringify(tools,null,2));
for(const args of [{name:'search',arguments:{query:'Model Context Protocol official documentation',max_results:3}},{name:'fetch_content',arguments:{url:'https://example.com/',max_length:1000,backend:'httpx'}}]){
 try{const r=await client.callTool(args,undefined,{timeout:20000});results.push({tool:args.name,result:r});console.log(JSON.stringify({tool:args.name,result:r}).slice(0,2500))}catch(error){results.push({tool:args.name,error:String(error)});console.log(args.name,String(error))}
}
await writeFile('docs/acceptance/oss-search-probe.json',JSON.stringify({capturedAt:new Date().toISOString(),provider:'duckduckgo-mcp-server@0.7.0',results},null,2)+'\n');
}finally{await client.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
