type DatabaseProbe = {
  query(text: string, values?: any[]): Promise<{rows: any[]}>;
};

// Read-only admission checks. No DDL, GRANT, automatic migrations or role changes.
// A managed-provider owner login must never become SAM's runtime identity.
export async function assertReleaseDatabaseSafety(db: DatabaseProbe): Promise<void> {
  const login=(await db.query("SELECT current_user=session_user same_login")).rows[0];
  if(!login?.same_login)throw new Error("RELEASE_APPLICATION_LOGIN_REQUIRED");
  const role=(await db.query(`SELECT rolsuper,rolbypassrls,rolcreatedb,rolcreaterole,rolreplication
    FROM pg_roles WHERE rolname=current_user`)).rows[0];
  if(!role||Object.values(role).some(Boolean))throw new Error("RELEASE_APPLICATION_ROLE_UNSAFE");
  // Conservative membership check, including roles reachable by SET ROLE even
  // when NOINHERIT would hide their privileges from the initial session.
  const membership=(await db.query(`SELECT count(*)::int n FROM pg_roles
    WHERE rolname<>current_user AND pg_has_role(current_user,oid,'MEMBER')
    AND (rolsuper OR rolbypassrls OR rolcreatedb OR rolcreaterole OR rolreplication
      OR rolname=ANY($1::text[]))`,[
    ["pg_read_all_data","pg_write_all_data","pg_read_server_files",
      "pg_write_server_files","pg_execute_server_program"]
  ])).rows[0];
  if(membership.n>0)throw new Error("RELEASE_PRIVILEGED_ROLE_MEMBERSHIP_FORBIDDEN");
  const ownership=(await db.query(`SELECT count(*)::int n FROM pg_class
    WHERE relnamespace=to_regnamespace(current_schema()) AND relkind IN ('r','p')
      AND pg_has_role(current_user,relowner,'MEMBER')`)).rows[0];
  if(ownership.n>0)throw new Error("RELEASE_APPLICATION_TABLE_OWNER_FORBIDDEN");
  const ddl=(await db.query(`SELECT
    has_schema_privilege(current_schema(),'CREATE') schema_create,
    has_database_privilege(current_database(),'CREATE') database_create,
    EXISTS(SELECT 1 FROM pg_class WHERE relnamespace=to_regnamespace(current_schema())
      AND relkind IN ('r','p') AND
      (has_table_privilege(oid,'TRUNCATE') OR has_table_privilege(oid,'TRIGGER'))) table_ddl`)).rows[0];
  if(ddl.schema_create||ddl.database_create||ddl.table_ddl)throw new Error("RELEASE_APPLICATION_DDL_FORBIDDEN");
  const rls=(await db.query(`SELECT count(*)::int n,bool_and(relrowsecurity) protected FROM pg_class
    WHERE relnamespace=to_regnamespace(current_schema())
      AND relname=ANY($1::text[])`,[
    ["goals","plans","work_queue","executions","verifications","world_facts"]
  ])).rows[0];
  if(rls.n!==6||!rls.protected)throw new Error("RELEASE_RLS_REQUIRED");
}
