import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("pc_get_dependency_graph", () => {
  it("returns graph payload", async () => {
    const client = createClientStub({
      getDependencyGraph: vi.fn(async () => ({ nodes: [{ name: "api" }] })),
    });

    const result = await handleToolCall(client, "pc_get_dependency_graph", {});

    expect(result).toMatchObject({ graph: { nodes: [{ name: "api" }] } });
  });
});
