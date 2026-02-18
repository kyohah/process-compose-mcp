import type { PcClient } from "../../pcClient.js";

export type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
};

export type ToolResult = Record<string, unknown>;

export type ToolHandler = (client: PcClient, args: unknown) => Promise<ToolResult>;

export type ToolSpec = {
  definition: ToolDefinition;
  handle: ToolHandler;
};
