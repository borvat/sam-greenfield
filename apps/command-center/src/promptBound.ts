/**
 * Documented upper bound on prompt tokens, without a tokenizer dependency.
 *
 * The provider tokenizer is byte-level BPE: every token consumes at least one UTF-8
 * byte of the prompt, so the number of tokens can never exceed the number of bytes.
 * CHAT_OVERHEAD_TOKENS covers the chat template and special tokens the provider adds
 * around our message, which are not part of the string we send.
 *
 * Therefore: tokens ≤ utf8Bytes(prompt) + CHAT_OVERHEAD_TOKENS.
 * The cap is expressed in tokens, and the check happens before any request is sent.
 */
export const CHAT_OVERHEAD_TOKENS = 64;
export const MAX_INPUT_TOKENS = Number(process.env.SAM_BRIEFING_MAX_INPUT_TOKENS || 3000);

export function classifyPrompt(prompt: string): {bytes: number; codePoints: number; tokensUpperBound: number; allowed: boolean} {
  const bytes = Buffer.byteLength(prompt, 'utf8');
  const codePoints = [...prompt].length;
  const tokensUpperBound = bytes + CHAT_OVERHEAD_TOKENS;
  return {bytes, codePoints, tokensUpperBound, allowed: tokensUpperBound <= MAX_INPUT_TOKENS};
}
