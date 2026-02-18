import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("process_compose_is_alive", () => {
  it("returns status payload", async () => {
    const client = createClientStub({
      getLiveStatus: vi.fn(async () => ({ live: true })),
    });

    const result = await handleToolCall(client, "process_compose_is_alive", {});

    expect(result).toMatchObject({ status: { live: true } });
  });
});
