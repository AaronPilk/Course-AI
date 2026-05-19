// Auth helpers used in server components and route handlers.
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, email, display_name, role")
    .eq("id", user.id)
    .maybeSingle();
  return data;
}

export async function requireAdmin() {
  const profile = await getProfile();
  if (!profile) redirect("/admin/login");
  if (profile.role !== "admin") redirect("/?denied=1");
  return profile;
}
