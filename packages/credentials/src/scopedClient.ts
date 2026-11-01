import {currentLegalEntity} from "./entityContext";
import {CredentialResolver,fingerprint,type CredentialProvider} from "./resolver";
import type {SecretFields} from "../../db/src/credentialVault";

// A drop-in stand-in for an API client (BolRetailerClient, GmailApiClient, ...).
// Every method call resolves the client of the legal entity in the current context,
// building it from that entity's vault credentials. Existing adapters keep their
// `client.someMethod()` code unchanged but can no longer be bound to a single account.
// A rotated secret yields a new fingerprint, so a fresh client (and token cache) is built.
export function entityScopedClient<T extends object>(input:{
  resolver:CredentialResolver;
  provider:CredentialProvider;
  build:(fields:SecretFields)=>T;
}):T{
  const cache=new Map<string,{fp:string;client:T}>();
  const clientFor=async():Promise<T>=>{
    const entity=currentLegalEntity();
    const fields=await input.resolver.resolve(input.provider);
    const fp=fingerprint(fields),hit=cache.get(entity);
    if(hit&&hit.fp===fp)return hit.client;
    const client=input.build(fields);
    cache.set(entity,{fp,client});
    return client;
  };
  return new Proxy({} as T,{
    get(_t,prop){
      if(typeof prop==="symbol"||prop==="then")return undefined;
      return async(...args:unknown[])=>{
        const client=await clientFor();
        const member=(client as any)[prop];
        if(typeof member!=="function")throw new Error(`entity-scoped client has no method ${String(prop)}`);
        return member.apply(client,args);
      };
    }
  });
}

// For values the adapter reads per call (e.g. the Gmail From address).
export async function entityField(resolver:CredentialResolver,provider:CredentialProvider,field:string):Promise<string|undefined>{
  currentLegalEntity();
  return (await resolver.resolve(provider))[field];
}
