"use strict";
const {createHash}=require("node:crypto");
function identifier(value){
  if(typeof value!=="string"||!/^[a-z_][a-z0-9_]{0,62}$/.test(value))throw new Error("RLS_IDENTIFIER_INVALID");
  return `"${value}"`;
}
function portablePolicy(policy){
  const schema=identifier(policy.schema),table=identifier(policy.table),name=identifier(policy.policy);
  if(policy.roles?.length!==1)throw new Error("RLS_SINGLE_ROLE_REQUIRED");
  const role=policy.roles[0];identifier(role);
  if(typeof policy.permissive!=="boolean"||!["*","r","a","w","d"].includes(policy.command))
    throw new Error("RLS_POLICY_KIND_INVALID");
  const statements=[];
  function clause(expression,kind){
    if(expression===null)return null;
    if(typeof expression!=="string"||!expression.trim()||expression.includes("$sam_portable$"))
      throw new Error("RLS_CATALOG_EXPRESSION_INVALID");
    const hash=createHash("sha256").update(JSON.stringify([policy.schema,policy.table,policy.policy,kind])).digest("hex").slice(0,20);
    const fn=`sam_rls_${hash}`,qualified=`${schema}.${identifier(fn)}`;
    // A CASE around an inlined subquery still adds relation ACL checks for
    // nonmembers. An invoker PL/pgSQL function evaluates that subquery ONLY for
    // applicable roles. Never SECURITY DEFINER, dynamic SQL or arbitrary execute.
    statements.push(`CREATE FUNCTION ${qualified}(portable_row ${schema}.${table}) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = pg_catalog, ${schema}, pg_temp AS $sam_portable$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_catalog.pg_roles r
    WHERE r.rolname = '${role}' AND pg_catalog.pg_has_role(CURRENT_USER,r.oid,'USAGE')) THEN
    RETURN ${policy.permissive?"false":"true"};
  END IF;
  RETURN (SELECT (${expression}) FROM (SELECT (portable_row).*) AS ${table});
END
$sam_portable$;
GRANT EXECUTE ON FUNCTION ${qualified}(${schema}.${table}) TO PUBLIC;`);
    return `${qualified}(${table}.*)`;
  }
  const using=clause(policy.using,"using");
  const check=policy.check!==null&&policy.check===policy.using?using:clause(policy.check,"check");
  // Absent expressions mean TRUE for applicable roles, not for every caller.
  const u=using??(["*","r","w","d"].includes(policy.command)?clause("true","using"):null);
  const c=check??(policy.command==="a"?clause("true","check"):null);
  statements.push(`ALTER POLICY ${name} ON ${schema}.${table} TO PUBLIC`+
    (u?` USING (${u})`:"")+(c?` WITH CHECK (${c})`:"")+";");
  return {sql:statements.join("\n"),functionCount:statements.length-1};
}
module.exports={portablePolicy,identifier};
