/** A revoked or expired service credential is denied before model dispatch. */
export function checkServiceAccess(expiresAt: number, revoked: boolean, now: number) {
  return !revoked && expiresAt > now;
}
