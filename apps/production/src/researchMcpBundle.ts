import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { ProductionBundle } from "./types";
import { discoverResearchMcpCapabilities } from "../../tools/src/mcpResearchAdapter";

/** Optional generic read-only research MCP connector. Disabled unless explicitly configured. */
export async function withResearchMcpFromEnv(bundle: ProductionBundle, env: NodeJS.ProcessEnv = process.env): Promise<ProductionBundle> {
  const endpoint = env.SAM_RESEARCH_MCP_URL?.trim();
  const serverId = env.SAM_RESEARCH_MCP_SERVER_ID?.trim();
  const allowedReadTools = (env.SAM_RESEARCH_MCP_READ_TOOLS ?? "").split(",").map(x => x.trim()).filter(Boolean);
  const token = env.SAM_RESEARCH_MCP_TOKEN?.trim();
  if (!endpoint && !serverId && !allowedReadTools.length && !token) return bundle;
  if (!endpoint || !serverId || !allowedReadTools.length) throw new Error("Research MCP requires URL, server ID and exact read-tool allowlist");
  const url = new URL(endpoint);
  const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if (url.protocol !== "https:" && !(local && url.protocol === "http:")) throw new Error("Research MCP endpoint must use HTTPS (HTTP is allowed only on loopback)");
  if (url.username || url.password || url.hash) throw new Error("Research MCP URL must not contain credentials or fragment");

  const client = new Client({ name: "sam-autonomous-research", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(url, token ? { requestInit: { headers: { Authorization: `Bearer ${token}` } } } : undefined);
  await client.connect(transport);
  try {
    const discovered = await discoverResearchMcpCapabilities({
      serverId,
      client,
      allowedReadTools,
      sourceUri: url.origin
    });
    return {
      ...bundle,
      capabilities: [...bundle.capabilities, ...discovered.capabilities],
      toolDefinitions: [...bundle.toolDefinitions, ...discovered.toolDefinitions],
      toolAdapters: [...bundle.toolAdapters, ...discovered.toolAdapters],
      verificationAdapters: [...(bundle.verificationAdapters ?? []), ...discovered.verificationAdapters]
    };
  } catch (error) {
    await client.close();
    throw error;
  }
}
