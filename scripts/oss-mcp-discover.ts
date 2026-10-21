import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { mkdir,writeFile } from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
async function main(){
const root=process.env.SAM_OSS_LAB_ROOT!;
if(!root)throw new Error('SAM_OSS_LAB_ROOT required');
const work=resolve(root,'fixture');await mkdir(work,{recursive:true});
execFileSync('git',['init','-q',work]);
const profiles=[
 {id:'filesystem',command:process.execPath,args:[resolve(root,'oss-mcp-lab/node_modules/@modelcontextprotocol/server-filesystem/dist/index.js'),work]},
 {id:'git',command:resolve(root,'oss-mcp-python/bin/python'),args:['-m','mcp_server_git','--repository',work]},
 {id:'fetch',command:resolve(root,'oss-mcp-python/bin/python'),args:['-m','mcp_server_fetch']},
 {id:'browser',command:process.execPath,args:[resolve(root,'oss-mcp-lab/node_modules/@playwright/mcp/cli.js'),'--headless','--isolated','--sandbox','--no-webmcp']}
];
for(const profile of profiles){
 const client=new Client({name:'sam-oss-discovery',version:'1'});
 const transport=new StdioClientTransport({command:profile.command,args:profile.args,env:{PATH:process.env.PATH!,PYTHONUNBUFFERED:'1'},stderr:'pipe'});
 let stderr='';transport.stderr?.on('data',chunk=>{stderr+=String(chunk)});
 try{await client.connect(transport,{timeout:20000});const list=await client.listTools();
 await writeFile(resolve(root,profile.id+'-tools.json'),JSON.stringify(list,null,2));
 console.log(JSON.stringify({id:profile.id,tools:list.tools.map(t=>t.name)}));
 }catch(error){console.log(JSON.stringify({id:profile.id,error:String(error),stderr:stderr.slice(-1500)}))}
 finally{await client.close()}
}

}
main().catch(error=>{console.error(error);process.exitCode=1});
