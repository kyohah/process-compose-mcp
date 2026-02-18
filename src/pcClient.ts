import {
  getDependencyGraph as apiGetDependencyGraph,
  getProcess as apiGetProcess,
  getProcesses as apiGetProcesses,
  getProcessInfo as apiGetProcessInfo,
  getProcessLogs as apiGetProcessLogs,
  getProcessPorts as apiGetProcessPorts,
  getProjectName as apiGetProjectName,
  getProjectState as apiGetProjectState,
  isAlive as apiIsAlive,
  logsStream as apiLogsStream,
  reloadProject as apiReloadProject,
  restartProcess as apiRestartProcess,
  scaleProcess as apiScaleProcess,
  shutDownProject as apiShutDownProject,
  startProcess as apiStartProcess,
  stopProcess as apiStopProcess,
  stopProcesses as apiStopProcesses,
  truncateProcessLogs as apiTruncateProcessLogs,
  updateProcess as apiUpdateProcess,
  updateProject as apiUpdateProject,
} from "./generated/processCompose.js";

const DEFAULT_BASE_URL = "http://localhost:8080";
const GENERATED_OPENAPI_SOURCE = "openapi/process-compose/swagger-doc.latest.yaml";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeErrorResponse(data: unknown): unknown {
  if (typeof data === "string") return data;
  if (isRecord(data)) return data;
  return { message: String(data) };
}

function responseMessage(data: unknown): string {
  if (isRecord(data) && typeof data.error === "string" && data.error.length > 0) return data.error;
  return "API request failed";
}

type ApiResponse<T> = {
  status?: number;
  data?: T;
};

function responseStatus(response: ApiResponse<unknown> | undefined): number {
  return typeof response?.status === "number" ? response.status : 0;
}

export class PcApiError extends Error {
  operationId?: string;
  method: string;
  path: string;
  status: number;
  response: unknown;

  constructor(
    message: string,
    opts: { operationId?: string; method: string; path: string; status: number; response: unknown },
  ) {
    super(message);
    this.name = "PcApiError";
    this.operationId = opts.operationId;
    this.method = opts.method;
    this.path = opts.path;
    this.status = opts.status;
    this.response = opts.response;
  }
}

function unwrapResponse<T>(response: ApiResponse<T>, ctx: { operationId: string; method: string; path: string }): T {
  const status = typeof response?.status === "number" ? response.status : 0;
  const data = response?.data as unknown;
  if (status >= 200 && status < 300) return (response?.data ?? {}) as T;

  throw new PcApiError(`${responseMessage(data)} (status ${status})`, {
    operationId: ctx.operationId,
    method: ctx.method,
    path: ctx.path,
    status,
    response: normalizeErrorResponse(data),
  });
}

export class PcClient {
  readonly baseUrl: string;
  readonly openapiUrl: string;
  readonly token?: string;

  private constructor(params: { baseUrl: string; token?: string }) {
    this.baseUrl = params.baseUrl.replace(/\/+$/, "");
    this.token = params.token;
    this.openapiUrl = GENERATED_OPENAPI_SOURCE;
  }

