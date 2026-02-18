import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { PcClient } from "./pcClient.js";
import { handleToolCall, toolDefinitions } from "./tools/pcTools.js";

const SERVER_NAME = "process-compose-mcp";
const SERVER_VERSION = "0.1.0";

async function start(): Promise<void> {
  let client: PcClient;
  try {
    client = await PcClient.createFromEnv();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[${SERVER_NAME}] Startup failed: process-compose API initialization failed.\n${message}`);
    process.exit(1);
    return;
  }

  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: toolDefinitions };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    let result: Record<string, unknown>;
    try {
      const toolName = request.params.name;
      const args = request.params.arguments ?? {};
      result = await handleToolCall(client, toolName, args);
    } catch (error) {
      result = {
        error: {
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
    const isError = typeof result === "object" && result !== null && "error" in result;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
      isError,
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

start().catch((error) => {
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  console.error(`[${SERVER_NAME}] Unhandled startup error:\n${message}`);
  process.exit(1);
});
