import { errorResult } from "../shared/errors.js";
import { jsonSchemaLogsStream, LogsStreamSchema } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcLogsStreamWsTool: ToolSpec = {
  definition: {
    name: "process_compose_logs_stream_ws",
    description:
      "Call websocket log stream endpoint for process names[] (best for live follow, not deterministic snapshots).",
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
        note: "This endpoint is websocket-based. Use process_compose_get_process_logs for deterministic snapshots.",
      };
    } catch (error) {
      return errorResult(error);
    }
  },
};
