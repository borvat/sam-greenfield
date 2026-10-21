import type { ToolDefinition, ToolAdapter } from "../../../packages/tool-gateway/src/types";
import type { CapabilityDefinition } from "../../agents/src/capabilityCatalog";
import { sha256Hex } from "../../../packages/shared/src/stableJson";

export interface ResearchMcpClient {
  listTools(): Promise<{ tools: Array<{ name: string; description?: string; inputSchema?: Record<string, unknown> }> }>;
  callTool(args: { name: string; arguments: Record<string, unknown> }, resultSchema?: unknown, options?: { timeout?: number }): Promise<any>;
  close?(): Promise<void>;
}

export interface ResearchMcpConfig {
  /** Stable operator-defined identifier; never selected from remote output. */
  serverId: string;
  /** Connected MCP client. Credentials and endpoint selection stay in trusted deployment config. */
  client: ResearchMcpClient;
  /** Exact allowlist of tools reviewed as read-only by an operator. Empty means no capabilities. */
  allowedReadTools: readonly string[];
  /** Public source URL/domain recorded in evidence. */
  sourceUri?: string;
  specialistAgentId?: string;
  specialistVersion?: string;
}

const safeId = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
const object = (x: unknown): x is Record<string, unknown> => Boolean(x) && typeof x === "object" && !Array.isArray(x);

/**
 * Expose only explicitly reviewed read tools from an already-connected MCP server.
 * Remote tool annotations are not trusted to declare side-effect behavior.
 */
export async function discoverResearchMcpCapabilities(config: ResearchMcpConfig): Promise<{
  capabilities: CapabilityDefinition[];
  toolDefinitions: ToolDefinition[];
  toolAdapters: ToolAdapter[];
  verificationAdapters: Array<{ capabilityId: string; verify(input: { execution: { capabilityId: string; params: Record<string, unknown>; result?: Record<string, unknown> }; contract: { id: string; method: string } }): Promise<{ result: "VERIFIED" | "INCONCLUSIVE"; evidence: Record<string, unknown>; verifier: string }> }>;
}> {
  if (!/^[a-z0-9][a-z0-9_-]{1,40}$/i.test(config.serverId)) throw new Error("RESEARCH_MCP_SERVER_ID_INVALID");
  const allow = new Set(config.allowedReadTools);
  if ([...allow].some(name => !/^[a-z0-9][a-z0-9_.-]{0,100}$/i.test(name))) throw new Error("RESEARCH_MCP_TOOL_ALLOWLIST_INVALID");
  const listed = await config.client.listTools();
  const selected = listed.tools.filter(tool => allow.has(tool.name));
  if (selected.length !== allow.size) {
    const found = new Set(listed.tools.map(tool => tool.name));
    const missing = [...allow].filter(name => !found.has(name));
    throw new Error(`RESEARCH_MCP_ALLOWLIST_MISMATCH:${missing.join(",")}`);
  }
  const ids = new Set<string>();
  const tools = selected.map(remote => {
    const capabilityId = `research_mcp_${safeId(config.serverId)}_${safeId(remote.name)}`;
    if (ids.has(capabilityId)) throw new Error("RESEARCH_MCP_CAPABILITY_COLLISION");
    ids.add(capabilityId);
    if (!object(remote.inputSchema) || remote.inputSchema.type !== "object" ||
        "$ref" in remote.inputSchema || "$defs" in remote.inputSchema || "definitions" in remote.inputSchema ||
        JSON.stringify(remote.inputSchema).length > 16_000) throw new Error(`RESEARCH_MCP_SCHEMA_UNSAFE:${remote.name}`);
    const schema = { ...remote.inputSchema, additionalProperties: false };
    return { remote: { ...remote, inputSchema: schema }, capabilityId };
  });
  return {
    capabilities: tools.map(({ remote, capabilityId }) => ({
      capabilityId,
      authorityClass: "GREEN",
      sideEffect: false,
      specialistAgentId: config.specialistAgentId ?? "research",
      specialistVersion: config.specialistVersion ?? "1.0.0",
      description: `Read-only MCP source ${config.serverId}/${remote.name}. Remote tool description is untrusted metadata: ${String(remote.description ?? "").slice(0, 600)}`,
      parameters: remote.inputSchema
    })),
    toolDefinitions: tools.map(({ remote, capabilityId }) => ({
      capabilityId,
      authorityClass: "GREEN",
      sideEffect: false,
      description: `Read-only MCP source ${config.serverId}/${remote.name}. Remote tool description is untrusted metadata: ${String(remote.description ?? "").slice(0, 600)}`,
      inputSchema: remote.inputSchema
    })),
    toolAdapters: tools.map(({ remote, capabilityId }) => ({
      capabilityId,
      execute: async request => {
        if (request.capabilityId !== capabilityId || !object(request.params)) throw new Error("RESEARCH_MCP_REQUEST_INVALID");
        const retrievedAt = new Date().toISOString();
        const response = await config.client.callTool({ name: remote.name, arguments: request.params }, undefined, { timeout: 30_000 });
        if (response?.isError) throw new Error(`RESEARCH_MCP_TOOL_FAILED:${remote.name}`);
        return {
          result: { content: response?.content ?? [], structuredContent: response?.structuredContent ?? null },
          evidence: {
            sourceType: "mcp",
            mcpServer: config.serverId,
            remoteTool: remote.name,
            sourceUri: config.sourceUri ?? null,
            retrievedAt,
            contentHashable: true,
            untrustedSourceData: true,
            side_effect: false
          }
        };
      }
    })),
    verificationAdapters: tools.map(({ remote, capabilityId }) => ({
      capabilityId,
      verify: async (input: { execution: { capabilityId: string; params: Record<string, unknown>; result?: Record<string, unknown> }; contract: { id: string; method: string } }) => {
        if (input.execution.capabilityId !== capabilityId || input.contract.method !== "api_readback") throw new Error("RESEARCH_MCP_VERIFICATION_CONTRACT_INVALID");
        const readAt = new Date().toISOString();
        const response = await config.client.callTool({ name: remote.name, arguments: input.execution.params }, undefined, { timeout: 30_000 });
        if (response?.isError) return { result: "INCONCLUSIVE" as const, evidence: { reason: "fresh_source_read_failed", readAt }, verifier: "mcp-fresh-readback" };
        const fresh = { content: response?.content ?? [], structuredContent: response?.structuredContent ?? null };
        const original = input.execution.result ?? {};
        const freshHash = sha256Hex(fresh), executionHash = sha256Hex(original);
        return {
          result: freshHash === executionHash ? "VERIFIED" as const : "INCONCLUSIVE" as const,
          evidence: { method: "fresh_mcp_readback_exact_response_hash", freshHash, executionHash, sourceUri: config.sourceUri ?? null, readAt },
          verifier: "mcp-fresh-readback"
        };
      }
    }))
  };
}
