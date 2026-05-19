"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminLoginPage() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string }
  >({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: "sending" });
    const supabase = createSupabaseBrowserClient();
    const redirectTo = params.get("redirectTo") ?? "/admin";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) setState({ kind: "error", message: error.message });
    else setState({ kind: "sent" });
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto size-10 rounded-2xl bg-foreground text-background grid place-items-center font-bold">
            C
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign in to Course Factory
          </h1>
          <p className="text-sm text-mutedForeground">
            We&apos;ll email you a one-time sign-in link.
          </p>
        </div>

        <Card className="shadow-float">
          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={state.kind === "sending"}
              >
                {state.kind === "sending" ? "Sending..." : "Send sign-in link"}
              </Button>

              {state.kind === "sent" && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Check your inbox for a sign-in link.
                </p>
              )}
              {state.kind === "error" && (
                <p className="text-sm text-red-500">{state.message}</p>
              )}
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-mutedForeground">
          Admin access only. New accounts default to <code>user</code> role —
          ask the platform owner to elevate.
        </p>
      </div>
    </main>
  );
}
