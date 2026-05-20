import Image from "next/image";
import Link from "next/link";
import type { PublicCourseCard } from "@/lib/db/queries";

interface CourseTileProps {
  course: PublicCourseCard;
}

/**
 * Premium course card used on the homepage and /courses index.
 * If the course has `brand` metadata (logo + gradient + tint), render
 * a branded hero band; otherwise fall back to the purple house gradient.
 */
export function CourseTile({ course }: CourseTileProps) {
  const brand = course.brand;
  const gradient = brand?.gradient ?? [];
  const tint = brand?.tint ?? "hsl(263 30% 12%)";

  // Build the branded background. Two-or-more colors get radial accents
  // in opposite corners; a tint fills the rest of the band.
  const branded = brand && gradient.length >= 1
    ? buildBrandBackground(gradient, tint)
    : null;

  const houseBackground = `
    radial-gradient(circle at 20% 20%, hsl(263 80% 56% / 0.55) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, hsl(263 80% 40% / 0.4) 0%, transparent 50%),
    linear-gradient(135deg, hsl(0 0% 8%) 0%, hsl(263 30% 12%) 100%)
  `;

  return (
    <Link href={`/courses/${course.slug}`} className="group">
      <article className="h-full rounded-2xl border border-border bg-card hover:border-accent/40 transition-all overflow-hidden shadow-cinematic group-hover:translate-y-[-2px] duration-200">
        {/* Hero band */}
        <div className="relative h-40 overflow-hidden">
          <div
            className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
            style={{ background: branded ?? houseBackground }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

          {brand?.logo && (
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="relative size-16 drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
                <Image
                  src={brand.logo}
                  alt={brand.name ?? course.title}
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {course.category && (
            <div className="absolute top-4 left-4 inline-flex px-2.5 py-1 rounded-full bg-background/80 backdrop-blur text-[10px] uppercase tracking-wider text-foreground border border-border/60">
              {course.category}
            </div>
          )}
        </div>

        <div className="p-5 space-y-3">
          <h3 className="font-semibold text-lg leading-tight group-hover:text-accent transition-colors">
            {course.title}
          </h3>
          {course.subtitle && (
            <p className="text-sm text-mutedForeground line-clamp-2 leading-relaxed">
              {course.subtitle}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-mutedForeground pt-3 border-t border-border/60">
            <div className="flex items-center gap-3">
              {course.difficulty && (
                <span className="capitalize">{course.difficulty}</span>
              )}
              {course.durationMinutes && (
                <>
                  <span className="text-border">·</span>
                  <span>
                    {Math.round((course.durationMinutes / 60) * 10) / 10}h
                  </span>
                </>
              )}
            </div>
            <span className="text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Open →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function buildBrandBackground(colors: string[], tint: string): string {
  const [c1, c2 = c1, c3 = c2, c4 = c3] = colors;
  return `
    radial-gradient(circle at 18% 22%, ${withAlpha(c1, 0.55)} 0%, transparent 55%),
    radial-gradient(circle at 82% 26%, ${withAlpha(c2, 0.45)} 0%, transparent 55%),
    radial-gradient(circle at 22% 82%, ${withAlpha(c3, 0.4)} 0%, transparent 55%),
    radial-gradient(circle at 80% 78%, ${withAlpha(c4, 0.4)} 0%, transparent 55%),
    linear-gradient(135deg, ${tint} 0%, hsl(0 0% 5%) 100%)
  `;
}

function withAlpha(hexOrRgb: string, alpha: number): string {
  // Accept "#RRGGBB" or "#RRGGBBAA" or already-rgba/hsl strings; for the latter, return as-is.
  if (!hexOrRgb.startsWith("#")) return hexOrRgb;
  const hex = hexOrRgb.replace("#", "");
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hexOrRgb;
}
