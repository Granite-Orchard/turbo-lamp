import {
  ApiError,
  ApiErrorBody,
  BASE_URL,
  HttpMethod,
  isApiEnvelope,
  isIdempotentMethod,
  parseJsonSafe,
} from "./config";

export async function clientRequest<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: unknown,
  headers: HeadersInit = {},
  idempotencyKey?: string,
): Promise<T> {
  const headersCopy = {
    "Content-Type": "application/json",
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

  if (res.status === 401) {
    window.location.href = "/login";
    throw new ApiError(401, undefined, "Unauthorized", undefined);
  }

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
  get: <T>(path: string) => clientRequest<T>(path, "GET"),
  post: <T>(path: string, body: unknown) =>
    clientRequest<T>(path, "POST", body),
  put: <T>(path: string, body: unknown) => clientRequest<T>(path, "PUT", body),
  patch: <T>(path: string, body: unknown) =>
    clientRequest<T>(path, "PATCH", body),
  del: <T>(path: string) => clientRequest<T>(path, "DELETE"),
};
