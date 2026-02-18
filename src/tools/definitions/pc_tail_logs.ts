import { runNamedProcessOperation } from "../shared/errors.js";
import { extractLogText, summarizeLogEvents } from "../shared/formatters.js";
import { jsonSchemaTail, TailLogsSchema } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcTailLogsTool: ToolSpec = {
  definition: {
    name: "pc_tail_logs",
    description: "Fetch recent logs for a process.",
    inputSchema: jsonSchemaTail,
  },
  async handle(client, args) {
    const params = TailLogsSchema.parse(args ?? {});
    return runNamedProcessOperation(client, params.name, async () => {
      const data = await client.tailLogs(params);
      const rawText = extractLogText(data);
      return {
        name: params.name,
        raw: rawText,
        summary: {
          importantEvents: summarizeLogEvents(rawText),
          totalLines: rawText ? rawText.split("\n").length : 0,
        },
      };
    });
  },
};
