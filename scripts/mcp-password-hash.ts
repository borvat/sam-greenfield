import {makePasswordHash} from "../apps/mcp/src/internalOAuth";

function readHiddenPassword():Promise<string>{
  const input=process.stdin;
  if(!input.isTTY||typeof input.setRawMode!=="function"){
    return new Promise((resolve,reject)=>{
      let value="";
      input.setEncoding("utf8");
      input.on("data",chunk=>{value+=chunk;});
      input.on("end",()=>resolve(value.replace(/[\r\n]+$/,"")));
      input.on("error",reject);
    });
  }
  return new Promise((resolve,reject)=>{
    let value="";
    const finish=(error?:Error)=>{
      input.off("data",onData);
      input.setRawMode(false);
      input.pause();
      process.stdout.write("\n");
      error?reject(error):resolve(value);
    };
    const onData=(chunk:Buffer)=>{
      for(const char of chunk.toString("utf8")){
        if(char==="\u0003"){finish(new Error("Cancelled"));return;}
        if(char==="\r"||char==="\n"){finish();return;}
        if(char==="\u007f"||char==="\b"){value=value.slice(0,-1);continue;}
        if(value.length<1024)value+=char;
      }
    };
    process.stdout.write("SAM owner password (input hidden): ");
    input.setRawMode(true);
    input.resume();
    input.on("data",onData);
  });
}

async function main(){
  process.stdout.write(makePasswordHash(await readHiddenPassword())+"\n");
}
void main().catch(error=>{
  process.stderr.write(`${error instanceof Error?error.message:"Password hash failed"}\n`);
  process.exitCode=1;
});
