import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  const secret = req.headers.get("x-revalidate-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const host = (body?.host ?? "").toLowerCase();

  // global tag + tenant-specific tag (recommended)
  revalidateTag("storefront-config", "default");
  if (host) revalidateTag(`host:${host}`, "default");

  return NextResponse.json({ ok: true });
}
