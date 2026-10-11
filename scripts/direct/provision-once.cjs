"use strict";
// Administrative input stays in a private terminal/pipe, outside app Secrets.
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const {hidden}=require('../provisioning/neon-migrator-once.cjs');
const {manifest}=require('./provision.cjs');
async function main(){
 const filename=process.argv[2];
 if(!filename){console.log('Usage: npm run direct:provision -- deploy/direct/provision.json');return;}
 if(process.env.NODE_OPTIONS)throw new Error('PRELOAD_REFUSED');
 const config=JSON.parse(fs.readFileSync(filename,'utf8'));
 if(!config.expectedHost||!config.expectedDatabase||!config.metadata)throw new Error('TARGET_REQUIRED');
 manifest(config.metadata);
 const packet={...config,adminUrl:await hidden('New database administrative URL (hidden): '),runtimePassword:await hidden('New runtime random password, 32+ characters (hidden): ')};
 const child=spawn(process.execPath,[path.join(__dirname,'provision.cjs'),'--apply'],{env:{LANG:'C.UTF-8'},stdio:['ignore','pipe','pipe','pipe']});
 let output='';child.stdout.on('data',b=>{output=(output+b).slice(0,4096);});child.stderr.on('data',()=>{});
 child.stdio[3].on('error',()=>{});child.stdio[3].end(JSON.stringify(packet));
 const timeout=setTimeout(()=>child.kill('SIGKILL'),120000);
 const status=await new Promise((resolve,reject)=>{child.once('exit',resolve);child.once('error',reject);});clearTimeout(timeout);
 let result;try{result=JSON.parse(output);}catch{}
 if(status!==0||!['PROVISIONED','ALREADY_PROVISIONED'].includes(result?.status)||result.runtimeLoginVerified!==true||!/^[0-9a-f]{64}$/.test(result.fingerprint??''))
   throw new Error('PROVISION_OUTCOME_REQUIRES_INSPECTION');
 console.log(JSON.stringify(result));
}
main().catch(()=>{console.error('DIRECT_PROVISION_REFUSED: inspect the target before retry; a committed installation may exist.');process.exitCode=1;});
