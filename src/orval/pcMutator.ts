const DEFAULT_BASE_URL = "http://localhost:8080";
const REQUEST_TIMEOUT_MS = 10_000;

type MutatorInput =
  | string
  | {
      url: string;
      method?: string;
      headers?: HeadersInit;
      params?: Record<string, string | number | boolean | null | undefined>;
      data?: unknown;
      body?: unknown;
    };

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function joinUrl(base: string, path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!path.startsWith("/")) return `${normalizeBaseUrl(base)}/${path}`;
  return `${normalizeBaseUrl(base)}${path}`;
}

function withQuery(url: string, params?: Record<string, string | number | boolean | null | undefined>): string {
  if (!params) return url;
  const parsed = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    parsed.searchParams.set(key, String(value));
  }
  return parsed.toString();
}

export async function pcFetch<T>(input: MutatorInput, init?: RequestInit): Promise<T> {
  const baseUrl = normalizeBaseUrl(process.env.PC_API_BASE_URL || DEFAULT_BASE_URL);
  const token = process.env.PC_API_TOKEN;

  const cfg =
    typeof input === "string" ? { url: input, method: init?.method, headers: init?.headers, body: init?.body } : input;

  let url = joinUrl(baseUrl, cfg.url);
  url = withQuery(url, cfg.params);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const headers = new Headers(init?.headers ?? cfg.headers);
    headers.set("Accept", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const body = cfg.body ?? cfg.data;
    const requestInit: RequestInit = {
      ...init,
      method: cfg.method ?? init?.method ?? "GET",
      headers,
      signal: controller.signal,
    };

    if (body !== undefined && body !== null && requestInit.method !== "GET") {
      if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
      requestInit.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    const res = await fetch(url, requestInit);
    const text = await res.text();
    const contentType = res.headers.get("content-type") || "";

    let data: unknown = {};
    if (text.length > 0) {
      if (contentType.includes("json")) {
        data = JSON.parse(text);
      } else {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
    }
    return { status: res.status, data, headers: res.headers } as T;
  } finally {
    clearTimeout(timeout);
  }
}
