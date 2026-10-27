import { createHash } from "node:crypto";

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    // A normal object treats __proto__ as a setter and silently omits that
    // JSON key. A null-prototype accumulator preserves every own key in hashes
    // and signatures without mutating the accumulator's prototype.
    return Object.keys(obj).sort().reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = normalize(obj[key]);
      return acc;
    }, Object.create(null) as Record<string, unknown>);
  }
  return value;
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(normalize(value));
}

export function sha256Hex(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}
