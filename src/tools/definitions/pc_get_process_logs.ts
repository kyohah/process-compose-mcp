import { runNamedProcessOperation } from "../shared/errors.js";
import { extractLogText, summarizeLogEvents } from "../shared/formatters.js";
import { GetProcessLogsSchema, jsonSchemaGetProcessLogs } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcGetProcessLogsTool: ToolSpec = {
  definition: {
    name: "pc_get_process_logs",
    description: "Fetch process logs with explicit endOffset and limit.",
    inputSchema: jsonSchemaGetProcessLogs,
  },
  async handle(client, args) {
    const params = GetProcessLogsSchema.parse(args ?? {});
    const endOffset = params.endOffset ?? 0;
    const limit = params.limit ?? 200;

    return runNamedProcessOperation(client, params.name, async () => {
      const data = await client.getProcessLogs({ name: params.name, endOffset, limit });
      const rawText = extractLogText(data);
      return {
        name: params.name,
        endOffset,
        limit,
        raw: rawText,
        summary: {
          importantEvents: summarizeLogEvents(rawText),
          totalLines: rawText ? rawText.split("\n").length : 0,
        },
      };
    });
  },
};
