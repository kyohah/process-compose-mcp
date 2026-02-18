import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub, createNotFoundError } from "./support/mockClient";

describe("process_compose_get_process", () => {
  it("returns normalized process payload", async () => {
    const client = createClientStub({
      getProcess: vi.fn(async () => ({ name: "api", status: "running" })),
    });

    const result = await handleToolCall(client, "process_compose_get_process", { name: "api" });

    expect(result).toMatchObject({ process: { name: "api", running: true } });
  });

  it("returns suggestions when target is not found", async () => {
    const client = createClientStub({
      getProcess: vi.fn(async () => {
        throw createNotFoundError("/process/{name}");
      }),
      listProcesses: vi.fn(async () => ({ processes: [{ name: "api" }, { name: "worker" }] })),
    });

    const result = await handleToolCall(client, "process_compose_get_process", { name: "missing" });

    expect(result).toMatchObject({
      error: {
        name: "missing",
        suggestions: ["api", "worker"],
      },
    });
  });
});
