"use client";

import { logoutAction } from "@/actions/auth/logout";
import { Icon } from "@/components/primitives";

export function SignOutButton({ className = "" }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={`inline-flex items-center gap-1.5 text-[12px] font-mono text-ink-600 hover:text-ink-900 ${className}`}
      >
        <Icon name="log-out" className="w-3.5 h-3.5" />
        Sign out
      </button>
    </form>
  );
}
