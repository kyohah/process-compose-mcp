import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("process_compose_get_process_info", () => {
  it("returns process info payload", async () => {
    const client = createClientStub({
      getProcessInfo: vi.fn(async () => ({ name: "api", command: "node app.js" })),
    });

    const result = await handleToolCall(client, "process_compose_get_process_info", { name: "api" });

    expect(result).toMatchObject({ processInfo: { name: "api", command: "node app.js" } });
  });
});
