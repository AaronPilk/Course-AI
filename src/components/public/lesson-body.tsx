"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function LessonBody({ markdown }: { markdown: string }) {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-6 mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold tracking-tight mt-12 mb-4">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold tracking-tight mt-8 mb-3">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="leading-relaxed my-4 text-foreground">{children}</p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-accent underline-offset-4 hover:underline"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="my-4 space-y-2 pl-6 list-disc text-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 space-y-2 pl-6 list-decimal text-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-4 border-accent pl-5 italic text-mutedForeground bg-muted/30 py-3 rounded-r-lg">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code
                  className={
                    "block w-full my-4 p-4 rounded-xl bg-muted text-sm font-mono overflow-x-auto " +
                    (className ?? "")
                  }
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          hr: () => <hr className="my-10 border-border/60" />,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
