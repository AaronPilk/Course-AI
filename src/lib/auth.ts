// Local-only auth. Single admin gated by ADMIN_PASSWORD env var.
// On login, we set an HTTP-only signed cookie. The signature uses
// SESSION_SECRET so the cookie can't be forged.
//
// This is intentionally simple — no users table, no roles, no multi-tenant.
// When we move to Supabase for launch, this file gets swapped with a
// Supabase-Auth version and the rest of the app barely changes.
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";

const COOKIE_NAME = "cf_session";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "SESSION_SECRET must be set (>= 16 chars). Add it to .env.local."
    );
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function verify(payload: string, signature: string): boolean {
  const expected = sign(payload);
  if (expected.length !== signature.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function buildSessionCookie(): string {
  // payload is a fixed string + issuedAt; rotating SESSION_SECRET invalidates all sessions.
  const payload = `admin.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function isValidSessionCookie(value: string | undefined): boolean {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [role, issuedAt, sig] = parts;
  if (role !== "admin") return false;
  const issued = Number(issuedAt);
  if (!Number.isFinite(issued)) return false;
  return verify(`${role}.${issuedAt}`, sig);
}

/** Validate the password the user typed against ADMIN_PASSWORD. */
export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  if (password.length === 0) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const sessionCookie = {
  name: COOKIE_NAME,
  maxAge: COOKIE_MAX_AGE_SECONDS,
};

// ─── App-facing API used by server components / routes ─────────────────

export interface AdminProfile {
  id: "local-admin";
  email: string | null;
  display_name: string;
  role: "admin";
}

export async function getProfile(): Promise<AdminProfile | null> {
  const cookie = cookies().get(COOKIE_NAME);
  if (!isValidSessionCookie(cookie?.value)) return null;
  return {
    id: "local-admin",
    email: process.env.ADMIN_EMAIL ?? null,
    display_name: "Admin",
    role: "admin",
  };
}

export async function getSessionUser() {
  return await getProfile();
}

export async function requireAdmin(): Promise<AdminProfile> {
  const profile = await getProfile();
  if (!profile) redirect("/admin/login");
  return profile;
}
