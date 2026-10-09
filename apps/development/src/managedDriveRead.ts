import { ReplitConnectors } from "@replit/connectors-sdk";
import { DriveReadError } from "./driveRead";

// Credentials remain opaque and are handled by the official SDK and proxy.
// SDK.proxy retries 401 automatically; these public SDK transport methods let
// this experiment make exactly one bounded GET per executor/verifier.
export function managedDriveMetadataFetcher(onWire?:()=>void) {
  const connectors = new ReplitConnectors();
  const proxy = new URL(connectors.getProxyUrl());
  if (proxy.origin !== "https://connectors.replit.com" || proxy.pathname !== "/api/v2/proxy") {
    throw new DriveReadError("DRIVE_UNEXPECTED_MANAGED_PROXY");
  }
  return async (path: string): Promise<Response> => {
    if (!/^\/drive\/v3\/files\/[A-Za-z0-9_-]{10,200}\?fields=id,mimeType,modifiedTime,trashed$/.test(path)) {
      throw new DriveReadError("DRIVE_MANAGED_PATH_DENIED");
    }
    const headers=await connectors.getProxyHeaders("google-drive");
    onWire?.();
    return fetch(`${proxy.href}${path}`, {
      method:"GET",
      headers,
      signal:AbortSignal.timeout(20_000),
      redirect:"error"
    });
  };
}
