const fs=require("fs");
const path=require("path");
const crypto=require("crypto");
const {Client}=require("pg");

const migDir=path.join(__dirname,"../migrations");
const files=fs.readdirSync(migDir).filter(f=>f.endsWith(".sql")).sort();

function sha256(text){return crypto.createHash("sha256").update(text).digest("hex");}
function requireDatabaseUrl(){
  const value=(process.env.DATABASE_URL||"").trim();
  if(!value) throw new Error("DATABASE_URL is required");
  return value;
}

async function main(){
  console.log("Migrations in deterministic order:");
  let concat="";
  const descriptors=files.map(file=>{
    const content=fs.readFileSync(path.join(migDir,file),"utf8");
    const hash=sha256(content);
    concat+=content;
    console.log(`  ${file} sha256:${hash.slice(0,16)}`);
    return {file,content,hash};
  });
  const finalHash=sha256(concat);
  console.log(`\nFinal deterministic schema hash: ${finalHash}`);
  console.log(`Total migrations: ${files.length}`);

  if(process.argv.includes("--check-deterministic")){
    const sorted=[...files].sort();
    if(JSON.stringify(files)!==JSON.stringify(sorted)) throw new Error("Migrations not deterministic");
    console.log("Deterministic check PASS");
    if(!process.argv.includes("--apply")) return;
  }

  const client=new Client({connectionString:requireDatabaseUrl()});
  await client.connect();
  try{
    await client.query("SELECT pg_advisory_lock(hashtextextended('sam_schema_migrations',0))");
    try{
      await client.query(`CREATE TABLE IF NOT EXISTS sam_schema_migrations(
        filename text PRIMARY KEY,
        sha256 text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )`);

      for(const migration of descriptors){
        const existing=await client.query(
          "SELECT sha256 FROM sam_schema_migrations WHERE filename=$1",
          [migration.file]
        );
        if(existing.rowCount===1){
          if(existing.rows[0].sha256!==migration.hash){
            throw new Error(`Applied migration hash mismatch: ${migration.file}`);
          }
          console.log(`SKIP ${migration.file} already applied`);
          continue;
        }

        console.log(`APPLY ${migration.file}`);
        await client.query("BEGIN");
        try{
          await client.query(migration.content);
          await client.query(
            "INSERT INTO sam_schema_migrations(filename,sha256) VALUES($1,$2)",
            [migration.file,migration.hash]
          );
          await client.query("COMMIT");
        }catch(err){
          await client.query("ROLLBACK");
          throw err;
        }
      }

      const applied=await client.query("SELECT filename,sha256,applied_at FROM sam_schema_migrations ORDER BY filename");
      console.log(`Applied migrations recorded: ${applied.rowCount}`);
      if(applied.rowCount!==descriptors.length){
        throw new Error(`Migration count mismatch: expected ${descriptors.length}, recorded ${applied.rowCount}`);
      }
      console.log("DATABASE MIGRATION PASS");
    }finally{
      await client.query("SELECT pg_advisory_unlock(hashtextextended('sam_schema_migrations',0))");
    }
  }finally{
    await client.end();
  }
}

main().catch(err=>{
  console.error("DATABASE MIGRATION FAIL",err instanceof Error?err.message:err);
  process.exit(1);
});
