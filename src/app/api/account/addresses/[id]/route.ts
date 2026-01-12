/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@/features/Account/address/action/addresses";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const session = await auth();
  const token = session?.backendTokens.accessToken;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dto = await req.json();
    const data = await updateCustomerAddress(id, dto, token);

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err?.error?.message ?? err?.message ?? "Failed to update address",
      },
      { status: err?.statusCode ?? 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const session = await auth();
  const token = session?.backendTokens.accessToken;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await deleteCustomerAddress(id, token);
    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.error?.message ?? "Failed to delete address",
      },
      { status: err?.statusCode ?? 500 }
    );
  }
}
