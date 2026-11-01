#!/usr/bin/env python3
"""Replay pinned, nonsecret catalog ACL metadata ONLY on the exact disposable target.
ONE stdin JSON: targetInternalURL, sourceCatalogPath, restoredSchemaPath.
No passwords/catalog contents/tenant UUIDs are printed. All application roles stay
NOLOGIN; this does not enable applications, migrate, or relax any RLS setting.
"""
import datetime,hashlib,json,os,pathlib,re,subprocess,sys,tempfile,urllib.parse
HOST='dpg-dbjpqkutlv9c73dup8lg-a';DB='sam_restore_pr86_20261101_2013';ADMIN='sam_restore_pr86_20261101_2013_user'
BIN='/tmp/sam-pr86-restore-2013/pg/bin/psql'
DEADLINE=datetime.datetime(2026,11,2,20,13,7,tzinfo=datetime.timezone.utc)
CATALOG_SHA='1dc27fdfedb9d4060628287587fa3afd20f8b8268d7559b41435d6a590187943'
ROLES={'sam_trial_postgres_user','sam_runtime_app','sam_mcp_app','sam_eval_runtime_20261024'}
PRIV={'r':'SELECT','a':'INSERT','w':'UPDATE','d':'DELETE','D':'TRUNCATE','x':'REFERENCES','t':'TRIGGER','U':'USAGE','C':'CREATE','X':'EXECUTE','c':'CONNECT','T':'TEMPORARY'}
class Refused(Exception):pass
def need(c,k):
 if not c:raise Refused(k)
def qi(v):
 need(bool(re.fullmatch(r'[a-z_][a-z0-9_]*',v)),'IDENTIFIER_REFUSED');return '"'+v+'"'
def lit(v):return "'"+v.replace("'","''")+"'"
def mapped(role,database=False):
 if role=='PUBLIC':return role
 need(role in ROLES|{'postgres',ADMIN},'SOURCE_ACL_PRINCIPAL_REFUSED')
 return ADMIN if database and role=='sam_trial_postgres_user' else role
def acl_entries(raw,owner,kind,database=False):
 if raw is None:
  base={'r':'arwdDxt','S':'rwU','f':'X','n':'UC','d':'CTc'}[kind]
  pieces=[owner+'='+base+'/'+owner]
  if kind=='f':pieces.append('=X/'+owner)
  if kind=='d':pieces.append('=Tc/'+owner)
 else:
  need(raw.startswith('{') and raw.endswith('}'),'ACL_ARRAY_REFUSED')
  pieces=raw[1:-1].split(',') if raw[1:-1] else []
 out=[]
 for piece in pieces:
  m=re.fullmatch(r'([a-z_][a-z0-9_]*|)=([a-zA-Z*]*)/([a-z_][a-z0-9_]*)',piece)
  need(m is not None,'ACL_ITEM_REFUSED')
  grantee,flags,grantor=m.groups();grantee=mapped(grantee or 'PUBLIC',database);grantor=mapped(grantor,database)
  allowed={'r':set('arwdDxt'),'S':set('rwU'),'f':set('X'),'n':set('UC'),'d':set('CTc'),'c':set('arwx')}[kind]
  i=0
  while i<len(flags):
   ch=flags[i];need(ch in allowed,'ACL_PRIVILEGE_REFUSED');i+=1
   option=i<len(flags) and flags[i]=='*'
   if option:i+=1
   out.append([grantee,grantor,PRIV[ch],option])
 return sorted(out,key=lambda x:(x[0],x[1],x[2],x[3]))