  static async createFromEnv(): Promise<PcClient> {
    const baseUrl = (process.env.PC_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
    const token = process.env.PC_API_TOKEN;

    const client = new PcClient({ baseUrl, token });

    // Startup connectivity check against process-compose API.
    const alive = await apiIsAlive();
    const status = responseStatus(alive as ApiResponse<unknown>);
    if (status < 200 || status >= 300) {
      throw new PcApiError(`Failed health check against process-compose API (status ${status})`, {
        operationId: "IsAlive",
        method: "get",
        path: "/live",
        status,
        response: normalizeErrorResponse((alive as ApiResponse<unknown>).data),
      });
    }

    return client;
  }

  async listProcesses(): Promise<unknown> {
    return unwrapResponse(await apiGetProcesses(), {
      operationId: "GetProcesses",
      method: "get",
      path: "/processes",
    });
  }

  async getProcess(name: string): Promise<unknown> {
    try {
      return unwrapResponse(await apiGetProcess(name), {
        operationId: "GetProcess",
        method: "get",
        path: "/process/{name}",
      });
    } catch (error) {
      if (error instanceof PcApiError && error.status === 404) {
        return unwrapResponse(await apiGetProcessInfo(name), {
          operationId: "GetProcessInfo",
          method: "get",
          path: "/process/info/{name}",
        });
      }
      throw error;
    }
  }

  async startProcess(name: string): Promise<unknown> {
    return unwrapResponse(await apiStartProcess(name), {
      operationId: "StartProcess",
      method: "post",
      path: "/process/start/{name}",
    });
  }

  async stopProcess(name: string): Promise<unknown> {
    return unwrapResponse(await apiStopProcess(name), {
      operationId: "StopProcess",
      method: "patch",
      path: "/process/stop/{name}",
    });
  }

  async restartProcess(name: string): Promise<unknown> {
    return unwrapResponse(await apiRestartProcess(name), {
      operationId: "RestartProcess",
      method: "post",
      path: "/process/restart/{name}",
    });
  }

  async getDependencyGraph(): Promise<unknown> {
    return unwrapResponse(await apiGetDependencyGraph(), {
      operationId: "GetDependencyGraph",
      method: "get",
      path: "/graph",
    });
  }

  async getLiveStatus(): Promise<unknown> {
    return unwrapResponse(await apiIsAlive(), {
      operationId: "IsAlive",
      method: "get",
      path: "/live",
    });
  }

  async updateProcessConfig(config: Record<string, unknown>): Promise<unknown> {
    return unwrapResponse(await apiUpdateProcess(config as unknown as Parameters<typeof apiUpdateProcess>[0]), {
      operationId: "UpdateProcess",
      method: "post",
      path: "/process",
    });
  }

  async getProcessInfo(name: string): Promise<unknown> {
    return unwrapResponse(await apiGetProcessInfo(name), {
      operationId: "GetProcessInfo",
      method: "get",
      path: "/process/info/{name}",
    });
  }

  async logsStream(params: { names: string[]; offset: number; follow?: boolean }): Promise<unknown> {
    const response = await apiLogsStream({
      name: params.names.join(","),
      offset: params.offset,
      follow: params.follow,
    });
    const status = responseStatus(response as ApiResponse<unknown>);
    if (status >= 200 && status < 300) return (response as ApiResponse<unknown>).data;
    throw new PcApiError(`Logs websocket endpoint failed (status ${status})`, {
      operationId: "LogsStream",
      method: "get",
      path: "/process/logs/ws",
      status,
      response: normalizeErrorResponse((response as ApiResponse<unknown>).data),
    });
  }

  async truncateProcessLogs(name: string): Promise<unknown> {
    return unwrapResponse(await apiTruncateProcessLogs(name), {
      operationId: "TruncateProcessLogs",
      method: "delete",
      path: "/process/logs/{name}",
    });
  }

  async getProcessLogs(params: { name: string; endOffset: number; limit: number }): Promise<unknown> {
    return unwrapResponse(await apiGetProcessLogs(params.name, params.endOffset, params.limit), {
      operationId: "GetProcessLogs",
      method: "get",
      path: "/process/logs/{name}/{endOffset}/{limit}",
    });
  }

  async getProcessPorts(name: string): Promise<unknown> {
    return unwrapResponse(await apiGetProcessPorts(name), {
      operationId: "GetProcessPorts",
      method: "get",
      path: "/process/ports/{name}",
    });
  }

  async scaleProcess(name: string, scale: number): Promise<unknown> {
    return unwrapResponse(await apiScaleProcess(name, scale), {
      operationId: "ScaleProcess",
      method: "patch",
      path: "/process/scale/{name}/{scale}",
    });
  }

  async stopProcesses(names: string[]): Promise<unknown> {
    return unwrapResponse(await apiStopProcesses(names), {
      operationId: "StopProcesses",
      method: "patch",
      path: "/processes/stop",
    });
  }

  async updateProject(): Promise<unknown> {
    return unwrapResponse(await apiUpdateProject(), {
      operationId: "UpdateProject",
      method: "post",
      path: "/project",
    });
  }

  async reloadProject(): Promise<unknown> {
    return unwrapResponse(await apiReloadProject(), {
      operationId: "ReloadProject",
      method: "post",
      path: "/project/configuration",
    });
  }

  async getProjectName(): Promise<unknown> {
    return unwrapResponse(await apiGetProjectName(), {
      operationId: "GetProjectName",
      method: "get",
      path: "/project/name",
    });
  }

  async getProjectState(): Promise<unknown> {
    return unwrapResponse(await apiGetProjectState(), {
      operationId: "GetProjectState",
      method: "get",
      path: "/project/state",
    });
  }

  async shutDownProject(): Promise<unknown> {
    return unwrapResponse(await apiShutDownProject(), {
      operationId: "ShutDownProject",
      method: "post",
      path: "/project/stop",
    });
  }

  async tailLogs(params: { name: string; lines?: number; sinceSeconds?: number; replica?: number }): Promise<unknown> {
    const limit = params.lines ?? 200;
    // process-compose API (v1.90) uses endOffset + limit path params.
    // sinceSeconds/replica are accepted in tool input for compatibility, but not supported by this endpoint.
    return this.getProcessLogs({ name: params.name, endOffset: 0, limit });
  }

  async healthSummary(): Promise<{ data: unknown; usedHealthEndpoint: boolean }> {
    try {
      const projectState = unwrapResponse(await apiGetProjectState(), {
        operationId: "GetProjectState",
        method: "get",
        path: "/project/state",
      });

      try {
        const processes = extractProcesses(await this.listProcesses());
        if (processes) {
          return {
            usedHealthEndpoint: true,
            data: {
              projectState,
              processes,
            },
          };
        }
      } catch {
        // Ignore list-processes failures when project state is available.
      }

      return { data: projectState, usedHealthEndpoint: true };
    } catch {
      const data = await this.listProcesses();
      return { data, usedHealthEndpoint: false };
    }
  }
}

export function extractProcessNames(data: unknown): string[] {
  const processes = extractProcesses(data);
  if (!processes) return [];

  const names = new Set<string>();
  for (const proc of processes) {
    if (!proc || typeof proc !== "object") continue;
    const obj = proc as Record<string, unknown>;
    const name = obj.name || obj.process || obj.processName || obj.process_name || obj.id || obj.service;
    if (typeof name === "string" && name.trim().length > 0) names.add(name);
  }
  return Array.from(names).sort();
}

export function extractProcesses(data: unknown): unknown[] | null {
  if (!data) return null;
  if (Array.isArray(data)) return data;
  if (isRecord(data)) {
    if (Array.isArray(data.processes)) return data.processes;
    if (Array.isArray(data.data)) return data.data;
    if (isRecord(data.projectState) && Array.isArray(data.processes)) return data.processes;
    if (Array.isArray(data.items)) return data.items;
    const values = Object.values(data);
    if (values.length > 0 && values.every((v) => typeof v === "object")) {
      return values;
    }
  }
  return null;
}
