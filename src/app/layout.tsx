import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Course Factory",
  description:
    "Premium courses built from primary sources — for the AI search era.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <script
          // Honor the user's stored preference (admin's toggle writes
          // 'light' or 'dark' to localStorage). Public side has no toggle,
          // so on first load everyone sees dark.
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('theme');
                const root = document.documentElement;
                if (t === 'light') {
                  root.classList.remove('dark');
                  root.classList.add('light');
                } else {
                  root.classList.add('dark');
                  root.classList.remove('light');
                }
              } catch (_) {}
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
