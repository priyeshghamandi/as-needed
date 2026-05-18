"use client";

import { logoutAction } from "@/actions/auth/logout";
import { Icon } from "@/components/primitives";

export function SignOutButton({
  className = "",
  variant = "inline",
}: {
  className?: string;
  variant?: "inline" | "sidebar";
}) {
  const buttonClass =
    variant === "sidebar"
      ? `w-full flex items-center gap-2.5 px-2.5 h-9 rounded-md text-[13px] tracking-tight text-ink-700 hover:bg-ink-100 ${className}`
      : `inline-flex items-center gap-1.5 text-[12px] font-mono text-ink-600 hover:text-ink-900 ${className}`;

  return (
    <form action={logoutAction} className={variant === "sidebar" ? "w-full" : undefined}>
      <button type="submit" className={buttonClass}>
        <Icon name="log-out" className="w-3.5 h-3.5 shrink-0" />
        Sign out
      </button>
    </form>
  );
}
