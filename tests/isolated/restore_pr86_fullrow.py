#!/usr/bin/env python3
"""Exact isolated target: temporary RLS DDL + COPY-out in ONE rollback-only TX.
No customer-row mutations, grants, owner changes or persistent security changes.
Root must obtain independent approval before execution. Config is original
{targetInternalURL,archiveDownloadURL}; URL is never printed, download unused.
TLS require is encryption-only, not server-identity verification.
"""
import datetime,gzip,hashlib,json,os,pathlib,re,subprocess,sys,tarfile,tempfile,urllib.parse
HOST='dpg-dbjpqkutlv9c73dup8lg-a';DB='sam_restore_pr86_20261101_2013';ADMIN='sam_restore_pr86_20261101_2013_user'
ROOT=pathlib.Path('/tmp/sam-native-restore-ej859p8n');BIN=pathlib.Path('/tmp/sam-pr86-restore-2013/pg/bin')
ARCHIVE_SHA='b40ce0f831238bc060f49affdf5e8dcaf31670d2624b00d6d0053a3e43790a79'
DEADLINE=datetime.datetime(2026,11,2,20,13,7,tzinfo=datetime.timezone.utc)
RESERVE=1200
class Refused(Exception):pass
def need(x,code):
 if not x:raise Refused(code)
def remaining():
 r=int((DEADLINE-datetime.datetime.now(datetime.timezone.utc)).total_seconds())-RESERVE
 need(r>0,'CLEANUP_RESERVE_REACHED');return r
def sha_bytes(b):return hashlib.sha256(b).hexdigest()
def qi(v):
 need(bool(re.fullmatch('[a-z_][a-z0-9_]*',v)),'UNSAFE_ARCHIVE_IDENTIFIER');return '"'+v+'"'
def archive_lines(data):
 rows=[];ended=False
 for line in data.splitlines(keepends=True):
  if ended:need(line.strip()==b'','ARCHIVE_NONBLANK_TRAILER')
  elif line in (b'\\.\n',b'\\.\r\n'):ended=True
  else:rows.append(line)
 need(ended,'ARCHIVE_COPY_TERMINATOR_MISSING');return rows
