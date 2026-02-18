import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("pc_tail_logs", () => {
  it("returns raw logs and event summary", async () => {
    const client = createClientStub({
      tailLogs: vi.fn(async () => ["ready", "fatal crash", "restarting"].join("\n")),
    });

    const result = await handleToolCall(client, "pc_tail_logs", { name: "api", lines: 20 });

    expect(result).toMatchObject({
      name: "api",
      summary: {
        totalLines: 3,
      },
    });
    expect((result.summary as { importantEvents: Array<{ type: string }> }).importantEvents.map((e) => e.type)).toEqual(
      ["crash", "restart"],
    );
  });
});
