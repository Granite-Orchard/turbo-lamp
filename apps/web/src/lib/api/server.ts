import { cookies } from "next/headers";
import {
  ApiError,
  ApiErrorBody,
  BASE_URL,
  HttpMethod,
  isApiEnvelope,
  isIdempotentMethod,
  parseJsonSafe,
} from "./config";

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
    cache: "no-store",
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
