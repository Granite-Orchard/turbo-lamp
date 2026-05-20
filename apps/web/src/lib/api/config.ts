export const BASE_URL = "http://localhost:3001/api/core/v1";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type IdempotentMethod = "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorBody = {
  message?: string;
  code?: string;
  details?: unknown;
};

export function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return Boolean(
    value && typeof value === "object" && "data" in (value as object),
  );
}

export async function parseJsonSafe(res: Response): Promise<unknown> {
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

export function isIdempotentMethod(
  method: HttpMethod,
): method is IdempotentMethod {
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
