import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {withExecutiveBrief,EXECUTIVE_BRIEF_CAPABILITY} from '../../apps/production/src/executiveBriefCapability';
import {Client} from 'pg';

const ENTITY = process.env.SAM_TEST_ENTITY ?? '47a33109-ae57-4ff1-a935-0412c38c14da';
const db = () => new Client({connectionString: process.env.DATABASE_URL});

async function seed(callId: string, factsHash: string, opts: {success?: boolean; tokens?: number; entity?: string; audit?: boolean} = {}) {
  const c = db();
  await c.connect();
  await c.query('delete from model_calls where task like $1', [`executive_briefing:${callId}:%`]);
  await c.query(
    `insert into model_calls(task,provider,model,tokens,cost,latency_ms,retry_count,success,verification_result,data_classification,legal_entity_id)
     values($1,'deepseek','deepseek-flash',$2,0.0006,3000,0,$3,'VERIFIED','INTERNAL',$4)`,
    [`executive_briefing:${callId}:1`, opts.tokens ?? 975, opts.success ?? true, opts.entity ?? ENTITY],
  );
  if (opts.audit !== false) {
    await c.query(
      `insert into audit_log(actor,action,entity_type,entity_id,after_ref,source,result,timestamp)
       values('command-center','EXECUTIVE_BRIEF_V1','legal_entity',$1,$2::jsonb,'command-center','MODEL',now())`,
      [ENTITY, JSON.stringify({lang: 'ar', receipt: {callId, factsHash}})],
    );
  }
  await c.end();
}

async function cleanup(callId: string) {
  const c = db();
  await c.connect();
  await c.query('delete from model_calls where task like $1', [`executive_briefing:${callId}:%`]);
  await c.end();
}

function verifier() {
  return withExecutiveBrief({capabilities: [], toolDefinitions: [], toolAdapters: []} as any).verificationAdapters![0];
}

function call(callId: string, factsHash: string) {
  return {
    execution: {id: 'e1', capabilityId: EXECUTIVE_BRIEF_CAPABILITY, params: {}, result: {mode: 'MODEL'}, evidence: {callId, attribution: 'VERIFIED', factsHash}, operationKeyRef: null},
    contract: {id: 'executive_brief', method: 'db_query', requiredEvidenceFields: {}, independentQueryTemplate: {}},
  } as any;
}

test('a traced, billed, same-tenant call with a stored facts hash verifies', async () => {
  const callId = randomUUID();
  const hash = 'aa11';
  await seed(callId, hash);
  try {
    const out = await verifier().verify(call(callId, hash));
    assert.equal(out.result, 'VERIFIED');
    assert.equal((out.evidence as any).tokens, 975);
  } finally {
    await cleanup(callId);
  }
});

test('a call recorded for another company never verifies', async () => {
  const callId = randomUUID();
  await seed(callId, 'bb22', {entity: '99999999-9999-4999-8999-999999999999'});
  try {
    const out = await verifier().verify(call(callId, 'bb22'));
    assert.equal(out.result, 'FAILED');
    assert.equal((out.evidence as any).reason, 'CALL_FOREIGN_TENANT');
  } finally {
    await cleanup(callId);
  }
});

test('a failed or unbilled call never verifies', async () => {
  const callId = randomUUID();
  await seed(callId, 'cc33', {success: false});
  try {
    const out = await verifier().verify(call(callId, 'cc33'));
    assert.equal(out.result, 'FAILED');
    assert.equal((out.evidence as any).reason, 'CALL_NOT_SUCCESSFUL');
  } finally {
    await cleanup(callId);
  }
});

test('a facts hash that no stored brief carries never verifies', async () => {
  const callId = randomUUID();
  await seed(callId, 'dd44');
  try {
    const out = await verifier().verify(call(callId, 'deadbeef'));
    assert.equal(out.result, 'FAILED');
    assert.equal((out.evidence as any).reason, 'FACTS_HASH_NOT_STORED');
  } finally {
    await cleanup(callId);
  }
});

test('an unknown trace id never verifies', async () => {
  const out = await verifier().verify(call(randomUUID(), 'ee55'));
  assert.equal(out.result, 'FAILED');
  assert.equal((out.evidence as any).reason, 'CALL_NOT_FOUND');
});
