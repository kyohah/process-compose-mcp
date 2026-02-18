import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("pc_reload_project", () => {
  it("calls reload project endpoint", async () => {
    const client = createClientStub({
      reloadProject: vi.fn(async () => ({ reloaded: true })),
    });

    const result = await handleToolCall(client, "pc_reload_project", {});

    expect(result).toMatchObject({ ok: true, result: { reloaded: true } });
  });
});
