import {pool} from "./client";
import {assertReleaseDatabaseSafety} from "./releaseSafety";

// Startup admission for every long-running SAM service in production.
// Row-level security is only a control if the connecting role is subject to it:
// superusers, BYPASSRLS roles and table owners ignore every policy. This refuses
// to start unless the service connects as a plain, non-owner application login.
// Read-only: no DDL, GRANT or role changes. Outside production it is a no-op so
// local development and the existing test suites are unaffected.
export async function assertProductionDatabaseRole(env:NodeJS.ProcessEnv=process.env):Promise<void>{
  if(env.NODE_ENV!=="production")return;
  await assertReleaseDatabaseSafety(pool);
}

// Only fixed RELEASE_* codes are safe to log; anything else stays withheld.
export function safeStartupCode(err:unknown):string|null{
  const m=(err as {message?:unknown})?.message;
  return typeof m==="string"&&/^RELEASE_[A-Z_]+$/.test(m)?m:null;
}

// The baseline goal/financial policies (00008/00009) scope by legal entity alone.
// A service whose PGOPTIONS pair an org with an entity of ANOTHER org would
// therefore read that entity's rows. legal_entities is scoped by org, so an entity
// that is visible under the connection's org context belongs to that org; if it is
// not visible the pairing is wrong and the service must not start.
export async function assertTenantContextConsistent(
  db:{query(text:string,values?:any[]):Promise<{rows:any[];rowCount?:number|null}>},
  legalEntityId:string
):Promise<void>{
  const r=await db.query("SELECT 1 FROM legal_entities WHERE id=$1",[legalEntityId]);
  if(!r.rows.length)throw new Error("RELEASE_TENANT_CONTEXT_MISMATCH");
}
