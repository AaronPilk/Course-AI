// POST /api/auth/login   — body: { password }
// Validates against ADMIN_PASSWORD env var and sets a signed session cookie.
import { NextResponse, type NextRequest } from "next/server";
import {
  buildSessionCookie,
  checkAdminPassword,
  sessionCookie,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!checkAdminPassword(password)) {
    // Small delay reduces password-spray noise.
    await new Promise((r) => setTimeout(r, 350));
    return NextResponse.json({ error: "invalid password" }, { status: 401 });
  }

  const value = buildSessionCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie.name, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionCookie.maxAge,
  });
  return res;
}
