import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Course Factory",
  description:
    "AI-powered course generation platform — turn technical sources into premium educational courses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <script
          // Pre-paint theme set so we don't flash light → dark.
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
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
