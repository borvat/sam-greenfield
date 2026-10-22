"use strict";
const assert=require("node:assert/strict");
const {portablePolicy}=require("../../scripts/development/portable-rls.cjs");
function fixtureSQL(){
  const schema="sam_rls_portability_fixture";
  const role="sam_rls_fixture_app",member="sam_rls_fixture_member",
    noninherit="sam_rls_fixture_noinherit",other="sam_rls_fixture_other",partial="sam_rls_fixture_partial";
  const actors=[role,member,noninherit,other,partial];
  const statements=["BEGIN; SET LOCAL lock_timeout='3s'; SET LOCAL statement_timeout='60s';",
    `DO $$ BEGIN IF current_database()<>'heliumdb' THEN RAISE EXCEPTION 'RLS_FIXTURE_WRONG_DATABASE'; END IF; END $$;`,
    `CREATE SCHEMA ${schema};`,
    ...actors.map(r=>`CREATE ROLE ${r} NOLOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION NOINHERIT;`),
    `GRANT ${role} TO ${member} WITH INHERIT TRUE; GRANT ${role} TO ${noninherit} WITH INHERIT FALSE;`,
    `GRANT USAGE ON SCHEMA ${schema} TO ${actors.join(",")};`];
  for(const table of ["old","new"]){
    statements.push(`CREATE TABLE ${schema}.${table}(id int PRIMARY KEY,tenant text,entity text,allowed boolean);
      INSERT INTO ${schema}.${table} VALUES(1,'A','one',true),(2,'A','one',false),(3,'B','two',true),(4,'A','sibling',true),(5,'A','one',null);
      ALTER TABLE ${schema}.${table} ENABLE ROW LEVEL SECURITY; ALTER TABLE ${schema}.${table} FORCE ROW LEVEL SECURITY;
      GRANT SELECT,INSERT,UPDATE,DELETE ON ${schema}.${table} TO ${actors.join(",")};
      CREATE POLICY base ON ${schema}.${table} TO PUBLIC
        USING(tenant=current_setting('sam.fixture_org',true) AND entity=current_setting('sam.fixture_entity',true))
        WITH CHECK(tenant=current_setting('sam.fixture_org',true) AND entity=current_setting('sam.fixture_entity',true));
      CREATE POLICY extra ON ${schema}.${table} TO ${role} USING(tenant='A' AND entity='one' AND allowed)
        WITH CHECK(tenant='A' AND entity='one' AND allowed);
      CREATE POLICY fence ON ${schema}.${table} AS RESTRICTIVE TO ${role}
        USING(tenant='A' AND entity='one' AND allowed) WITH CHECK(tenant='A' AND entity='one' AND allowed);`);
    if(table==="new")for(const [policy,permissive] of [["extra",true],["fence",false]])
      statements.push(portablePolicy({schema,table,policy,permissive,command:"*",roles:[role],
        using:"tenant='A' AND entity='one' AND allowed",check:"tenant='A' AND entity='one' AND allowed"}).sql);
  }
  // An outsider with child-only ACLs must not acquire permission errors merely
  // because a previously inapplicable policy contains a parent-table subquery.
  for(const table of ["old_child","new_child"]){
    const parent=table==="old_child"?"old":"new";
    statements.push(`CREATE TABLE ${schema}.${table}(id int,parent_id int,tenant text,entity text);
      INSERT INTO ${schema}.${table} VALUES(1,1,'A','one'),(3,3,'B','two');
      ALTER TABLE ${schema}.${table} ENABLE ROW LEVEL SECURITY; ALTER TABLE ${schema}.${table} FORCE ROW LEVEL SECURITY;
      GRANT SELECT ON ${schema}.${table} TO ${actors.join(",")};
      CREATE POLICY base ON ${schema}.${table} TO PUBLIC USING(tenant=current_setting('sam.fixture_org',true) AND entity=current_setting('sam.fixture_entity',true));
      CREATE POLICY related ON ${schema}.${table} TO ${role} USING(EXISTS(SELECT 1 FROM ${schema}.${parent} p WHERE p.id=${table}.parent_id));`);
    if(table==="new_child")statements.push(portablePolicy({schema,table,policy:"related",permissive:true,command:"r",
      roles:[role],using:`EXISTS(SELECT 1 FROM ${schema}.${parent} p WHERE p.id=${table}.parent_id)`,check:null}).sql);
  }
  statements.push(`REVOKE ALL ON ${schema}.old,${schema}.new FROM ${partial};`);
  statements.push(`DO $$ DECLARE actor text;ctx text[];operation text;a int[];b int[];expected int[];
    x text;y text;n bigint;checks int:=0; BEGIN
    FOREACH actor IN ARRAY ARRAY[${actors.map(r=>`'${r}'`).join(",")}] LOOP
      FOREACH ctx SLICE 1 IN ARRAY ARRAY[['A','one'],['B','two'],['A','sibling'],['',''],['A',''],['','one']] LOOP
        PERFORM set_config('sam.fixture_org',ctx[1],true);PERFORM set_config('sam.fixture_entity',ctx[2],true);
        EXECUTE format('SET LOCAL ROLE %I',actor);
        IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname=current_user AND (rolsuper OR rolbypassrls)) THEN RAISE EXCEPTION 'RLS_ROLE_BYPASS';END IF;
        IF actor<>'${partial}' THEN
          expected=CASE WHEN actor IN ('${role}','${member}') THEN ARRAY[1]
            WHEN ctx=ARRAY['A','one'] THEN ARRAY[1,2,5] WHEN ctx=ARRAY['B','two'] THEN ARRAY[3]
            WHEN ctx=ARRAY['A','sibling'] THEN ARRAY[4] ELSE ARRAY[]::int[] END;
          SELECT coalesce(array_agg(id ORDER BY id),ARRAY[]::int[]) INTO a FROM ${schema}.old;
          SELECT coalesce(array_agg(id ORDER BY id),ARRAY[]::int[]) INTO b FROM ${schema}.new;
          IF a IS DISTINCT FROM b OR a IS DISTINCT FROM expected THEN RAISE EXCEPTION 'RLS_SELECT_PARITY';END IF;
          checks=checks+1;
          FOREACH operation IN ARRAY ARRAY[
            'INSERT INTO TABLE_NAME VALUES(99,''A'',''one'',true)',
            'INSERT INTO TABLE_NAME VALUES(99,''A'',''one'',false)',
            'INSERT INTO TABLE_NAME VALUES(99,''B'',''two'',true)',
            'UPDATE TABLE_NAME SET allowed=false WHERE id=1',
            'DELETE FROM TABLE_NAME WHERE id=2'] LOOP
            BEGIN EXECUTE replace(operation,'TABLE_NAME','${schema}.old');
              GET DIAGNOSTICS n=ROW_COUNT;x='OK:'||n;RAISE EXCEPTION USING ERRCODE='P0002';
            EXCEPTION WHEN SQLSTATE 'P0002' THEN NULL;WHEN OTHERS THEN x=SQLSTATE;END;
            BEGIN EXECUTE replace(operation,'TABLE_NAME','${schema}.new');
              GET DIAGNOSTICS n=ROW_COUNT;y='OK:'||n;RAISE EXCEPTION USING ERRCODE='P0002';
            EXCEPTION WHEN SQLSTATE 'P0002' THEN NULL;WHEN OTHERS THEN y=SQLSTATE;END;
            IF x IS DISTINCT FROM y THEN RAISE EXCEPTION 'RLS_DML_PARITY';END IF;
            checks=checks+1;
          END LOOP;
        END IF;
        SELECT coalesce(array_agg(id ORDER BY id),ARRAY[]::int[]) INTO a FROM ${schema}.old_child;
        SELECT coalesce(array_agg(id ORDER BY id),ARRAY[]::int[]) INTO b FROM ${schema}.new_child;
        IF a IS DISTINCT FROM b THEN RAISE EXCEPTION 'RLS_RELATED_ACL_PARITY';END IF;
        checks=checks+1;
        EXECUTE 'RESET ROLE';
      END LOOP;
    END LOOP;
    IF checks<>174 THEN RAISE EXCEPTION 'RLS_MATRIX_INCOMPLETE';END IF;
  END $$;`);
  // Restore the converted definitions into a schema when the original role is
  // genuinely absent. Removing original policies first leaves no role dependency.
  statements.push(`DROP POLICY extra ON ${schema}.old; DROP POLICY fence ON ${schema}.old;
    DROP POLICY related ON ${schema}.old_child;
    REVOKE ${role} FROM ${member},${noninherit};
    REVOKE ALL ON SCHEMA ${schema} FROM ${role};
    REVOKE ALL ON ALL TABLES IN SCHEMA ${schema} FROM ${role};
    DROP ROLE ${role};`);
  for(const table of ["restored","read_only"]){
    statements.push(`CREATE TABLE ${schema}.${table}(id int,tenant text,entity text,allowed boolean);
      ALTER TABLE ${schema}.${table} ENABLE ROW LEVEL SECURITY; ALTER TABLE ${schema}.${table} FORCE ROW LEVEL SECURITY;
      GRANT SELECT ON ${schema}.${table} TO ${other};
      CREATE POLICY restored ON ${schema}.${table} TO PUBLIC USING(false);`);
    statements.push(portablePolicy({schema,table,policy:"restored",permissive:true,
      command:table==="read_only"?"r":"*",roles:[role],using:"true",check:null}).sql);
  }
  statements.push(`INSERT INTO ${schema}.restored VALUES(1,'A','one',true);
    DO $$ DECLARE n int; BEGIN
      EXECUTE 'SET LOCAL ROLE ${other}';SELECT count(*) INTO n FROM ${schema}.restored;
      IF n<>0 THEN RAISE EXCEPTION 'RLS_ABSENT_ROLE_NOT_CLOSED';END IF;EXECUTE 'RESET ROLE';
    END $$;
    SELECT 'PASS' AS status, 175 AS checks, 'REAL_DEVELOPMENT_PG_SYNTHETIC_SET_ROLE_NOT_LOGIN_AUTH' AS classification;
    ROLLBACK;`);
  return statements.join("\n");
}
const p={schema:"fixture",table:"goals",policy:"scope",roles:["app"],permissive:true,command:"*",
  using:"tenant='A'",check:"tenant='A'"};
assert.equal(portablePolicy(p).functionCount,1);
assert.ok(!portablePolicy(p).sql.includes("SECURITY DEFINER"));
for(const patch of [{roles:["bad'role"]},{schema:"bad;DROP TABLE goals"}, {permissive:"false"}, {command:"?"}, {using:"$sam_portable$"}])
  assert.throws(()=>portablePolicy({...p,...patch}));
if(process.argv.includes("--emit-sql"))process.stdout.write(fixtureSQL());
else console.log("PORTABLE_RLS_UNIT_PASS: strict identifiers, policy kinds, invoker-only functions; fixture SQL available via --emit-sql.");
module.exports={fixtureSQL};
