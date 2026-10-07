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
      this.state.startupError=err instanceof Error ? err.message : "startup failure";
      throw err;
    }
  }

  beginShutdown():void{
    this.state.shuttingDown=true;
    this.state.ready=false;
  }
}
