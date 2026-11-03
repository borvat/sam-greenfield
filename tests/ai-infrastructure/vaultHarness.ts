import { spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdtemp, writeFile, rm, readdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** Disposable normal Vault, not dev mode. No auth material is printed or committed. */
export async function vaultHarness() {
  const binary = process.env.AI_TEST_VAULT_BIN;
  if (!binary) throw Error('AI_TEST_VAULT_BIN_REQUIRED');
  const root = await mkdtemp(join(tmpdir(), 'surooh-vault-test-'));
  const socket = createServer(); await new Promise<void>(r => socket.listen(0, '127.0.0.1', r));
  const port = (socket.address() as { port: number }).port;
  await new Promise<void>(r => socket.close(() => r()));
  const address = `http://127.0.0.1:${port}`;
  const config = join(root, 'vault.hcl');
  await writeFile(config, `disable_mlock = true\nui = false\napi_addr = "${address}"\nstorage "file" { path = "${root}/data" }\nlistener "tcp" { address = "127.0.0.1:${port}"\n tls_disable = true }\n`, { mode: 0o600 });
  let child: ChildProcess | undefined;
  async function start() {
    child = spawn(binary!, ['server', '-config', config], { stdio: 'ignore', env: { PATH: process.env.PATH, HOME: root } });
    let ready = false;
    for (let i = 0; i < 100; i++) {
      try { await fetch(`${address}/v1/sys/health`); ready = true; break; } catch {}
      await new Promise(r => setTimeout(r, 50));
    }
    if (!ready) throw Error('VAULT_TEST_START_FAILED');
  }
  async function stop() {
    if (child && child.exitCode === null) {
      const done = new Promise<void>(r => child!.once('exit', () => r())); child.kill('SIGTERM'); await done;
    }
  }
  let rootToken = '', unseal = '';
  async function api(path: string, method = 'GET', body?: unknown, token = rootToken) {
    const r = await fetch(`${address}/v1/${path}`, { method, headers: { 'X-Vault-Token': token, 'content-type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const data = r.status === 204 ? {} : await r.json();
    if (!r.ok) throw Error(`VAULT_TEST_HTTP_${r.status}`);
    return data as any;
  }
  try {
    await start();
    const initialized = await api('sys/init', 'PUT', { secret_shares: 1, secret_threshold: 1 });
    rootToken = initialized.root_token; unseal = initialized.keys_base64[0];
    await api('sys/unseal', 'PUT', { key: unseal });
    await api('sys/mounts/surooh-ai', 'POST', { type: 'kv', options: { version: '2' } });
    await api('sys/audit/file', 'PUT', { type: 'file', options: { file_path: join(root, 'audit.jsonl') } });
    return {
      address, rootToken,
      api,
      async reader(policy: string) {
        const name = `reader-${Math.random().toString(36).slice(2)}`;
        await api(`sys/policies/acl/${name}`, 'PUT', { policy });
        return (await api('auth/token/create', 'POST', { policies: [name], no_default_policy: true, ttl: '5m' })).auth.client_token as string;
      },
      async restart() { await stop(); await start(); await api('sys/unseal', 'PUT', { key: unseal }); },
      async containsPlaintext(secret: string) {
        async function walk(dir: string): Promise<boolean> {
          for (const entry of await readdir(dir, { withFileTypes: true })) {
            const path = join(dir, entry.name);
            if (entry.isDirectory() ? await walk(path) : (await readFile(path)).includes(Buffer.from(secret))) return true;
          }
          return false;
        }
        return walk(join(root, 'data'));
      },
      async auditText() { return readFile(join(root, 'audit.jsonl'), 'utf8'); },
      async close() { await stop(); rootToken = ''; unseal = ''; await rm(root, { recursive: true, force: true }); }
    };
  } catch (e) { await stop(); await rm(root, { recursive: true, force: true }); throw e; }
}
