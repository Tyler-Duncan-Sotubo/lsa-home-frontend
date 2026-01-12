/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { headers as nextHeaders } from "next/headers";
import { getStorefrontConfig } from "./storefront-config";

export type StorefrontFetchOpts = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  params?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;

  revalidate?: number;
  tags?: string[];
  cache?: RequestCache;

  headers?: Record<string, string>;

  // ✅ cart auth (access)
  cartToken?: string | null;

  // ✅ cart refresh (new)
  cartRefreshToken?: string | null;

  // ✅ customer auth
  accessToken?: string | null;

  /**
   * ✅ NEW:
   * When true, return { data, headers, status } so callers can read rotated tokens.
   * Default false keeps existing behavior (returns data only).
   */
  includeMeta?: boolean;
};

type MetaResult<T> = { data: T; headers: Headers; status: number };

function toQueryString(
  params?: Record<string, string | number | boolean | null | undefined>
) {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

async function readError(res: Response) {
  const ct = res.headers.get("content-type") ?? "";
  try {
    if (ct.includes("application/json")) return await res.json();
    return await res.text();
  } catch {
    return null;
  }
}

async function getIncomingHost(): Promise<string | null> {
  // In Next.js App Router, this returns the headers of the incoming request
  const h = await nextHeaders();

  // Prefer forwarded host (CDN/proxy), fallback to host
  const host = h.get("x-forwarded-host") || h.get("host") || null;

  if (!host) return null;

  // strip port
  return host.split(":")[0].trim().toLowerCase();
}

export async function storefrontFetch<T>(
  path: string,
  opts?: StorefrontFetchOpts & { includeMeta?: false }
): Promise<T>;
export async function storefrontFetch<T>(
  path: string,
  opts: StorefrontFetchOpts & { includeMeta: true }
): Promise<MetaResult<T>>;
export async function storefrontFetch<T>(
  path: string,
  opts: StorefrontFetchOpts = {}
): Promise<T | MetaResult<T>> {
  const { baseUrl } = getStorefrontConfig();

  const method = opts.method ?? "GET";
  const qs = toQueryString(opts.params);
  const url = `${baseUrl}${path}${qs}`;

  const cache =
    opts.cache ?? (opts.revalidate !== undefined ? undefined : "no-store");

  const incomingHost = await getIncomingHost();

  const headers: Record<string, string> = {
    // ✅ Domain-based tenancy header
    ...(incomingHost ? { "X-Store-Host": incomingHost } : {}),

    ...(opts.body ? { "Content-Type": "application/json" } : {}),

    // ✅ for CartTokenGuard (access + refresh)
    ...(opts.cartToken ? { "X-Cart-Token": opts.cartToken } : {}),
    ...(opts.cartRefreshToken
      ? { "X-Cart-Refresh-Token": opts.cartRefreshToken }
      : {}),

    ...(opts.accessToken
      ? { Authorization: `Bearer ${opts.accessToken}` }
      : {}),

    ...opts.headers,
  };

  const res = await fetch(url, {
    method,
    cache,
    next:
      opts.revalidate !== undefined || opts.tags?.length
        ? {
            ...(opts.revalidate !== undefined
              ? { revalidate: opts.revalidate }
              : {}),
            ...(opts.tags?.length
              ? {
                  tags: incomingHost
                    ? [...opts.tags, `host:${incomingHost}`]
                    : opts.tags,
                }
              : {}),
          }
        : undefined,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await readError(res);
    if (errorBody && typeof errorBody === "object") {
      (errorBody as any).status = res.status;
      (errorBody as any).statusCode ??= res.status;
    }
    throw (
      errorBody ?? {
        statusCode: res.status,
        status: res.status,
        message: res.statusText,
      }
    );
  }

  if (res.status === 204) {
    const data = undefined as T;
    return opts.includeMeta
      ? ({ data, headers: res.headers, status: res.status } as MetaResult<T>)
      : data;
  }

  const json = await res.json().catch(() => null);
  const data = ((json as any)?.data ?? json) as T;

  return opts.includeMeta
    ? ({ data, headers: res.headers, status: res.status } as MetaResult<T>)
    : data;
}

type StorefrontError = {
  statusCode?: number;
  status?: number;
  message?: string;
  error?: string;
};

type Result<T> =
  | { ok: true; data: T }
  | { ok: false; statusCode: number; error: StorefrontError | unknown };

function getStatusCode(e: any): number {
  return e?.statusCode ?? e?.status ?? e?.response?.status ?? 500;
}

export async function storefrontFetchSafe<T>(
  path: string,
  opts: StorefrontFetchOpts = {}
): Promise<Result<T>> {
  try {
    const data = (await storefrontFetch<T>(path, opts as any)) as T;
    return { ok: true, data };
  } catch (e: any) {
    const statusCode = getStatusCode(e);
    return { ok: false, statusCode, error: e };
  }
}
