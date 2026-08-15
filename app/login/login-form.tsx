"use client";

import { useState } from "react";
import Link from "next/link";
import { createClientPB } from "@/lib/pocketbase-client";

export function LoginForm({
  next,
  error: initialError,
}: {
  next: string;
  error?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    try {
      const pb = createClientPB();
      // Opens Google in a popup and exchanges the code (server-side on PB).
      await pb.collection("users").authWithOAuth2({ provider: "google" });
      // Persist the auth token as a cookie so the server sees us logged in.
      document.cookie = pb.authStore.exportToCookie({
        httpOnly: false,
        sameSite: "lax",
        secure: true,
        path: "/",
      });
      window.location.href = next.startsWith("/") ? next : "/dashboard";
    } catch {
      setError("Google sign-in didn't complete. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 mesh_bg" />
        <div className="absolute inset-0 dotgrid" />
        <div className="glow-layer -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2" />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface shadow-glow">
            <img
              src="/image/iconalone.png"
              alt="ProdLog"
              className="h-10 w-10 object-contain"
            />
          </div>
          <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-accent">
            Welcome back
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.02em] text-text">
            Open your log
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            Sign in to track ideas, log progress, and share what you build.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface/80 p-6 shadow-glass backdrop-blur-sm">
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-text shadow-sm transition-all hover:border-border-strong hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
              </svg>
            )}
            {loading ? "Redirecting to Google…" : "Continue with Google"}
          </button>

          {error && (
            <div className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2 text-xs text-rose-600 dark:text-rose-400">
              {error === "google"
                ? "Google sign-in didn't complete. Please try again."
                : error}
            </div>
          )}

          <p className="mt-4 text-center text-xs leading-relaxed text-text-muted">
            By continuing, you agree to keep your progress log yours. No
            trackers, no walled gardens.
          </p>
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs font-medium text-text-secondary transition-colors hover:text-text"
          >
            ← Back to prodlog
          </Link>
        </p>
      </div>
    </div>
  );
}
