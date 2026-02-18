import { runNamedProcessOperation } from "../shared/errors.js";
import { normalizeProcess } from "../shared/formatters.js";
import { jsonSchemaName, NameInputSchema } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcGetProcessTool: ToolSpec = {
  definition: {
    name: "process_compose_get_process",
    description: "Get a single process by name.",
    inputSchema: jsonSchemaName,
  },
  async handle(client, args) {
    const { name } = NameInputSchema.parse(args ?? {});
    return runNamedProcessOperation(client, name, async () => {
      const data = await client.getProcess(name);
      if (data && typeof data === "object") {
        return { process: normalizeProcess(data as Record<string, unknown>), raw: data };
      }
      return { process: data, raw: data };
    });
  },
};
