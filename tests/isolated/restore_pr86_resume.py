#!/usr/bin/env python3
"""READ ONLY resumption verification of the already committed isolated restore.
Never restores, drops, grants, resets statistics, changes roles or disables RLS.
Input is original two-key target JSON. n_tup_ins is conditional evidence of the
one fresh committed restore, NOT recovered COPY tags or canonical row hashes.
"""
import datetime,gzip,hashlib,json,os,pathlib,re,subprocess,sys,urllib.parse
HOST='dpg-dbjpqkutlv9c73dup8lg-a';DB='sam_restore_pr86_20261101_2013';ADMIN='sam_restore_pr86_20261101_2013_user'
BIN='/tmp/sam-pr86-restore-2013/pg/bin/psql';ROOT=pathlib.Path('/tmp/sam-native-restore-ej859p8n')
SHA='b40ce0f831238bc060f49affdf5e8dcaf31670d2624b00d6d0053a3e43790a79'
DEADLINE=datetime.datetime(2026,11,2,20,13,7,tzinfo=datetime.timezone.utc)
ID=r'"?([a-z_][a-z0-9_]*)"?';ROLES={'sam_trial_postgres_user','sam_runtime_app','sam_mcp_app','sam_eval_runtime_20261024'}
class Refused(Exception):pass
def need(x,code):
 if not x:raise Refused(code)
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def count_rows(p):
 rows=0;ended=False
 with (gzip.open(p,'rb') if p.suffix=='.gz' else open(p,'rb')) as f:
  for line in f:
   if ended:need(line.strip()==b'','ARCHIVE_NONBLANK_COPY_TRAILER')
   elif line in (b'\\.\n',b'\\.\r\n'):ended=True
   else:rows+=1
 need(ended,'ARCHIVE_COPY_TERMINATOR_MISSING');return rows
