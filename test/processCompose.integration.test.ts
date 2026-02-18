import { execFileSync, spawnSync } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { extractProcesses, PcClient } from "../src/pcClient";
import { handleToolCall } from "../src/tools/pcTools";

const TEST_FILE = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(TEST_FILE), "..");
const HAS_PROCESS_COMPOSE = spawnSync("process-compose", ["version"], { encoding: "utf8" }).status === 0;
const describeIfProcessCompose = HAS_PROCESS_COMPOSE ? describe : describe.skip;

let port = 0;
let baseUrl = "";
let client: PcClient;
let oldBaseUrl: string | undefined;
let oldToken: string | undefined;

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") {
        server.close();
        reject(new Error("Failed to allocate a TCP port"));
        return;
      }
      const selected = addr.port;
      server.close((err) => {
        if (err) reject(err);
        else resolve(selected);
      });
    });
  });
}

function isRunning(proc: Record<string, unknown>): boolean {
  if (typeof proc.running === "boolean") return proc.running;
  if (typeof proc.is_running === "boolean") return proc.is_running;
  const status = String(proc.status ?? proc.state ?? proc.process_status ?? "").toLowerCase();
  return /running|started|up/.test(status);
}

async function callTool(toolName: string, args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const result = await handleToolCall(client, toolName, args);
  expect(result).not.toHaveProperty("error");
  return result;
}

async function waitForApiLive(url: string, timeoutMs = 15_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${url}/live`);
      if (res.ok) return;
    } catch {
      // continue retry
    }
    await delay(250);
  }
  throw new Error(`Timed out waiting for process-compose API: ${url}`);
}

async function waitForHeartbeatState(expectedRunning: boolean, timeoutMs = 12_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastStatus = "unknown";
  while (Date.now() < deadline) {
    try {
      const raw = await client.listProcesses();
      const processes = extractProcesses(raw) ?? [];
      const heartbeat = processes.find(
        (proc) =>
          typeof proc === "object" && proc !== null && String((proc as Record<string, unknown>).name) === "heartbeat",
      ) as Record<string, unknown> | undefined;
      if (!heartbeat) {
        lastStatus = "missing";
        await delay(250);
        continue;
      }
      const running = isRunning(heartbeat);
      lastStatus = String(heartbeat.status ?? heartbeat.state ?? running);
      if (running === expectedRunning) return;
    } catch {
      lastStatus = "api-unavailable";
    }
    await delay(250);
  }
  throw new Error(`Timed out waiting for heartbeat running=${expectedRunning}. lastStatus=${lastStatus}`);
}

describeIfProcessCompose("process-compose integration", () => {
  beforeAll(async () => {
    oldBaseUrl = process.env.PC_API_BASE_URL;
    oldToken = process.env.PC_API_TOKEN;
    delete process.env.PC_API_TOKEN;

    port = await getFreePort();
    baseUrl = `http://127.0.0.1:${port}`;
    process.env.PC_API_BASE_URL = baseUrl;

    execFileSync(
      "process-compose",
      ["--keep-project", "-f", "./examples/process-compose.yaml", "-p", String(port), "-t=false", "-D", "up"],
      { cwd: REPO_ROOT, encoding: "utf8" },
    );

    await waitForApiLive(baseUrl);
    client = await PcClient.createFromEnv();
    await waitForHeartbeatState(true);
  }, 30_000);

  afterAll(() => {
    if (port > 0) {
      try {
        execFileSync("process-compose", ["-p", String(port), "down"], { cwd: REPO_ROOT, stdio: "ignore" });
      } catch {
        // cleanup best-effort
      }
    }

    if (oldBaseUrl === undefined) delete process.env.PC_API_BASE_URL;
    else process.env.PC_API_BASE_URL = oldBaseUrl;

    if (oldToken === undefined) delete process.env.PC_API_TOKEN;
    else process.env.PC_API_TOKEN = oldToken;
  });

  it("lists heartbeat from real process-compose", async () => {
    const result = await callTool("pc_list_processes", {});
    const names = ((result.processes as Array<Record<string, unknown>>) ?? []).map((p) => p.name);
    expect(names).toContain("heartbeat");
  });

  it("reads live metadata from project and process endpoints", async () => {
    const alive = await callTool("pc_is_alive", {});
    expect(alive).toHaveProperty("status");

    const graph = await callTool("pc_get_dependency_graph", {});
    expect(graph).toHaveProperty("graph");

    const process = await callTool("pc_get_process", { name: "heartbeat" });
    expect(process).toMatchObject({
      process: {
        name: "heartbeat",
      },
    });

    const processInfo = await callTool("pc_get_process_info", { name: "heartbeat" });
    expect(processInfo).toHaveProperty("processInfo");

    const projectName = await callTool("pc_get_project_name", {});
    expect(projectName).toHaveProperty("project");

    const healthSummary = await callTool("pc_health_summary", {});
    expect(healthSummary).toHaveProperty("summary.counts.total");
    expect(Number((healthSummary.summary as { counts: { total: number } }).counts.total)).toBeGreaterThanOrEqual(1);
  });

  it("restarts heartbeat via MCP tool", async () => {
    const restartResult = await callTool("pc_restart_process", { name: "heartbeat" });
    expect(restartResult).toMatchObject({ ok: true });
    await waitForHeartbeatState(true);
  });

  it("stops and starts heartbeat through MCP tools", async () => {
    const stopResult = await callTool("pc_stop_process", { name: "heartbeat" });
    expect(stopResult).toMatchObject({ ok: true });
    await waitForHeartbeatState(false);

    const startResult = await callTool("pc_start_process", { name: "heartbeat" });
    expect(startResult).toMatchObject({ ok: true });
    await waitForHeartbeatState(true);
  });

  it("stops process via bulk operation and starts it again", async () => {
    const bulkStop = await callTool("pc_stop_processes", { names: ["heartbeat"], confirm: true });
    expect(bulkStop).toMatchObject({
      ok: true,
      names: ["heartbeat"],
    });
    await waitForHeartbeatState(false);

    const startResult = await callTool("pc_start_process", { name: "heartbeat" });
    expect(startResult).toMatchObject({ ok: true });
    await waitForHeartbeatState(true);
  });

  it("reads logs and project state from live API", async () => {
    await delay(1200);

    const logs = await callTool("pc_get_process_logs", {
      name: "heartbeat",
      endOffset: 0,
      limit: 50,
    });
    expect(typeof logs.raw).toBe("string");
    expect(String(logs.raw)).toContain("heartbeat");

    const state = await callTool("pc_get_project_state", {});
    expect(state).toHaveProperty("state");
  });

  it("returns suggestions for unknown process names", async () => {
    const result = await handleToolCall(client, "pc_stop_process", { name: "missing-process-name" });
    expect(result).toHaveProperty("error");
    expect(result).toHaveProperty("error.name", "missing-process-name");

    const suggestions = ((result.error as { suggestions?: unknown[] }).suggestions ?? []) as unknown[];
    expect(suggestions).toContain("heartbeat");
  });
});
