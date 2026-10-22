import {Pool} from "pg";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
import {assertReleaseDatabaseSafety} from "../../packages/db/src/releaseSafety";

const require=createRequire(import.meta.url);
const {validateReleaseDatabase}=require("./contract.cjs");
type Probe={
  query(text:string,values?:any[]):Promise<{rows:any[]}>;
  end():Promise<void>;
};

// Operational admission only: no worker, model call, DDL, grant or data reads.
// Reuses the same release contract and runtime role guard; no credential broker.
export async function checkReleaseDatabase(
  env:NodeJS.ProcessEnv,
  approved:boolean,
  createPool:(config:any)=>Probe=config=>new Pool(config)
){
  if(!approved)throw new Error("RELEASE_DATABASE_CHECK_APPROVAL_REQUIRED");
  const config=validateReleaseDatabase(env);
  const db=createPool({
    connectionString:config.databaseUrl,max:1,connectionTimeoutMillis:5000,
    query_timeout:5000,statement_timeout:5000
  });
  try{
    const transport=(await db.query(
      "SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()"
    )).rows[0];
    if(transport?.ssl!==true)throw new Error("RELEASE_DATABASE_TLS_REQUIRED");
    await assertReleaseDatabaseSafety(db);
    return {
      status:"PASS",
      classification:"DATABASE_ADMISSION_ONLY_NOT_END_TO_END_ACCEPTANCE",
      tls:"verify-full",
      nonownerRestrictedLogin:true,
      rlsEnabled:true,
      workerStarted:false,modelCalls:0,mutations:0,publishAuthorized:false
    };
  }finally{await db.end();}
}

export function databaseCheckFailure(error:unknown){
  const allowed=new Set([
    "RELEASE_DATABASE_CHECK_APPROVAL_REQUIRED","RELEASE_DATABASE_TLS_REQUIRED",
    "RELEASE_APPLICATION_LOGIN_REQUIRED","RELEASE_APPLICATION_ROLE_UNSAFE",
    "RELEASE_PRIVILEGED_ROLE_MEMBERSHIP_FORBIDDEN","RELEASE_APPLICATION_TABLE_OWNER_FORBIDDEN",
    "RELEASE_APPLICATION_DDL_FORBIDDEN","RELEASE_RLS_REQUIRED"
  ]);
  return error instanceof Error&&allowed.has(error.message)?
    error.message:"RELEASE_DATABASE_CHECK_FAILED";
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  checkReleaseDatabase(process.env,process.argv.includes("--approved-read-only"))
    .then(result=>console.log(JSON.stringify(result)))
    .catch(error=>{
      // Never print provider messages, query text, credentials or URLs.
      const code=databaseCheckFailure(error);
      console.error(JSON.stringify({status:"BLOCKED",code,publishAuthorized:false}));
      process.exitCode=1;
    });
}
