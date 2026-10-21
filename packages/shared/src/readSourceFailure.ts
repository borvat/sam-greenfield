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
