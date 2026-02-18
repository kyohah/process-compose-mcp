import { errorResult } from "../shared/errors.js";
import { jsonSchemaEmptyObject } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcGetProjectNameTool: ToolSpec = {
  definition: {
    name: "process_compose_get_project_name",
    description: "Get project name (/project/name).",
    inputSchema: jsonSchemaEmptyObject,
  },
  async handle(client) {
    try {
      const data = await client.getProjectName();
      return { project: data };
    } catch (error) {
      return errorResult(error);
    }
  },
};
