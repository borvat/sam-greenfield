// Test instrumentation: attempts fail the native-process test, not a fake backend.
const Module=require("node:module");
const load=Module._load;
Module._load=function(name,...args){
  if(name==="pg"||name==="tsx"||/contract\.cjs|supervisor\.cjs|ports\.cjs|apps\/|packages\//.test(name)){
    throw new Error("SETUP_FORBIDDEN_MODULE_ATTEMPT");
  }
  return load.call(this,name,...args);
};
const denied=()=>{throw new Error("SETUP_OUTBOUND_OR_CHILD_ATTEMPT");};
require("node:net").Socket.prototype.connect=denied;
require("node:tls").connect=denied;
global.fetch=denied;
for(const key of ["spawn","spawnSync","fork","exec","execSync","execFile","execFileSync"]){
  require("node:child_process")[key]=denied;
}
