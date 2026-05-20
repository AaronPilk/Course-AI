// Stub. Local mode has no Supabase.
export function createSupabaseBrowserClient(): never {
  throw new Error(
    "Supabase is not used in local mode. The admin uses password auth via /api/auth/login."
  );
}
