const {test}=require('node:test');
const assert=require('node:assert/strict');
const {probeWindow,assertProbeRoleDeadline}=require('../../packages/hermes/src/probeWindow.cjs');
const start='2026-10-26T00:00:00.000Z',end='2026-10-26T01:00:00.000Z';
const now=Date.parse(start)+1000;
const config={activatedAt:start,expiresAt:end,apiKey:'synthetic-secret',effectiveTools:[]};
const env={SAM_HERMES_PROBE_ACTIVATED_AT:start,SAM_HERMES_PROBE_EXPIRES_AT:end};
test('non-secret timestamps replace stale secret timestamps without mutating configuration',()=>{
  const stale={...config,activatedAt:'2020-01-01T00:00:00Z',expiresAt:'2020-01-01T01:00:00Z'};
  const before=JSON.stringify(stale);const window=probeWindow(stale,env,now);
  assert.deepEqual(window,{activatedAt:start,expiresAt:end});assert.equal(JSON.stringify(stale),before);
  assert(!JSON.stringify(window).includes('synthetic-secret'));assert(Object.isFrozen(window));
});
test('legacy explicit timestamps still require a live bounded window',()=>{
  assert.deepEqual(probeWindow(config,{},now),{activatedAt:start,expiresAt:end});
  assert.throws(()=>probeWindow(config,{},Date.parse(end)),/WINDOW_INVALID/);
});
test('partial or malformed override fails closed instead of falling back',()=>{
  for(const changes of [{SAM_HERMES_PROBE_ACTIVATED_AT:start},{SAM_HERMES_PROBE_EXPIRES_AT:end},
    {...env,SAM_HERMES_PROBE_ACTIVATED_AT:''},{...env,SAM_HERMES_PROBE_EXPIRES_AT:'invalid'},
    {...env,SAM_HERMES_PROBE_ACTIVATED_AT:'invalid'}])
    assert.throws(()=>probeWindow(config,changes,now),/WINDOW_INVALID/);
});
test('future, reversed, expired, zero-length and over-hour windows are refused',()=>{
  for(const [a,e] of [[end,'2026-10-26T02:00:00Z'],[end,start],[start,start],
    ['2026-10-25T22:00:00Z','2026-10-25T23:00:00Z'],[start,'2026-10-26T01:00:00.001Z']])
    assert.throws(()=>probeWindow({activatedAt:a,expiresAt:e},{},now),/WINDOW_INVALID/);
});
test('restart keeps the exact deadline and cannot reopen an expired window',()=>{
  assert.deepEqual(probeWindow(config,env,now),probeWindow(config,env,now+10000));
  assert.throws(()=>probeWindow(config,env,Date.parse(end)),/WINDOW_INVALID/);
});
test('probe cannot exceed restricted PostgreSQL role deadline or use unlimited role',()=>{
  const w=probeWindow(config,env,now);assertProbeRoleDeadline(w,end);
  for(const d of [null,undefined,'infinity','invalid',start])
    assert.throws(()=>assertProbeRoleDeadline(w,d),/WINDOW_EXCEEDS_ROLE/);
});
