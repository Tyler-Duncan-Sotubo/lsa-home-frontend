import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getLoyaltyBalance } from "@/features/Account/credits/actions/loyalty";

export async function GET() {
  const session = await auth();
  const token = session?.backendTokens.accessToken;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getLoyaltyBalance(token);
    return NextResponse.json({ data }, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err?.error?.message ??
          err?.message ??
          "Failed to load loyalty balance",
      },
      { status: err?.statusCode ?? 500 },
    );
  }
}
