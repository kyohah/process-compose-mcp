import { runNamedProcessOperation } from "../shared/errors.js";
import { jsonSchemaName, NameInputSchema } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcTruncateProcessLogsTool: ToolSpec = {
  definition: {
    name: "process_compose_truncate_process_logs",
    description: "Truncate logs for a process.",
    inputSchema: jsonSchemaName,
  },
  async handle(client, args) {
    const { name } = NameInputSchema.parse(args ?? {});
    return runNamedProcessOperation(client, name, async () => {
      const data = await client.truncateProcessLogs(name);
      return { ok: true, name, result: data };
    });
  },
};
