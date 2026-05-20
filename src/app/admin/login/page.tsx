"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "submitting" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: "submitting" });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setState({ kind: "error", message: data.error ?? "Invalid password" });
        return;
      }
      const redirectTo = params.get("redirectTo") ?? "/admin";
      router.push(redirectTo);
      router.refresh();
    } catch (e) {
      setState({
        kind: "error",
        message: e instanceof Error ? e.message : "Login failed",
      });
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto size-10 rounded-2xl bg-foreground text-background grid place-items-center font-bold">
            C
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Course Factory
          </h1>
          <p className="text-sm text-mutedForeground">
            Admin sign-in. Local mode — set <code>ADMIN_PASSWORD</code> in
            your <code>.env.local</code>.
          </p>
        </div>

        <Card className="shadow-float">
          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Admin password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={state.kind === "submitting"}
              >
                {state.kind === "submitting" ? "Signing in…" : "Sign in"}
              </Button>

              {state.kind === "error" && (
                <p className="text-sm text-red-500">{state.message}</p>
              )}
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-mutedForeground">
          Local development mode. Multi-user auth is wired when we migrate
          to Supabase at launch.
        </p>
      </div>
    </main>
  );
}
