import { authenticateOAuth, type OAuthResourceConfig } from '../../../apps/mcp/src/oauthResource';
import { deny } from './security';

export interface SamModelIdentity { readonly kind: 'SAM_VERIFIED_MODEL_IDENTITY'; }
interface IdentityClaims { actor: string; orgId: string; entityId: string; expiresAt: number; }
const verified = new WeakMap<object, IdentityClaims>();

/** Reuse SAM's signature/issuer/audience/scope verifier. No new login/token issuer.
 * Only its synthetic-submit authority is accepted here; production remains disabled.
 */
export function authenticateSamModelToken(token: string, config: OAuthResourceConfig): SamModelIdentity {
  const principal = authenticateOAuth(token, config);
  if (!principal.scopes.includes('sam:synthetic:submit')) deny('AI_IDENTITY_SCOPE_DENIED');
  const identity = Object.freeze({ kind: 'SAM_VERIFIED_MODEL_IDENTITY' as const });
  verified.set(identity, { actor: principal.actor, orgId: principal.orgId,
    entityId: principal.entityId, expiresAt: principal.expiresAt });
  return identity;
}
export function samIdentityClaims(identity: SamModelIdentity): Readonly<IdentityClaims> {
  const claims = verified.get(identity);
  if (!claims || claims.expiresAt <= Date.now()) deny('AI_IDENTITY_DENIED');
  return Object.freeze({ ...claims });
}
