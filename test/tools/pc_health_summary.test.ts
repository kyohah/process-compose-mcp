import { describe, expect, it, vi } from "vitest";
import { handleToolCall } from "../../src/tools/pcTools";
import { createClientStub } from "./support/mockClient";

describe("pc_health_summary", () => {
  it("summarizes health and anomalies", async () => {
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

    const result = await handleToolCall(client, "pc_health_summary", {});

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
    expect((result.anomalies as Array<{ name?: string }>).some((item) => item.name === "worker")).toBe(true);
  });
});
