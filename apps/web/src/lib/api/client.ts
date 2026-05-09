import { cookies } from "next/headers";

const BASE_URL = "http://localhost:3001/api/core/v1";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type IdempotentMethod = "POST" | "PUT" | "PATCH" | "DELETE";

type ApiEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

type ApiErrorBody = {
  message?: string;
  code?: string;
  details?: unknown;
};

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return Boolean(
    value && typeof value === "object" && "data" in (value as object),
  );
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

function isIdempotentMethod(method: HttpMethod): method is IdempotentMethod {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method);
}

export class ApiError extends Error {
  status: number;
  details: unknown;
  code?: string;

  constructor(
    status: number,
    details: unknown,
    message: string,
    code?: string,
  ) {
    super(message);
    this.status = status;
    this.details = details;
    this.code = code;
  }
}

export async function serverRequest<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: unknown,
  headers: HeadersInit = {},
  idempotencyKey?: string,
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")!;

  const headersCopy = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token.value!}`,
    ...headers,
  };

  if (isIdempotentMethod(method) && idempotencyKey) {
    (headersCopy as Record<string, string>)["Idempotency-Key"] = idempotencyKey;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: headersCopy,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const payload = await parseJsonSafe(res);

  if (!res.ok) {
    const error = (payload ?? {}) as ApiErrorBody;
    throw new ApiError(
      res.status,
      error.details,
      error.message ?? "API request failed",
      error.code,
    );
  }

  if (payload === null) {
    return undefined as T;
  }

  if (isApiEnvelope<T>(payload)) {
    return payload.data;
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string) => serverRequest<T>(path, "GET"),
  post: <T>(path: string, body: unknown) =>
    serverRequest<T>(path, "POST", body),
  put: <T>(path: string, body: unknown) => serverRequest<T>(path, "PUT", body),
  patch: <T>(path: string, body: unknown) =>
    serverRequest<T>(path, "PATCH", body),
  del: <T>(path: string) => serverRequest<T>(path, "DELETE"),
};
