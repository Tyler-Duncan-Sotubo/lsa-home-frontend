import { storefrontFetchSafe } from "@/shared/api/fetch";
import { NextResponse } from "next/server";

type SubscribeBody = {
  email: string;
  source?: string; // optional
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as SubscribeBody | null;

  if (!body?.email || typeof body.email !== "string") {
    return NextResponse.json(
      { ok: false, message: "Email is required" },
      { status: 400 }
    );
  }

  // Optional: pass extra headers (page url, referrer) to backend metadata
  const pageUrl = req.headers.get("origin") ?? undefined;
  const referrer = req.headers.get("referer") ?? undefined;
  const userAgent = req.headers.get("user-agent") ?? undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await storefrontFetchSafe<any>("/api/mail/public/subscribe", {
    method: "POST",
    body: {
      email: body.email,
      source: body.source ?? "form",
    },
    headers: {
      ...(pageUrl ? { "X-Page-Url": pageUrl } : {}),
      ...(referrer ? { "X-Referrer": referrer } : {}),
      ...(userAgent ? { "X-User-Agent": userAgent } : {}),
    },
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.statusCode || 500 }
    );
  }

  return NextResponse.json({ ok: true, data: result.data }, { status: 200 });
}
