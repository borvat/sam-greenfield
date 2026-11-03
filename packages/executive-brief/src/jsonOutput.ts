/**
 * The model is asked for JSON in the prompt; without a server-side JSON mode the answer
 * may still arrive inside a markdown fence, so the fence is stripped before parsing.
 * Anything that is not a JSON object is returned as null and rejected by the validator.
 */
export function parseModelJson(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw;
  let text = raw.trim();
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) text = fence[1].trim();
  if (!text.startsWith('{')) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    text = text.slice(start, end + 1);
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
