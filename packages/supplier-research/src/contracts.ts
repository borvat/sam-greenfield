/** Read-only supplier research contracts. Web content is untrusted. */
export type SupplierField = "company" | "wattage" | "price" | "currency" | "moq" | "lead_time" | "contact" | "supplier_type";
export interface SupplierClaim { field: SupplierField; value: string | null; evidenceUrl: string; observedAt: string; status: "UNVERIFIED"; }
export interface SupplierResearchResult { sourceUrl: string; observedAt: string; claims: SupplierClaim[]; status: "EXTRACTED_UNVERIFIED"; }
export interface SupplierExtractor { extract(input: {url: string; productQuery: string}): Promise<SupplierResearchResult>; }
export function normalizeUnverifiedResult(sourceUrl: string, observedAt: string, fields: Partial<Record<SupplierField,string>>): SupplierResearchResult {
  const claims = (Object.keys(fields) as SupplierField[]).map(field => ({field, value: fields[field] ?? null, evidenceUrl: sourceUrl, observedAt, status: "UNVERIFIED" as const}));
  return {sourceUrl, observedAt, claims, status: "EXTRACTED_UNVERIFIED"};
}
