import {createHash} from "node:crypto";
import {CredentialVault,type SecretFields} from "../../db/src/credentialVault";
import {CredentialError,currentLegalEntity} from "./entityContext";

export type CredentialProvider="bol"|"gmail"|"eboekhouden";

// Env variables of the pre-vault, single-account deployment, mapped to vault field names.
const LEGACY:Record<CredentialProvider,Record<string,string>>={
  bol:{client_id:"BOL_CLIENT_ID",client_secret:"BOL_CLIENT_SECRET"},
  gmail:{client_id:"GOOGLE_OAUTH_CLIENT_ID",client_secret:"GOOGLE_OAUTH_CLIENT_SECRET",
    refresh_token:"GOOGLE_OAUTH_REFRESH_TOKEN",from_email:"GMAIL_FROM_EMAIL",user_id:"GMAIL_USER_ID"},
  eboekhouden:{api_token:"EBOEKHOUDEN_API_TOKEN"}
};
const REQUIRED:Record<CredentialProvider,string[]>={
  bol:["client_id","client_secret"],
  gmail:["client_id","client_secret","refresh_token"],
  eboekhouden:["api_token"]
};
// Accepted vault fields per provider (required + optional); used by the operator CLI.
export const PROVIDER_FIELDS:Record<CredentialProvider,{required:string[];optional:string[]}>={
  bol:{required:REQUIRED.bol,optional:[]},
  gmail:{required:REQUIRED.gmail,optional:["from_email","user_id"]},
  eboekhouden:{required:REQUIRED.eboekhouden,optional:["source"]}
};

export class CredentialResolver{
  constructor(private readonly opts:{
    vault:CredentialVault|null;
    env?:NodeJS.ProcessEnv;
    actor?:string;
  }){}

  // Credentials of the legal entity in the current context. Order: vault, then the
  // legacy environment credentials ONLY for the one entity named by
  // SAM_LEGACY_CREDENTIAL_ENTITY_ID. Any other entity without a vault secret fails
  // closed, so one entity's work can never run under another entity's account.
  async resolve(provider:CredentialProvider,name="default"):Promise<SecretFields>{
    const legalEntityId=currentLegalEntity();
    const actor=this.opts.actor??"runtime";
    const stored=this.opts.vault?await this.opts.vault.get({legalEntityId,provider,name,actor}):null;
    const fields=stored??this.legacy(provider,legalEntityId,name);
    if(!fields)throw new CredentialError("CREDENTIAL_NOT_CONFIGURED");
    for(const f of REQUIRED[provider])if(!fields[f])throw new CredentialError("CREDENTIAL_INCOMPLETE");
    return fields;
  }

  private legacy(provider:CredentialProvider,legalEntityId:string,name:string):SecretFields|null{
    const env=this.opts.env??process.env;
    const legacyEntity=env.SAM_LEGACY_CREDENTIAL_ENTITY_ID?.trim().toLowerCase();
    if(!legacyEntity||legacyEntity!==legalEntityId.toLowerCase()||name!=="default")return null;
    const out:Record<string,string>={};
    for(const [field,variable] of Object.entries(LEGACY[provider])){
      const v=env[variable]?.trim();if(v)out[field]=v;
    }
    return Object.keys(out).length?out:null;
  }
}

export function fingerprint(fields:SecretFields):string{
  return createHash("sha256").update(JSON.stringify(Object.entries(fields).sort())).digest("hex");
}
