import { runNamedProcessOperation } from "../shared/errors.js";
import { jsonSchemaScaleProcess, ScaleProcessSchema } from "../shared/schemas.js";
import type { ToolSpec } from "../shared/types.js";

export const pcScaleProcessTool: ToolSpec = {
  definition: {
    name: "pc_scale_process",
    description: "Scale a process to the requested replica count.",
    inputSchema: jsonSchemaScaleProcess,
  },
  async handle(client, args) {
    const { name, scale } = ScaleProcessSchema.parse(args ?? {});
    return runNamedProcessOperation(client, name, async () => {
      const data = await client.scaleProcess(name, scale);
      return { ok: true, name, scale, result: data };
    });
  },
};
