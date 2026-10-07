export type RuntimeMode="development"|"test"|"production";

export interface RuntimeConfig{
  mode:RuntimeMode;
  databaseUrl:string;
  port:number;
  workerId:string;
  tickIntervalMs:number;
  shutdownGraceMs:number;
}

function positiveInt(name:string,value:string|undefined,fallback:number):number{
  if(value===undefined||value==="") return fallback;
  const n=Number(value);
  if(!Number.isInteger(n)||n<=0) throw new Error(`${name} must be a positive integer`);
  return n;
}

export function loadRuntimeConfig(env:NodeJS.ProcessEnv=process.env):RuntimeConfig{
  const mode=(env.NODE_ENV ?? "development") as RuntimeMode;
  if(!["development","test","production"].includes(mode)){
    throw new Error("NODE_ENV must be development, test, or production");
  }

  const databaseUrl=env.DATABASE_URL ?? "";
  if(mode==="production" && !databaseUrl){
    throw new Error("DATABASE_URL is required in production");
  }
  if(mode==="production"){
    if(!env.SAM_WORKER_ID?.trim()) throw new Error("SAM_WORKER_ID is required in production");
    if(env.POSTGRES_PASSWORD==="postgres"){
      throw new Error("Default POSTGRES_PASSWORD is forbidden in production");
    }
  }

  return {
    mode,
    databaseUrl:databaseUrl || "postgres://postgres:postgres@localhost:5432/sam_greenfield",
    port:positiveInt("PORT",env.PORT,8080),
    workerId:env.SAM_WORKER_ID?.trim() || "sam-local",
    tickIntervalMs:positiveInt("SAM_TICK_INTERVAL_MS",env.SAM_TICK_INTERVAL_MS,1000),
    shutdownGraceMs:positiveInt("SAM_SHUTDOWN_GRACE_MS",env.SAM_SHUTDOWN_GRACE_MS,15000)
  };
}
