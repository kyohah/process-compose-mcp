import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("pc_get_project_name", () => {
  it("returns project name payload", async () => {
    const client = createClientStub({
      getProjectName: vi.fn(async () => ({ name: "demo" })),
    });

    const result = await handleToolCall(client, "pc_get_project_name", {});

    expect(result).toMatchObject({ project: { name: "demo" } });
  });
});
