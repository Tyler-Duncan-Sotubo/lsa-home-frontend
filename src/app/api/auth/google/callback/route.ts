import { NextRequest, NextResponse } from "next/server";
import { decodeState } from "@/lib/auth/google-oauth-state";
import { storefrontFetch } from "@/shared/api/fetch";

const STATE_COOKIE = "g_oauth_state";

function storefrontOrigin(host: string) {
  const isLocal =
    host.startsWith("localhost") || host.startsWith("127.0.0.1");
  return `${isLocal ? "http" : "https"}://${host}`;
}

// Broker callback — Google redirects here (the single registered URI).
// Exchanges the Google code for a one-time redirect code bound to the
// merchant's tenant, then sends the customer back to the merchant domain.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const stateNonce = req.nextUrl.searchParams.get("state");
  const cookieValue = req.cookies.get(STATE_COOKIE)?.value;

  const state = cookieValue ? decodeState(cookieValue) : null;
  if (!code || !state || !stateNonce || state.nonce !== stateNonce) {
    return NextResponse.json(
      { error: "Sign-in session expired — please try again" },
      { status: 400 },
    );
  }

  try {
    const { redirectCode } = await storefrontFetch<{ redirectCode: string }>(
      "/api/storefront/customers/oauth/google/exchange",
      {
        method: "POST",
        body: { code, redirectUri: process.env.GOOGLE_REDIRECT_URI },
        headers: { "X-Store-Host": state.host },
        cache: "no-store",
      },
    );

    const target = new URL(
      "/auth/google/complete",
      storefrontOrigin(state.host),
    );
    target.searchParams.set("code", redirectCode);
    target.searchParams.set("next", state.next);

    const res = NextResponse.redirect(target);
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch {
    const back = new URL("/login", storefrontOrigin(state.host));
    back.searchParams.set("error", "google");
    const res = NextResponse.redirect(back);
    res.cookies.delete(STATE_COOKIE);
    return res;
  }
}
