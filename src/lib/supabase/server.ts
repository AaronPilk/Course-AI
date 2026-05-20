// Local mode has no Supabase. This stub exists so any forgotten import
// throws loudly at request time instead of compiling to nothing.
export function createSupabaseServerClient(): never {
  throw new Error(
    "Supabase is not used in local mode. Use the Drizzle client from @/lib/db."
  );
}
