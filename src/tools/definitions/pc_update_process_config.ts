import { errorResult } from "../shared/errors.js";
import { jsonSchemaProcessConfig, ProcessConfigInputSchema } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcUpdateProcessConfigTool: ToolSpec = {
  definition: {
    name: "pc_update_process_config",
    description: "Update process configuration (/process).",
    inputSchema: jsonSchemaProcessConfig,
  },
  async handle(client, args) {
    const { process } = ProcessConfigInputSchema.parse(args ?? {});
    try {
      const data = await client.updateProcessConfig(process);
      return { ok: true, result: data };
    } catch (error) {
      return errorResult(error);
    }
  },
};
