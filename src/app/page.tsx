import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-2xl text-center space-y-6">
        <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-mutedForeground text-xs font-medium">
          <span className="size-1.5 rounded-full bg-accent" />
          Public portal launching soon
        </p>
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight">
          Premium courses, manufactured by AI.
        </h1>
        <p className="text-lg text-mutedForeground">
          Course Factory turns deep technical sources into structured,
          original educational content — built lesson by lesson, reviewed
          by humans, and delivered through a beautiful learning portal.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/admin"
            className="inline-flex h-11 items-center justify-center rounded-full bg-foreground text-background px-6 text-sm font-medium hover:opacity-90 transition"
          >
            Admin sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
