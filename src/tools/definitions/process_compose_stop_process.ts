import { runNamedProcessOperation } from "../shared/errors.js";
import { jsonSchemaName, NameInputSchema } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcStopProcessTool: ToolSpec = {
  definition: {
    name: "process_compose_stop_process",
    description: "Stop a process by name (requires name).",
    inputSchema: jsonSchemaName,
  },
  async handle(client, args) {
    const { name } = NameInputSchema.parse(args ?? {});
    return runNamedProcessOperation(client, name, async () => {
      const data = await client.stopProcess(name);
      return { ok: true, result: data };
    });
  },
};
