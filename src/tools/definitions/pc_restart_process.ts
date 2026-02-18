import { runNamedProcessOperation } from "../shared/errors.js";
import { jsonSchemaName, NameInputSchema } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcRestartProcessTool: ToolSpec = {
  definition: {
    name: "pc_restart_process",
    description: "Restart a process by name.",
    inputSchema: jsonSchemaName,
  },
  async handle(client, args) {
    const { name } = NameInputSchema.parse(args ?? {});
    return runNamedProcessOperation(client, name, async () => {
      const data = await client.restartProcess(name);
      return { ok: true, result: data };
    });
  },
};
