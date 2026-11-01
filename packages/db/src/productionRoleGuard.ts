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
  await assertSamRoleIsolation(pool);
}

const SAM_GROUPS=["sam_runtime_worker","sam_tenant_app","sam_mcp_bridge"] as const;

// Read-only structural checks on the role model. They apply only when the connecting
// login belongs to a SAM group role (self-hosted deployments provisioned by
// provision-roles.sql); other deployments are unaffected.
//   * a login may belong to at most one of the three SAM groups (privileges are the
//     union of memberships, so an overlap silently widens access);
//   * credential_vault must have row level security enabled;
//   * only a member of sam_credential_vault may read the vault.
export async function assertSamRoleIsolation(
  db:{query(text:string,values?:any[]):Promise<{rows:any[];rowCount?:number|null}>}
):Promise<void>{
  const m=await db.query(
    `SELECT r.rolname FROM pg_catalog.pg_roles r
      WHERE r.rolname = ANY($1::text[]) AND pg_catalog.pg_has_role(current_user, r.oid, 'USAGE')
        AND NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles s WHERE s.rolname=current_user AND s.rolsuper)`,
    [SAM_GROUPS as unknown as string[]]);
  if(!m.rows.length)return;
  if(m.rows.length>1)throw new Error("RELEASE_ROLE_MEMBERSHIP_OVERLAP");
  const v=await db.query(
    `SELECT c.relrowsecurity AS rls,
            pg_catalog.has_table_privilege(current_user,c.oid,'SELECT') AS can_read,
            EXISTS(SELECT 1 FROM pg_catalog.pg_roles g
                    WHERE g.rolname='sam_credential_vault' AND pg_catalog.pg_has_role(current_user,g.oid,'USAGE')) AS is_vault
       FROM pg_catalog.pg_class c
       JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace AND n.nspname='public'
      WHERE c.relname='credential_vault' AND c.relkind='r'`);
  if(!v.rows.length)return;
  if(!v.rows[0].rls)throw new Error("RELEASE_VAULT_RLS_DISABLED");
  if(v.rows[0].can_read&&!v.rows[0].is_vault)throw new Error("RELEASE_VAULT_ACCESS_UNEXPECTED");
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
