// Compatibility shim — old form action posts here. We just clear the
// cookie and bounce to the login page. Same behavior as /api/auth/logout.
import { NextResponse, type NextRequest } from "next/server";
import { sessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/admin/login", request.url));
  res.cookies.set(sessionCookie.name, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
