"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Disc } from "lucide-react";
import { createClient } from "@/src/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
        } else {
          setSuccess("Account created successfully! You can now sign in.");
          setMode("signin");
          setPassword("");
        }
      } else {
        const { error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });

        if (signInError) {
          setError(signInError.message);
        } else {
          router.push("/");
          router.refresh();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Disc className="h-8 w-8 text-foreground" />
          <h1 className="text-2xl font-bold text-foreground">The Record Vault</h1>
        </div>

        <div className="mb-6 flex border-b border-border">
          <button
            type="button"
            onClick={() => switchMode("signin")}
            className={cn(
              "flex-1 pb-2 text-sm font-medium",
              mode === "signin"
                ? "border-b-2 border-cyan-400 text-cyan-400"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={cn(
              "flex-1 pb-2 text-sm font-medium",
              mode === "signup"
                ? "border-b-2 border-cyan-400 text-cyan-400"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-md border border-cyan-400/50 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-400"
            >
              {success}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="border-border bg-secondary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              className="border-border bg-secondary"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-cyan-400 text-background hover:bg-cyan-500"
          >
            {loading
              ? mode === "signin"
                ? "Signing in..."
                : "Signing up..."
              : mode === "signin"
                ? "Sign In"
                : "Sign Up"}
          </Button>
        </form>
      </div>
    </div>
  );
}
