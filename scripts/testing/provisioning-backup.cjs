// Synthetic Docker PostgreSQL only. No URL, production env or external input.
const {spawnSync}=require('node:child_process'),fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const [container,run]=process.argv.slice(2);
const local=container==='sam-provision-pg'&&run==='provisioning';
assert(local||(/^sam-verify-[0-9]+-[0-9a-f]{8}$/.test(run||'')&&container===run+'-pg'));
function docker(args,input){const r=spawnSync('docker',args,{input,maxBuffer:20*1024*1024,timeout:60000});assert.equal(r.status,0,String(r.stderr));return r.stdout;}
assert.equal(docker(['inspect','--format',local?'{{index .Config.Labels "sam.review"}}':'{{index .Config.Labels "sam.verification.run"}}',container]).toString().trim(),run);
const names=['sam_core_test_backup_'+process.pid,'sam_core_test_restored_'+process.pid],created=[];
const q=s=>"'"+s.replaceAll("'","''")+"'",hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const psql=(db,sql)=>docker(['exec','-i',container,'psql','-X','-v','ON_ERROR_STOP=1','-U','postgres','-d',db,'-At'],sql).toString().trim();
try{
 for(const db of names){assert.equal(psql('postgres','SELECT count(*) FROM pg_database WHERE datname='+q(db)),'0');docker(['exec',container,'createdb','-U','postgres',db]);created.push(db);}
 const moved=['00011_mcp_internal_oauth.sql','00099_sam_google_oauth.sql','00100_sam_google_oauth_runtime.sql','00101_goal_read_reviews.sql'];
 const files=[...fs.readdirSync('packages/db/migrations').filter(f=>Number(f.slice(0,5))<=10),...moved].sort();
 psql(names[0],'CREATE TABLE sam_schema_migrations(filename text PRIMARY KEY,sha256 text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now());');
 for(const file of files){const sql=fs.readFileSync('packages/db/'+(moved.includes(file)?'integration-migrations/':'migrations/')+file,'utf8');psql(names[0],'BEGIN;'+sql+';INSERT INTO sam_schema_migrations(filename,sha256) VALUES('+q(file)+','+q(hash(sql))+');COMMIT;');}
 psql(names[0],"INSERT INTO mcp_oauth_clients(client_id,redirect_uris) VALUES('synthetic-backup-sentinel',ARRAY['https://fixture.invalid/callback']);");
 const before=psql(names[0],'SELECT filename,sha256,applied_at FROM sam_schema_migrations ORDER BY filename;');
 const dump=docker(['exec',container,'pg_dump','-U','postgres','-d',names[0],'-Fc','--no-owner','--no-acl']);
 for(const file of fs.readdirSync('packages/db/migrations').filter(f=>Number(f.slice(0,5))>10).sort()){
  const sql=fs.readFileSync('packages/db/migrations/'+file,'utf8');psql(names[0],'BEGIN;'+sql+';INSERT INTO sam_schema_migrations(filename,sha256) VALUES('+q(file)+','+q(hash(sql))+');COMMIT;');
 }
 assert.equal(psql(names[0],'SELECT count(*) FROM sam_schema_migrations;'),'16');
 docker(['exec','-i',container,'pg_restore','-U','postgres','-d',names[1],'--exit-on-error','--no-owner','--no-acl'],dump);
 assert.equal(psql(names[1],'SELECT filename,sha256,applied_at FROM sam_schema_migrations ORDER BY filename;'),before);
 assert.equal(psql(names[1],"SELECT count(*) FROM mcp_oauth_clients WHERE client_id='synthetic-backup-sentinel';"),'1');
 assert.equal(psql(names[1],'SELECT count(*) FROM sam_schema_migrations;'),'14');
 assert.equal(psql(names[0],'SELECT count(*) FROM sam_schema_migrations;'),'16','restoring separate quarantine must not alter upgraded database');
 console.log(JSON.stringify({suite:'provisioning-backup-recovery',status:'PASS',backupSha256:hash(dump),restoredLedger:14,upgradedLedger:16,quarantined:true,applicationStarted:false,productionData:false,automaticDownMigration:false}));
}finally{for(const db of created.reverse())docker(['exec',container,'dropdb','-U','postgres',db]);}
