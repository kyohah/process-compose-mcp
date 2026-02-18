import { errorResult } from "../shared/errors.js";
import { jsonSchemaEmptyObject } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcUpdateProjectTool: ToolSpec = {
  definition: {
    name: "pc_update_project",
    description: "Update running project (/project).",
    inputSchema: jsonSchemaEmptyObject,
  },
  async handle(client) {
    try {
      const data = await client.updateProject();
      return { ok: true, result: data };
    } catch (error) {
      return errorResult(error);
    }
  },
};
