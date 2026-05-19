"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Library,
  ShieldCheck,
  Sparkles,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Course projects", icon: FolderKanban },
  { href: "/admin/library", label: "Source library", icon: Library, soon: true },
  { href: "/admin/safety", label: "Content safety", icon: ShieldCheck, soon: true },
  { href: "/admin/published", label: "Published", icon: Sparkles, soon: true },
  { href: "/admin/settings", label: "Settings", icon: Settings2, soon: true },
];

export function AdminSidebar({ email }: { email?: string | null }) {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-border/70 bg-card/50 backdrop-blur-xl">
      <div className="px-6 py-5 flex items-center gap-2">
        <div className="size-8 rounded-xl bg-foreground text-background grid place-items-center font-bold">
          C
        </div>
        <div>
          <div className="text-sm font-semibold">Course Factory</div>
          <div className="text-xs text-mutedForeground">Admin</div>
        </div>
      </div>

      <nav className="px-3 pb-4 space-y-0.5">
        {items.map((it) => {
          const active =
            pathname === it.href ||
            (it.href !== "/admin" && pathname.startsWith(it.href));
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.soon ? "#" : it.href}
              aria-disabled={it.soon}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                active
                  ? "bg-muted text-foreground font-medium"
                  : "text-mutedForeground hover:bg-muted/60 hover:text-foreground",
                it.soon && "pointer-events-none opacity-60"
              )}
            >
              <Icon className="size-4" />
              <span className="flex-1">{it.label}</span>
              {it.soon ? (
                <span className="text-[10px] uppercase tracking-wider text-mutedForeground">
                  soon
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-border/70 space-y-3">
        <ThemeToggle />
        <div className="text-xs text-mutedForeground truncate">{email}</div>
        <form action="/admin/logout" method="post">
          <button
            type="submit"
            className="text-xs text-mutedForeground hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
