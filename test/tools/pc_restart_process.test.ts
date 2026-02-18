import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("pc_restart_process", () => {
  it("restarts a process", async () => {
    const client = createClientStub({
      restartProcess: vi.fn(async () => ({ restarted: true })),
    });

    const result = await handleToolCall(client, "pc_restart_process", { name: "api" });

    expect(result).toMatchObject({ ok: true, result: { restarted: true } });
  });
});
