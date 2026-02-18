import { extractProcesses } from "../../pcClient.js";

type JsonObject = Record<string, unknown>;

type HealthSummary = {
  summary: JsonObject;
  anomalies: JsonObject[];
};

function isRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}

function pickFirst(obj: JsonObject, keys: string[]): unknown {
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

function pickNumber(obj: JsonObject, keys: string[]): number | null {
  const value = pickFirst(obj, keys);
  return typeof value === "number" ? value : null;
}

export function normalizeProcess(proc: JsonObject): JsonObject {
  const name = pickFirst(proc, [
    "name",
    "process",
    "processName",
    "process_name",
    "id",
    "service",
    "serviceName",
    "title",
  ]);

  const status = pickFirst(proc, ["status", "state", "processState", "statusText", "phase"]);
  const runningFromField = proc.running;
  const running =
    typeof runningFromField === "boolean"
      ? runningFromField
      : typeof status === "string"
        ? /running|started|up/i.test(status)
        : null;

  const healthField = proc.health;
  const healthyFromField = proc.healthy;
  const healthy =
    typeof healthyFromField === "boolean"
      ? healthyFromField
      : typeof healthField === "boolean"
        ? healthField
        : isRecord(healthField) && typeof healthField.status === "string"
          ? /healthy|pass|ok/i.test(healthField.status)
          : null;

  const exitCode = pickNumber(proc, ["exitCode", "exit_code", "exitStatus"]);
  const restarts = pickNumber(proc, ["restarts", "restartCount", "restart_count"]);
  const pid = typeof proc.pid === "number" ? proc.pid : null;

  return {
    name,
    status,
    running,
    healthy,
    exitCode,
    restarts,
    pid,
    raw: proc,
  };
}

export function extractLogText(data: unknown): string {
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return data.map((line) => String(line)).join("\n");
  if (isRecord(data)) {
    const logs = data.logs;
    if (typeof logs === "string") return logs;
    if (Array.isArray(logs)) return logs.map((line) => String(line)).join("\n");

    const rawData = data.data;
    if (typeof rawData === "string") return rawData;
    if (Array.isArray(rawData)) return rawData.map((line) => String(line)).join("\n");

    if (typeof data.output === "string") return data.output;
  }
  return JSON.stringify(data, null, 2);
}

const EVENT_PATTERNS: Array<{ type: string; regex: RegExp }> = [
  { type: "crash", regex: /panic|segfault|crash|fatal/i },
  { type: "restart", regex: /restart|restarting|backoff/i },
  { type: "exit", regex: /exit(ed)?\s+code|terminated|killed/i },
  { type: "health", regex: /unhealthy|health check failed|liveness|readiness/i },
  { type: "error", regex: /error|failed|exception/i },
];

export function summarizeLogEvents(text: string): Array<{ type: string; line: string }> {
  const lines = text.split("\n");
  const events: Array<{ type: string; line: string }> = [];

  for (const line of lines) {
    for (const pattern of EVENT_PATTERNS) {
      if (pattern.regex.test(line)) {
        events.push({ type: pattern.type, line: line.trim().slice(0, 500) });
        break;
      }
    }
  }

  return events.slice(-20);
}

function summarizeHealthFromProcesses(processes: JsonObject[]): HealthSummary {
  const normalized = processes.map((proc) => normalizeProcess(proc));
  const anomalies = normalized.filter((proc) => {
    if (proc.healthy === false) return true;
    if (proc.running === false) return true;
    if (typeof proc.status === "string" && /fail|error|crash|dead|exit/i.test(proc.status)) return true;
    return false;
  });

  return {
    summary: {
      total: normalized.length,
      running: normalized.filter((p) => p.running === true).length,
      stopped: normalized.filter((p) => p.running === false).length,
      unhealthy: normalized.filter((p) => p.healthy === false).length,
      processes: normalized,
    },
    anomalies,
  };
}

export function summarizeHealthFromRaw(data: unknown): HealthSummary {
  if (!isRecord(data)) {
    return { summary: { raw: data }, anomalies: [] };
  }

  const readiness = pickFirst(data, ["readiness", "ready", "readinessStatus", "readiness_state"]);
  const liveness = pickFirst(data, ["liveness", "live", "livenessStatus", "liveness_state"]);
  const overall = pickFirst(data, ["status", "health", "state", "overall"]);

  const anomalies: JsonObject[] = [];
  if (typeof overall === "string" && /fail|error|unhealthy|down/i.test(overall)) {
    anomalies.push({ type: "overall", value: overall });
  }
  if (typeof readiness === "string" && /fail|error|unhealthy|down/i.test(readiness)) {
    anomalies.push({ type: "readiness", value: readiness });
  }
  if (typeof liveness === "string" && /fail|error|unhealthy|down/i.test(liveness)) {
    anomalies.push({ type: "liveness", value: liveness });
  }

  const processes = extractProcesses(data);
  if (processes) {
    const processRecords = processes.filter(isRecord);
    const { summary, anomalies: processAnomalies } = summarizeHealthFromProcesses(processRecords);
    return {
      summary: {
        overall,
        readiness,
        liveness,
        processes: summary.processes,
        counts: {
          total: summary.total,
          running: summary.running,
          stopped: summary.stopped,
          unhealthy: summary.unhealthy,
        },
        raw: data,
      },
      anomalies: [...anomalies, ...processAnomalies],
    };
  }

  return {
    summary: {
      overall,
      readiness,
      liveness,
      raw: data,
    },
    anomalies,
  };
}
