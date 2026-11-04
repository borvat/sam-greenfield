/** Prompt-bound checks only; no database, no network, no paid call. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {CHAT_OVERHEAD_TOKENS, MAX_INPUT_TOKENS, classifyPrompt} from '../../apps/command-center/src/promptBound';

const samples: Record<string, string> = {
  arabic: 'اكتب موجزاً تنفيذياً عربياً للمالك من الحقائق المرفقة فقط. الهدف 900008 بانتظار قرارك.',
  emojiFamily: 'قرار عائلي 👨‍👩‍👧‍👦 ووسم 🇸🇦 في النص',
  rareScripts: 'الرمز 𓀀 وحرف 𠜎 مع تشكيل a\u0301 وعلامة ™',
  mixed: 'Goal 900008 · هدف معلّق · 🚦 · «الأدلة» · 42%',
  ascii: 'plain ascii prompt used to size the cap',
};

test('the byte bound dominates the code-point count for every script', () => {
  for (const [name, prompt] of Object.entries(samples)) {
    const r = classifyPrompt(prompt);
    assert.ok(r.bytes >= r.codePoints, `${name}: bytes ${r.bytes} < code points ${r.codePoints}`);
    assert.ok(r.tokensUpperBound >= r.codePoints, `${name}: bound below code points`);
    assert.equal(r.tokensUpperBound, r.bytes + CHAT_OVERHEAD_TOKENS, `${name}: overhead not applied`);
  }
});

test('multi-byte scripts need more bytes than characters, so the cap is not a character count', () => {
  const arabic = classifyPrompt(samples.arabic);
  const ascii = classifyPrompt(samples.ascii);
  assert.ok(arabic.bytes > arabic.codePoints * 1.5, 'arabic should be ~2 bytes per character');
  assert.equal(ascii.bytes, ascii.codePoints, 'ascii stays one byte per character');
});

test('a prompt over the cap is rejected, a prompt at the cap is accepted', () => {
  const atCap = classifyPrompt('x'.repeat(MAX_INPUT_TOKENS - CHAT_OVERHEAD_TOKENS));
  assert.equal(atCap.tokensUpperBound, MAX_INPUT_TOKENS);
  assert.equal(atCap.allowed, true);

  const overCap = classifyPrompt('x'.repeat(MAX_INPUT_TOKENS - CHAT_OVERHEAD_TOKENS + 1));
  assert.equal(overCap.tokensUpperBound, MAX_INPUT_TOKENS + 1);
  assert.equal(overCap.allowed, false);

  // 'هدف ' is 7 UTF-8 bytes, so this repeats past the cap in bytes.
  const arabicOver = classifyPrompt('هدف '.repeat(Math.ceil(MAX_INPUT_TOKENS / 7) + 5));
  assert.equal(arabicOver.allowed, false);
});

test('emoji and rare characters are counted by their bytes, not by their glyph count', () => {
  const family = classifyPrompt('👨‍👩‍👧‍👦');
  assert.equal(family.codePoints, 7);
  assert.ok(family.bytes >= 25, `expected the ZWJ sequence to cost bytes, got ${family.bytes}`);

  const rare = classifyPrompt('𓀀');
  assert.equal(rare.codePoints, 1);
  assert.equal(rare.bytes, 4);
});

test('the measured task name has the same length as a real call task', async () => {
  const {randomUUID} = await import('node:crypto');
  const measured = `executive_briefing:${'00000000-0000-4000-8000-000000000000'}:2`;
  const real = `executive_briefing:${randomUUID()}:2`;
  assert.equal(Buffer.byteLength(measured, 'utf8'), Buffer.byteLength(real, 'utf8'));
});
