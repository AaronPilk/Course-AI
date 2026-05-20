// Gate /admin/* on a valid signed session cookie. No Supabase, no remote
// session — just our local admin password cookie.
import { NextResponse, type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "cf_session";

// Re-implemented here because middleware runs on the Edge runtime by
// default and we want to keep this file lean. We do `export const runtime`
// below to opt into Node so node:crypto works.
function verify(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  if (expected.length !== signature.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

function isValid(value: string | undefined): boolean {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [role, issuedAt, sig] = parts;
  if (role !== "admin") return false;
  if (!Number.isFinite(Number(issuedAt))) return false;
  return verify(`${role}.${issuedAt}`, sig, secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const cookie = request.cookies.get(COOKIE_NAME);
  if (!isValid(cookie?.value)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const runtime = "nodejs";

export const config = {
  matcher: ["/admin/:path*"],
};
