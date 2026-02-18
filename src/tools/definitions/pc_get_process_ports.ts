import { runNamedProcessOperation } from "../shared/errors.js";
import { jsonSchemaName, NameInputSchema } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcGetProcessPortsTool: ToolSpec = {
  definition: {
    name: "pc_get_process_ports",
    description: "Get open ports by process name.",
    inputSchema: jsonSchemaName,
  },
  async handle(client, args) {
    const { name } = NameInputSchema.parse(args ?? {});
    return runNamedProcessOperation(client, name, async () => {
      const data = await client.getProcessPorts(name);
      return { name, ports: data };
    });
  },
};
