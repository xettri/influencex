const API_BASE = import.meta.env.VITE_API_URL ?? "";

// Module-level state — wired by auth store on initialisation
let _token: string | null = null;
let _onRefresh: (() => Promise<string | null>) | null = null;
let _onSignOut: (() => void) | null = null;

export function updateApiToken(token: string | null) {
  _token = token;
}

export function initApiClient(opts: {
  onRefresh: () => Promise<string | null>;
  onSignOut: () => void;
}) {
  _onRefresh = opts.onRefresh;
  _onSignOut = opts.onSignOut;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) ?? {}),
  };
  if (_token) headers["Authorization"] = `Bearer ${_token}`;

  const url = `${API_BASE}${path}`;
  let res = await fetch(url, { ...opts, headers });

  // Token expired: attempt silent refresh once, then retry
  if (res.status === 401 && _onRefresh) {
    const newToken = await _onRefresh();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, { ...opts, headers });
    } else {
      _onSignOut?.();
      throw new ApiError(401, "Session expired. Please log in again.");
    }
  }

  const body = (await res.json().catch(() => ({}))) as {
    data?: T;
    message?: string;
    code?: string;
  };
  if (!res.ok) throw new ApiError(res.status, body.message ?? "Request failed", body.code);
  return body.data as T;
}

export const api = {
  get: <T>(path: string, opts?: RequestInit) =>
    request<T>(path, { method: "GET", ...opts }),
  post: <T>(path: string, body?: unknown, opts?: RequestInit) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body), ...opts }),
  put: <T>(path: string, body?: unknown, opts?: RequestInit) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body), ...opts }),
  patch: <T>(path: string, body?: unknown, opts?: RequestInit) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body), ...opts }),
  del: <T>(path: string, opts?: RequestInit) =>
    request<T>(path, { method: "DELETE", ...opts }),
};
