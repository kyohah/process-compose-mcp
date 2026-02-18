import { errorResult } from "../shared/errors.js";
import { jsonSchemaStopProcesses, StopProcessesSchema } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcStopProcessesTool: ToolSpec = {
  definition: {
    name: "process_compose_stop_processes",
    description: "Bulk stop multiple processes. Requires confirm=true.",
    inputSchema: jsonSchemaStopProcesses,
  },
  async handle(client, args) {
    const { names } = StopProcessesSchema.parse(args ?? {});
    try {
      const data = await client.stopProcesses(names);
      return { ok: true, names, result: data };
    } catch (error) {
      return errorResult(error);
    }
  },
};
