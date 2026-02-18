import { errorResult } from "../shared/errors.js";
import { jsonSchemaEmptyObject } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcGetProjectStateTool: ToolSpec = {
  definition: {
    name: "process_compose_get_project_state",
    description: "Get project state (/project/state).",
    inputSchema: jsonSchemaEmptyObject,
  },
  async handle(client) {
    try {
      const data = await client.getProjectState();
      return { state: data };
    } catch (error) {
      return errorResult(error);
    }
  },
};