def main():
 os.umask(0o077)
 need((DEADLINE-datetime.datetime.now(datetime.timezone.utc)).total_seconds()>1200,'CLEANUP_RESERVE_REACHED')
 raw=sys.stdin.buffer.read(32769);need(len(raw)<=32768,'CONFIG_TOO_LARGE');cfg=json.loads(raw)
 need(set(cfg)=={'targetInternalURL','sourceCatalogPath','restoredSchemaPath'},'CONFIG_KEYS_REFUSED')
 u=urllib.parse.urlsplit(cfg['targetInternalURL'])
 need(u.scheme in ('postgres','postgresql') and u.hostname==HOST and u.port in (None,5432)
      and urllib.parse.unquote(u.path)=='/'+DB and urllib.parse.unquote(u.username or '')==ADMIN
      and u.password and not u.fragment,'EXACT_TARGET_REQUIRED')
 opts=urllib.parse.parse_qs(u.query,strict_parsing=True)
 need(set(opts)<={'sslmode'} and all(len(v)==1 for v in opts.values()),'TARGET_OPTIONS_REFUSED')
 ssl=opts.get('sslmode',['require'])[0];need(ssl in ('require','verify-full'),'SSL_REQUIRED')
 source=pathlib.Path(cfg['sourceCatalogPath']);need(source.is_file() and not source.is_symlink(),'CATALOG_FILE_REQUIRED')
 data=source.read_bytes();need(hashlib.sha256(data).hexdigest()==CATALOG_SHA,'PINNED_CATALOG_REQUIRED');cat=json.loads(data)
 need(len(cat['roles'])==4 and len(cat['relations'])==95 and len(cat['functions'])==62
      and len(cat['schemas'])==2 and len(cat['column_acls'])==33,'CATALOG_SHAPE_CHANGED')
 need(cat['memberships']==[] and cat['default_acls']==[] and cat['role_settings']==[],
      'UNSUPPORTED_NONEMPTY_MEMBERSHIP_DEFAULTACL_ROLECONFIG')
 schemafile=pathlib.Path(cfg['restoredSchemaPath']);need(schemafile.is_file() and not schemafile.is_symlink(),'SCHEMA_FILE_REQUIRED')
 schema=schemafile.read_text()
 # Derive the immutable binding from both USING and WITH CHECK in the restored policy.
 p=re.search(r'CREATE POLICY "runtime_sam_runtime_app" ON "public"\."goals" AS RESTRICTIVE TO "sam_runtime_app"[\s\S]*?;',schema)
 need(p is not None,'FIXED_TENANT_POLICY_REQUIRED')
 text=p.group(0)
 uuid=r'([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})'
 entities=re.findall(r'"?current_legal_entity_id"?\(\)\s*=\s*\''+uuid+r"'",text)
 orgs=re.findall(r'"?current_org_id"?\(\)\s*=\s*\''+uuid+r"'",text)
 # pg_dump wraps the function expression and casts uuid; normalize harmless syntax.
 if not entities or not orgs:
  normalized=re.sub(r'["\s()]','',text)
  entities=re.findall(r"current_legal_entity_id='"+uuid+r"'",normalized)
  orgs=re.findall(r"current_org_id='"+uuid+r"'",normalized)
 need(len(entities)==2 and len(set(entities))==1 and len(orgs)==2 and len(set(orgs))==1,'FIXED_TENANT_POLICY_AMBIGUOUS')
 private=pathlib.Path(tempfile.mkdtemp(prefix='sam-acl-replay-',dir='/tmp'));private.chmod(0o700)
 (private/'tenant-binding.private.json').write_text(json.dumps({'org':orgs[0],'entity':entities[0],
     'connection_options':'-c search_path=public,pg_catalog -c app.current_org_id='+orgs[0]+' -c app.current_legal_entity_id='+entities[0]}))
 env={'PATH':'/usr/bin:/bin','LANG':'C.UTF-8','HOME':str(private),'PGHOST':HOST,'PGPORT':'5432',
      'PGDATABASE':DB,'PGUSER':ADMIN,'PGPASSWORD':urllib.parse.unquote(u.password),'PGSSLMODE':ssl,
      'PGCONNECT_TIMEOUT':'10','PGOPTIONS':'-c search_path=pg_catalog -c statement_timeout=300000'}
 def execute(sql,tag):
  need((DEADLINE-datetime.datetime.now(datetime.timezone.utc)).total_seconds()>1200,'CLEANUP_RESERVE_REACHED')
  with open(private/(tag+'.stderr'),'wb') as err:
   r=subprocess.run([BIN,'-X','-w','-qAt','--set=ON_ERROR_STOP=1'],input=sql.encode(),stdout=subprocess.PIPE,
       stderr=err,env=env,timeout=min(600,max(1,int((DEADLINE-datetime.datetime.now(datetime.timezone.utc)).total_seconds()-1200))),check=False)
  need(r.returncode==0,tag.upper()+'_FAILED_PRIVATE_DIAGNOSTICS');return r.stdout.decode().strip()
 identity=json.loads(execute("SELECT json_build_object('db',current_database(),'user',current_user,'session',session_user,'major',current_setting('server_version_num')::int/10000,'bypass',(SELECT rolbypassrls OR rolsuper FROM pg_roles WHERE rolname=current_user));",'identity'))
 need(identity=={'db':DB,'user':ADMIN,'session':ADMIN,'major':15,'bypass':False},'TARGET_IDENTITY_REFUSED')
 sql=['BEGIN;',"SET LOCAL lock_timeout='5s';",'SELECT pg_advisory_xact_lock(15112013);']
 for role in cat['roles']:
  name=role['rolname'];need(name in ROLES and not any(role[k] for k in ['rolsuper','rolbypassrls','rolreplication']),'UNSAFE_SOURCE_ROLE')
  flags=['NOSUPERUSER','NOBYPASSRLS','NOREPLICATION','NOLOGIN',
    'INHERIT' if role['rolinherit'] else 'NOINHERIT','CREATEROLE' if role['rolcreaterole'] else 'NOCREATEROLE',
    'CREATEDB' if role['rolcreatedb'] else 'NOCREATEDB','CONNECTION LIMIT '+str(int(role['rolconnlimit']))]
  sql.append('ALTER ROLE '+qi(name)+' '+' '.join(flags)+(' VALID UNTIL '+lit(role['rolvaliduntil']) if role['rolvaliduntil'] else " VALID UNTIL 'infinity'")+';')
 reset_roles=sorted(ROLES|{ADMIN})
 objects=[]
 managed_functions=[]
 for x in cat['schemas']:
  objects.append(('SCHEMA '+qi(x['nspname']),'n',x['owner'],x['acl'],False,
      'SELECT nspacl acl,nspowner owner FROM pg_namespace WHERE nspname='+lit(x['nspname'])))
 for x in cat['relations']:
  need(x['relkind'] in ('r','p','S','v','m'),'RELATION_KIND_REFUSED')
  address=qi(x['nspname'])+'.'+qi(x['relname']);kind='S' if x['relkind']=='S' else 'r'
  objects.append((('SEQUENCE ' if kind=='S' else 'TABLE ')+address,kind,x['owner'],x['acl'],False,
      'SELECT relacl acl,relowner owner FROM pg_class WHERE oid='+lit(address)+'::regclass'))
 for x in cat['functions']:
  args=x['arguments'];need(bool(re.fullmatch(r'[a-zA-Z0-9_" .,\[\]]*',args)),'FUNCTION_ARGUMENTS_REFUSED')
  address=qi(x['nspname'])+'.'+qi(x['proname'])+'('+args+')'
  catalogsql='SELECT p.proacl acl,p.proowner owner,p.oid object_oid FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='+lit(x['nspname'])+' AND p.proname='+lit(x['proname'])+' AND pg_get_function_identity_arguments(p.oid)='+lit(args)
  if x['owner']=='postgres':
   need(x['acl']=='{=X/postgres,postgres=X/postgres,sam_trial_postgres_user=X/postgres}',
        'MANAGED_EXTENSION_SOURCE_ACL_PATTERN_CHANGED')
   expected=acl_entries(x['acl'],x['owner'],'f')
   expected=sorted([[ADMIN if row[0]=='sam_trial_postgres_user' else row[0],*row[1:]] for row in expected],key=lambda z:(z[0],z[1],z[2],z[3]))
   managed_functions.append((catalogsql,expected))
  else:
   need(x['owner']=='sam_trial_postgres_user','FUNCTION_OWNER_REFUSED')
   objects.append(('FUNCTION '+address,'f',x['owner'],x['acl'],False,catalogsql))
 need(len(managed_functions)==36,'MANAGED_EXTENSION_FUNCTION_COUNT_CHANGED')
 for x in cat['database']:
  need(x['datname']=='sam_trial_postgres' and x['owner']=='sam_trial_postgres_user','SOURCE_DATABASE_CHANGED')
  objects.append(('DATABASE '+qi(DB),'d',x['owner'],x['acl'],True,
      'SELECT datacl acl,datdba owner FROM pg_database WHERE datname='+lit(DB)))
 checks=["IF EXISTS (SELECT 1 FROM pg_auth_members m JOIN pg_roles r ON r.oid=m.member WHERE r.rolname IN ('sam_trial_postgres_user','sam_runtime_app','sam_mcp_app','sam_eval_runtime_20261024')) THEN RAISE EXCEPTION 'TARGET_SOURCE_ROLE_MEMBERSHIP_MISMATCH'; END IF;",
  "IF EXISTS (SELECT 1 FROM pg_default_acl d JOIN pg_roles r ON r.oid=d.defaclrole WHERE r.rolname IN ('sam_trial_postgres_user','sam_runtime_app','sam_mcp_app','sam_eval_runtime_20261024','sam_restore_pr86_20261101_2013_user')) THEN RAISE EXCEPTION 'TARGET_DEFAULT_ACL_MISMATCH'; END IF;"]
 for x in cat['relations']:
  address=qi(x['nspname'])+'.'+qi(x['relname'])
  checks.append('IF NOT EXISTS (SELECT 1 FROM pg_class WHERE oid='+lit(address)+'::regclass AND relrowsecurity='+str(x['relrowsecurity']).upper()+' AND relforcerowsecurity='+str(x['relforcerowsecurity']).upper()+") THEN RAISE EXCEPTION 'TARGET_RLS_FLAGS_MISMATCH'; END IF;")
 for role in cat['roles']:
  tests=['NOT rolcanlogin','NOT rolsuper','NOT rolbypassrls','NOT rolreplication',
   'rolinherit='+str(role['rolinherit']).upper(),'rolcreatedb='+str(role['rolcreatedb']).upper(),
   'rolcreaterole='+str(role['rolcreaterole']).upper(),'rolconnlimit='+str(int(role['rolconnlimit']))]
  checks.append('IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='+lit(role['rolname'])+' AND '+' AND '.join(tests)+") THEN RAISE EXCEPTION 'TARGET_ROLE_FLAGS_MISMATCH'; END IF;")
 for catalogsql,expected in managed_functions:
  expected_json=json.dumps(expected,separators=(',',':'))
  checks.append('IF NOT EXISTS (SELECT 1 FROM ('+catalogsql+") o JOIN pg_depend d ON d.classid='pg_proc'::regclass AND d.objid=o.object_oid AND d.deptype='e' JOIN pg_extension e ON e.oid=d.refobjid WHERE e.extname='pgcrypto' AND pg_get_userbyid(o.owner)='postgres') THEN RAISE EXCEPTION 'MANAGED_PGCRYPTO_MEMBERSHIP_OWNER_MISMATCH'; END IF;")
  expression="(SELECT COALESCE(jsonb_agg(jsonb_build_array(COALESCE(g.rolname,'PUBLIC'),r.rolname,a.privilege_type,a.is_grantable) ORDER BY COALESCE(g.rolname,'PUBLIC') COLLATE \"C\",r.rolname COLLATE \"C\",a.privilege_type COLLATE \"C\",a.is_grantable),'[]'::jsonb) FROM ("+catalogsql+") o CROSS JOIN LATERAL aclexplode(COALESCE(o.acl,acldefault('f'::\"char\",o.owner))) a LEFT JOIN pg_roles g ON g.oid=a.grantee JOIN pg_roles r ON r.oid=a.grantor)"
  checks.append('IF '+expression+' IS DISTINCT FROM '+lit(expected_json)+"::jsonb THEN RAISE EXCEPTION 'MANAGED_PGCRYPTO_CREATOR_ACL_MISMATCH'; END IF;")
 for address,kind,owner,rawacl,dbmap,catalogsql in objects:
  entries=acl_entries(rawacl,owner,kind,dbmap)
  # Null ACL means standard default. Keep it null instead of inventing explicit grants.
  if rawacl is not None:
   sql.append('RESET ROLE;')
   for who in ['PUBLIC',*reset_roles]:sql.append('REVOKE ALL PRIVILEGES ON '+address+' FROM '+('PUBLIC' if who=='PUBLIC' else qi(who))+';')
   for grantee,grantor,priv,option in entries:
    sql.append('SET LOCAL ROLE '+qi(grantor)+';')
    sql.append('GRANT '+priv+' ON '+address+' TO '+('PUBLIC' if grantee=='PUBLIC' else qi(grantee))+(' WITH GRANT OPTION' if option else '')+';')
  # Effective ACL equality, including grantors/options; OIDs differ between instances.
  expected=json.dumps(entries,separators=(',',':'))
  expression="(SELECT COALESCE(jsonb_agg(jsonb_build_array(COALESCE(g.rolname,'PUBLIC'),r.rolname,a.privilege_type,a.is_grantable) ORDER BY COALESCE(g.rolname,'PUBLIC') COLLATE \"C\",r.rolname COLLATE \"C\",a.privilege_type COLLATE \"C\",a.is_grantable),'[]'::jsonb) FROM ("+catalogsql+") o CROSS JOIN LATERAL aclexplode(COALESCE(o.acl,acldefault('"+('s' if kind=='S' else kind)+"'::\"char\",o.owner))) a LEFT JOIN pg_roles g ON g.oid=a.grantee JOIN pg_roles r ON r.oid=a.grantor)"
  checks.append('IF (SELECT pg_get_userbyid(owner) FROM ('+catalogsql+') own) IS DISTINCT FROM '+lit(mapped(owner,dbmap))+" THEN RAISE EXCEPTION 'TARGET_OWNER_MAPPING_MISMATCH'; END IF;")
  checks.append('IF '+expression+' IS DISTINCT FROM '+lit(expected)+"::jsonb THEN RAISE EXCEPTION 'TARGET_ACL_SEMANTIC_MISMATCH'; END IF;")
 # Column grants are independent from table grants; exact listed source column ACLs.
 for x in cat['column_acls']:
  address=qi(x['nspname'])+'.'+qi(x['relname']);col=qi(x['attname']);entries=acl_entries(x['acl'],'sam_trial_postgres_user','c')
  sql.append('RESET ROLE;')
  for who in ['PUBLIC',*reset_roles]:
   for priv in ['SELECT','INSERT','UPDATE','REFERENCES']:sql.append('REVOKE '+priv+' ('+col+') ON TABLE '+address+' FROM '+('PUBLIC' if who=='PUBLIC' else qi(who))+';')
  for grantee,grantor,priv,option in entries:
   sql.append('SET LOCAL ROLE '+qi(grantor)+';')
   sql.append('GRANT '+priv+' ('+col+') ON TABLE '+address+' TO '+('PUBLIC' if grantee=='PUBLIC' else qi(grantee))+(' WITH GRANT OPTION' if option else '')+';')
  expected=json.dumps(entries,separators=(',',':'))
  expression="(SELECT COALESCE(jsonb_agg(jsonb_build_array(COALESCE(g.rolname,'PUBLIC'),r.rolname,a.privilege_type,a.is_grantable) ORDER BY COALESCE(g.rolname,'PUBLIC') COLLATE \"C\",r.rolname COLLATE \"C\",a.privilege_type COLLATE \"C\",a.is_grantable),'[]'::jsonb) FROM pg_attribute t CROSS JOIN LATERAL aclexplode(t.attacl) a LEFT JOIN pg_roles g ON g.oid=a.grantee JOIN pg_roles r ON r.oid=a.grantor WHERE t.attrelid="+lit(address)+'::regclass AND t.attname='+lit(x['attname'])+")"
  checks.append('IF '+expression+' IS DISTINCT FROM '+lit(expected)+"::jsonb THEN RAISE EXCEPTION 'TARGET_COLUMN_ACL_MISMATCH'; END IF;")
 sql+=['RESET ROLE;','DO $verify$ BEGIN '+' '.join(checks)+' END $verify$;','COMMIT;']
 packet='\n'.join(sql)+'\n';(private/'acl-replay.private.sql').write_text(packet)
 execute(packet,'acl-replay')
 summary={'status':'PINNED_ACL_SEMANTICS_REPLAYED','target':HOST,'database':DB,'source_catalog_sha256':CATALOG_SHA,
  'objects_checked':len(objects)+len(managed_functions),'managed_pgcrypto_functions_readonly_asserted':len(managed_functions),'managed_pgcrypto_function_mutations':False,'raw_source_acls_identical':False,'column_acls_checked':len(cat['column_acls']),'default_acls_source_count':0,
  'source_role_settings_count':0,'source_memberships_count':0,'temporary_restore_owner_membership_retained':True,
  'intentional_differences':['All four source roles remain NOLOGIN; no production password copied.',
    '36 provider-owned pgcrypto functions retain postgres owner/grantor unchanged; only source-extension-creator EXECUTE grantee maps to target administrator, readonly asserted, never mutated.',
    'Managed extension raw ACLs intentionally differ in creator grantee; normalized context-specific mapping only.',
    'Source database owner maps to target administrator; application-object owners remain source owner.',
    'Target administrator retains restore-only source-owner membership; not part of source runtime memberships.'],
  'fixed_tenant_binding_derived_privately':True,'application_login_tested':False,'rls_changed':False,
  'passwords_copied':False,'production_connected':False,'native_app_readiness_proven':False,
  'private_evidence_directory':str(private),'sql_sha256':hashlib.sha256(packet.encode()).hexdigest()}
 (private/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary))
if __name__=='__main__':
 try:main()
 except Refused as e:print(json.dumps({'status':'REFUSED','code':str(e),'production_connected':False}),file=sys.stderr);sys.exit(1)
 except Exception as e:print(json.dumps({'status':'FAILED','exception_type':type(e).__name__,'details':'WITHHELD'}),file=sys.stderr);sys.exit(1)
