import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("pc_get_project_state", () => {
  it("returns project state payload", async () => {
    const client = createClientStub({
      getProjectState: vi.fn(async () => ({ state: "running" })),
    });

    const result = await handleToolCall(client, "pc_get_project_state", {});

    expect(result).toMatchObject({ state: { state: "running" } });
  });
});
