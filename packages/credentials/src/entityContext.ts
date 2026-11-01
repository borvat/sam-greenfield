import {AsyncLocalStorage} from "node:async_hooks";

// Carries "which legal entity is this work for" down to the point where an API
// client needs credentials. Set by the kernel executor, verifier and reconciler
// from the goal's company_scope; read by entity-scoped clients. Absence is an error,
// never a default: a missing context must not fall back to some other entity's account.
const als=new AsyncLocalStorage<{legalEntityId:string}>();
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CredentialError extends Error{
  constructor(readonly code:string){super(code);this.name="CredentialError";}
}

export function runWithLegalEntity<T>(legalEntityId:string|null|undefined,fn:()=>Promise<T>):Promise<T>{
  // Work without an entity still runs (non-credentialed capabilities, drive, etc.);
  // only a credentialed client call fails closed when it finds no context.
  if(legalEntityId==null)return fn();
  if(!UUID.test(legalEntityId))throw new CredentialError("CREDENTIAL_ENTITY_INVALID");
  return als.run({legalEntityId},fn);
}

export function currentLegalEntity():string{
  const ctx=als.getStore();
  if(!ctx)throw new CredentialError("CREDENTIAL_ENTITY_CONTEXT_REQUIRED");
  return ctx.legalEntityId;
}
