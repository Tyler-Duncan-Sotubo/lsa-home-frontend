/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { storefrontFetch } from "@/shared/api/fetch";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const paymentId = body?.paymentId;
  const key = body?.key;

  if (!paymentId || !key) {
    return NextResponse.json(
      { error: "paymentId and key are required" },
      { status: 400 }
    );
  }

  const payload = {
    key,
    url: body?.url ?? undefined,
    fileName: body?.fileName ?? undefined,
    mimeType: body?.mimeType ?? undefined,
    note: body?.note ?? undefined,
  };

  const data = await storefrontFetch<any>(
    `/api/payments/${paymentId}/evidence/finalize`,
    {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: payload,
    }
  );

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
