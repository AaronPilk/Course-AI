"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Toggles between the dark and light themes. We use two CSS classes —
 * `.dark` and `.light` — because the redesign made dark the default and
 * uses `.light` as the opt-in override. Removing `.dark` alone leaves
 * us still on the dark theme because `:root` defaults to dark.
 */
export function ThemeToggle({
  variant = "label",
}: {
  variant?: "label" | "icon";
}) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    // Sync initial state from the html element.
    setDark(!document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    const root = document.documentElement;
    if (next) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  const Icon = dark ? Sun : Moon;

  if (variant === "icon") {
    return (
      <button
        onClick={toggle}
        type="button"
        className="size-9 grid place-items-center rounded-full text-mutedForeground hover:text-foreground hover:bg-muted/60 transition"
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <Icon className="size-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      type="button"
      className="flex items-center gap-2 text-xs text-mutedForeground hover:text-foreground transition"
      aria-label="Toggle theme"
    >
      <Icon className="size-3.5" />
      {dark ? "Light" : "Dark"} mode
    </button>
  );
}
