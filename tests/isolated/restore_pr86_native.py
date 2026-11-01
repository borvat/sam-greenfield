#!/usr/bin/env python3
"""One explicitly fenced disposable Render target. Never accepts production config.
Read ONE JSON object from stdin; secret URLs never appear in subprocess arguments,
logs or summary. Does not start applications, run migrations, or fabricate ACLs.
"""
import datetime, gzip, hashlib, ipaddress, json, os, pathlib, re, shlex
import subprocess, sys, tarfile, tempfile, urllib.parse, urllib.request

HOST='dpg-dbjpqkutlv9c73dup8lg-a'
DATABASE='sam_restore_pr86_20261101_2013'
ADMIN='sam_restore_pr86_20261101_2013_user'
DEADLINE=datetime.datetime(2026,11,2,20,13,7,tzinfo=datetime.timezone.utc)
ARCHIVE_SHA='b40ce0f831238bc060f49affdf5e8dcaf31670d2624b00d6d0053a3e43790a79'
ARCHIVE_BYTES=2769775
UNPACKED_BYTES=17260487
MEMBERS=95
BIN=pathlib.Path('/tmp/sam-pr86-restore-2013/pg/bin')
OWNER='sam_trial_postgres_user'
ROLES=[OWNER,'sam_runtime_app','sam_mcp_app','sam_eval_runtime_20261024']
STAGE='PREWRITE'
RESERVE_SECONDS=1200
IDENT=re.compile(r'^[a-z_][a-z0-9_]*$')
class Refused(Exception): pass

def require(condition,code):
    if not condition: raise Refused(code)
def before_deadline():
    require((DEADLINE-datetime.datetime.now(datetime.timezone.utc)).total_seconds()>RESERVE_SECONDS,'TARGET_CLEANUP_RESERVE_REACHED')
def qi(value):
    require(bool(IDENT.fullmatch(value)),'UNSAFE_IDENTIFIER')
    return '"'+value+'"'
def sha(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
    return h.hexdigest()

class HTTPSOnlyRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl):
        validate_download_url(newurl)
        return super().redirect_request(req,fp,code,msg,headers,newurl)
def validate_download_url(value):
    u=urllib.parse.urlsplit(value)
    require(u.scheme=='https' and u.hostname and not u.username and not u.password
            and u.port in (None,443) and not u.fragment,'ARCHIVE_HTTPS_REQUIRED')
    # Only official Render storage or its signed cloud-storage destinations.
    h=u.hostname.lower()
    require(any(h.endswith(s) for s in ('.amazonaws.com','.render.com','.storage.googleapis.com')),
            'ARCHIVE_STORAGE_HOST_NOT_ALLOWLISTED')
    try: ipaddress.ip_address(h)
    except ValueError: return
    raise Refused('ARCHIVE_LITERAL_ADDRESS_FORBIDDEN')

def archive_row_count(path,compressed=False):
    count=0;terminated=False
    with (gzip.open(path,'rb') if compressed else open(path,'rb')) as f:
        for line in f:
            if terminated:
                require(line.strip()==b'', 'ARCHIVE_NONBLANK_COPY_TRAILER')
            elif line in (b'\\.\n',b'\\.\r\n'):
                terminated=True
            else:
                count+=1
    require(terminated,'ARCHIVE_COPY_TERMINATOR_MISSING')
    return count

