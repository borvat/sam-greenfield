import { spawnSync } from 'node:child_process';
import { mkdtemp, chown, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { Pool } from 'pg';

/** Normal real PostgreSQL, fsync enabled, disposable local cluster, no shared DB. */
export async function postgresHarness() {
  const bin = process.env.AI_TEST_POSTGRES_BIN;
  if (!bin) throw Error('AI_TEST_POSTGRES_BIN_REQUIRED');
  if (process.getuid?.() === 0) {
    const mapping = await readFile('/proc/self/uid_map','utf8');
    if (/^\s*0\s+0\s+1\s*$/.test(mapping)) throw Error('BLOCKED_POSTGRES_NONROOT_UID_UNAVAILABLE');
  }
  const root = await mkdtemp(join(tmpdir(), 'sam-ai-postgres-'));
  const uid = process.getuid?.() === 0 ? 65534 : process.getuid?.();
  const gid = process.getuid?.() === 0 ? 65534 : process.getgid?.();
  if (process.getuid?.() === 0) await chown(root, uid!, gid!);
  const socket = createServer(); await new Promise<void>(r => socket.listen(0, '127.0.0.1', r));
  const port = (socket.address() as { port: number }).port;
  await new Promise<void>(r => socket.close(() => r()));
  const run = (name: string, args: string[]) => {
    const r = spawnSync(join(bin, name), args, { uid, gid, encoding: 'utf8', timeout: 30000,
      env: { PATH: process.env.PATH, LANG: 'C' } });
    if (r.status !== 0) throw Error(`POSTGRES_TEST_${name}_FAILED:${(r.stderr || '').slice(0, 500)}`);
    return r.stdout;
  };
  const data = join(root, 'data');
  const stop = () => run('pg_ctl', ['-D', data, '-m', 'immediate', '-w', 'stop']);
  const start = () => run('pg_ctl', ['-D', data, '-l', join(root, 'postgres.log'), '-o',
    `-h 127.0.0.1 -p ${port} -k '' -c fsync=on -c synchronous_commit=on -c full_page_writes=on`, '-w', 'start']);
  try {
    run('initdb', ['-D', data, '-U', 'sam_test', '--auth=trust', '--encoding=UTF8', '--locale=C']);
    start();
    const url = `postgresql://sam_test@127.0.0.1:${port}/postgres`;
    const pool = new Pool({ connectionString: url });
    await pool.query(await readFile(new URL('../../packages/db/src/schema.sql', import.meta.url), 'utf8'));
    return { pool, url, version: (await pool.query('SELECT version() AS v')).rows[0].v,
      async restart() { stop(); start(); },
      async close() { await pool.end(); stop(); await rm(root, { recursive: true, force: true }); } };
  } catch (error) {
    try { stop(); } catch {}
    await rm(root, { recursive: true, force: true }); throw error;
  }
}
