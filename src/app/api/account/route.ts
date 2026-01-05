// app/api/account/profile/activity/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getCustomerActivityBundle } from "@/features/Pages/Account/core/actions/activity";

export async function GET(req: Request) {
  const session = await auth();
  const token = session?.backendTokens.accessToken;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const storeId = url.searchParams.get("storeId") ?? undefined;

    const data = await getCustomerActivityBundle(token, { storeId });

    return NextResponse.json({ data }, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err?.error?.message ??
          err?.message ??
          "Failed to load customer activity",
      },
      { status: err?.statusCode ?? 500 }
    );
  }
}