def main():
    global STAGE
    os.umask(0o077)
    before_deadline()
    raw=sys.stdin.buffer.read(32769)
    require(len(raw)<=32768,'CONFIG_TOO_LARGE')
    cfg=json.loads(raw)
    require(set(cfg)=={'targetInternalURL','archiveDownloadURL'},'EXACT_CONFIG_KEYS_REQUIRED')
    u=urllib.parse.urlsplit(cfg['targetInternalURL'])
    require(u.scheme in ('postgres','postgresql') and u.hostname==HOST and u.port in (None,5432)
            and urllib.parse.unquote(u.path)=='/'+DATABASE and urllib.parse.unquote(u.username or '')==ADMIN
            and bool(u.password) and not u.fragment,'EXACT_ISOLATED_TARGET_REQUIRED')
    query=urllib.parse.parse_qs(u.query,strict_parsing=True)
    require(set(query)<= {'sslmode'} and all(len(v)==1 for v in query.values()),'TARGET_URL_OPTIONS_REFUSED')
    sslmode=query.get('sslmode',['require'])[0]
    require(sslmode in ('require','verify-full'),'ENCRYPTED_TARGET_REQUIRED')
    validate_download_url(cfg['archiveDownloadURL'])
    private=pathlib.Path(tempfile.mkdtemp(prefix='sam-native-restore-',dir='/tmp'))
    private.chmod(0o700)
    # Do not inherit any production credentials, PGOPTIONS, service files or proxies.
    env={'PATH':'/usr/bin:/bin','LANG':'C.UTF-8','HOME':str(private),
         'PGHOST':HOST,'PGPORT':'5432','PGDATABASE':DATABASE,'PGUSER':ADMIN,
         'PGPASSWORD':urllib.parse.unquote(u.password),'PGSSLMODE':sslmode,
         'PGCONNECT_TIMEOUT':'10','PGOPTIONS':'-c search_path=pg_catalog -c statement_timeout=300000'}
    def run(tool,args,*,sql=None,tag='client'):
        before_deadline()
        err=private/(tag+'.stderr')
        with open(err,'wb') as e:
            result=subprocess.run([str(BIN/tool),*args],input=sql.encode() if sql is not None else None,
                                  stdout=subprocess.PIPE,stderr=e,env=env,timeout=min(900,max(1,int((DEADLINE-datetime.datetime.now(datetime.timezone.utc)).total_seconds()-RESERVE_SECONDS))),check=False)
        require(result.returncode==0,tag.upper()+'_FAILED_PRIVATE_DIAGNOSTICS')
        return result.stdout.decode('utf8')
    def query(sql,tag='query'):
        return run('psql',['-X','-w','-qAt','--set=ON_ERROR_STOP=1'],sql=sql,tag=tag).strip()
    for tool in ('psql','pg_restore','pg_dump'):
        require('15.' in run(tool,['--version'],tag=tool+'-version'),'POSTGRESQL15_CLIENT_REQUIRED')
    identity_sql="""SELECT json_build_object('database',current_database(),'user',current_user,
      'session_user',session_user,'admin_bypass',(SELECT rolsuper OR rolbypassrls FROM pg_roles WHERE rolname=current_user),'major',current_setting('server_version_num')::int/10000,
      'server_address',inet_server_addr()::text,'server_port',inet_server_port(),
      'user_tables',(SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND n.nspname !~ '^pg_toast'
        AND c.relkind IN ('r','p','f')),'source_roles',(SELECT count(*) FROM pg_roles
        WHERE rolname IN ('sam_trial_postgres_user','sam_runtime_app','sam_mcp_app','sam_eval_runtime_20261024')));
    """
    identity=json.loads(query(identity_sql,'target-identity'))
    require(identity['database']==DATABASE and identity['user']==ADMIN and identity['session_user']==ADMIN
            and identity['major']==15 and identity['user_tables']==0 and identity['source_roles']==0,
            'EMPTY_PG15_TARGET_IDENTITY_REQUIRED')
    (private/'target-identity.json').write_text(json.dumps(identity))
    archive=private/'archive.dir.tar.gz'
    opener=urllib.request.build_opener(urllib.request.ProxyHandler({}),HTTPSOnlyRedirect())
    with opener.open(cfg['archiveDownloadURL'],timeout=60) as response,open(archive,'wb') as f:
        total=0
        while True:
            b=response.read(1024*1024)
            if not b:break
            total+=len(b);require(total<=ARCHIVE_BYTES,'ARCHIVE_SIZE_EXCEEDED');f.write(b)
    require(total==ARCHIVE_BYTES and sha(archive)==ARCHIVE_SHA,'ARCHIVE_CHECKSUM_MISMATCH')
    extracted=private/'extracted';extracted.mkdir(mode=0o700)
    with tarfile.open(archive,'r:gz') as t:
        members=t.getmembers()
        require(len(members)==MEMBERS and sum(m.size for m in members)==UNPACKED_BYTES,'ARCHIVE_MANIFEST_MISMATCH')
        names=set()
        for m in members:
            p=pathlib.PurePosixPath(m.name)
            require(not p.is_absolute() and '..' not in p.parts and (m.isfile() or m.isdir())
                    and m.name not in names,'ARCHIVE_UNSAFE_MEMBER')
            names.add(m.name)
        t.extractall(extracted,filter='data')
    tocs=list(extracted.rglob('toc.dat'));require(len(tocs)==1,'SINGLE_ARCHIVE_DATABASE_REQUIRED')
    directory=tocs[0].parent
    listing=run('pg_restore',['--list',str(directory)],tag='archive-list')
    (private/'toc.private.txt').write_text(listing)
    schema=run('pg_restore',['--schema-only','--file=-',str(directory)],tag='archive-schema')
    (private/'schema.private.sql').write_text(schema)
    forbidden=[r'\bCREATE\s+(?:FOREIGN\s+DATA\s+WRAPPER|SERVER|FOREIGN\s+TABLE|SUBSCRIPTION|USER\s+MAPPING)\b',
               r'\bALTER\s+SYSTEM\b',r'\bCOPY\b[^;]*\bPROGRAM\b',r'\b(?:dblink|postgres_fdw|pg_net|http_get|http_post)\b',
               r'\bLANGUAGE\s+"?(?:c|plpython\w*|plperl\w*)"?\b']
    require(not any(re.search(p,schema,re.I|re.S) for p in forbidden),'ARCHIVE_EXTERNAL_EXECUTION_FEATURE_REFUSED')
    extensions=re.findall(r'CREATE\s+EXTENSION\s+(?:IF\s+NOT\s+EXISTS\s+)?"?([a-z_][a-z0-9_]*)',schema,re.I)
    require(set(extensions)<= {'pgcrypto','plpgsql'},'ARCHIVE_EXTENSION_REFUSED')
    require(not re.search(r'^\s*(?:GRANT|REVOKE|ALTER DEFAULT PRIVILEGES)\b',schema,re.M),
            'ARCHIVE_ACL_ASSUMPTION_CHANGED')
    expected={}
    for line in listing.splitlines():
        m=re.match(r'^(\d+);\s+\d+\s+\d+\s+TABLE DATA\s+(\S+)\s+(\S+)\s+(.+)$',line)
        if not m:continue
        oid,ns,table,_=m.groups()
        require(IDENT.fullmatch(ns) and IDENT.fullmatch(table),'ARCHIVE_TABLE_NAME_REFUSED')
        plain=directory/(oid+'.dat');compressed=directory/(oid+'.dat.gz')
        require(plain.is_file()!=compressed.is_file(),'ARCHIVE_TABLE_DATA_FILE_MISSING_OR_AMBIGUOUS')
        dat=plain if plain.is_file() else compressed
        expected[(ns,table)]=archive_row_count(dat,dat==compressed)
    require(len(expected)==91,'ARCHIVE_TABLE_DATA_COUNT_CHANGED')

    restore_sql=private/'restore.private.sql'
    run('pg_restore',['--file='+str(restore_sql),str(directory)],tag='generate-full-restore')
    copy_order=[]
    with open(restore_sql,encoding='utf8') as f:
        for line in f:
            if not line.startswith('COPY '):continue
            m=re.match(r'COPY \"?([a-z_][a-z0-9_]*)\"?\.\"?([a-z_][a-z0-9_]*)\"? \(',line)
            require(m is not None and line.rstrip().endswith('FROM stdin;'),'RESTORE_COPY_STATEMENT_REFUSED')
            copy_order.append(tuple(m.groups()))
    require(len(copy_order)==91 and set(copy_order)==set(expected),'RESTORE_COPY_MAPPING_MISMATCH')
    # Last check before first write; exact host is immutable in the clean child env.
    require(json.loads(query(identity_sql,'target-identity-recheck'))==identity,'TARGET_CHANGED_BEFORE_WRITE')
    role_sql='BEGIN;\n'
    for role in ROLES:
        role_sql+='CREATE ROLE '+qi(role)+' NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;\n'
    # Target admin needs source-owner membership to assign archived ownership.
    role_sql+='GRANT '+qi(OWNER)+' TO '+qi(ADMIN)+';\nCOMMIT;\n'
    query(role_sql,'isolated-role-stubs')
    STAGE='ROLE_STUBS_CREATED_RESTORE_FAILED'
    restore=run('psql',['-X','-w','-A','-t','--set=ON_ERROR_STOP=1','--single-transaction','--file='+str(restore_sql)],tag='strict-restore')
    STAGE='RESTORE_COMPLETED_COMPARISON_PENDING'
    (private/'restore.private.stdout').write_text(restore)
    native_copy_counts=[int(x) for x in re.findall(r'^COPY (\d+)\r?$',restore,re.M)]
    (private/'native-copy-counts.private.json').write_text(json.dumps(native_copy_counts))
    require(len(native_copy_counts)==len(copy_order),'RESTORE_COPY_COMMAND_TAG_COUNT_MISMATCH')
    require(all(n==expected[key] for key,n in zip(copy_order,native_copy_counts)),'RESTORED_ARCHIVE_COPY_COUNT_MISMATCH')
    (private/'copy-counts.private.json').write_text(json.dumps([{'schema':key[0],'table':key[1],'archive_rows':expected[key],'native_copy_rows':n} for key,n in zip(copy_order,native_copy_counts)]))
    snapshots={};counts_match=True;stable=None
    if identity['admin_bypass']:
        for (ns,table),expected_count in sorted(expected.items()):
            ident=qi(ns)+'.'+qi(table)
            value=json.loads(query("SELECT json_build_object('count',count(*),'row_hash',"
                "encode(public.digest(COALESCE(string_agg(to_jsonb(t)::text,E'\\n' ORDER BY to_jsonb(t)::text),''),'sha256'),'hex')) FROM "+ident+' t;',
                'snapshot-'+ns+'-'+table))
            value['archive_count']=expected_count
            counts_match=counts_match and value['count']==expected_count
            snapshots[ns+'.'+table]=value
        (private/'restored-snapshots.private.json').write_text(json.dumps(snapshots,sort_keys=True))
        require(counts_match,'RESTORED_ARCHIVE_ROW_COUNT_MISMATCH')
        # Re-read every restored table to establish a stable native baseline for later rehearsal.
        stable=True
        for name,value in snapshots.items():
            ns,table=name.split('.')
            again=json.loads(query("SELECT json_build_object('count',count(*),'row_hash',"
                "encode(public.digest(COALESCE(string_agg(to_jsonb(t)::text,E'\\n' ORDER BY to_jsonb(t)::text),''),'sha256'),'hex')) FROM "+qi(ns)+'.'+qi(table)+' t;',
                'recheck-'+ns+'-'+table))
            stable=stable and again=={'count':value['count'],'row_hash':value['row_hash']}
        require(stable,'RESTORED_HISTORY_CHANGED_DURING_CHECK')
    else:
        (private/'restored-snapshots.private.json').write_text(json.dumps({'status':'DATA_COMPARISON_BLOCKED_RLS','copy_counts_verified':True}))
    summary={'status':'RESTORED_COPY_COUNTS_VERIFIED','target_resource_id':HOST,'database':DATABASE,
        'postgres_major':15,'archive_sha256':ARCHIVE_SHA,'archive_bytes':ARCHIVE_BYTES,
        'archive_members':MEMBERS,'strict_single_transaction_restore':True,'table_data_entries':len(expected),
        'total_restored_rows':sum(native_copy_counts),'archive_row_counts_match':counts_match,
        'native_row_hashes_stable':stable,'post_restore_canonical_comparison':('VERIFIED' if stable else 'DATA_COMPARISON_BLOCKED_RLS'),'authoritative_copy_counts_verified':True,'target_admin_bypass':identity['admin_bypass'],'cleanup_reserve_seconds':RESERVE_SECONDS,'private_snapshot_sha256':sha(private/'restored-snapshots.private.json'),
        'private_evidence_directory':str(private),'source_roles_not_in_archive':True,'source_acls_not_in_archive':True,
        'isolated_nologin_role_stubs':ROLES,'target_admin_source_owner_membership_only':True,
        'source_permission_fidelity_proven':False,'original_grants_invented':False,
        'migration_00106_run':False,'application_started':False,'production_connected':False,
        'deadline_utc':DEADLINE.isoformat()}
    (private/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
    print(json.dumps(summary))

if __name__=='__main__':
    try:main()
    except Refused as e:
        print(json.dumps({'status':STAGE if STAGE!='PREWRITE' else 'REFUSED','code':str(e),'production_connected':False}),file=sys.stderr);sys.exit(1)
    except Exception as e:
        # Never stringify upstream exceptions: URLs/passwords/data can be embedded.
        print(json.dumps({'status':STAGE if STAGE!='PREWRITE' else 'FAILED','code':'PRIVATE_DIAGNOSTICS_ONLY','exception_type':type(e).__name__}),file=sys.stderr);sys.exit(1)
