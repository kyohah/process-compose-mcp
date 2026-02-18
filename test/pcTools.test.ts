import { describe, expect, it, vi } from "vitest";
import { PcApiError, type PcClient } from "../src/pcClient";
import { handleToolCall } from "../src/tools/pcTools";

type ClientMethods = Pick<
  PcClient,
  | "listProcesses"
  | "getProcess"
  | "startProcess"
  | "stopProcess"
  | "restartProcess"
  | "tailLogs"
  | "healthSummary"
  | "stopProcesses"
  | "shutDownProject"
>;

function createClientStub(overrides: Partial<ClientMethods> = {}): PcClient {
  const base: ClientMethods = {
    listProcesses: vi.fn(async () => ({ processes: [] })),
    getProcess: vi.fn(async (_name: string) => ({ name: "default" })),
    startProcess: vi.fn(async (_name: string) => ({ ok: true })),
    stopProcess: vi.fn(async (_name: string) => ({ ok: true })),
    restartProcess: vi.fn(async (_name: string) => ({ ok: true })),
    tailLogs: vi.fn(async (_params: { name: string; lines?: number; sinceSeconds?: number; replica?: number }) => ""),
    healthSummary: vi.fn(async () => ({ data: { processes: [] }, usedHealthEndpoint: false })),
    stopProcesses: vi.fn(async (_names: string[]) => ({ ok: true })),
    shutDownProject: vi.fn(async () => ({ ok: true })),
  };

  return { ...base, ...overrides } as unknown as PcClient;
}

describe("handleToolCall", () => {
  it("returns normalized process info for list tool", async () => {
    const client = createClientStub({
      listProcesses: vi.fn(async () => ({
        processes: [{ name: "api", status: "running", healthy: true, pid: 1234, restarts: 2 }],
      })),
    });

    const result = await handleToolCall(client, "process_compose_list_processes", {});

    expect(result).toMatchObject({
      processes: [
        {
          name: "api",
          status: "running",
          running: true,
          healthy: true,
          pid: 1234,
          restarts: 2,
        },
      ],
    });
  });

  it("requires name for destructive actions", async () => {
    const client = createClientStub();
    const result = await handleToolCall(client, "process_compose_stop_process", {});
    expect(result).toMatchObject({
      error: {
        message: "Invalid tool arguments",
      },
    });
    expect(Array.isArray((result.error as { issues?: unknown[] }).issues)).toBe(true);
  });

  it("returns suggestions when process action gets 404", async () => {
    const notFound = new PcApiError("API request failed with status 404", {
      method: "post",
      path: "/process/{name}/stop",
      status: 404,
      response: { message: "not found" },
    });

    const client = createClientStub({
      stopProcess: vi.fn(async (_name: string) => {
        throw notFound;
      }),
      listProcesses: vi.fn(async () => ({
        processes: [{ name: "worker" }, { name: "api" }],
      })),
    });

    const result = await handleToolCall(client, "process_compose_stop_process", { name: "missing" });

    expect(result).toMatchObject({
      error: {
        status: 404,
        name: "missing",
        suggestions: ["api", "worker"],
      },
    });
  });

  it("summarizes log events in tail logs output", async () => {
    const client = createClientStub({
      tailLogs: vi.fn(async (_params: { name: string }) =>
        ["service ready", "fatal crash in worker", "restarting in backoff"].join("\n"),
      ),
    });

    const result = await handleToolCall(client, "process_compose_tail_logs", { name: "worker", lines: 50 });

    expect(result).toMatchObject({
      name: "worker",
      summary: {
        totalLines: 3,
      },
    });
    expect(
      (result.summary as { importantEvents: Array<{ type: string }> }).importantEvents.map((event) => event.type),
    ).toEqual(["crash", "restart"]);
  });

  it("builds health summary and anomalies", async () => {
    const client = createClientStub({
      healthSummary: vi.fn(async () => ({
        usedHealthEndpoint: false,
        data: {
          processes: [
            { name: "api", status: "running", healthy: true },
            { name: "worker", status: "crashed", healthy: false },
          ],
        },
      })),
    });

    const result = await handleToolCall(client, "process_compose_health_summary", {});

    expect(result).toMatchObject({
      usedHealthEndpoint: false,
      summary: {
        counts: {
          total: 2,
          running: 1,
          unhealthy: 1,
        },
      },
    });
    expect(Array.isArray(result.anomalies)).toBe(true);
    expect((result.anomalies as Array<{ name?: string }>).some((item) => item.name === "worker")).toBe(true);
  });

  it("requires confirm=true for bulk stop", async () => {
    const client = createClientStub();
    const result = await handleToolCall(client, "process_compose_stop_processes", { names: ["api"] });
    expect(result).toMatchObject({
      error: {
        message: "Invalid tool arguments",
      },
    });
  });

  it("runs bulk stop when confirm=true", async () => {
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
