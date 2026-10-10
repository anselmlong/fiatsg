import { NextResponse, type NextRequest } from "next/server";

// A shared link carries ?ref=<supporter id>. Remember who shared it, so if this
// visitor joins, the person who invited them meets St Andrew.
export function proxy(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  if (!ref || !/^\d{1,9}$/.test(ref) || request.cookies.has("fiat_ref")) return NextResponse.next();
  request.cookies.set("fiat_ref", ref);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set("fiat_ref", ref, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
  return response;
}

export const config = {
  matcher: ["/((?!_next/|api/|images/|saints/|.*\\..*).*)"],
};
