import type { GoogleDriveApiClient } from "../../../packages/google-drive/src/client";
import type { VerificationAdapter } from "./types";

export class DriveGetMetadataVerifier implements VerificationAdapter{
  readonly capabilityId="drive_get_metadata";
  constructor(private readonly client:GoogleDriveApiClient){}

  async verify(input:Parameters<VerificationAdapter["verify"]>[0]){
    const fileId=String(input.execution.params?.file_id??"").trim();
    if(!fileId){
      return {
        result:"INCONCLUSIVE" as const,
        evidence:{reason:"missing_file_id"},
        verifier:"drive-independent-readback"
      };
    }
    const file=await this.client.getFile(fileId);
    return {
      result:file?.id===fileId?"VERIFIED" as const:"FAILED" as const,
      evidence:{provider_file_id:file?.id??null,method:"drive_file_get"},
      verifier:"drive-independent-readback"
    };
  }
}

export class DriveSearchVerifier implements VerificationAdapter{
  readonly capabilityId="drive_search";
  constructor(private readonly client:GoogleDriveApiClient){}

  async verify(input:Parameters<VerificationAdapter["verify"]>[0]){
    const query=input.execution.params?.query?String(input.execution.params.query):undefined;
    const parentId=input.execution.params?.parent_id?String(input.execution.params.parent_id):undefined;
    const limit=input.execution.params?.limit?Number(input.execution.params.limit):50;
    const result=await this.client.search({query,parentId,pageSize:limit});
    return {
      result:"VERIFIED" as const,
      evidence:{
        method:"drive_search_readback",
        result_count:Array.isArray(result?.files)?result.files.length:0
      },
      verifier:"drive-independent-readback"
    };
  }
}

export class DriveCreateFolderVerifier implements VerificationAdapter{
  readonly capabilityId="drive_create_folder";
  constructor(private readonly client:GoogleDriveApiClient){}

  async verify(input:Parameters<VerificationAdapter["verify"]>[0]){
    const providerId=
      typeof input.execution.evidence?.provider_file_id==="string"
        ? input.execution.evidence.provider_file_id
        : null;
    if(!providerId){
      return {
        result:"INCONCLUSIVE" as const,
        evidence:{reason:"missing_provider_file_id"},
        verifier:"drive-independent-readback"
      };
    }

    const expectedName=String(input.execution.params?.name??"").trim();
    const expectedParent=input.execution.params?.parent_id
      ? String(input.execution.params.parent_id).trim()
      : null;

    const file=await this.client.getFile(providerId);
    const nameOk=file?.name===expectedName;
    const mimeOk=file?.mimeType==="application/vnd.google-apps.folder";
    const parentOk=expectedParent
      ? Array.isArray(file?.parents)&&file.parents.includes(expectedParent)
      : true;
    const notTrashed=file?.trashed!==true;

    return {
      result:nameOk&&mimeOk&&parentOk&&notTrashed?"VERIFIED" as const:"FAILED" as const,
      evidence:{
        provider_file_id:providerId,
        name_ok:nameOk,
        mime_ok:mimeOk,
        parent_ok:parentOk,
        not_trashed:notTrashed,
        method:"drive_file_get"
      },
      verifier:"drive-independent-readback"
    };
  }
}
