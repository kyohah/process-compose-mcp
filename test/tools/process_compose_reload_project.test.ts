import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("process_compose_reload_project", () => {
  it("calls reload project endpoint", async () => {
    const client = createClientStub({
      reloadProject: vi.fn(async () => ({ reloaded: true })),
    });

    const result = await handleToolCall(client, "process_compose_reload_project", {});

    expect(result).toMatchObject({ ok: true, result: { reloaded: true } });
  });
});
