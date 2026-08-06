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

type ParsedSetCookie = {
  name: string;
  value: string;
  options: Record<string, string | true>;
};

function parseSetCookie(header: string): ParsedSetCookie | null {
  const segments = header.split(";");
  const first = segments.shift();
  if (!first) return null;
  const eq = first.indexOf("=");
  if (eq === -1) return null;
  const options: Record<string, string | true> = {};
  for (const segment of segments) {
    const idx = segment.indexOf("=");
    if (idx === -1) {
      options[segment.trim().toLowerCase()] = true;
    } else {
      options[segment.slice(0, idx).trim().toLowerCase()] = segment
        .slice(idx + 1)
        .trim();
    }
  }
  return {
    name: first.slice(0, eq).trim(),
    value: first.slice(eq + 1).trim(),
    options,
  };
}

async function forwardSetCookies(res: Response): Promise<void> {
  const headers = res.headers.getSetCookie();
  if (headers.length === 0) return;
  const cookieStore = await cookies();
  for (const header of headers) {
    const parsed = parseSetCookie(header);
    if (!parsed) continue;
    const { options } = parsed;
    try {
      cookieStore.set(parsed.name, parsed.value, {
        path: typeof options.path === "string" ? options.path : "/",
        httpOnly: options.httponly === true,
        secure: options.secure === true,
        sameSite:
          typeof options.samesite === "string"
            ? (options.samesite as "lax" | "strict" | "none")
            : "lax",
        ...(typeof options.domain === "string"
          ? { domain: options.domain }
          : {}),
        ...(typeof options.maxage === "string"
          ? { maxAge: Number(options.maxage) }
          : {}),
        ...(typeof options.expires === "string"
          ? { expires: new Date(options.expires) }
          : {}),
      });
    } catch (err) {
      // Only Server Actions / Route Handlers may set cookies. During render
      // cookies().set() throws ReadonlyRequestCookiesError; no Set-Cookie is
      // expected there today, so skip silently. Any other failure means the
      // browser will not receive a cookie it needs (e.g. the session cookie) —
      // surface it instead of swallowing it.
      const isReadonly =
        err instanceof Error &&
        err.message.startsWith("Cookies can only be modified");
      if (!isReadonly) {
        console.warn(
          `[api] failed to forward Set-Cookie for "${parsed.name}":`,
          err,
        );
      }
    }
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
  const token = cookieStore.get("session");

  const headersCopy = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    (headersCopy as Record<string, string>)["Authorization"] =
      `Bearer ${token.value}`;
  }

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

  await forwardSetCookies(res);

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
