import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("pc_list_processes", () => {
  it("normalizes process list", async () => {
    const client = createClientStub({
      listProcesses: vi.fn(async () => ({
        processes: [{ name: "api", status: "running", healthy: true, pid: 42 }],
      })),
    });

    const result = await handleToolCall(client, "pc_list_processes", {});

    expect(result).toMatchObject({
      processes: [{ name: "api", status: "running", running: true, healthy: true, pid: 42 }],
    });
  });
});
