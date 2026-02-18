import { errorResult } from "../shared/errors.js";
import { jsonSchemaLogsStream, LogsStreamSchema } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcLogsStreamWsTool: ToolSpec = {
  definition: {
    name: "pc_logs_stream_ws",
    description: "Call the websocket log stream endpoint (/process/logs/ws).",
    inputSchema: jsonSchemaLogsStream,
  },
  async handle(client, args) {
    const params = LogsStreamSchema.parse(args ?? {});
    const offset = params.offset ?? 0;

    try {
      const data = await client.logsStream({ names: params.names, offset, follow: params.follow });
      return {
        requested: {
          names: params.names,
          offset,
          follow: params.follow ?? false,
        },
        result: data,
        note: "This endpoint is websocket-based. Use pc_get_process_logs for deterministic snapshots.",
      };
    } catch (error) {
      return errorResult(error);
    }
  },
};
