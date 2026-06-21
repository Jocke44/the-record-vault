"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Disc } from "lucide-react";
import { createClient } from "@/src/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=1920&q=80')",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      />

      <div className="relative z-10 flex w-full flex-col items-center gap-8">
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

        <div
          className="w-full max-w-sm rounded-xl px-6 py-8"
          style={{
            background: "rgba(0,0,0,0.2)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2 className="mb-6 text-center text-lg font-medium text-white">
            Set a new password
          </h2>

          {success ? (
            <p
              className="text-center text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Password updated! Redirecting you to login...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  New password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="h-11 rounded-md text-white placeholder:text-white/20 focus-visible:ring-cyan-400"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="confirm-password"
                  className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Confirm password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
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
                {loading ? "Saving..." : "Update password"}
              </Button>

              {error && (
                <p className="text-center text-sm" style={{ color: "#fca5a5" }}>
                  {error}
                </p>
              )}
            </form>
          )}
        </div>

        <Link
          href="/login"
          className="text-sm hover:underline"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          ← Back to login
        </Link>
      </div>
    </div>
  );
}
