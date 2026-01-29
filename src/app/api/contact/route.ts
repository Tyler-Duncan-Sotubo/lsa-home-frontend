/* eslint-disable @typescript-eslint/no-explicit-any */
import { storefrontFetchSafe } from "@/shared/api/fetch";
import { NextResponse } from "next/server";

type ContactBody = {
  name?: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  subject?: string;
  website?: string; // honeypot
};

function getRequestHost(req: Request) {
  // Prefer forwarded host (Vercel/Cloudflare/proxies)
  const forwardedHost = req.headers.get("x-forwarded-host");
  if (forwardedHost) return forwardedHost.split(",")[0].trim();

  const host = req.headers.get("host");
  if (host) return host;

  // fallback: try origin hostname
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host;
    } catch {}
  }

  return "";
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as ContactBody | null;

  if (!body?.email || typeof body.email !== "string") {
    return NextResponse.json(
      { ok: false, message: "Email is required" },
      { status: 400 },
    );
  }

  if (!body?.message || typeof body.message !== "string") {
    return NextResponse.json(
      { ok: false, message: "Message is required" },
      { status: 400 },
    );
  }

  // honeypot
  if (body.website && body.website.trim().length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const storeHost = getRequestHost(req);
  if (!storeHost) {
    return NextResponse.json(
      { ok: false, message: "Missing host" },
      { status: 400 },
    );
  }

  const origin = req.headers.get("origin") ?? undefined;
  const referrer = req.headers.get("referer") ?? undefined;
  const userAgent = req.headers.get("user-agent") ?? undefined;

  const result = await storefrontFetchSafe<any>("/api/mail/public/contact", {
    method: "POST",
    body: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      message: body.message,
      subject: body.subject,
    },
    headers: {
      // ✅ this is what your backend expects (same as Axios interceptor)
      "X-Store-Host": storeHost,

      ...(origin ? { "X-Page-Url": origin } : {}),
      ...(referrer ? { "X-Referrer": referrer } : {}),
      ...(userAgent ? { "X-User-Agent": userAgent } : {}),
    },
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.statusCode || 500 },
    );
  }

  return NextResponse.json({ ok: true, data: result.data }, { status: 200 });
}
