import { runNamedProcessOperation } from "../shared/errors.js";
import { jsonSchemaName, NameInputSchema } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcGetProcessInfoTool: ToolSpec = {
  definition: {
    name: "process_compose_get_process_info",
    description: "Get process configuration by name (/process/info/{name}).",
    inputSchema: jsonSchemaName,
  },
  async handle(client, args) {
    const { name } = NameInputSchema.parse(args ?? {});
    return runNamedProcessOperation(client, name, async () => {
      const data = await client.getProcessInfo(name);
      return { processInfo: data };
    });
  },
};
