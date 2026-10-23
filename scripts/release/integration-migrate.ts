// Explicit operator action; never invoked by app startup or verification.
import {Client} from 'pg';
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import {applyIntegrationProfile,integrationManifest} from '../../packages/db/src/integrationProfile';
async function main(){
 if(process.argv[2]!=='--apply'||process.env.SAM_DATABASE_TARGET!=='staging'||process.env.SAM_STAGING_MIGRATION_APPROVED!=='1')throw Error('EXPLICIT_STAGING_MIGRATION_AUTHORIZATION_REQUIRED');
 const url=new URL(process.env.DATABASE_URL||'');
 if(url.hostname!==process.env.SAM_STAGING_DB_HOST||url.pathname!=='/'+process.env.SAM_STAGING_DB_NAME||url.searchParams.get('sslmode')!=='verify-full')throw Error('STAGING_DATABASE_IDENTITY_OR_TLS_REQUIRED');
 const schema=process.env.SAM_STAGING_DB_SCHEMA||'';if(!/^[a-z_][a-z0-9_]{0,62}$/.test(schema))throw Error('STAGING_SCHEMA_REQUIRED');
 const hash=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex');
 const manifest=integrationManifest().map(({filename,sha256})=>({filename,sha256}));
 if(hash(JSON.stringify(manifest))!==process.env.SAM_STAGING_MIGRATION_MANIFEST_SHA256)throw Error('REVIEWED_STAGING_MANIFEST_REQUIRED');
 const c=new Client({connectionString:url.href});await c.connect();
 try{
  const identity=(await c.query('SELECT current_database() db,current_schema() s')).rows[0];
  if(identity.db!==process.env.SAM_STAGING_DB_NAME||identity.s!==schema)throw Error('STAGING_DATABASE_IDENTITY_MISMATCH');
  const core=(await c.query('SELECT filename,sha256 FROM sam_schema_migrations ORDER BY filename')).rows;
  const expected=readdirSync('packages/db/migrations').filter(f=>f.endsWith('.sql')).sort().map(filename=>({filename,sha256:hash(readFileSync('packages/db/migrations/'+filename))}));
  if(JSON.stringify(core)!==JSON.stringify(expected))throw Error('VERIFIED_CORE_MIGRATION_BASELINE_REQUIRED');
  await applyIntegrationProfile(c);console.log('STAGING_INTEGRATION_MIGRATIONS_APPLIED; verify roles and tenant acceptance before starting services');
 }finally{await c.end();}
}
main().catch(()=>{console.error('STAGING_MIGRATION_REFUSED_OR_FAILED; details withheld; review target, TLS, authorization and ledger');process.exitCode=1;});
