import { NextRequest, NextResponse } from "next/server";
import { encodeState } from "@/lib/auth/google-oauth-state";

const STATE_COOKIE = "g_oauth_state";
const HOST_RE = /^[a-z0-9.-]+(:\d+)?$/i;

// Broker entry point — runs on the canonical accounts domain (the only
// origin registered with Google). ?host= is the merchant storefront the
// customer came from; we return them there after the Google hop.
export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Google sign-in is not configured" },
      { status: 500 },
    );
  }

  const host = (req.nextUrl.searchParams.get("host") ?? "").toLowerCase();
  const next = req.nextUrl.searchParams.get("next") ?? "/";
  if (!host || !HOST_RE.test(host)) {
    return NextResponse.json({ error: "Invalid host" }, { status: 400 });
  }
  // only relative paths — never an open redirect
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const { cookieValue, nonce } = encodeState({ host, next: safeNext });

  const authorize = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", "openid email profile");
  authorize.searchParams.set("state", nonce);
  authorize.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(authorize);
  res.cookies.set(STATE_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/api/auth/google",
  });
  return res;
}
