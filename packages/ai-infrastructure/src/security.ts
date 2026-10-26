import { createHash, randomBytes } from 'node:crypto';
import type { DataClassification } from '../../model-gateway/src/types';

export class InfrastructureError extends Error {
  constructor(readonly code: string) { super(code); this.name = 'InfrastructureError'; }
}
export function deny(code: string): never { throw new InfrastructureError(code); }
export function identifier(value: string): string {
  if (!/^[a-z][a-z0-9-]{0,62}$/.test(value)) deny('INVALID_IDENTIFIER');
  return value;
}
export type Environment = 'test' | 'production';
export interface ServiceGrant {
  service: string;
  project: string;
  environment: Environment;
  providers: readonly string[];
  capabilities: readonly string[];
  classifications: readonly DataClassification[];
  expiresAt: number;
}
const digest = (token: string) => createHash('sha256').update(token).digest('hex');

/** Trusted bootstrap/admin object. Never register this object as an agent tool.
 * Process-local identities only; production needs independently reviewed OIDC/mTLS.
 */
export class ServiceIdentities {
  #grants = new Map<string, Readonly<ServiceGrant>>();
  #disabled = new Set<string>();
  #adminEvents: { event: 'ISSUED' | 'REVOKED' | 'SERVICE_DISABLED'; service: string;
    project: string; environment: Environment; at: number }[] = [];
  constructor(private readonly now = Date.now) {}
  issue(grant: ServiceGrant): string {
    identifier(grant.service); identifier(grant.project);
    grant.providers.forEach(identifier);
    if (!['test', 'production'].includes(grant.environment) ||
        !Number.isSafeInteger(grant.expiresAt) || grant.expiresAt <= this.now()) deny('INVALID_GRANT');
    if (this.#disabled.has(`${grant.environment}/${grant.project}/${grant.service}`)) deny('SERVICE_DENIED');
    const token = randomBytes(32).toString('base64url');
    this.#grants.set(digest(token), Object.freeze({ ...grant,
      providers: Object.freeze([...grant.providers]), capabilities: Object.freeze([...grant.capabilities]),
      classifications: Object.freeze([...grant.classifications]) }));
    this.#adminEvents.push({ event: 'ISSUED', service: grant.service, project: grant.project,
      environment: grant.environment, at: this.now() });
    return token;
  }
  authenticate(token: string): Readonly<ServiceGrant> {
    if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) deny('SERVICE_DENIED');
    const grant = this.#grants.get(digest(token));
    if (!grant || grant.expiresAt <= this.now() ||
        this.#disabled.has(`${grant.environment}/${grant.project}/${grant.service}`)) deny('SERVICE_DENIED');
    return grant;
  }
  revoke(token: string): void {
    const grant = this.#grants.get(digest(token)); this.#grants.delete(digest(token));
    if (grant) this.#adminEvents.push({ event: 'REVOKED', service: grant.service, project: grant.project,
      environment: grant.environment, at: this.now() });
  }
  disableService(service: string, project: string, environment: Environment): void {
    identifier(service); identifier(project);
    if (!['test', 'production'].includes(environment)) deny('INVALID_ENVIRONMENT');
    this.#disabled.add(`${environment}/${project}/${service}`);
    this.#adminEvents.push({ event: 'SERVICE_DISABLED', service, project, environment, at: this.now() });
  }
  administrativeEvents() { return structuredClone(this.#adminEvents); }
}

export interface AuditEvent {
  event: 'ADMITTED' | 'SUCCEEDED' | 'UNCERTAIN' | 'DENIED';
  service: string;
  project: string;
  environment: Environment;
  provider: string;
  requestId: string;
  reservedMicrousd?: number;
  actualMicrousd?: number;
  inputTokens?: number;
  outputTokens?: number;
  cachedTokens?: number;
}
export type AuditSink = (event: Readonly<AuditEvent>) => Promise<void>;

/** Fixed-shape audit only: no prompts, arbitrary errors, auth tokens or headers. */
export async function audit(sink: AuditSink, event: AuditEvent): Promise<void> {
  const { event: kind, service, project, environment, provider, requestId,
    reservedMicrousd, actualMicrousd, inputTokens, outputTokens, cachedTokens } = event;
  // Caller-supplied correlation text could accidentally contain a bearer credential.
  const requestDigest = createHash('sha256').update(requestId).digest('hex');
  try { await sink(Object.freeze({ event: kind, service, project, environment, provider, requestId: requestDigest,
    reservedMicrousd, actualMicrousd, inputTokens, outputTokens, cachedTokens })); }
  catch { deny('AUDIT_UNAVAILABLE'); }
}

/** A single-process test ledger. Reservation is synchronous before I/O.
 * Uncertain calls retain the entire reservation; no automatic retries/refunds.
 */
export class LocalAdmissionLedger {
  #spent = new Map<string, number>();
  #seen = new Map<string, Set<string>>();
  #windows = new Map<string, { at: number; count: number }>();
  #cooldowns = new Map<string, number>();
  constructor(readonly ceilingMicrousd: number, readonly requestsPerMinute: number,
    private readonly now = Date.now) {
    if (!Number.isSafeInteger(ceilingMicrousd) || ceilingMicrousd < 0 ||
        !Number.isSafeInteger(requestsPerMinute) || requestsPerMinute < 1) deny('INVALID_LIMIT');
  }
  reserve(scope: string, requestId: string, amount: number): void {
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(requestId)) deny('INVALID_REQUEST_ID');
    if (!Number.isSafeInteger(amount) || amount < 0) deny('INVALID_RESERVATION');
    if (this.#seen.get(scope)?.has(requestId)) deny('DUPLICATE_REQUEST');
    if ((this.#cooldowns.get(scope) ?? 0) > this.now()) deny('PROVIDER_COOLDOWN');
    const prev = this.#windows.get(scope);
    const window = prev && this.now() - prev.at < 60_000 ? prev : { at: this.now(), count: 0 };
    if (window.count >= this.requestsPerMinute) deny('RATE_LIMITED');
    const total = (this.#spent.get(scope) ?? 0) + amount;
    if (!Number.isSafeInteger(total) || total > this.ceilingMicrousd) deny('BUDGET_EXHAUSTED');
    const seen = this.#seen.get(scope) ?? new Set<string>();
    seen.add(requestId); this.#seen.set(scope, seen);
    this.#spent.set(scope, total); window.count++; this.#windows.set(scope, window);
  }
  settle(scope: string, reserved: number, actual: number): void {
    if (!Number.isSafeInteger(actual) || actual < 0 || actual > reserved) deny('USAGE_EXCEEDS_RESERVATION');
    this.#spent.set(scope, (this.#spent.get(scope) ?? 0) - reserved + actual);
  }
  cooldown(scope: string, retryAfterMs: number): void {
    this.#cooldowns.set(scope, Math.max(this.#cooldowns.get(scope) ?? 0, this.now() + retryAfterMs));
  }
  consumed(scope: string): number { return this.#spent.get(scope) ?? 0; }
}
