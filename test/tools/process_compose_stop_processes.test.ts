import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("process_compose_stop_processes", () => {
  it("requires confirm=true", async () => {
    const client = createClientStub();

    const result = await handleToolCall(client, "process_compose_stop_processes", { names: ["api"] });

    expect(result).toMatchObject({ error: { message: "Invalid tool arguments" } });
  });

  it("stops multiple processes", async () => {
    const client = createClientStub({
      stopProcesses: vi.fn(async (names: string[]) => ({ stopped: names })),
    });

    const result = await handleToolCall(client, "process_compose_stop_processes", {
      names: ["api", "worker"],
      confirm: true,
    });

    expect(result).toMatchObject({
      ok: true,
      names: ["api", "worker"],
      result: { stopped: ["api", "worker"] },
    });
  });
});
