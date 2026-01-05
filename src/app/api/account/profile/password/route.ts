// app/api/account/profile/password/route.ts
import "server-only";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { updateCustomerPassword } from "@/features/Pages/Account/information/action/profile";

export async function PATCH(req: Request) {
  const session = await auth();
  const token = session?.backendTokens.accessToken;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dto = (await req.json()) as {
      currentPassword: string;
      newPassword: string;
    };

    const data = await updateCustomerPassword(dto, token);

    return NextResponse.json({ data }, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err?.error?.message ?? err?.message ?? "Failed to update password",
      },
      { status: err?.statusCode ?? 500 }
    );
  }
}
