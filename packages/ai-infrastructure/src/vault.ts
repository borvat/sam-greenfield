import { deny, identifier, type Environment } from './security';

export interface AiSecret { apiKey: string; enabled: boolean; }
/** Server-only dependency. Not an agent-facing raw-secret API. */
export class VaultAiSecrets {
  #base: string;
  #token: string;
  #project: string;
  #environment: Environment;
  #mount: string;
  constructor(options: { address: string; token: string; project: string;
    environment: Environment; mount?: string; allowLoopbackTest?: boolean }) {
    let url: URL;
    try { url = new URL(options.address); } catch { deny('VAULT_ADDRESS_REJECTED'); }
    const loopback = options.allowLoopbackTest && options.environment === 'test' &&
      ['127.0.0.1', '[::1]'].includes(url.hostname) && url.protocol === 'http:';
    if ((!loopback && url.protocol !== 'https:') || url.username || url.password ||
        url.search || url.hash || url.pathname !== '/') deny('VAULT_ADDRESS_REJECTED');
    if (!options.token || /[\r\n]/.test(options.token)) deny('VAULT_TOKEN_REQUIRED');
    this.#base = url.origin; this.#token = options.token;
    this.#project = identifier(options.project); this.#environment = options.environment;
    if (!['test', 'production'].includes(this.#environment)) deny('INVALID_ENVIRONMENT');
    this.#mount = identifier(options.mount ?? 'surooh-ai');
  }
  async #request(path: string, method = 'GET', body?: unknown): Promise<any> {
    try {
      const response = await fetch(`${this.#base}/v1/${this.#mount}/${path}`, {
        method, headers: { 'X-Vault-Token': this.#token, 'content-type': 'application/json' },
        redirect: 'error', signal: AbortSignal.timeout(5000),
        ...(body === undefined ? {} : { body: JSON.stringify(body) })
      });
      if (!response.ok) deny('VAULT_ACCESS_REJECTED');
      if (response.status === 204) return {};
      return await response.json();
    } catch { deny('VAULT_UNAVAILABLE'); }
  }
  #path(provider: string): string {
    return `data/${this.#environment}/${this.#project}/${identifier(provider)}`;
  }
  async use(provider: string, operation: (key: string) => Promise<unknown>): Promise<unknown> {
    const reply = await this.#request(this.#path(provider));
    const record = reply?.data?.data;
    if (record?.enabled !== true || typeof record.apiKey !== 'string' ||
        record.apiKey.length < 8 || record.apiKey.length > 4096 || /[\r\n]/.test(record.apiKey)) deny('SECRET_DISABLED');
    // No key cache: rotation/deletion is effective for the next dispatch.
    return operation(record.apiKey);
  }
  /** Admin-only instance must carry a separate Vault writer token. CAS is mandatory.
   * Vault audit device supplies durable administrative audit, not this class.
   */
  async rotate(provider: string, secret: AiSecret, expectedVersion: number): Promise<number> {
    if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 0 ||
        typeof secret.enabled !== 'boolean' || typeof secret.apiKey !== 'string' ||
        secret.apiKey.length < 8 || secret.apiKey.length > 4096 || /[\r\n]/.test(secret.apiKey)) deny('INVALID_SECRET');
    const reply = await this.#request(this.#path(provider), 'POST', {
      options: { cas: expectedVersion }, data: { apiKey: secret.apiKey, enabled: secret.enabled }
    });
    return reply.data.version;
  }
}

/** A credential-isolated read policy. No list, writer, identity, sys or other domain access. */
export function aiReaderPolicy(project: string, environment: Environment, providers: string[]): string {
  identifier(project);
  if (!['test', 'production'].includes(environment) || !providers.length) deny('INVALID_POLICY');
  return providers.map(p => `path "surooh-ai/data/${environment}/${project}/${identifier(p)}" { capabilities = ["read"] }`).join('\n') + '\n';
}
