/** Explicit operator-only synthetic fixture; never imported by startup or MCP. */
import {readFile,mkdtemp,writeFile,chmod,rm} from 'node:fs/promises';
import {Client} from 'pg';
import {sha256Hex} from '../../packages/shared/src/stableJson';
import {openPersistentBinding} from './persistentBinding';

async function main(){
 const mode=process.argv[2],nonce=process.env.SAM_RELIABILITY_SENTINEL_NONCE;
 if(!['--write-sentinel','--read-sentinel'].includes(mode)||!/^reliability_[a-z0-9]{16}$/.test(nonce??''))throw Error('EXPLICIT_SYNTHETIC_SENTINEL_REQUIRED');
 if(process.env.RENDER_SERVICE_ID!=='srv-dbe27ics728c738tuoc0')throw Error('EXACT_TEST_SERVICE_REQUIRED');
 const bytes=await readFile('/etc/secrets/sam-restricted-connection.json');
 if(bytes.length<1||bytes.length>8192)throw Error('PRIVATE_BINDING_FILE_REQUIRED');
 const dir=await mkdtemp('/tmp/sam-sentinel-binding-');await chmod(dir,0o700);
 let storage:Awaited<ReturnType<typeof openPersistentBinding>>;
 try{await writeFile(dir+'/binding.json',bytes,{mode:0o600,flag:'wx'});storage=await openPersistentBinding(dir+'/binding.json');}
 finally{bytes.fill(0);await rm(dir,{recursive:true,force:true});}
 const c=new Client({connectionString:storage.binding.connectionString,connectionTimeoutMillis:5000,statement_timeout:5000});
 await c.connect();
 try{
  await c.query('BEGIN');
  const enrolled=(await c.query("SELECT 1 FROM evaluation_companies WHERE legal_entity_id=$1 AND purpose='SYNTHETIC_EVALUATION_ONLY'",[storage.binding.entity])).rowCount;
  if(enrolled!==1)throw Error('SYNTHETIC_COMPANY_REQUIRED');
  const source='operator_synthetic_sentinel:'+nonce,statement='SAM reliability synthetic observation '+nonce;
  await c.query('SELECT pg_advisory_xact_lock(hashtext($1))',[source]);
  const find=()=>c.query(`SELECT id,type,statement,scope,source,status,created_at FROM memory_records
   WHERE source=$1 AND scope->>'legal_entity_id'=$2 AND scope->>'synthetic'='true'`,[source,storage.binding.entity]);
  let result=await find();
  if(result.rowCount===0&&mode==='--write-sentinel'){
   await c.query(`INSERT INTO memory_records(type,statement,scope,source,confidence,status)
    VALUES('OPERATIONAL',$1,$2::jsonb,$3,0,'OBSERVED')`,[statement,JSON.stringify({legal_entity_id:storage.binding.entity,synthetic:true,nonce}),source]);
   result=await find();
  }
  if(result.rowCount!==1||result.rows[0].statement!==statement||result.rows[0].status!=='OBSERVED')throw Error('EXACT_SENTINEL_READBACK_REQUIRED');
  const approved=(await c.query("SELECT 1 FROM memory_records WHERE id=$1 AND status IN ('REINFORCED','APPROVED_RULE')",[result.rows[0].id])).rowCount;
  if(approved)throw Error('SYNTHETIC_OBSERVATION_MUST_NOT_BECOME_RULE');
  await c.query('COMMIT');
  console.info(JSON.stringify({memoryId:result.rows[0].id,hash:sha256Hex(result.rows[0]),status:'OBSERVED',synthetic:true,mode,
   scopedRecallQuery:statement,ownerApproved:false,modelCalls:0,containerReplacementValidated:false}));
 }catch(e){await c.query('ROLLBACK');throw e;}finally{await c.end();}
}
void main().catch(()=>{console.error('SYNTHETIC_SENTINEL_BLOCKED; no grant, renewal or model call performed');process.exitCode=1;});
