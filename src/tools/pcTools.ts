import { ZodError } from "zod";
import type { PcClient } from "../pcClient.js";
import { toolSpecs } from "./definitions/index.js";
import { errorResult, validationErrorResult } from "./shared/errors.js";
import type { ToolResult } from "./shared/types.js";

export const toolDefinitions = toolSpecs.map((tool) => tool.definition);

const handlerMap = new Map(toolSpecs.map((tool) => [tool.definition.name, tool.handle]));

export async function handleToolCall(client: PcClient, toolName: string, args: unknown): Promise<ToolResult> {
  try {
    const handler = handlerMap.get(toolName);
    if (!handler) {
      return { error: { message: `Unknown tool: ${toolName}` } };
    }

    return await handler(client, args ?? {});
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResult(error);
    }

    return errorResult(error);
  }
}
