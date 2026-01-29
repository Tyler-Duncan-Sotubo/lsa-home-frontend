/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { storefrontFetch } from "@/shared/api/fetch";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const paymentId = body?.paymentId;
  const fileName = body?.fileName;
  const mimeType = body?.mimeType;

  if (!paymentId || !fileName || !mimeType) {
    return NextResponse.json(
      { error: "paymentId, fileName and mimeType are required" },
      { status: 400 },
    );
  }

  const data = await storefrontFetch<any>(
    `/api/payments/${paymentId}/evidence/presign`,
    {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: { fileName, mimeType },
    },
  );

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
