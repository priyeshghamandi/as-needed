"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon, Eyebrow } from "@/components/primitives";
import { loginAction } from "@/actions/auth/login";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await loginAction({ email, password }, callbackUrl);

    if (result.status === "error") {
      setError(result.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[480px] mx-auto px-8 py-16 rise-in">
      <Eyebrow>Sign in</Eyebrow>
      <h1 className="mt-4 text-[36px] leading-[1.08] tracking-[-0.02em] font-medium">
        Welcome back to
        <span className="font-serif italic text-teal-800"> AsNeeded.</span>
      </h1>
      <p className="mt-2 text-[14px] text-ink-600 max-w-md">
        Sign in with the email and password for your agency, facility, or professional
        account.
      </p>

      {error && (
        <div
          className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <label className="block">
          <div className="text-[12px] font-medium tracking-tight text-ink-800 mb-1.5">
            Work email
          </div>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@agency.com"
            className="w-full h-11 px-3 rounded-md border border-ink-200 bg-white text-[14px] outline-none focus:border-teal-600"
            required
          />
        </label>

        <label className="block">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="text-[12px] font-medium tracking-tight text-ink-800">
              Password
            </div>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-[11px] font-mono text-teal-700 hover:underline"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="w-full h-11 px-3 rounded-md border border-ink-200 bg-white text-[14px] outline-none focus:border-teal-600"
            required
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-full bg-ink-900 text-paper text-[14px] font-medium hover:bg-ink-800 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Icon name="loader-2" className="w-4 h-4 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Sign in <Icon name="arrow-right" className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-[13px] text-ink-600">
        New agency?{" "}
        <Link href="/signup" className="text-teal-800 font-medium hover:underline">
          Create a workspace
        </Link>
      </p>
    </div>
  );
}
