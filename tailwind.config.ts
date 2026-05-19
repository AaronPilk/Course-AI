import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: "hsl(var(--card) / <alpha-value>)",
        cardForeground: "hsl(var(--card-foreground) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        mutedForeground: "hsl(var(--muted-foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        accentForeground: "hsl(var(--accent-foreground) / <alpha-value>)",
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.08)",
        float: "0 10px 40px -10px rgba(0,0,0,0.18)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
