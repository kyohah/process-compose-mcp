import { extractProcesses } from "../../pcClient.js";
import { errorResult } from "../shared/errors.js";
import { normalizeProcess } from "../shared/formatters.js";
import { jsonSchemaEmptyObject } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcListProcessesTool: ToolSpec = {
  definition: {
    name: "pc_list_processes",
    description: "List all processes and their status from process-compose.",
    inputSchema: jsonSchemaEmptyObject,
  },
  async handle(client) {
    try {
      const data = await client.listProcesses();
      const processes = extractProcesses(data) ?? [];
      const normalized = processes
        .filter((proc): proc is Record<string, unknown> => typeof proc === "object" && proc !== null)
        .map((proc) => normalizeProcess(proc));
      return { processes: normalized, raw: data };
    } catch (error) {
      return errorResult(error);
    }
  },
};
