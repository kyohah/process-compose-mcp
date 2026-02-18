import { describe, expect, it } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("unknown tool", () => {
  it("returns clear error", async () => {
    const client = createClientStub();
    const result = await handleToolCall(client, "pc_not_exist", {});
    expect(result).toMatchObject({ error: { message: "Unknown tool: pc_not_exist" } });
  });
});
