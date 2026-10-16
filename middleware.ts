import { NextRequest, NextResponse } from "next/server";
// Layouts can't see the URL, so tell the app layout which /app/... page a visitor asked for (as a request header) so a brand-new
// guest lands there, query string included, instead of on /app.
export function middleware(req: NextRequest) {
  const h = new Headers(req.headers); h.set("x-isdead-next", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.next({ request: { headers: h } });
}
export const config = { matcher: ["/app/:path*"] };
