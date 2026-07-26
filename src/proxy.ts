import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Root layout (a server component) has no access to the request's query
 * string, only headers — so the draft-preview token (?preview_token=...)
 * is forwarded here as a request header the layout's server-side fetch can
 * read, the same way the store host is already resolved via headers.
 */
export default function proxy(request: NextRequest) {
  const previewToken = request.nextUrl.searchParams.get("preview_token");
  if (!previewToken) return NextResponse.next();

  const headers = new Headers(request.headers);
  headers.set("x-preview-token", previewToken);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
