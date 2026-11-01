import {pool} from "../../db/src/client";
import {CredentialVault,VaultKeyring} from "../../db/src/credentialVault";
import {CredentialResolver} from "./resolver";

// Vault mode is on when master keys are configured (SAM_VAULT_KEYS). Off keeps the
// original single-account environment wiring, so existing deployments are unchanged
// until the operator opts in. Malformed keys fail loudly at startup, never silently.
export function vaultEnabled(env:NodeJS.ProcessEnv=process.env):boolean{
  return Boolean(env.SAM_VAULT_KEYS?.trim());
}

let shared:CredentialResolver|null|undefined;
export function sharedCredentialResolver(env:NodeJS.ProcessEnv=process.env):CredentialResolver|null{
  if(shared!==undefined)return shared;
  shared=vaultEnabled(env)
    ?new CredentialResolver({vault:new CredentialVault(pool,VaultKeyring.fromEnv(env)),env,actor:env.SAM_WORKER_ID?.trim()||"runtime"})
    :null;
  return shared;
}
