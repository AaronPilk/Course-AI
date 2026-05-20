// Stub. Local mode has no Supabase. Use @/lib/db instead.
export function createSupabaseAdminClient(): never {
  throw new Error(
    "Supabase is not used in local mode. Use the Drizzle client from @/lib/db."
  );
}
