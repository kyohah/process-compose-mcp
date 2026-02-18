import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("pc_scale_process", () => {
  it("scales a process", async () => {
    const client = createClientStub({
      scaleProcess: vi.fn(async () => ({ scaled: true })),
    });

    const result = await handleToolCall(client, "pc_scale_process", { name: "api", scale: 3 });

    expect(result).toMatchObject({ ok: true, name: "api", scale: 3, result: { scaled: true } });
  });
});
