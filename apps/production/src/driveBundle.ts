import { GoogleRefreshTokenProvider } from "../../../packages/google-auth/src/refreshToken";
import { GoogleDriveApiClient } from "../../../packages/google-drive/src/client";
import { DriveGetMetadataAdapter,DriveSearchAdapter,DriveCreateFolderAdapter } from "../../tools/src/driveAdapters";
import { DriveGetMetadataVerifier,DriveSearchVerifier,DriveCreateFolderVerifier } from "./driveVerifiers";
import type { ProductionBundle } from "./types";

export const DRIVE_VERIFICATION_CONTRACTS=[
  {
    capabilityId:"drive_get_metadata",
    description:"Verify Drive metadata through independent files.get readback",
    verificationMethod:"api_readback" as const,
    requiredEvidenceFields:{provider_file_id:"string"},
    independentQueryTemplate:{api:"google_drive",method:"files.get"}
  },
  {
    capabilityId:"drive_search",
    description:"Verify Drive search through independent list/search readback",
    verificationMethod:"list_search" as const,
    requiredEvidenceFields:{result_count:"number"},
    independentQueryTemplate:{api:"google_drive",method:"files.list"}
  },
  {
    capabilityId:"drive_create_folder",
    description:"Verify folder exists with expected name, mime type and parent",
    verificationMethod:"api_readback" as const,
    requiredEvidenceFields:{provider_file_id:"string"},
    independentQueryTemplate:{api:"google_drive",method:"files.get"}
  }
];

export function withGoogleDriveFromEnv(
  bundle:ProductionBundle,
  env:NodeJS.ProcessEnv=process.env
):ProductionBundle{
  const clientId=env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret=env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const refreshToken=env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim();

  if(!clientId&&!clientSecret&&!refreshToken) return bundle;
  if(!clientId||!clientSecret||!refreshToken){
    throw new Error("Google Drive production wiring requires GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_OAUTH_REFRESH_TOKEN");
  }

  const tokens=new GoogleRefreshTokenProvider({
    clientId,
    clientSecret,
    refreshToken,
    tokenUrl:env.GOOGLE_OAUTH_TOKEN_URL?.trim()||undefined
  });
  const client=new GoogleDriveApiClient({
    tokens,
    baseUrl:env.GOOGLE_DRIVE_API_BASE_URL?.trim()||undefined
  });

  return {
    ...bundle,
    capabilities:[
      ...bundle.capabilities,
      {
        capabilityId:"drive_get_metadata",
        authorityClass:"GREEN",
        specialistAgentId:"documents",
        specialistVersion:"1.0.0"
      },
      {
        capabilityId:"drive_search",
        authorityClass:"GREEN",
        specialistAgentId:"documents",
        specialistVersion:"1.0.0"
      },
      {
        capabilityId:"drive_create_folder",
        authorityClass:"YELLOW",
        specialistAgentId:"documents",
        specialistVersion:"1.0.0"
      }
    ],
    toolDefinitions:[
      ...bundle.toolDefinitions,
      {capabilityId:"drive_get_metadata",authorityClass:"GREEN",sideEffect:false},
      {capabilityId:"drive_search",authorityClass:"GREEN",sideEffect:false},
      {capabilityId:"drive_create_folder",authorityClass:"YELLOW",sideEffect:true}
    ],
    toolAdapters:[
      ...bundle.toolAdapters,
      new DriveGetMetadataAdapter(client),
      new DriveSearchAdapter(client),
      new DriveCreateFolderAdapter(client)
    ],
    verificationAdapters:[
      ...(bundle.verificationAdapters??[]),
      new DriveGetMetadataVerifier(client),
      new DriveSearchVerifier(client),
      new DriveCreateFolderVerifier(client)
    ]
  };
}
