import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("process_compose_update_project", () => {
  it("calls update project endpoint", async () => {
    const client = createClientStub({
      updateProject: vi.fn(async () => ({ updated: true })),
    });

    const result = await handleToolCall(client, "process_compose_update_project", {});

    expect(result).toMatchObject({ ok: true, result: { updated: true } });
  });
});
