#!/usr/bin/env python3
"""Only pinned00106 on exact disposable restore DB; no customer-row reads.
Original two-key JSON stdin. SQL bytes are embedded from exact forward8a08 and
SHA256 verified before connection; SOURCE_URL records immutable source identity.
No runtime source fetch, production call, RLS alteration or grant change.
"""
import datetime,hashlib,json,os,pathlib,re,subprocess,sys,tempfile,urllib.parse
HOST='dpg-dbjpqkutlv9c73dup8lg-a';DB='sam_restore_pr86_20261101_2013';ADMIN='sam_restore_pr86_20261101_2013_user'
BIN='/tmp/sam-pr86-restore-2013/pg/bin/psql'
DEADLINE=datetime.datetime(2026,11,2,20,13,7,tzinfo=datetime.timezone.utc)
SOURCE_URL='https://raw.githubusercontent.com/borvat/sam-greenfield/8a08e6163516f30f37c65313134170744330c4f4/packages/db/integration-migrations/00106_read_review_revisions.sql'
SOURCE_SHA='b8a62b8b5de73dea82210965132523d27adfa3cf3d3ccc84bd9fa86f70826db2'
SOURCE_SQL='-- Keep the original immutable report; permit at most one explicitly linked same-plan revision.\nALTER TABLE goal_read_reviews ADD COLUMN revision INTEGER NOT NULL DEFAULT 1 CHECK(revision BETWEEN 1 AND 2);\nALTER TABLE goal_read_reviews ADD COLUMN supersedes_report_id UUID;\nALTER TABLE goal_read_reviews DROP CONSTRAINT goal_read_reviews_goal_id_plan_id_key;\nALTER TABLE goal_read_reviews ADD CONSTRAINT goal_read_reviews_goal_plan_revision_key UNIQUE(goal_id,plan_id,revision);\nALTER TABLE goal_read_reviews ADD CONSTRAINT goal_read_reviews_identity_scope_key UNIQUE(id,goal_id,plan_id);\nALTER TABLE goal_read_reviews ADD CONSTRAINT goal_read_reviews_supersedes_key UNIQUE(supersedes_report_id);\nALTER TABLE goal_read_reviews ADD CONSTRAINT goal_read_reviews_supersedes_scope_fk\n FOREIGN KEY(supersedes_report_id,goal_id,plan_id) REFERENCES goal_read_reviews(id,goal_id,plan_id);\nALTER TABLE goal_read_reviews ADD CONSTRAINT goal_read_reviews_revision_link_check\n CHECK((revision=1 AND supersedes_report_id IS NULL) OR (revision=2 AND supersedes_report_id IS NOT NULL AND supersedes_report_id<>id));\n-- Existing RLS and SELECT/INSERT grants remain unchanged. No UPDATE/DELETE grant.\n'
class Refused(Exception):pass
def need(x,k):
 if not x:raise Refused(k)
def remaining():
 x=int((DEADLINE-datetime.datetime.now(datetime.timezone.utc)).total_seconds())-1200
 need(x>0,'CLEANUP_RESERVE_REACHED');return x
def lit(v):return "'"+v.replace("'","''")+"'"
SECURITY_QUERY="""SELECT jsonb_agg(jsonb_build_object('schema',n.nspname,'table',c.relname,
 'owner',pg_get_userbyid(c.relowner),'rls',c.relrowsecurity,'force',c.relforcerowsecurity,'acl',c.relacl::text,
 'column_acls',(SELECT jsonb_agg(jsonb_build_array(a.attname,a.attacl::text) ORDER BY a.attnum)
    FROM pg_attribute a WHERE a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped AND a.attacl IS NOT NULL),
 'policies',(SELECT jsonb_agg(jsonb_build_object('name',p.polname,'roles',p.polroles,'cmd',p.polcmd,
    'permissive',p.polpermissive,'qual',pg_get_expr(p.polqual,p.polrelid),'check',pg_get_expr(p.polwithcheck,p.polrelid)) ORDER BY p.polname)
    FROM pg_policy p WHERE p.polrelid=c.oid)) ORDER BY n.nspname,c.relname)
 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname IN ('public','sam_eval_20261024') AND c.relkind IN ('r','p','S','v','m')"""
COUNTERS_QUERY="""SELECT jsonb_build_object('inserts',n_tup_ins,'updates',n_tup_upd,'deletes',n_tup_del)
 FROM pg_stat_all_tables WHERE schemaname='public' AND relname='goal_read_reviews'"""
