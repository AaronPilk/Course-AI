// Service-role client. NEVER import this from a Client Component or any
// file that could ship to the browser. Use only in Route Handlers and
// Server Actions where we deliberately bypass RLS (background ingestion,
// embedding writes, etc.).
//
// We intentionally do not pass a Database type generic. Until we generate
// real types via `supabase gen types`, runtime safety lives in the Zod
// validators at the API boundary.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient<any, any, any> | null = null;

export function createSupabaseAdminClient(): SupabaseClient<any, any, any> {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  cached = createClient<any, any, any>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
