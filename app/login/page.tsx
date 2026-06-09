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
          setSuccess(
            "Check your inbox — confirm your email before signing in.",
          );
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
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Full-page background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=1920&q=80')",
        }}
      />
      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      />

      {/* All content sits above the overlay */}
      <div className="relative z-10 flex w-full flex-col items-center gap-8">

        {/* 1 — App name + tagline */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <Disc className="h-6 w-6" style={{ color: "#22d3ee" }} />
            <h1
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              The Record Vault
            </h1>
          </div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Get your collection Catalogued.
          </p>
        </div>

        {/* 2 — Auth card */}
        <div
          className="w-full max-w-sm rounded-xl px-6 py-8"
          style={{
            background: "rgba(0,0,0,0.2)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Mode toggle */}
          <div
            className="mb-7 flex"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={cn(
                "flex-1 pb-3 text-sm font-medium",
                mode === "signin"
                  ? "text-cyan-400"
                  : "text-white/40 hover:text-white/60",
              )}
              style={
                mode === "signin"
                  ? {
                      borderBottom: "2px solid #22d3ee",
                      color: "#22d3ee",
                      marginBottom: "-1px",
                    }
                  : {}
              }
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={cn(
                "flex-1 pb-3 text-sm font-medium",
                mode === "signup"
                  ? "text-cyan-400"
                  : "text-white/40 hover:text-white/60",
              )}
              style={
                mode === "signup"
                  ? {
                      borderBottom: "2px solid #22d3ee",
                      color: "#22d3ee",
                      marginBottom: "-1px",
                    }
                  : {}
              }
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div
                role="alert"
                className="rounded-md px-4 py-3 text-sm"
                style={{
                  backgroundColor: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#fca5a5",
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-md px-4 py-3 text-sm"
                style={{
                  backgroundColor: "rgba(34,211,238,0.08)",
                  border: "1px solid rgba(34,211,238,0.3)",
                  color: "#22d3ee",
                }}
              >
                {success}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="email"
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11 rounded-md text-white placeholder:text-white/20 focus-visible:ring-cyan-400"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="password"
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Password
              </Label>
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
                className="h-11 rounded-md text-white placeholder:text-white/20 focus-visible:ring-cyan-400"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-1 h-11 w-full rounded-md text-sm font-semibold text-black hover:opacity-90"
              style={{ backgroundColor: "#22d3ee" }}
            >
              {loading
                ? mode === "signin"
                  ? "Signing in…"
                  : "Creating account…"
                : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
            </Button>
          </form>
        </div>

        {/* 3 — Step explainer */}
        <ol className="flex flex-col items-center gap-3 text-center">
          {[
            "Create your free account",
            "Confirm your email address",
            "Start building your collection",
          ].map((step, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-xs"
              style={{ color: "rgba(255,255,255,0.38)" }}
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  backgroundColor: "rgba(34,211,238,0.1)",
                  color: "#22d3ee",
                  border: "1px solid rgba(34,211,238,0.25)",
                }}
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

      </div>
    </div>
  );
}
