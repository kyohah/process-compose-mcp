import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("pc_truncate_process_logs", () => {
  it("truncates process logs", async () => {
    const client = createClientStub({
      truncateProcessLogs: vi.fn(async () => ({ truncated: true })),
    });

    const result = await handleToolCall(client, "pc_truncate_process_logs", { name: "api" });

    expect(result).toMatchObject({ ok: true, name: "api", result: { truncated: true } });
  });
});
