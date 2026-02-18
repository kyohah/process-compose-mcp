import { errorResult } from "../shared/errors.js";
import { summarizeHealthFromRaw } from "../shared/formatters.js";
import { jsonSchemaEmptyObject } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcHealthSummaryTool: ToolSpec = {
  definition: {
    name: "process_compose_health_summary",
    description: "Summarize health status for process-compose and its processes.",
    inputSchema: jsonSchemaEmptyObject,
  },
  async handle(client) {
    try {
      const { data, usedHealthEndpoint } = await client.healthSummary();
      const summary = summarizeHealthFromRaw(data);
      return {
        usedHealthEndpoint,
        summary: summary.summary,
        anomalies: summary.anomalies,
      };
    } catch (error) {
      return errorResult(error);
    }
  },
};
