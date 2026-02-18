import { errorResult } from "../shared/errors.js";
import { jsonSchemaShutdownProject, ShutdownProjectSchema } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcShutdownProjectTool: ToolSpec = {
  definition: {
    name: "process_compose_shutdown_project",
    description: "Stop the entire project (/project/stop). Requires confirm=true.",
    inputSchema: jsonSchemaShutdownProject,
  },
  async handle(client, args) {
    ShutdownProjectSchema.parse(args ?? {});

    try {
      const data = await client.shutDownProject();
      return { ok: true, result: data };
    } catch (error) {
      return errorResult(error);
    }
  },
};
