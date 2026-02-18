import { errorResult } from "../shared/errors.js";
import { jsonSchemaEmptyObject } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcReloadProjectTool: ToolSpec = {
  definition: {
    name: "pc_reload_project",
    description: "Reload project configuration (/project/configuration).",
    inputSchema: jsonSchemaEmptyObject,
  },
  async handle(client) {
    try {
      const data = await client.reloadProject();
      return { ok: true, result: data };
    } catch (error) {
      return errorResult(error);
    }
  },
};
