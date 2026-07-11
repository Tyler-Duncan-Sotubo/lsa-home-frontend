import { createHmac, randomBytes, timingSafeEqual } from "crypto";

// Signed state carried through the broker OAuth hop. The cookie lives on
// the canonical accounts domain; the HMAC stops host/next tampering.

export type GoogleOAuthState = {
  host: string;
  next: string;
  nonce: string;
};

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeState(state: Omit<GoogleOAuthState, "nonce">): {
  cookieValue: string;
  nonce: string;
} {
  const nonce = randomBytes(16).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ ...state, nonce } satisfies GoogleOAuthState),
  ).toString("base64url");
  return { cookieValue: `${payload}.${sign(payload)}`, nonce };
}

export function decodeState(cookieValue: string): GoogleOAuthState | null {
  const dot = cookieValue.lastIndexOf(".");
  if (dot < 0) return null;
  const payload = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);

  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as GoogleOAuthState;
    if (!parsed.host || !parsed.nonce) return null;
    return parsed;
  } catch {
    return null;
  }
}
