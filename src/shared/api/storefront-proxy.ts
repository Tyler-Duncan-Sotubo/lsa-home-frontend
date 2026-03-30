/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export async function proxyStorefront<T>(
  fn: () => Promise<T>,
): Promise<NextResponse> {
  try {
    const data = await fn();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err: any) {
    const status =
      err?.status ??
      err?.statusCode ??
      err?.response?.status ??
      err?.cause?.status ??
      500;

    const payload =
      err?.error || err?.data || err?.response?.data || err?.message
        ? {
            message: err?.message ?? "Request failed",
            ...(typeof err?.error === "object" ? err.error : {}),
            status,
            statusCode: status,
          }
        : { message: "Request failed", status, statusCode: status };

    return NextResponse.json(payload, {
      status,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  }
}
