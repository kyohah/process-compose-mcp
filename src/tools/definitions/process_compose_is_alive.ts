import { errorResult } from "../shared/errors.js";
import { jsonSchemaEmptyObject } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcIsAliveTool: ToolSpec = {
  definition: {
    name: "process_compose_is_alive",
    description: "Run process-compose liveness check (/live).",
    inputSchema: jsonSchemaEmptyObject,
  },
  async handle(client) {
    try {
      const data = await client.getLiveStatus();
      return { status: data };
    } catch (error) {
      return errorResult(error);
    }
  },
};
