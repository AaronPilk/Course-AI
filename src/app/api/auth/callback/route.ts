// Compatibility shim — Supabase magic-link callback is no longer used in
// local mode. Hitting this URL just sends you to the login page.
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
