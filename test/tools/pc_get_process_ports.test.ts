import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("pc_get_process_ports", () => {
  it("returns process ports payload", async () => {
    const client = createClientStub({
      getProcessPorts: vi.fn(async () => ({ ports: [3000, 9229] })),
    });

    const result = await handleToolCall(client, "pc_get_process_ports", { name: "api" });

    expect(result).toMatchObject({ name: "api", ports: { ports: [3000, 9229] } });
  });
});
