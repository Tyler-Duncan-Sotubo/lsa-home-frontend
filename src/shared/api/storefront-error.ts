/* eslint-disable @typescript-eslint/no-explicit-any */
// src/shared/api/storefront-error.ts
export type StorefrontErrorPayload =
  | string
  | {
      message?: string | string[];
      error?: string;
      code?: string;
      errors?: unknown; // can be array or object depending on backend
      statusCode?: number;
      [k: string]: unknown;
    };

export class StorefrontError extends Error {
  status: number;
  statusText: string;
  url: string;
  payload?: StorefrontErrorPayload;

  constructor(args: {
    message: string;
    status: number;
    statusText: string;
    url: string;
    payload?: StorefrontErrorPayload;
  }) {
    super(args.message);
    this.name = "StorefrontError";
    this.status = args.status;
    this.statusText = args.statusText;
    this.url = args.url;
    this.payload = args.payload;
  }
}

// ✅ Extract the best UX message from any backend shape
export function getStorefrontErrorMessage(err: unknown): string {
  if (!(err instanceof StorefrontError)) {
    if (err instanceof Error) return err.message || "Something went wrong.";
    return "Something went wrong.";
  }

  const p = err.payload;

  // string payload
  if (typeof p === "string" && p.trim()) return p;

  // object payload
  if (p && typeof p === "object") {
    const anyP = p as any;

    // message can be array or string (Nest ValidationPipe often returns array)
    if (Array.isArray(anyP.message) && anyP.message.length) {
      return String(anyP.message[0]);
    }
    if (typeof anyP.message === "string" && anyP.message.trim()) {
      return anyP.message;
    }

    // errors can be [{field,message}] or {field:[...]}
    const errors = anyP.errors;
    if (Array.isArray(errors) && errors.length) {
      const first = errors[0];
      if (typeof first === "string") return first;
      if (first && typeof first === "object") {
        return String((first as any).message ?? (first as any).msg ?? "");
      }
    }
    if (errors && typeof errors === "object") {
      const firstKey = Object.keys(errors)[0];
      const v = (errors as any)[firstKey];
      if (Array.isArray(v) && v.length) return String(v[0]);
      if (typeof v === "string") return v;
    }

    if (typeof anyP.error === "string" && anyP.error.trim()) return anyP.error;
  }

  // fallback (useful, but not noisy)
  if (err.status === 400) return "Please check the form and try again.";
  if (err.status === 401) return "You’re not authorized to do that.";
  if (err.status === 404) return "Not found.";
  return "Something went wrong. Please try again.";
}
