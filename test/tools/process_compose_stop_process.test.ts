import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("process_compose_stop_process", () => {
  it("stops a process", async () => {
    const client = createClientStub({
      stopProcess: vi.fn(async () => ({ stopped: true })),
    });

    const result = await handleToolCall(client, "process_compose_stop_process", { name: "api" });

    expect(result).toMatchObject({ ok: true, result: { stopped: true } });
  });
});
