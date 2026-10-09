// Generic archived-build compatibility reader, test only. No worker is started.
const path=require("node:path");
const {createHash}=require("node:crypto");
let stage="ARCHIVE_IMPORT";
async function main(){
  const root=path.resolve(process.argv[2]??"");
  if(root!==process.cwd()&&(!root.startsWith(path.resolve(".local/sam-dev/restore-fixture-"))||!/build-[0-9a-f]{7}$/.test(root)))
    throw new Error("ARCHIVE_SCOPE_DENIED");
  const {pool}=require(path.join(root,"packages/db/src/client.ts"));
  const {loadActiveIncidents}=require(path.join(root,"apps/supervisor/src/incidents.ts"));
  const c=await pool.connect();
  try{
    stage="ROLE_AND_READ_ONLY_TRANSACTION";
    await c.query("BEGIN READ ONLY");
    const meta=(await c.query("SELECT current_user=session_user direct,(SELECT rolsuper OR rolbypassrls FROM pg_roles WHERE rolname=current_user) bypass")).rows[0];
    if(!meta.direct||meta.bypass)throw new Error("ARCHIVE_READER_ROLE_DENIED");
    stage="AUDIT_AND_RECEIPT_READ";
    const audit=(await c.query("SELECT to_jsonb(a)::text row FROM audit_log a ORDER BY id")).rows.map(x=>x.row);
    const receipts=(await c.query("SELECT to_jsonb(m)::text row FROM model_calls m ORDER BY id")).rows.map(x=>x.row);
    const goals=(await c.query("SELECT id,state FROM goals ORDER BY id")).rowCount;
    stage="NATIVE_INCIDENT_READER";
    await loadActiveIncidents(c,"synthetic-restore");
    for(const sql of ["SELECT * FROM work_queue","SELECT * FROM outbox_events"]){
      await c.query("SAVEPOINT denied");
      let denied=false;try{await c.query(sql);}catch(e){denied=e.code==="42501";}
      await c.query("ROLLBACK TO SAVEPOINT denied");
      if(!denied)throw new Error("RESTORE_QUARANTINE_FAILED");
    }
    const hash=v=>createHash("sha256").update(JSON.stringify(v)).digest("hex");
    console.log(JSON.stringify({auditCount:audit.length,receiptCount:receipts.length,goalCount:goals,
      auditHash:hash(audit),receiptHash:hash(receipts),nativeIncidentReader:true,queueOutboxDenied:true,directNonBypassLogin:true}));
    await c.query("ROLLBACK");
  }finally{c.release();await pool.end();}
}
main().catch(e=>{console.error(JSON.stringify({test:"ARCHIVED_BUILD_READ_FAILED",stage,
  code:e.code??e.name,details:"withheld"}));process.exitCode=1;});
