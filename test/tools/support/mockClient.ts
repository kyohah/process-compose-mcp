import { vi } from "vitest";
import { PcApiError, type PcClient } from "../../../src/pcClient";

type ClientMethods = Pick<
  PcClient,
  | "getDependencyGraph"
  | "getLiveStatus"
  | "listProcesses"
  | "getProcess"
  | "getProcessInfo"
  | "getProcessPorts"
  | "startProcess"
  | "stopProcess"
  | "restartProcess"
  | "scaleProcess"
  | "updateProcessConfig"
  | "tailLogs"
  | "getProcessLogs"
  | "logsStream"
  | "truncateProcessLogs"
  | "stopProcesses"
  | "updateProject"
  | "reloadProject"
  | "getProjectName"
  | "getProjectState"
  | "shutDownProject"
  | "healthSummary"
>;

export function createClientStub(overrides: Partial<ClientMethods> = {}): PcClient {
  const base: ClientMethods = {
    getDependencyGraph: vi.fn(async () => ({ nodes: [] })),
    getLiveStatus: vi.fn(async () => ({ ok: true })),
    listProcesses: vi.fn(async () => ({ processes: [] })),
    getProcess: vi.fn(async (name: string) => ({ name })),
    getProcessInfo: vi.fn(async (name: string) => ({ name, info: true })),
    getProcessPorts: vi.fn(async (name: string) => ({ name, ports: [8080] })),
    startProcess: vi.fn(async (_name: string) => ({ ok: true })),
    stopProcess: vi.fn(async (_name: string) => ({ ok: true })),
    restartProcess: vi.fn(async (_name: string) => ({ ok: true })),
    scaleProcess: vi.fn(async (_name: string, _scale: number) => ({ ok: true })),
    updateProcessConfig: vi.fn(async (_process: Record<string, unknown>) => ({ ok: true })),
    tailLogs: vi.fn(async (_params: { name: string; lines?: number; sinceSeconds?: number; replica?: number }) => "ok"),
    getProcessLogs: vi.fn(async (_params: { name: string; endOffset: number; limit: number }) => "ok"),
    logsStream: vi.fn(async (_params: { names: string[]; offset: number; follow?: boolean }) => ({ stream: true })),
    truncateProcessLogs: vi.fn(async (_name: string) => ({ ok: true })),
    stopProcesses: vi.fn(async (_names: string[]) => ({ ok: true })),
    updateProject: vi.fn(async () => ({ ok: true })),
    reloadProject: vi.fn(async () => ({ ok: true })),
    getProjectName: vi.fn(async () => ({ name: "example" })),
    getProjectState: vi.fn(async () => ({ state: "running" })),
    shutDownProject: vi.fn(async () => ({ ok: true })),
    healthSummary: vi.fn(async () => ({ usedHealthEndpoint: true, data: { processes: [] } })),
  };

  return { ...base, ...overrides } as unknown as PcClient;
}

export function createNotFoundError(path = "/process/{name}"): PcApiError {
  return new PcApiError("not found", {
    operationId: "test",
    method: "get",
    path,
    status: 404,
    response: { message: "not found" },
  });
}
