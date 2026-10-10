import assert from "node:assert/strict";
import {createServer} from "node:net";
import {TLSSocket,createSecureContext} from "node:tls";
import {mkdtempSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {spawnSync} from "node:child_process";
import {once} from "node:events";
import {Client} from "pg";

async function main(){
  const dir=mkdtempSync(join(tmpdir(),"sam-tls-fixture-"));
  try{
    for(const [name,address] of [["good","127.0.0.1"],["wrong","127.0.0.2"]]){
      const r=spawnSync("openssl",["req","-x509","-newkey","rsa:2048","-nodes",
        "-keyout",join(dir,name+".key"),"-out",join(dir,name+".crt"),"-days","1",
        "-subj","/CN=Synthetic local TLS fixture","-addext",`subjectAltName=DNS:${name==="good"?"localhost":"wrong.invalid"},IP:${address}`],
        {stdio:"ignore",timeout:10000});
      assert.equal(r.status,0);
    }
    for(const [name,trusted] of [["good",true],["good",false],["wrong",true]] as const){
      let startupReached=0;
      const sockets=new Set<any>();
      const server=createServer(socket=>{
        sockets.add(socket);socket.on("close",()=>sockets.delete(socket));socket.on("error",()=>{});
        // Loopback protocol fixture tests the REAL pg client's PostgreSQL SSL
        // negotiation and certificate checks, not database auth or Neon access.
        socket.once("data",packet=>{
          assert.equal(packet.readInt32BE(4),80877103);
          socket.write("S");
          const tls=new TLSSocket(socket,{isServer:true,secureContext:createSecureContext({
            key:readFileSync(join(dir,name+".key")),cert:readFileSync(join(dir,name+".crt"))
          })});
          tls.on("error",()=>{});tls.once("data",()=>{
            startupReached++;
            const body=Buffer.from("SERROR\0C28000\0MTLS_VERIFIED_FIXTURE_ONLY\0\0");
            const head=Buffer.alloc(5);head[0]=69;head.writeInt32BE(body.length+4,1);
            tls.end(Buffer.concat([head,body]));
          });
        });
      });
      server.listen(0,"localhost");await once(server,"listening");
      const port=(server.address() as any).port;
      const url=new URL(`postgresql://synthetic_app@localhost:${port}/synthetic?sslmode=verify-full`);
      if(trusted)url.searchParams.set("sslrootcert",join(dir,name+".crt"));
      const client=new Client({connectionString:url.toString(),connectionTimeoutMillis:2000});
      try{
        await assert.rejects(()=>client.connect(),(e:any)=>name==="good"&&trusted?
          e.message==="TLS_VERIFIED_FIXTURE_ONLY":
          ["DEPTH_ZERO_SELF_SIGNED_CERT","ERR_TLS_CERT_ALTNAME_INVALID"].includes(e.code));
        assert.equal(startupReached,name==="good"&&trusted?1:0);
      }finally{
        await client.end().catch(()=>{});for(const socket of sockets)socket.destroy();
        await new Promise<void>(resolve=>server.close(()=>resolve()));
      }
    }
    console.log("POSTGRES_TLS_LOCAL_PASS: real pg SSL negotiation; trusted matching certificate reaches synthetic startup; untrusted and hostname-mismatch certificates denied before startup. NOT_PROVIDER_OR_DB_AUTH_PROOF.");
  }finally{rmSync(dir,{recursive:true,force:true});}
}
main().catch((error:any)=>{
  // Only fixture assertion/transport codes; never the URL or a certificate/key.
  console.error("POSTGRES_TLS_LOCAL_FAILED",error.code??"ASSERTION",error.actual?.code??"");
  process.exitCode=1;
});
