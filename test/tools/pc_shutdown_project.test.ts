import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("pc_shutdown_project", () => {
  it("requires confirm=true", async () => {
    const client = createClientStub();

    const result = await handleToolCall(client, "pc_shutdown_project", {});

    expect(result).toMatchObject({ error: { message: "Invalid tool arguments" } });
  });

  it("shuts down project when confirmed", async () => {
    const client = createClientStub({
      shutDownProject: vi.fn(async () => ({ stopped: true })),
    });

    const result = await handleToolCall(client, "pc_shutdown_project", { confirm: true });

    expect(result).toMatchObject({ ok: true, result: { stopped: true } });
  });
});
