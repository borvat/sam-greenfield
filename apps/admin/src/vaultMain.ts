import {userInfo} from "node:os";
import {pool} from "../../../packages/db/src/client";
import {CredentialVault,VaultKeyring} from "../../../packages/db/src/credentialVault";
import {runVaultCli,type CliIo} from "./vaultCli";

function readHidden(prompt:string):Promise<string>{
  return new Promise((resolve,reject)=>{
    const stdin=process.stdin;
    process.stderr.write(prompt);
    stdin.setRawMode(true);stdin.resume();stdin.setEncoding("utf8");
    let buf="";
    const done=(fn:()=>void)=>{stdin.setRawMode(false);stdin.pause();stdin.off("data",onData);process.stderr.write("\n");fn();};
    const onData=(chunk:string)=>{
      for(const ch of chunk){
        if(ch==="\u0003")return done(()=>reject(new Error("aborted")));
        if(ch==="\r"||ch==="\n")return done(()=>resolve(buf));
        if(ch==="\u007f"||ch==="\b")buf=buf.slice(0,-1);else buf+=ch;
      }
    };
    stdin.on("data",onData);
  });
}
function readStdin():Promise<string>{
  return new Promise((resolve,reject)=>{
    let d="";process.stdin.setEncoding("utf8");
    process.stdin.on("data",c=>{d+=c;if(d.length>65536)reject(new Error("stdin too large"));});
    process.stdin.on("end",()=>resolve(d));process.stdin.on("error",reject);
  });
}

async function main(){
  const io:CliIo={
    out:l=>process.stdout.write(l+"\n"),err:l=>process.stderr.write(l+"\n"),
    isInteractive:Boolean(process.stdin.isTTY),readHidden,readStdin
  };
  let code=1;
  try{
    const vault=new CredentialVault(pool,VaultKeyring.fromEnv());
    code=await runVaultCli(process.argv.slice(2),io,vault,`operator:${process.env.SAM_OPERATOR?.trim()||userInfo().username}`);
  }catch(e){
    io.err(`error: ${(e as Error).message}`);
  }finally{await pool.end().catch(()=>{});}
  process.exit(code);
}
void main();
