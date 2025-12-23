/* eslint-disable @typescript-eslint/no-explicit-any */
import { storefrontFetch } from "@/shared/api/fetch";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const payload = await storefrontFetch<{
      customer: {
        id: string;
        companyId: string;
        email: string;
        firstName?: string;
        lastName?: string;
      };
      tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      };
    }>(`/api/storefront/customers/login`, {
      method: "POST",
      body: { email, password },
    });

    // normalize to the structure your NextAuth expects
    return NextResponse.json(
      {
        customer: payload.customer,
        tokens: payload.tokens,
      },
      { status: 200 }
    );
  } catch (err: any) {
    const msg =
      err?.message ??
      (typeof err === "string" ? err : null) ??
      "Internal server error";

    // map common invalid creds messages
    if (/invalid email or password|invalid credentials/i.test(msg)) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
