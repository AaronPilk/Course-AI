"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      type="button"
      className="flex items-center gap-2 text-xs text-mutedForeground hover:text-foreground transition"
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
      {dark ? "Light" : "Dark"} mode
    </button>
  );
}
