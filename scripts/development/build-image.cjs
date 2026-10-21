// Use the configured proxy and trust bundle; never disable verification or
// persist proxy credentials/CA material in the image. No production startup.
const {lookup}=require('node:dns').promises;
const {isIP}=require('node:net');
const {spawnSync}=require('node:child_process');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');

async function main(){
  const tag=process.argv[2]||'sam-core-reliability:review';
  if(!/^[a-zA-Z0-9][a-zA-Z0-9_./:-]*$/.test(tag))throw Error('IMAGE_TAG_INVALID');
  const args=['build','--no-cache','--progress=plain'];
  const hosts=new Set();
  for(const name of ['HTTP_PROXY','HTTPS_PROXY','NO_PROXY','http_proxy','https_proxy','no_proxy']){
    if(!process.env[name])continue;
    args.push('--build-arg',name);
    if(name.toLowerCase()==='no_proxy')continue;
    const host=new URL(process.env[name]).hostname;
    if(!isIP(host))hosts.add(host);
  }
  // BuildKit DNS can differ from the cloud host's configured proxy mapping.
  // Resolve that existing destination on the host, keeping the same proxy path.
  for(const host of hosts){
    const {address}=await lookup(host,{family:4});
    args.push('--add-host',`${host}:${address}`);
  }
  const ca=process.env.NODE_EXTRA_CA_CERTS;
  if(ca){
    if(!fs.statSync(ca).isFile())throw Error('REGISTRY_CA_FILE_REQUIRED');
    args.push('--secret',`id=registry_ca,src=${ca}`);
  }
  const config=process.env.DOCKER_CONFIG||path.join(os.tmpdir(),'sam-docker-config');
  fs.mkdirSync(config,{recursive:true,mode:0o700});
  const result=spawnSync('docker',[...args,'--tag',tag,'.'],{
    cwd:path.resolve(__dirname,'../..'),env:{...process.env,DOCKER_CONFIG:config},stdio:'inherit'
  });
  if(result.error)throw Error('DOCKER_BUILD_UNAVAILABLE');
  process.exitCode=result.status??1;
}
main().catch(()=>{console.error('CLEAN_IMAGE_BUILD_FAILED: check Docker, proxy DNS and configured CA');process.exitCode=1;});