def main():
 os.umask(0o077)
 remaining=(DEADLINE-datetime.datetime.now(datetime.timezone.utc)).total_seconds()-1200
 need(remaining>0,'CLEANUP_RESERVE_REACHED')
 raw=sys.stdin.buffer.read(32769);need(len(raw)<=32768,'CONFIG_TOO_LARGE');cfg=json.loads(raw)
 need(set(cfg)=={'targetInternalURL','archiveDownloadURL'},'ORIGINAL_CONFIG_KEYS_REQUIRED')
 u=urllib.parse.urlsplit(cfg['targetInternalURL']);opts=urllib.parse.parse_qs(u.query,strict_parsing=True)
 need(u.scheme in ('postgres','postgresql') and u.hostname==HOST and u.port in (None,5432)
   and urllib.parse.unquote(u.path)=='/'+DB and urllib.parse.unquote(u.username or '')==ADMIN
   and u.password and not u.fragment,'EXACT_ISOLATED_TARGET_REQUIRED')
 need(set(opts)<={'sslmode'} and all(len(v)==1 for v in opts.values()),'TARGET_OPTIONS_REFUSED')
 ssl=opts.get('sslmode',['require'])[0];need(ssl in ('require','verify-full'),'SSL_REQUIRED')
 need(ROOT.is_dir() and not ROOT.is_symlink(),'EXACT_RESTORE_EVIDENCE_DIRECTORY_REQUIRED')
 archive=ROOT/'archive.dir.tar.gz';need(archive.is_file() and digest(archive)==SHA,'PINNED_ARCHIVE_REQUIRED')
 listing=(ROOT/'toc.private.txt').read_text();schema=(ROOT/'schema.private.sql').read_text()
 dirs=list((ROOT/'extracted').rglob('toc.dat'));need(len(dirs)==1,'SINGLE_DATABASE_ARCHIVE_REQUIRED');directory=dirs[0].parent
 expected={}
 for line in listing.splitlines():
  m=re.match(r'^(\d+);\s+\d+\s+\d+\s+TABLE DATA\s+(\S+)\s+(\S+)\s+(.+)$',line)
  if not m:continue
  oid,ns,table,_=m.groups();need(re.fullmatch('[a-z_][a-z0-9_]*',ns) and re.fullmatch('[a-z_][a-z0-9_]*',table),'ARCHIVE_IDENTIFIER_REFUSED')
  plain=directory/(oid+'.dat');compressed=directory/(oid+'.dat.gz')
  need(plain.is_file()!=compressed.is_file(),'DATA_FILE_REQUIRED');expected[(ns,table)]=count_rows(plain if plain.is_file() else compressed)
 need(len(expected)==91 and sum(expected.values())==11034,'CORRECTED_ARCHIVE_EXPECTATION_MISMATCH')
 owners={}
 for match in re.finditer(r'ALTER (?:TABLE|SEQUENCE|VIEW|MATERIALIZED VIEW) '+ID+r'\.'+ID+r' OWNER TO '+ID+r';',schema):
  ns,name,owner=match.groups();owners[(ns,name)]=owner
 need(len(owners)==95,'ARCHIVE_RELATION_OWNERS_REQUIRED')
 enabled=set(m.groups() for m in re.finditer(r'ALTER TABLE(?: ONLY)? '+ID+r'\.'+ID+r' ENABLE ROW LEVEL SECURITY;',schema))
 forced=set(m.groups() for m in re.finditer(r'ALTER TABLE(?: ONLY)? '+ID+r'\.'+ID+r' FORCE ROW LEVEL SECURITY;',schema))
 constraints={}
 types={'CHECK':'c','FOREIGN KEY':'f','PRIMARY KEY':'p','UNIQUE':'u','EXCLUDE':'x'}
 def add_constraints(ns,table,body):
  for m in re.finditer(r'(?:ADD )?CONSTRAINT '+ID+r'\s+(CHECK|FOREIGN KEY|PRIMARY KEY|UNIQUE|EXCLUDE)\b([^;\n]*)',body):
   name,kind,tail=m.groups();constraints[(ns,table,name)]=(types[kind],'NOT VALID' not in tail)
 for m in re.finditer(r'CREATE TABLE '+ID+r'\.'+ID+r' \(([\s\S]*?)\n\);',schema):add_constraints(*m.groups())
 for m in re.finditer(r'ALTER TABLE(?: ONLY)? '+ID+r'\.'+ID+r'\s+(ADD CONSTRAINT [\s\S]*?);',schema):add_constraints(*m.groups())
 need(len(constraints)>200,'ARCHIVE_CONSTRAINT_PARSE_REQUIRED')
 env={'PATH':'/usr/bin:/bin','LANG':'C.UTF-8','HOME':str(ROOT),'PGHOST':HOST,'PGPORT':'5432','PGDATABASE':DB,
  'PGUSER':ADMIN,'PGPASSWORD':urllib.parse.unquote(u.password),'PGSSLMODE':ssl,'PGCONNECT_TIMEOUT':'10',
  'PGOPTIONS':'-c search_path=pg_catalog -c statement_timeout=60000 -c default_transaction_read_only=on'}
 sql="""BEGIN READ ONLY;
 SET LOCAL statement_timeout='60s';
 SELECT json_build_object(
 'identity',json_build_object('database',current_database(),'user',current_user,'session_user',session_user,
   'major',current_setting('server_version_num')::int/10000,'read_only',current_setting('transaction_read_only'),
   'bypass',(SELECT rolsuper OR rolbypassrls FROM pg_roles WHERE rolname=current_user)),
 'roles',(SELECT json_agg(json_build_object('name',rolname,'login',rolcanlogin)) FROM pg_roles
   WHERE rolname IN ('sam_trial_postgres_user','sam_runtime_app','sam_mcp_app','sam_eval_runtime_20261024')),
 'database_statistics',(SELECT json_build_object('stats_reset',stats_reset,'xact_commit',xact_commit,'xact_rollback',xact_rollback)
   FROM pg_stat_database WHERE datname=current_database()),
 'table_statistics',(SELECT json_agg(json_build_object('schema',schemaname,'table',relname,'inserts',n_tup_ins,
   'updates',n_tup_upd,'deletes',n_tup_del,'stats_since',last_analyze)) FROM pg_stat_all_tables
   WHERE schemaname IN ('public','sam_eval_20261024')),
 'relations',(SELECT json_agg(json_build_object('schema',n.nspname,'name',c.relname,'kind',c.relkind,
   'owner',pg_get_userbyid(c.relowner),'rls',c.relrowsecurity,'force',c.relforcerowsecurity))
   FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname IN ('public','sam_eval_20261024') AND c.relkind IN ('r','p','S','v','m')),
 'constraints',(SELECT json_agg(json_build_object('schema',n.nspname,'table',t.relname,'name',c.conname,
   'type',c.contype,'validated',c.convalidated,'definition',pg_get_constraintdef(c.oid,true)))
   FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace
   WHERE n.nspname IN ('public','sam_eval_20261024')),
 'policies',(SELECT json_agg(p) FROM (SELECT schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check
   FROM pg_policies WHERE schemaname IN ('public','sam_eval_20261024') ORDER BY schemaname,tablename,policyname) p),
 'triggers',(SELECT json_agg(json_build_object('schema',n.nspname,'table',c.relname,'name',t.tgname,
   'enabled',t.tgenabled,'definition',pg_get_triggerdef(t.oid))) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
   JOIN pg_namespace n ON n.oid=c.relnamespace WHERE NOT t.tgisinternal AND n.nspname IN ('public','sam_eval_20261024')),
 'indexes',(SELECT json_agg(p) FROM (SELECT schemaname,tablename,indexname,indexdef FROM pg_indexes
   WHERE schemaname IN ('public','sam_eval_20261024') ORDER BY schemaname,tablename,indexname) p));
 COMMIT;
 """
 with open(ROOT/'resume-readonly.private.stderr','wb') as err:
  r=subprocess.run([BIN,'-X','-w','-qAt','--set=ON_ERROR_STOP=1'],input=sql.encode(),stdout=subprocess.PIPE,
   stderr=err,env=env,timeout=min(120,max(1,int(remaining))),check=False)
 need(r.returncode==0,'READONLY_METADATA_QUERY_FAILED_PRIVATE_DIAGNOSTICS')
 metadata=json.loads(r.stdout.decode().strip());(ROOT/'resume-metadata.private.json').write_text(json.dumps(metadata,sort_keys=True))
 need(metadata['identity']=={'database':DB,'user':ADMIN,'session_user':ADMIN,'major':15,'read_only':'on','bypass':False},'TARGET_READONLY_IDENTITY_MISMATCH')
 need(len(metadata['roles'])==4 and {x['name'] for x in metadata['roles']}==ROLES and not any(x['login'] for x in metadata['roles']),
   'SOURCE_ROLE_STUBS_MUST_STILL_BE_NOLOGIN')
 stats={(x['schema'],x['table']):x for x in metadata['table_statistics']}
 diffs=[]
 for key,count in expected.items():
  x=stats.get(key)
  if not x or x['inserts']!=count or x['updates']!=0 or x['deletes']!=0:diffs.append({'schema':key[0],'table':key[1],'expected_inserts':count,'observed':x})
 (ROOT/'resume-count-differences.private.json').write_text(json.dumps(diffs))
 need(not diffs,'FRESH_TARGET_INSERT_COUNTER_MISMATCH')
 actual_rel={(x['schema'],x['name']):x for x in metadata['relations']}
 need(set(actual_rel)==set(owners),'ARCHIVE_RELATION_SET_MISMATCH')
 need(all(actual_rel[k]['owner']==v and actual_rel[k]['rls']==(k in enabled) and actual_rel[k]['force']==(k in forced) for k,v in owners.items()),
   'ARCHIVE_OWNER_RLS_FLAG_MISMATCH')
 actual_constraints={(x['schema'],x['table'],x['name']):(x['type'],x['validated']) for x in metadata['constraints']}
 need(actual_constraints==constraints,'ARCHIVE_CONSTRAINT_SET_OR_VALIDATION_MISMATCH')
 fingerprints={}
 for k in ['relations','constraints','policies','triggers','indexes']:
  canonical=sorted(metadata[k] or [],key=lambda x:json.dumps(x,sort_keys=True))
  fingerprints[k]=hashlib.sha256(json.dumps(canonical,sort_keys=True,separators=(',',':')).encode()).hexdigest()
 summary={'status':'RESTORE_RESUMPTION_READONLY_COUNTERS_MATCH','target':HOST,'database':DB,'archive_sha256':SHA,
  'archive_tables':91,'archive_rows_corrected':11034,'fresh_table_insert_counters_match':True,
  'observed_updates_deletes_zero':True,'archive_relation_owners_and_rls_flags_match':True,
  'archive_constraint_names_types_validation_match':True,'metadata_fingerprints':fingerprints,
  'original_psql_copy_tags_available':False,'original_psql_stdout_lost_before_failed_assertion':True,
  'canonical_postrestore_row_hashes_proven':False,'source_permission_fidelity_proven':False,
  'evidence_scope':'n_tup_ins counters corroborate one fresh committed restore only under root-observed no prior data attempts, no resets and no subsequent writes; not live row counts or recovered COPY tags.',
  'database_queries_read_only':True,'restore_or_drop_or_role_or_rls_mutations':False,'production_connected':False,
  'private_metadata_sha256':digest(ROOT/'resume-metadata.private.json'),'private_evidence_directory':str(ROOT)}
 (ROOT/'resume-summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary))
if __name__=='__main__':
 try:main()
 except Refused as e:print(json.dumps({'status':'REFUSED','code':str(e),'production_connected':False}),file=sys.stderr);sys.exit(1)
 except Exception as e:print(json.dumps({'status':'FAILED','exception_type':type(e).__name__,'details':'WITHHELD'}),file=sys.stderr);sys.exit(1)
