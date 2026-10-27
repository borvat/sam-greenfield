// Internal classification only; never carry provider response bodies or secrets
// into audit logs, planning context or automatic recovery decisions.
export class ReadSourceNotFoundError extends Error {
  constructor(readonly capabilityId:string){
    super("READ_SOURCE_NOT_FOUND");
    this.name="ReadSourceNotFoundError";
  }
}
const googleFileReads=new Set([
  "google_mcp_get_drive_file_content",
  "google_mcp_get_drive_file_download_url",
  "google_mcp_get_drive_shareable_link"
]);
export function isReadSourceNotFound(capabilityId:string,error:unknown):boolean{
  return googleFileReads.has(capabilityId) && error instanceof ReadSourceNotFoundError
    && error.capabilityId===capabilityId;
}

/** Constructed only by the reviewed cloud read bundle; never parse remote text as this type. */
export class ScopedCloudReadUnavailableError extends Error {
  constructor(readonly capabilityId:string){super('SCOPED_CLOUD_READ_UNAVAILABLE');this.name='ScopedCloudReadUnavailableError'}
}
export function isScopedCloudReadUnavailable(capabilityId:string,error:unknown):boolean{
  return /^research_mcp_[a-z0-9_]+$/.test(capabilityId)&&error instanceof ScopedCloudReadUnavailableError&&error.capabilityId===capabilityId;
}
