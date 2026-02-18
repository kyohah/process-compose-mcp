import type { ZodError } from "zod";
import { extractProcessNames, PcApiError, type PcClient } from "../../pcClient.js";
import type { ToolResult } from "./types.js";

export type ErrorDetails = {
  name?: string;
  suggestions?: string[];
};

export function errorResult(error: unknown, details?: ErrorDetails): ToolResult {
  if (error instanceof PcApiError) {
    return {
      error: {
        message: error.message,
        operationId: error.operationId,
        path: error.path,
        method: error.method,
        status: error.status,
        response: error.response,
        name: details?.name ?? null,
        suggestions: details?.suggestions ?? [],
      },
    };
  }

  return {
    error: {
      message: error instanceof Error ? error.message : String(error),
      name: details?.name ?? null,
      suggestions: details?.suggestions ?? [],
    },
  };
}

export function validationErrorResult(error: ZodError): ToolResult {
  return {
    error: {
      message: "Invalid tool arguments",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      })),
    },
  };
}

export function isMissingProcessError(error: PcApiError): boolean {
  if (error.status === 404) return true;
  if (error.status !== 400) return false;
  const raw = typeof error.response === "string" ? error.response : JSON.stringify(error.response ?? "");
  return /not\s*found|unknown\s*process|does\s*not\s*exist/i.test(raw);
}

export async function suggestProcessNames(client: PcClient): Promise<string[]> {
  try {
    const data = await client.listProcesses();
    return extractProcessNames(data);
  } catch {
    return [];
  }
}

export async function runNamedProcessOperation(
  client: PcClient,
  name: string,
  operation: () => Promise<ToolResult>,
): Promise<ToolResult> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof PcApiError && isMissingProcessError(error)) {
      const suggestions = await suggestProcessNames(client);
      return errorResult(error, { name, suggestions });
    }
    return errorResult(error, { name });
  }
}
