// Non-secret operator timestamps only. Never derives or renews a window at startup.
function probeWindow(config, env = process.env, now = Date.now()) {
  const a = env.SAM_HERMES_PROBE_ACTIVATED_AT;
  const e = env.SAM_HERMES_PROBE_EXPIRES_AT;
  if ((a !== undefined) !== (e !== undefined)) throw Error('HERMES_PROBE_WINDOW_INVALID');
  const window = {activatedAt: a === undefined ? config.activatedAt : a,
    expiresAt: e === undefined ? config.expiresAt : e};
  const start = Date.parse(window.activatedAt), end = Date.parse(window.expiresAt);
  if (typeof window.activatedAt !== 'string' || typeof window.expiresAt !== 'string' ||
      !Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(now) ||
      start > now || end <= now || end <= start || end - start > 3600000)
    throw Error('HERMES_PROBE_WINDOW_INVALID');
  return Object.freeze(window);
}
function assertProbeRoleDeadline(window, deadline) {
  const end = new Date(deadline).getTime();
  if (deadline == null || !Number.isFinite(end) || Date.parse(window.expiresAt) > end)
    throw Error('HERMES_PROBE_WINDOW_EXCEEDS_ROLE');
}
module.exports = {probeWindow, assertProbeRoleDeadline};
