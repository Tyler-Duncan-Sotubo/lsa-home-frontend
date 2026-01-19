/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { NextResponse } from "next/server";
import { storefrontFetch } from "@/shared/api/fetch";

export async function GET() {
  const data = await storefrontFetch<any>(
    `/api/payments/stores-front/payment-methods`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
