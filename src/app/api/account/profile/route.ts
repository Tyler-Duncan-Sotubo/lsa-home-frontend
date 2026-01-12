/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/account/profile/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  getCustomerProfile,
  updateCustomerProfile,
} from "@/features/Account/information/action/profile";

export async function GET() {
  const session = await auth();
  const token = session?.backendTokens.accessToken;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getCustomerProfile(token);
  if (!data) {
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 200 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  const token = session?.backendTokens.accessToken;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dto = await req.json();
    const data = await updateCustomerProfile(dto, token);

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err?.error?.message ?? err?.message ?? "Failed to update profile",
      },
      { status: err?.statusCode ?? 500 }
    );
  }
}
