import { PGlite } from '@electric-sql/pglite';
import { readFile,readdir } from 'node:fs/promises';
import { pool } from '../../packages/db/src/client';
export async function lab(){
 const db=new PGlite();
 const names=(await readdir('packages/db/migrations')).filter(n=>n.endsWith('.sql')).sort();
 for(const n of names){let sql=await readFile('packages/db/migrations/'+n,'utf8');
  sql=sql.replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";','');await db.exec(sql);
 }
 const savedConnect=pool.connect,savedQuery=pool.query;
 const query=async(q:string,p?:any[])=>{
  // PGlite has no multi-process advisory locking: isolate that unproven boundary.
  if(/pg_(try_advisory|advisory_unlock)/.test(q))return {rows:[{locked:true}],rowCount:1};
  const r=await db.query(q,p);return {...r,rowCount:r.rows.length||r.affectedRows||0};
 };
 (pool as any).connect=async()=>({query,release(){}});(pool as any).query=query;
 const org:any=(await db.query("INSERT INTO organizations(name) VALUES('Fixture Group') RETURNING id")).rows[0];
 const entity:any=(await db.query("INSERT INTO legal_entities(org_id,name) VALUES($1,'Fixture A') RETURNING id",[org.id])).rows[0];
 const other:any=(await db.query("INSERT INTO legal_entities(org_id,name) VALUES($1,'Fixture B') RETURNING id",[org.id])).rows[0];
 return {db,entity:entity.id,other:other.id,async close(){pool.connect=savedConnect;pool.query=savedQuery;await db.close()}};
}
