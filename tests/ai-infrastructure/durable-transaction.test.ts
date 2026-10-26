import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import type { Pool } from 'pg';
import { PostgresModelLedger } from '../../packages/ai-infrastructure/src/durableLedger';
import { syntheticSamIdentity } from './durableFixtures';

// Driver fault doubles protect the retry boundary. Real PostgreSQL evidence is
// in durable-postgres.test.ts; these cases do not claim engine verification.
class DriverClient extends EventEmitter {
  statements: string[] = [];
  releases: (Error | undefined)[] = [];
  constructor(private readonly failure?: 'begin' | 'commit') { super(); }
  async query(sql: string) {
    this.statements.push(sql);
    if (sql === 'BEGIN' && this.failure === 'begin') throw Error('SYNTHETIC_STALE_SOCKET');
    if (sql === 'COMMIT' && this.failure === 'commit') {
      const error = Error('SYNTHETIC_COMMIT_ACK_LOST');
      this.emit('error', error);
      throw error;
    }
    if (sql.includes('FROM sam_ai_service_grants')) return { rowCount: 1, rows: [{ environment: 'test' }] };
    return { rowCount: 0, rows: [] };
  }
  release(error?: Error) { this.releases.push(error); }
}
function driverPool(clients: DriverClient[], idleCount: number) {
  let connects = 0;
  const pool = { idleCount, async connect() {
    const client = clients[connects++];
    assert.ok(client, 'transaction must not request an unauthorized extra checkout');
    return client;
  } } as unknown as Pool;
  return { pool, connects: () => connects };
}
test('driver faults: drain existing stale idle clients before running the transaction body once', async () => {
  const clients = [new DriverClient('begin'), new DriverClient('begin'), new DriverClient()];
  const driver = driverPool(clients, 2), s = syntheticSamIdentity();
  await new PostgresModelLedger(driver.pool).authorize({ identity: s.identity, context: {} as any });
  assert.equal(driver.connects(), 3);
  assert.deepEqual(clients.slice(0, 2).map(c => c.statements), [['BEGIN'], ['BEGIN']]);
  assert.ok(clients[0].releases[0] instanceof Error); assert.ok(clients[1].releases[0] instanceof Error);
  assert.equal(clients[2].statements.filter(sql => sql.includes('FROM sam_ai_service_grants')).length, 1);
  assert.equal(clients[2].releases[0], undefined);
});
test('driver faults: a lost COMMIT acknowledgement discards the connection without replaying the transaction', async () => {
  const client = new DriverClient('commit'), driver = driverPool([client], 2), s = syntheticSamIdentity();
  await assert.rejects(new PostgresModelLedger(driver.pool).authorize({ identity: s.identity, context: {} as any }), /AI_LEDGER_UNAVAILABLE/);
  assert.equal(driver.connects(), 1);
  assert.equal(client.statements.filter(sql => sql.includes('FROM sam_ai_service_grants')).length, 1);
  assert.equal(client.statements.filter(sql => sql === 'COMMIT').length, 1);
  assert.ok(client.releases[0] instanceof Error);
});
