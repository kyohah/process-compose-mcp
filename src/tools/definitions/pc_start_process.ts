import { runNamedProcessOperation } from "../shared/errors.js";
import { jsonSchemaName, NameInputSchema } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcStartProcessTool: ToolSpec = {
  definition: {
    name: "pc_start_process",
    description: "Start a process by name.",
    inputSchema: jsonSchemaName,
  },
  async handle(client, args) {
    const { name } = NameInputSchema.parse(args ?? {});
    return runNamedProcessOperation(client, name, async () => {
      const data = await client.startProcess(name);
      return { ok: true, result: data };
    });
  },
};
