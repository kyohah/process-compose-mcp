import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("process_compose_start_process", () => {
  it("starts a process", async () => {
    const client = createClientStub({
      startProcess: vi.fn(async () => ({ started: true })),
    });

    const result = await handleToolCall(client, "process_compose_start_process", { name: "api" });

    expect(result).toMatchObject({ ok: true, result: { started: true } });
  });
});
