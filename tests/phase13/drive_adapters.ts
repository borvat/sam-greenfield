import assert from "node:assert/strict";
import { createServer } from "node:http";
import { GoogleRefreshTokenProvider } from "../../packages/google-auth/src/refreshToken";
import { GoogleDriveApiClient } from "../../packages/google-drive/src/client";
import { DriveGetMetadataAdapter,DriveSearchAdapter,DriveCreateFolderAdapter } from "../../apps/tools/src/driveAdapters";
import { DriveGetMetadataVerifier,DriveSearchVerifier,DriveCreateFolderVerifier } from "../../apps/production/src/driveVerifiers";
import { withGoogleDriveFromEnv,DRIVE_VERIFICATION_CONTRACTS } from "../../apps/production/src/driveBundle";
import { validateProductionBundle } from "../../apps/production/src/bundle";
import { syncVerificationContracts } from "../../apps/production/src/verificationContracts";
import { pool } from "../../packages/db/src/client";

async function mock(){
  const seen:any[]=[];
  const files=new Map<string,any>();
  files.set("existing-1",{id:"existing-1",name:"Existing",mimeType:"text/plain",parents:["root"],trashed:false});

  const server=createServer(async(req,res)=>{
    const chunks:Buffer[]=[];
    for await(const chunk of req) chunks.push(Buffer.from(chunk));
    const text=Buffer.concat(chunks).toString("utf8");
    seen.push({url:req.url,method:req.method,headers:req.headers,text});
    res.setHeader("content-type","application/json");

    if(req.url==="/token"){
      res.end(JSON.stringify({access_token:"drive-access",expires_in:3600}));
      return;
    }

    if(req.url?.startsWith("/drive/v3/files/existing-1?")){
      res.end(JSON.stringify(files.get("existing-1")));
      return;
    }

    if(req.method==="POST"&&req.url?.startsWith("/drive/v3/files?")){
      assert.equal(req.headers.authorization,"Bearer drive-access");
      const body=JSON.parse(text);
      assert.equal(body.mimeType,"application/vnd.google-apps.folder");
      const item={
        id:"folder-1",
        name:body.name,
        mimeType:body.mimeType,
        parents:body.parents??[],
        trashed:false,
        webViewLink:"https://drive.example/folder-1"
      };
      files.set(item.id,item);
      res.end(JSON.stringify(item));
      return;
    }

    if(req.url?.startsWith("/drive/v3/files/folder-1?")){
      res.end(JSON.stringify(files.get("folder-1")));
      return;
    }

    if(req.method==="GET"&&req.url?.startsWith("/drive/v3/files?")){
      assert.equal(req.headers.authorization,"Bearer drive-access");
      const u=new URL(`http://local${req.url}`);
      const q=u.searchParams.get("q")??"";
      assert.ok(q.includes("trashed = false"));
      const result=[...files.values()].filter((f)=>!f.trashed);
      res.end(JSON.stringify({files:result,nextPageToken:null}));
      return;
    }

    res.statusCode=404;
    res.end(JSON.stringify({error:{message:"not found"}}));
  });

  await new Promise<void>((resolve)=>server.listen(0,"127.0.0.1",()=>resolve()));
  const address=server.address();
  if(!address||typeof address==="string") throw new Error("mock unavailable");
  return {server,seen,base:`http://127.0.0.1:${address.port}`};
}