SNAPSHOT_SQL="""BEGIN READ ONLY;
SET LOCAL statement_timeout='30s';
SELECT json_build_object(
 'identity',json_build_object('database',current_database(),'user',current_user,'session',session_user,
   'major',current_setting('server_version_num')::int/10000,
   'ssl',COALESCE((SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()),false),
   'bypass',(SELECT rolsuper OR rolbypassrls FROM pg_roles WHERE rolname=current_user)),
 'relations',(SELECT json_agg(x) FROM (SELECT n.nspname,c.relname,c.relkind,pg_get_userbyid(c.relowner) owner,
   c.relrowsecurity,c.relforcerowsecurity,c.relacl::text FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname IN ('public','sam_eval_20261024') AND c.relkind IN ('r','p','S','v','m')
   ORDER BY n.nspname,c.relname) x),
 'policies',(SELECT json_agg(x) FROM (SELECT schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check
   FROM pg_policies WHERE schemaname IN ('public','sam_eval_20261024') ORDER BY schemaname,tablename,policyname) x),
 'schemas',(SELECT json_agg(x) FROM (SELECT nspname,pg_get_userbyid(nspowner) owner,nspacl::text
   FROM pg_namespace WHERE nspname IN ('public','sam_eval_20261024') ORDER BY nspname) x),
 'event_trigger_count',(SELECT count(*) FROM pg_event_trigger));
COMMIT;
"""
def main():
 os.umask(0o077);remaining()
 raw=sys.stdin.buffer.read(32769);need(len(raw)<=32768,'CONFIG_TOO_LARGE');cfg=json.loads(raw)
 need(set(cfg)=={'targetInternalURL','archiveDownloadURL'},'ORIGINAL_CONFIG_KEYS_REQUIRED')
 u=urllib.parse.urlsplit(cfg['targetInternalURL']);q=urllib.parse.parse_qs(u.query,strict_parsing=True)
 need(u.scheme in ('postgres','postgresql') and u.hostname==HOST and u.port in (None,5432)
   and urllib.parse.unquote(u.path)=='/'+DB and urllib.parse.unquote(u.username or '')==ADMIN
   and u.password and not u.fragment,'EXACT_ISOLATED_TARGET_REQUIRED')
 need(set(q)<={'sslmode'} and all(len(v)==1 for v in q.values()),'TARGET_OPTIONS_REFUSED')
 ssl=q.get('sslmode',['require'])[0];need(ssl in ('require','verify-full'),'SSL_REQUIRED')
 need(ROOT.is_dir() and not ROOT.is_symlink(),'EXACT_RESTORE_EVIDENCE_REQUIRED')
 archive=ROOT/'archive.dir.tar.gz';need(archive.is_file() and sha_bytes(archive.read_bytes())==ARCHIVE_SHA,'PINNED_ARCHIVE_REQUIRED')
 private=pathlib.Path(tempfile.mkdtemp(prefix='sam-fullrow-proof-',dir='/tmp'));private.chmod(0o700)
 env={'PATH':'/usr/bin:/bin','LANG':'C.UTF-8','HOME':str(private),'PGHOST':HOST,'PGPORT':'5432','PGDATABASE':DB,
  'PGUSER':ADMIN,'PGPASSWORD':urllib.parse.unquote(u.password),'PGSSLMODE':ssl,'PGCONNECT_TIMEOUT':'10',
  'PGOPTIONS':'-c search_path=pg_catalog -c statement_timeout=60000 -c default_transaction_read_only=on'}
 def run(tool,args,sql=None,tag='client',timeout=120):
  # Popen + explicit kill/wait guarantees connection closes on every failure/timeout;
  # server rolls back the open transaction on disconnect. No auto-commit wrapper.
  with open(private/(tag+'.stderr'),'wb') as err:
   p=subprocess.Popen([str(BIN/tool),*args],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=err,env=env)
   try:
    out,_=p.communicate(sql.encode() if sql is not None else None,timeout=min(timeout,remaining()))
   finally:
    if p.poll() is None:p.kill()
    p.wait()
  need(p.returncode==0,tag.upper()+'_FAILED_CONNECTION_CLOSED_PRIVATE_DIAGNOSTICS');return out
 def snapshot(tag):
  value=json.loads(run('psql',['-X','-w','-qAt','--set=ON_ERROR_STOP=1'],SNAPSHOT_SQL,tag).decode().strip())
  need(value['identity']=={'database':DB,'user':ADMIN,'session':ADMIN,'major':15,'ssl':True,'bypass':False},'TARGET_METADATA_IDENTITY_MISMATCH')
  need(value['event_trigger_count']==0,'EVENT_TRIGGERS_FORBIDDEN')
  (private/(tag+'.private.json')).write_text(json.dumps(value,sort_keys=True));return value
 # Verify extracted files against pinned archive before using local pg_restore.
 expected={};toc_member=None
 with tarfile.open(archive,'r:gz') as t:
  members=t.getmembers();need(len(members)==95 and sum(m.size for m in members)==17260487,'ARCHIVE_MANIFEST_CHANGED')
  for m in members:
   path=pathlib.PurePosixPath(m.name)
   need(not path.is_absolute() and '..' not in path.parts and (m.isfile() or m.isdir()),'ARCHIVE_MEMBER_UNSAFE')
   if not m.isfile():continue
   target=ROOT/'extracted'/m.name
   need(target.is_file() and not target.is_symlink(),'EXTRACTED_ARCHIVE_MEMBER_REQUIRED')
   data=t.extractfile(m).read();need(sha_bytes(data)==sha_bytes(target.read_bytes()),'EXTRACTED_ARCHIVE_MEMBER_CHANGED')
   if path.name=='toc.dat':toc_member=target
  need(toc_member is not None,'ARCHIVE_TOC_REQUIRED')
 directory=toc_member.parent
 listing=run('pg_restore',['--list',str(directory)],tag='archive-list').decode()
 for line in listing.splitlines():
  m=re.match(r'^(\d+);\s+\d+\s+\d+\s+TABLE DATA\s+(\S+)\s+(\S+)\s+(.+)$',line)
  if not m:continue
  oid,ns,table,_=m.groups();qi(ns);qi(table)
  plain=directory/(oid+'.dat');compressed=directory/(oid+'.dat.gz')
  need(plain.is_file()!=compressed.is_file(),'ARCHIVE_DATA_FILE_REQUIRED')
  data=plain.read_bytes() if plain.is_file() else gzip.decompress(compressed.read_bytes())
  expected[(ns,table)]=archive_lines(data)
 need(len(expected)==91 and sum(len(v) for v in expected.values())==11034,'CORRECTED_ARCHIVE_COUNTS_CHANGED')
 source_sql=private/'source.private.sql';run('pg_restore',['--file='+str(source_sql),str(directory)],tag='archive-sql')
 columns={}
 for line in source_sql.read_text().splitlines():
  if not line.startswith('COPY '):continue
  m=re.fullmatch(r'COPY "?([a-z_][a-z0-9_]*)"?\."?([a-z_][a-z0-9_]*)"? \(([^)]+)\) FROM stdin;',line)
  need(m is not None,'ARCHIVE_COPY_HEADER_REFUSED')
  ns,table,rawcols=m.groups();cols=[]
  for col in rawcols.split(','):
   col=col.strip().strip('"');qi(col);cols.append(col)
  need(len(cols)==len(set(cols)),'ARCHIVE_DUPLICATE_COLUMN')
  columns[(ns,table)]=cols
 need(set(columns)==set(expected),'ARCHIVE_COPY_TABLE_SET_CHANGED')
 before=snapshot('before')
 relations={(x['nspname'],x['relname']):x for x in before['relations']}
 need(len(relations)==95,'RESTORED_RELATION_SET_CHANGED')
 for key in expected:
  need(key in relations and relations[key]['relkind'] in ('r','p') and relations[key]['owner']=='sam_trial_postgres_user',
       'ARCHIVAL_TABLE_OWNERSHIP_MISMATCH')
 sql=['\\set ON_ERROR_STOP on','BEGIN READ WRITE;',"SET LOCAL lock_timeout='2s';","SET LOCAL statement_timeout='60s';",
  "SET LOCAL idle_in_transaction_session_timeout='90s';","SET LOCAL timezone='UTC';","SET LOCAL datestyle='ISO, MDY';",
  "SET LOCAL intervalstyle='postgres';","SET LOCAL extra_float_digits=3;","SET LOCAL bytea_output='hex';",
  "SELECT pg_advisory_xact_lock(15112014);",
  "DO $fence$ BEGIN IF current_database()<>'"+DB+"' OR current_user<>'"+ADMIN+"' OR session_user<>current_user OR current_setting('server_version_num')::int/10000<>15 OR NOT COALESCE((SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()),false) OR NOT pg_has_role(current_user,'sam_trial_postgres_user','MEMBER') THEN RAISE EXCEPTION 'EXACT_ISOLATED_TRANSACTION_TARGET_REQUIRED'; END IF; END $fence$;"]
 files={}
 for i,key in enumerate(sorted(expected)):
  address=qi(key[0])+'.'+qi(key[1]);out=private/('table-'+str(i)+'.copy.private')
  files[key]=out
  sql.append('ALTER TABLE '+address+' DISABLE ROW LEVEL SECURITY;')
  sql.append('\\copy (SELECT '+','.join(qi(c) for c in columns[key])+' FROM '+address+") TO '"+str(out)+"' WITH (FORMAT text)")
 sql.append('ROLLBACK;')
 packet='\n'.join(sql)+'\n';need(not re.search(r'^\s*COMMIT\b',packet,re.M|re.I),'COMMIT_PATH_FORBIDDEN')
 (private/'rollback-only-copy.private.sql').write_text(packet)
 proof_error=None
 try:
  run('psql',['-X','-w','-qAt','--set=ON_ERROR_STOP=1'],packet,tag='rollback-only-copy',timeout=300)
 except Exception as e:
  proof_error=e
 finally:
  # Fresh read-only connection AFTER dedicated transaction connection is closed.
  after=snapshot('after')
 need(before==after,'POSTROLLBACK_SECURITY_METADATA_CHANGED')
 if proof_error:raise proof_error
 results=[]
 for key in sorted(expected):
  native=files[key].read_bytes().splitlines(keepends=True);original=expected[key]
  left=sha_bytes(b''.join(sorted(original)));right=sha_bytes(b''.join(sorted(native)))
  results.append({'schema':key[0],'table':key[1],'archive_rows':len(original),'native_rows':len(native),
    'archive_sorted_copy_sha256':left,'native_sorted_copy_sha256':right,'match':len(original)==len(native) and left==right})
 (private/'table-copy-hashes.private.json').write_text(json.dumps(results,sort_keys=True))
 need(all(x['match'] for x in results),'EXACT_ARCHIVE_COPY_BYTES_MISMATCH')
 summary={'status':'EXACT_NATIVE_COPY_ROW_BYTES_VERIFIED_ROLLBACK_ONLY','target':HOST,'database':DB,'archive_sha256':ARCHIVE_SHA,
  'tables':91,'rows':11034,'all_sorted_native_copy_bytes_match_archive':True,'duplicate_rows_preserved':True,
  'row_mutations_performed':False,'temporary_rls_disable_transaction':True,'explicit_rollback_sent':True,
  'dedicated_transaction_connection_closed':True,'fresh_postrollback_rls_policy_owner_acl_snapshot_equal':True,
  'security_metadata_sha256':sha_bytes(json.dumps(before,sort_keys=True,separators=(',',':')).encode()),
  'private_table_hashes_sha256':sha_bytes((private/'table-copy-hashes.private.json').read_bytes()),
  'tls_mode':ssl,'tls_server_identity_verified':ssl=='verify-full','production_connected':False,
  'application_role_rls_acceptance_proven':False,'application_or_provider_started':False,
  'source_permission_fidelity_proven':False,'private_evidence_directory':str(private),'cleanup_reserve_seconds':RESERVE}
 (private/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary))
if __name__=='__main__':
 try:main()
 except Refused as e:print(json.dumps({'status':'REFUSED','code':str(e),'details':'Private evidence only; no blind retry.'}),file=sys.stderr);sys.exit(1)
 except Exception as e:print(json.dumps({'status':'FAILED','exception_type':type(e).__name__,'details':'WITHHELD; transaction connection closed; inspect private evidence before retry.'}),file=sys.stderr);sys.exit(1)