# Snapshot includes metadata and insert/update/delete counters only, never report rows.
SNAPSHOT="""SELECT json_build_object('identity',json_build_object('database',current_database(),'user',current_user,
 'session',session_user,'major',current_setting('server_version_num')::int/10000,
 'ssl',COALESCE((SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()),false),
 'super',(SELECT rolsuper FROM pg_roles WHERE rolname=current_user),
 'bypass',(SELECT rolbypassrls FROM pg_roles WHERE rolname=current_user)),
 'security',("""+SECURITY_QUERY+"""),'counters',("""+COUNTERS_QUERY+"""),
 'columns',(SELECT json_agg(json_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod),
   'notnull',a.attnotnull,'default',pg_get_expr(d.adbin,d.adrelid),'has_missing',a.atthasmissing,
   'missing',a.attmissingval::text) ORDER BY a.attnum) FROM pg_attribute a LEFT JOIN pg_attrdef d
   ON d.adrelid=a.attrelid AND d.adnum=a.attnum WHERE a.attrelid='public.goal_read_reviews'::regclass AND a.attnum>0 AND NOT a.attisdropped),
 'constraints',(SELECT json_agg(json_build_object('name',conname,'type',contype,'validated',convalidated,
   'definition',pg_get_constraintdef(oid,true)) ORDER BY conname) FROM pg_constraint WHERE conrelid='public.goal_read_reviews'::regclass),
 'track_counts',current_setting('track_counts'),'postmaster_start',pg_postmaster_start_time(),
 'stats_reset',(SELECT stats_reset FROM pg_stat_database WHERE datname=current_database()))"""
