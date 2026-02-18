import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("process_compose_get_process_logs", () => {
  it("returns explicit log snapshot", async () => {
    const client = createClientStub({
      getProcessLogs: vi.fn(async () => "line1\nline2"),
    });

    const result = await handleToolCall(client, "process_compose_get_process_logs", {
      name: "api",
      endOffset: 0,
      limit: 50,
    });

    expect(result).toMatchObject({
      name: "api",
      endOffset: 0,
      limit: 50,
      raw: "line1\nline2",
    });
  });
});
