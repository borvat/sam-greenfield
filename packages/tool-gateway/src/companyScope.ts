/** Undefined keeps legacy behavior; an explicit empty scope denies everyone. */
export function companyMayUse(scopes:readonly string[]|undefined, company:unknown):boolean {
  return scopes===undefined || (typeof company==="string" && scopes.includes(company));
}

export function companyCapabilities<T>(items:readonly T[]|undefined, company:unknown):T[]|undefined {
  return items?.filter((item:any)=>companyMayUse(item.companyScopes,company));
}
