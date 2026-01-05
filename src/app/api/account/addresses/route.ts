/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  createCustomerAddress,
  listCustomerAddresses,
} from "@/features/Pages/Account/address/action/addresses";

export async function GET() {
  const session = await auth();
  const token = session?.backendTokens.accessToken;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await listCustomerAddresses(token);
  if (!data) {
    return NextResponse.json(
      { error: "Failed to load addresses" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 200 });
}

export async function POST(req: Request) {
  const session = await auth();
  const token = session?.backendTokens.accessToken;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dto = await req.json();
    const data = await createCustomerAddress(dto, token);

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err?.error?.message ?? err?.message ?? "Failed to create address",
      },
      { status: err?.statusCode ?? 500 }
    );
  }
}
