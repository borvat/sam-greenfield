/**
 * Documented upper bound on prompt tokens, without a tokenizer dependency.
 *
 * 1) The provider tokenizer is byte-level BPE: every token consumes at least one UTF-8
 *    byte of the prompt, so tokens ≤ utf8Bytes(prompt).
 * 2) The request carries exactly one user message, no tools and no system message. The
 *    tokenizer's own chat template (tokenizer_config.json, shipped with the model) emits
 *    for that shape with a generation prompt: bos_token, '<｜User｜>', '<｜Assistant｜>'.
 *    Each is a single added token in tokenizer.json, so the template adds 3 tokens. The
 *    request sets no server-side JSON mode, so no hidden instruction is added.
 *
 * CHAT_OVERHEAD_TOKENS is 64: over 21x those three documented tokens, leaving room for
 * provider-side wrappers we cannot see. The cap and the pre-flight reservation both use
 * tokens ≤ bytes + 64, and the check runs before any request is sent.
 */
export const CHAT_OVERHEAD_TOKENS = 64;
export const MAX_INPUT_TOKENS = Number(process.env.SAM_BRIEFING_MAX_INPUT_TOKENS || 3000);

export function classifyPrompt(prompt: string): {bytes: number; codePoints: number; tokensUpperBound: number; allowed: boolean} {
  const bytes = Buffer.byteLength(prompt, 'utf8');
  const codePoints = [...prompt].length;
  const tokensUpperBound = bytes + CHAT_OVERHEAD_TOKENS;
  return {bytes, codePoints, tokensUpperBound, allowed: tokensUpperBound <= MAX_INPUT_TOKENS};
}
