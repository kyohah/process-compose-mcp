import { errorResult } from "../shared/errors.js";
import { jsonSchemaEmptyObject } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcGetDependencyGraphTool: ToolSpec = {
  definition: {
    name: "pc_get_dependency_graph",
    description: "Get process dependency graph with readiness/status information.",
    inputSchema: jsonSchemaEmptyObject,
  },
  async handle(client) {
    try {
      const data = await client.getDependencyGraph();
      return { graph: data };
    } catch (error) {
      return errorResult(error);
    }
  },
};