def main():
 os.umask(0o077);remaining()
 need(hashlib.sha256(SOURCE_SQL.encode()).hexdigest()==SOURCE_SHA,'PINNED_MIGRATION_BYTES_MISMATCH')
 raw=sys.stdin.buffer.read(32769);need(len(raw)<=32768,'CONFIG_TOO_LARGE');cfg=json.loads(raw)
 need(set(cfg)=={'targetInternalURL','archiveDownloadURL'},'ORIGINAL_CONFIG_KEYS_REQUIRED')
 u=urllib.parse.urlsplit(cfg['targetInternalURL']);q=urllib.parse.parse_qs(u.query,strict_parsing=True)
 need(u.scheme in ('postgres','postgresql') and u.hostname==HOST and u.port in (None,5432)
   and urllib.parse.unquote(u.path)=='/'+DB and urllib.parse.unquote(u.username or '')==ADMIN and u.password and not u.fragment,'EXACT_TARGET_REQUIRED')
 need(set(q)<={'sslmode'} and all(len(v)==1 for v in q.values()),'TARGET_OPTIONS_REFUSED')
 ssl=q.get('sslmode',['require'])[0];need(ssl in ('require','verify-full'),'SSL_REQUIRED')
 private=pathlib.Path(tempfile.mkdtemp(prefix='sam-native-00106-',dir='/tmp'));private.chmod(0o700)
 env={'PATH':'/usr/bin:/bin','LANG':'C.UTF-8','HOME':str(private),'PGHOST':HOST,'PGPORT':'5432','PGDATABASE':DB,
  'PGUSER':ADMIN,'PGPASSWORD':urllib.parse.unquote(u.password),'PGSSLMODE':ssl,'PGCONNECT_TIMEOUT':'10',
  'PGOPTIONS':'-c search_path=pg_catalog,public -c statement_timeout=30000 -c default_transaction_read_only=on'}
 def run(sql,tag,timeout=120):
  with open(private/(tag+'.stderr'),'wb') as err:
   p=subprocess.Popen([BIN,'-X','-w','-qAt','--set=ON_ERROR_STOP=1'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=err,env=env)
   try:out,_=p.communicate(sql.encode(),timeout=min(timeout,remaining()))
   finally:
    if p.poll() is None:p.kill()
    p.wait()
  need(p.returncode==0,tag.upper()+'_FAILED_OUTCOME_REQUIRES_READONLY_INSPECTION')
  (private/(tag+'.private.stdout')).write_bytes(out);return out.decode().strip()
 before=json.loads(run('BEGIN READ ONLY;\n'+SNAPSHOT+';\nCOMMIT;','before'))
 expected_identity={'database':DB,'user':ADMIN,'session':ADMIN,'major':15,'ssl':True,'super':False,'bypass':False}
 need(before['identity']==expected_identity,'TARGET_IDENTITY_MISMATCH')
 need(not any(c['name'] in ('revision','supersedes_report_id') for c in before['columns']),'PRE00106_COLUMNS_REQUIRED')
 need(any(c['name']=='goal_read_reviews_goal_id_plan_id_key' and c['type']=='u' for c in before['constraints']),'PRE00106_PAIR_UNIQUE_REQUIRED')
 guard="""IF current_database()<>"""+lit(DB)+""" OR current_user<>"""+lit(ADMIN)+""" OR session_user<>current_user
 OR current_setting('server_version_num')::int/10000<>15
 OR NOT COALESCE((SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()),false)
 OR EXISTS(SELECT 1 FROM pg_roles WHERE rolname=current_user AND (rolsuper OR rolbypassrls))
 OR EXISTS(SELECT 1 FROM pg_event_trigger)
 THEN RAISE EXCEPTION 'EXACT_ISOLATED_NONPRIVILEGED_MIGRATION_TARGET_REQUIRED'; END IF;"""
 assertions="""
 IF NOT EXISTS(SELECT 1 FROM pg_attribute a JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
  WHERE a.attrelid='public.goal_read_reviews'::regclass AND a.attname='revision' AND a.atttypid='integer'::regtype
    AND a.attnotnull AND pg_get_expr(d.adbin,d.adrelid)='1')
 OR NOT EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid='public.goal_read_reviews'::regclass
    AND attname='supersedes_report_id' AND atttypid='uuid'::regtype AND NOT attnotnull)
 THEN RAISE EXCEPTION 'REVISION_COLUMN_SEMANTICS_MISMATCH'; END IF;
 IF EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.goal_read_reviews'::regclass
   AND conname='goal_read_reviews_goal_id_plan_id_key') THEN RAISE EXCEPTION 'OLD_PAIR_UNIQUE_REMAINS'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint c WHERE c.conrelid='public.goal_read_reviews'::regclass
   AND c.conname='goal_read_reviews_goal_plan_revision_key' AND c.contype='u' AND c.convalidated
   AND (SELECT array_agg(a.attname::text ORDER BY z.ord) FROM unnest(c.conkey) WITH ORDINALITY z(num,ord)
     JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=z.num)=ARRAY['goal_id','plan_id','revision'])
 OR NOT EXISTS(SELECT 1 FROM pg_constraint c WHERE c.conrelid='public.goal_read_reviews'::regclass
   AND c.conname='goal_read_reviews_identity_scope_key' AND c.contype='u' AND c.convalidated
   AND (SELECT array_agg(a.attname::text ORDER BY z.ord) FROM unnest(c.conkey) WITH ORDINALITY z(num,ord)
     JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=z.num)=ARRAY['id','goal_id','plan_id'])
 OR NOT EXISTS(SELECT 1 FROM pg_constraint c WHERE c.conrelid='public.goal_read_reviews'::regclass
   AND c.conname='goal_read_reviews_supersedes_key' AND c.contype='u' AND c.convalidated
   AND (SELECT array_agg(a.attname::text ORDER BY z.ord) FROM unnest(c.conkey) WITH ORDINALITY z(num,ord)
     JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=z.num)=ARRAY['supersedes_report_id'])
 THEN RAISE EXCEPTION 'REVISION_UNIQUE_CONSTRAINT_MISMATCH'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint c WHERE c.conrelid='public.goal_read_reviews'::regclass
   AND c.conname='goal_read_reviews_supersedes_scope_fk' AND c.contype='f' AND c.convalidated
   AND c.confrelid=c.conrelid AND c.confupdtype='a' AND c.confdeltype='a'
   AND (SELECT array_agg(a.attname::text ORDER BY z.ord) FROM unnest(c.conkey) WITH ORDINALITY z(num,ord)
     JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=z.num)=ARRAY['supersedes_report_id','goal_id','plan_id']
   AND (SELECT array_agg(a.attname::text ORDER BY z.ord) FROM unnest(c.confkey) WITH ORDINALITY z(num,ord)
     JOIN pg_attribute a ON a.attrelid=c.confrelid AND a.attnum=z.num)=ARRAY['id','goal_id','plan_id'])
 THEN RAISE EXCEPTION 'REVISION_FOREIGN_KEY_MISMATCH'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint c WHERE c.conrelid='public.goal_read_reviews'::regclass
   AND c.contype='c' AND c.convalidated AND regexp_replace(pg_get_expr(c.conbin,c.conrelid),'[[:space:]()"]','','g')='revision>=1ANDrevision<=2')
 OR NOT EXISTS(SELECT 1 FROM pg_constraint c WHERE c.conrelid='public.goal_read_reviews'::regclass
   AND c.conname='goal_read_reviews_revision_link_check' AND c.contype='c' AND c.convalidated
   AND regexp_replace(pg_get_expr(c.conbin,c.conrelid),'[[:space:]()"]','','g')=
    'revision=1ANDsupersedes_report_idISNULLORrevision=2ANDsupersedes_report_idISNOTNULLANDsupersedes_report_id<>id')
 THEN RAISE EXCEPTION 'REVISION_CHECK_CONSTRAINT_MISMATCH'; END IF;
 """
 packet="BEGIN READ WRITE;\nSET LOCAL search_path=pg_catalog,public;\nSET LOCAL lock_timeout='5s';\nSET LOCAL statement_timeout='30s';\nSET LOCAL idle_in_transaction_session_timeout='60s';\n"+"DO $migration$ DECLARE before_security jsonb; after_security jsonb; before_counts jsonb; after_counts jsonb; BEGIN\n"+guard+"\nPERFORM pg_advisory_xact_lock(hashtext('sam-integration-migrations'));\nIF EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid='public.goal_read_reviews'::regclass AND attname IN ('revision','supersedes_report_id') AND NOT attisdropped) THEN RAISE EXCEPTION 'PRE00106_EXPECTATION_CHANGED'; END IF;\n"+"SELECT q.v INTO before_security FROM ("+SECURITY_QUERY+") q(v);\nSELECT q.v INTO before_counts FROM ("+COUNTERS_QUERY+") q(v);\nIF before_security IS DISTINCT FROM "+lit(json.dumps(before['security'],separators=(',',':')))+"::jsonb THEN RAISE EXCEPTION 'PREWRITE_SECURITY_CHANGED'; END IF;\nEXECUTE "+lit(SOURCE_SQL)+";\n"+assertions+"\nSELECT q.v INTO after_security FROM ("+SECURITY_QUERY+") q(v);\nPERFORM pg_stat_clear_snapshot();\nSELECT q.v INTO after_counts FROM ("+COUNTERS_QUERY+") q(v);\nIF before_security IS DISTINCT FROM after_security THEN RAISE EXCEPTION 'MIGRATION_PERMISSIONS_RLS_CHANGED'; END IF;\nIF before_counts IS DISTINCT FROM after_counts THEN RAISE EXCEPTION 'MIGRATION_TABLE_DML_COUNTERS_CHANGED'; END IF;\nEND $migration$;\nCOMMIT;\n"
 (private/'migration.private.sql').write_text(packet)
 run(packet,'apply-pinned-00106')
 after=json.loads(run('BEGIN READ ONLY;\n'+SNAPSHOT+';\nCOMMIT;','after'))
 need(after['identity']==expected_identity and after['security']==before['security'],'POSTCOMMIT_IDENTITY_SECURITY_MISMATCH')
 need(after['counters']==before['counters'],'POSTCOMMIT_DML_COUNTERS_CHANGED')
 need(len(after['columns'])==len(before['columns'])+2,'POSTCOMMIT_COLUMN_COUNT_MISMATCH')
 (private/'before.private.json').write_text(json.dumps(before,sort_keys=True));(private/'after.private.json').write_text(json.dumps(after,sort_keys=True))
 summary={'status':'ISOLATED_PINNED_00106_COMMITTED','target':HOST,'database':DB,'source_url':SOURCE_URL,'sql_sha256':SOURCE_SHA,
  'commit_acknowledged':True,'native_schema_semantics_asserted':True,'rls_acl_owner_security_unchanged':True,
  'table_insert_update_delete_counters_unchanged':True,'original_report_rows_read':False,
  'original_row_hashes_reverified':False,'row_immutability_scope':'Pinned SQL contains schema-only revision DDL, including constraint replacement; counters unchanged. No hidden-row SELECT or fresh canonical-row assertion.',
  'integration_migration_ledger_updated':False,'security_sha256':hashlib.sha256(json.dumps(after['security'],sort_keys=True,separators=(',',':')).encode()).hexdigest(),
  'tls_mode':ssl,'tls_server_identity_verified':ssl=='verify-full','production_connected':False,'applications_started':False,
  'private_evidence_directory':str(private),'cleanup_reserve_seconds':1200}
 (private/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary))
if __name__=='__main__':
 try:main()
 except Refused as e:print(json.dumps({'status':'REFUSED_OR_TRANSACTION_OUTCOME_REQUIRES_READONLY_INSPECTION','code':str(e),'production_connected':False}),file=sys.stderr);sys.exit(1)
 except Exception as e:print(json.dumps({'status':'FAILED_OUTCOME_REQUIRES_READONLY_INSPECTION','exception_type':type(e).__name__,'details':'WITHHELD'}),file=sys.stderr);sys.exit(1)
