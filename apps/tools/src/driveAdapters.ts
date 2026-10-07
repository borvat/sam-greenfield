import type { ToolAdapter,ReconciliableToolAdapter,ToolExecutionRequest,ToolExecutionResult,ToolReconciliationResult } from "../../../packages/tool-gateway/src/types";
import type { GoogleDriveApiClient } from "../../../packages/google-drive/src/client";

export class DriveGetMetadataAdapter implements ToolAdapter{
  readonly capabilityId="drive_get_metadata";
  constructor(private readonly client:GoogleDriveApiClient){}

  async execute(request:ToolExecutionRequest):Promise<ToolExecutionResult>{
    const fileId=String(request.params.file_id??"").trim();
    if(!fileId) throw new Error("drive_get_metadata requires file_id");
    const file=await this.client.getFile(fileId);
    return {
      result:{file},
      evidence:{provider_file_id:file?.id??fileId,readback:true}
    };
  }
}

export class DriveSearchAdapter implements ToolAdapter{
  readonly capabilityId="drive_search";
  constructor(private readonly client:GoogleDriveApiClient){}

  async execute(request:ToolExecutionRequest):Promise<ToolExecutionResult>{
    const query=request.params.query?String(request.params.query):undefined;
    const parentId=request.params.parent_id?String(request.params.parent_id):undefined;
    const limit=request.params.limit?Number(request.params.limit):50;
    const result=await this.client.search({query,parentId,pageSize:limit});
    return {
      result:{
        files:Array.isArray(result?.files)?result.files:[],
        next_page_token:result?.nextPageToken??null
      },
      evidence:{
        result_count:Array.isArray(result?.files)?result.files.length:0,
        readback:true
      }
    };
  }
}

export class DriveCreateFolderAdapter implements ReconciliableToolAdapter{
  readonly capabilityId="drive_create_folder";
  constructor(private readonly client:GoogleDriveApiClient){}

  async execute(request:ToolExecutionRequest):Promise<ToolExecutionResult>{
    const name=String(request.params.name??"").trim();
    const parentId=request.params.parent_id?String(request.params.parent_id).trim():undefined;
    if(!name) throw new Error("drive_create_folder requires name");

    const file=await this.client.createFolder({name,parentId});
    if(typeof file?.id!=="string") throw new Error("Drive create folder response missing id");

    return {
      providerReference:file.id,
      result:{
        file_id:file.id,
        name:file.name??name,
        parent_id:Array.isArray(file.parents)?file.parents[0]??null:parentId??null,
        web_view_link:file.webViewLink??null
      },
      evidence:{
        provider_file_id:file.id,
        expected_name:name,
        expected_parent_id:parentId??null,
        expected_mime_type:"application/vnd.google-apps.folder"
      }
    };
  }

  async reconcile(input:{
    capabilityId:string;
    providerReference:string|null;
    idempotencyKey:string;
  }):Promise<ToolReconciliationResult>{
    if(input.providerReference){
      try{
        const file=await this.client.getFile(input.providerReference);
        if(file?.id && file?.trashed!==true){
          return {
            result:"CONFIRMED",
            evidence:{
              provider_file_id:file.id,
              reconciliation:"file_get"
            }
          };
        }
      }catch(err){
        if(!(err instanceof Error&&err.message.includes("HTTP 404"))) throw err;
      }
    }

    return {
      result:"NOT_FOUND",
      evidence:{
        reconciliation:"provider_reference_unavailable",
        idempotency_key:input.idempotencyKey
      }
    };
  }
}
