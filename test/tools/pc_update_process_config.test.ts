import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("pc_update_process_config", () => {
  it("updates process config", async () => {
    const client = createClientStub({
      updateProcessConfig: vi.fn(async () => ({ updated: true })),
    });

    const result = await handleToolCall(client, "pc_update_process_config", {
      process: { api: { command: "node app.js" } },
    });

    expect(result).toMatchObject({ ok: true, result: { updated: true } });
  });
});
