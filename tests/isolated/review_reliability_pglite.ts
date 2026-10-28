// Run the unchanged core review acceptance against disposable embedded PostgreSQL.
// Session advisory locks are stubbed for this single-client runner; concurrency and
// native restricted-role admission remain separate checks.
import {PGlite} from '@electric-sql/pglite';
import {pgcrypto} from '@electric-sql/pglite/contrib/pgcrypto';
import {readFile,readdir} from 'node:fs/promises';
import {pool} from '../../packages/db/src/client';
async function run(){
 const db=new PGlite({extensions:{pgcrypto}});
 for(const name of (await readdir('packages/db/migrations')).filter(n=>n.endsWith('.sql')).sort())await db.exec(await readFile('packages/db/migrations/'+name,'utf8'));
 const query=async(sql:string,args?:any[])=>{
  if(sql.includes('pg_try_advisory_lock'))return {rows:[{locked:true}],rowCount:1};
  if(sql.includes('pg_advisory_unlock')||sql.includes('pg_advisory_xact_lock'))return {rows:[{}],rowCount:1};
  if(!args?.length&&sql.includes(';')){const rows=await db.exec(sql);return {...rows.at(-1),rowCount:rows.at(-1)?.rows.length??0};}
  const result=await db.query(sql,args);return {...result,rowCount:result.rows.length};
 };
 (pool as any).connect=async()=>({query,release(){}});(pool as any).query=query;(pool as any).end=async()=>db.close();
 await import('../core/reviewReliability');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
