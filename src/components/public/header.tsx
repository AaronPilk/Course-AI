import Link from "next/link";
import { PointsBadge } from "./points-badge";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { CourseFactoryMark } from "./course-factory-mark";
import { GlobalAskBar } from "./global-ask-bar";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <CourseFactoryMark className="size-8 text-accent dark:text-white shrink-0" />
          <span className="font-semibold tracking-tight text-base text-foreground hidden sm:inline">
            <span>Course </span>
            <span className="text-mutedForeground">Factory</span>
          </span>
        </Link>

        {/* Center: global Ask AI bar */}
        <div className="flex-1 flex justify-center px-2">
          <GlobalAskBar className="hidden md:flex" />
        </div>

        <nav className="flex items-center gap-2 sm:gap-3 text-sm shrink-0">
          <Link
            href="/courses"
            className="text-mutedForeground hover:text-foreground transition-colors hidden sm:inline-block px-2"
          >
            All courses
          </Link>
          <Link
            href="/admin"
            className="text-mutedForeground hover:text-foreground transition-colors hidden sm:inline-block px-2"
          >
            Admin
          </Link>
          <ThemeToggle variant="icon" />
          <PointsBadge />
        </nav>
      </div>

      {/* Mobile: full-width ask bar below the row */}
      <div className="md:hidden border-t border-border/40 px-4 py-2">
        <GlobalAskBar />
      </div>
    </header>
  );
}
