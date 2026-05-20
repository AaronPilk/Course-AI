import { Sparkles, BookOpen, Cpu, ShieldCheck, CreditCard, Cloud, Wrench, Brain } from "lucide-react";

const items = [
  { icon: BookOpen,    label: "Built from primary sources" },
  { icon: Sparkles,    label: "Ask AI, get cited answers" },
  { icon: Brain,       label: "AI Engineering" },
  { icon: Cpu,         label: "Infrastructure" },
  { icon: CreditCard,  label: "Payments" },
  { icon: Wrench,      label: "Manufacturing" },
  { icon: Cloud,       label: "Cloud + Edge" },
  { icon: ShieldCheck, label: "Security + Zero Trust" },
];

/**
 * Slim horizontal scrolling banner that signals platform scope.
 *
 * Why 4 copies (and -25% animation):
 *   For a seamless loop we need the track to always be wider than the
 *   viewport AT LEAST when half-translated. With only 2 copies that
 *   fails on ultrawide displays — leaving a visible empty gap before
 *   the loop resets. Four copies guarantees coverage up to ~4× the
 *   widest reasonable viewport.
 *
 * Spacing is baked into each item (`px-6`) — no track-level gap —
 * so the seam between copies looks identical to every other item gap.
 */
export function CategoryMarquee() {
  const copies = 4;
  const all = Array.from({ length: copies }).flatMap(() => items);

  return (
    <section className="border-y border-border/60 bg-card/30">
      <div className="marquee-mask py-3 overflow-hidden">
        <div className="marquee-track-25">
          {all.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 text-sm whitespace-nowrap px-6 text-mutedForeground dark:text-white"
              aria-hidden={i >= items.length}
            >
              <item.icon className="size-4 text-accent shrink-0" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
