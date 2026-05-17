"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, Eyebrow } from "@/components/primitives";
import { acceptInviteAction } from "@/actions/invites/accept-invite";

type InviteAcceptFormProps = {
  token: string;
  email: string;
  agencyName: string;
  roleLabel: string;
};

export function InviteAcceptForm({
  token,
  email,
  agencyName,
  roleLabel,
}: InviteAcceptFormProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await acceptInviteAction({ token, name, password });

    if (result.status === "error") {
      setError(result.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[480px] mx-auto px-8 py-16 rise-in">
      <Eyebrow>Accept invitation</Eyebrow>
      <h1 className="mt-4 text-[36px] leading-[1.08] tracking-[-0.02em] font-medium">
        Join
        <span className="font-serif italic text-teal-800"> {agencyName}</span>
      </h1>
      <p className="mt-2 text-[14px] text-ink-600">
        You&apos;ve been invited as <span className="font-medium">{roleLabel}</span> using{" "}
        <span className="font-mono text-[12px]">{email}</span>.
      </p>

      {error && (
        <div
          className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-800"
          role="alert"
        >
          {error}
          {error.includes("expired") && (
            <p className="mt-2 text-[12px]">
              Contact your agency administrator for a new invite.
            </p>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <label className="block">
          <div className="text-[12px] font-medium tracking-tight text-ink-800 mb-1.5">
            Full name
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full h-11 px-3 rounded-md border border-ink-200 bg-white text-[14px] outline-none focus:border-teal-600"
            required
          />
        </label>

        <label className="block">
          <div className="text-[12px] font-medium tracking-tight text-ink-800 mb-1.5">
            Create password
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full h-11 px-3 rounded-md border border-ink-200 bg-white text-[14px] outline-none focus:border-teal-600"
            minLength={8}
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
              <Icon name="loader-2" className="w-4 h-4 animate-spin" /> Activating…
            </>
          ) : (
            <>
              Accept invite <Icon name="arrow-right" className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-[13px] text-ink-600">
        Already have an account?{" "}
        <Link href="/login" className="text-teal-800 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
