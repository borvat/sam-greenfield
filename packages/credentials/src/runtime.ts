import {pool} from "../../db/src/client";
import {CredentialVault,VaultKeyring} from "../../db/src/credentialVault";
import {CredentialResolver} from "./resolver";

// Vault mode is on when master keys are configured (SAM_VAULT_KEYS), or manifest mode for
// processes that must list the capabilities without ever holding credentials (SAM_CREDENTIAL_MODE=manifest). Off keeps the
// original single-account environment wiring, so existing deployments are unchanged
// until the operator opts in. Malformed keys fail loudly at startup, never silently.
export function vaultEnabled(env:NodeJS.ProcessEnv=process.env):boolean{
  return Boolean(env.SAM_VAULT_KEYS?.trim())||env.SAM_CREDENTIAL_MODE?.trim()==="manifest";
}

let shared:CredentialResolver|null|undefined;
export function sharedCredentialResolver(env:NodeJS.ProcessEnv=process.env):CredentialResolver|null{
  if(shared!==undefined)return shared;
  if(!vaultEnabled(env))shared=null;
  else if(env.SAM_VAULT_KEYS?.trim())
    shared=new CredentialResolver({vault:new CredentialVault(pool,VaultKeyring.fromEnv(env)),env,actor:env.SAM_WORKER_ID?.trim()||"runtime"});
  else // manifest mode (MCP bridge): same capabilities, but no keys and no env fallback => every credentialed call fails closed
    shared=new CredentialResolver({vault:null,env:{},actor:"manifest"});
  return shared;
}
