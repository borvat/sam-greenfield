import { pool } from "../../../packages/db/src/client";
import { recoverKernelAfterRestart } from "../../kernel/src/recovery";

export interface RuntimeReadiness{
  started:boolean;
  recovering:boolean;
  ready:boolean;
  shuttingDown:boolean;
  startupError:string|null;
  recoveredAt:string|null;
}

export class ReadinessGate{
  private state:RuntimeReadiness={
    started:false,
    recovering:false,
    ready:false,
    shuttingDown:false,
    startupError:null,
    recoveredAt:null
  };

  snapshot():RuntimeReadiness{
    return {...this.state};
  }

  async start():Promise<RuntimeReadiness>{
    if(this.state.started) return this.snapshot();
    this.state.started=true;
    this.state.recovering=true;
    this.state.ready=false;
    this.state.startupError=null;

    try{
      await pool.query("SELECT 1");
      await recoverKernelAfterRestart();
      this.state.recovering=false;
      this.state.ready=true;
      this.state.recoveredAt=new Date().toISOString();
      return this.snapshot();
    }catch(err){
      this.state.recovering=false;
      this.state.ready=false;
      this.state.startupError="DEPENDENCY_UNAVAILABLE";
      throw new Error("RUNTIME_DEPENDENCY_UNAVAILABLE");
    }
  }

  async refresh(probe:()=>Promise<unknown>=()=>pool.query("SELECT 1")):Promise<boolean>{
    if(this.state.shuttingDown)return false;
    try{
      await probe();
      if(!this.state.ready)await recoverKernelAfterRestart();
      this.state.ready=true;
      this.state.startupError=null;
      return true;
    }catch{
      this.state.ready=false;
      this.state.startupError="DEPENDENCY_UNAVAILABLE";
      return false;
    }
  }

  beginShutdown():void{
    this.state.shuttingDown=true;
    this.state.ready=false;
  }
}
