import { AdminSidebar } from "@/components/admin/sidebar";
import { getProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware redirects unauthenticated users to /admin/login. If we
  // don't have a profile yet, render the bare child (login page) without
  // the sidebar shell.
  const profile = await getProfile();
  if (!profile) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar email={profile.email} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
