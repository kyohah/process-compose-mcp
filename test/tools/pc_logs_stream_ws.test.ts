import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("pc_logs_stream_ws", () => {
  it("returns websocket call result", async () => {
    const client = createClientStub({
      logsStream: vi.fn(async () => ({ stream: "ok" })),
    });

    const result = await handleToolCall(client, "pc_logs_stream_ws", {
      names: ["api"],
      offset: 10,
      follow: true,
    });

    expect(result).toMatchObject({
      requested: { names: ["api"], offset: 10, follow: true },
      result: { stream: "ok" },
    });
  });
});
