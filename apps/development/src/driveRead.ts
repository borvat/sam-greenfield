import { GoogleDriveApiClient } from "../../../packages/google-drive/src/client";
import { DriveGetMetadataAdapter } from "../../tools/src/driveAdapters";
import { DriveGetMetadataVerifier } from "../../production/src/driveVerifiers";
import { validateProductionBundle } from "../../production/src/bundle";
import { assertSafeScalar, localDevelopment, denyDevelopment } from "./planningPolicy";
import { sha256Hex } from "../../../packages/shared/src/stableJson";

export const DRIVE_READ_OBJECTIVE = "Confirm the owner-approved personal Google document exists and record permitted metadata with independent readback. No content, search, writes, or model disclosure.";
export const DRIVE_READ_FIELDS = "id,mimeType,modifiedTime,trashed";
const nativeFields = "id,name,mimeType,parents,trashed,modifiedTime,webViewLink";
export class DriveReadError extends Error {
  constructor(readonly code: string, readonly httpStatus?: number) { super(code); }
}
type Metadata = {id:string;mimeType:string;modifiedTime?:string;trashed?:boolean};
export type DriveReadCall = {at:string;httpStatus:number;metadataHash?:string;failureCode?:string;providerErrorStatus?:string};

export function validateDriveMetadata(value: any, fileId: string): Metadata {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      Object.keys(value).some(key => !DRIVE_READ_FIELDS.split(",").includes(key))) {
    throw new DriveReadError("DRIVE_UNAPPROVED_RESPONSE_FIELD");
  }
  if (value.id !== fileId || value.mimeType !== "application/vnd.google-apps.document") {
    throw new DriveReadError("DRIVE_RESOURCE_OR_TYPE_MISMATCH");
  }
  assertSafeScalar(value.id); assertSafeScalar(value.mimeType);
  if (value.modifiedTime !== undefined) {
    assertSafeScalar(value.modifiedTime);
    if (typeof value.modifiedTime !== "string" || !Number.isFinite(Date.parse(value.modifiedTime))) {
      throw new DriveReadError("DRIVE_INVALID_TIMESTAMP");
    }
  }
  if (value.trashed !== undefined && typeof value.trashed !== "boolean") {
    throw new DriveReadError("DRIVE_INVALID_TRASH_FLAG");
  }
  if (value.trashed === true) throw new DriveReadError("DRIVE_APPROVED_RESOURCE_TRASHED");
  return value;
}

export function scopedDriveRequest(input: {
  fileId: string;
  fetchMetadata: (path: string) => Promise<Response>;
  onCall?: (call: DriveReadCall) => void;
}) {
  if (!localDevelopment() || process.env.NODE_ENV !== "development") denyDevelopment("DRIVE_READ_DEVELOPMENT_ONLY");
  if (!/^[A-Za-z0-9_-]{10,200}$/.test(input.fileId)) throw new DriveReadError("DRIVE_INVALID_RESOURCE");
  let spent = false;
  return async (path: string): Promise<Metadata> => {
    // Recognize the original client's request, then reduce its fields before any wire call.
    if (path !== `/files/${input.fileId}?fields=${nativeFields}`) throw new DriveReadError("DRIVE_PATH_OR_FIELDS_DENIED");
    if (spent) throw new DriveReadError("DRIVE_READ_ALREADY_CONSUMED");
    spent = true;
    const call: DriveReadCall = {at:new Date().toISOString(),httpStatus:0};
    try {
      const response = await input.fetchMetadata(`/drive/v3/files/${input.fileId}?fields=${DRIVE_READ_FIELDS}`);
      call.httpStatus = response.status;
      if (!response.ok) {
        // Only standardized enum diagnostics survive; discard the raw provider error.
        try {
          const error:any=await response.json();
          const status=error?.error?.status;
          if (["UNAUTHENTICATED","PERMISSION_DENIED","NOT_FOUND","INVALID_ARGUMENT","RESOURCE_EXHAUSTED","UNAVAILABLE","INTERNAL"].includes(status)) {
            call.providerErrorStatus=status;
          }
        } catch { /* Never echo error text, tokens, account names, or resource IDs. */ }
        throw new DriveReadError("DRIVE_METADATA_HTTP_REJECTED", response.status);
      }
      const text = await response.text();
      if (Buffer.byteLength(text) > 16_000) throw new DriveReadError("DRIVE_METADATA_RESPONSE_TOO_LARGE");
      let parsed: unknown;
      try { parsed = JSON.parse(text); } catch { throw new DriveReadError("DRIVE_METADATA_INVALID_JSON"); }
      let metadata: Metadata;
      try { metadata = validateDriveMetadata(parsed, input.fileId); }
      catch (error) {
        if (error instanceof DriveReadError) throw error;
        throw new DriveReadError("DRIVE_RESPONSE_SAFETY_REJECTED");
      }
      call.metadataHash = sha256Hex(metadata);
      return metadata;
    } catch (error) {
      if (error instanceof DriveReadError) { call.failureCode=error.code; throw error; }
      call.failureCode="DRIVE_MANAGED_ACCESS_UNAVAILABLE";
      throw new DriveReadError("DRIVE_MANAGED_ACCESS_UNAVAILABLE");
    } finally { input.onCall?.(call); }
  };
}

export function driveReadBundle(input:{
  fileId:string;
  executeRequest:(path:string)=>Promise<any>;
  verifyRequest:(path:string)=>Promise<any>;
}) {
  const paramsAllowed = (params: Record<string, unknown>) => {
    if (!params || Object.getPrototypeOf(params) !== Object.prototype ||
        Object.keys(params).length !== 1 || params.file_id !== input.fileId) {
      throw new DriveReadError("DRIVE_UNAPPROVED_PARAMS");
    }
  };
  const adapter = new DriveGetMetadataAdapter(new GoogleDriveApiClient({readOnlyRequest:input.executeRequest}));
  const verifier = new DriveGetMetadataVerifier(new GoogleDriveApiClient({readOnlyRequest:input.verifyRequest}));
  return validateProductionBundle({
    capabilities:[{capabilityId:"drive_get_metadata",authorityClass:"GREEN",specialistAgentId:"documents",specialistVersion:"1.0.0"}],
    toolDefinitions:[{capabilityId:"drive_get_metadata",authorityClass:"GREEN",sideEffect:false}],
    toolAdapters:[{capabilityId:"drive_get_metadata",async execute(request){paramsAllowed(request.params);return adapter.execute(request);}}],
    verificationAdapters:[{capabilityId:"drive_get_metadata",async verify(request){paramsAllowed(request.execution.params);return verifier.verify(request);}}],
    modelAdapters:[],modelProviderConfigs:[],workerLeaseTtlSeconds:30
  });
}
