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
  // Optional honeypot (spam protection later)
  website?: string;
};

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

  // Optional: honeypot check (if you add it in the form)
  if (body.website && body.website.trim().length > 0) {
    // Pretend success so bots don't learn
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const pageUrl = req.headers.get("origin") ?? undefined;
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
      ...(pageUrl ? { "X-Page-Url": pageUrl } : {}),
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