async function main(){
  const m=await mock();
  const tokens=new GoogleRefreshTokenProvider({
    clientId:"client",
    clientSecret:"secret",
    refreshToken:"refresh",
    tokenUrl:`${m.base}/token`
  });
  const client=new GoogleDriveApiClient({
    tokens,
    baseUrl:`${m.base}/drive/v3`
  });

  const metaAdapter=new DriveGetMetadataAdapter(client);
  const meta=await metaAdapter.execute({
    capabilityId:"drive_get_metadata",
    idempotencyKey:"read-1",
    params:{file_id:"existing-1"}
  });
  assert.equal((meta.result as any).file.id,"existing-1");

  const searchAdapter=new DriveSearchAdapter(client);
  const search=await searchAdapter.execute({
    capabilityId:"drive_search",
    idempotencyKey:"read-2",
    params:{query:"Existing",limit:25}
  });
  assert.ok(Array.isArray((search.result as any).files));

  const createAdapter=new DriveCreateFolderAdapter(client);
  const created=await createAdapter.execute({
    capabilityId:"drive_create_folder",
    idempotencyKey:"create-1",
    params:{name:"Projects",parent_id:"root"}
  });
  assert.equal(created.providerReference,"folder-1");

  const reconciled=await createAdapter.reconcile({
    capabilityId:"drive_create_folder",
    providerReference:"folder-1",
    idempotencyKey:"create-1"
  });
  assert.equal(reconciled.result,"CONFIRMED");

  const metaVerified=await new DriveGetMetadataVerifier(client).verify({
    execution:{
      id:"e1",
      capabilityId:"drive_get_metadata",
      params:{file_id:"existing-1"},
      evidence:meta.evidence,
      operationKeyRef:null
    },
    contract:{id:"c1",method:"api_readback",requiredEvidenceFields:{},independentQueryTemplate:{}}
  });
  assert.equal(metaVerified.result,"VERIFIED");

  const searchVerified=await new DriveSearchVerifier(client).verify({
    execution:{
      id:"e2",
      capabilityId:"drive_search",
      params:{query:"Existing"},
      evidence:search.evidence,
      operationKeyRef:null
    },
    contract:{id:"c2",method:"list_search",requiredEvidenceFields:{},independentQueryTemplate:{}}
  });
  assert.equal(searchVerified.result,"VERIFIED");

  const folderVerified=await new DriveCreateFolderVerifier(client).verify({
    execution:{
      id:"e3",
      capabilityId:"drive_create_folder",
      params:{name:"Projects",parent_id:"root"},
      evidence:created.evidence,
      operationKeyRef:"create-1"
    },
    contract:{id:"c3",method:"api_readback",requiredEvidenceFields:{},independentQueryTemplate:{}}
  });
  assert.equal(folderVerified.result,"VERIFIED");

  const base={capabilities:[],toolDefinitions:[],toolAdapters:[]};
  const configured=withGoogleDriveFromEnv(base,{
    GOOGLE_OAUTH_CLIENT_ID:"client",
    GOOGLE_OAUTH_CLIENT_SECRET:"secret",
    GOOGLE_OAUTH_REFRESH_TOKEN:"refresh",
    GOOGLE_OAUTH_TOKEN_URL:`${m.base}/token`,
    GOOGLE_DRIVE_API_BASE_URL:`${m.base}/drive/v3`
  } as NodeJS.ProcessEnv);
  const validated=validateProductionBundle(configured);
  assert.equal(validated.catalog.get("drive_get_metadata").authorityClass,"GREEN");
  assert.equal(validated.catalog.get("drive_search").authorityClass,"GREEN");
  assert.equal(validated.catalog.get("drive_create_folder").authorityClass,"YELLOW");
  assert.equal(validated.tools.definition("drive_create_folder").sideEffect,true);

  await syncVerificationContracts(DRIVE_VERIFICATION_CONTRACTS);
  const contracts=await pool.query(
    "SELECT capability_id FROM verification_contracts WHERE capability_id=ANY($1::text[]) ORDER BY capability_id",
    [["drive_get_metadata","drive_search","drive_create_folder"]]
  );
  assert.equal(contracts.rowCount,3);

  assert.equal(m.seen.filter((x)=>x.url==="/token").length,1);

  await new Promise<void>((resolve,reject)=>m.server.close((err)=>err?reject(err):resolve()));
  console.log("PHASE13_DRIVE_ADAPTERS PASS capabilities=3");
  await pool.end();
}

main().catch(async(err)=>{
  console.error(err);
  await pool.end();
  process.exit(1);
});
