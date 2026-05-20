"use client";

import { logoutAction } from "@/actions/auth/logout";
import { Icon } from "@/components/primitives";

export function SignOutButton({
  className = "",
  variant = "inline",
  collapsed = false,
}: {
  className?: string;
  variant?: "inline" | "sidebar";
  collapsed?: boolean;
}) {
  const buttonClass =
    variant === "sidebar"
      ? collapsed
        ? `w-10 h-10 mx-auto flex items-center justify-center rounded-md text-ink-700 hover:bg-ink-100 ${className}`
        : `w-full flex items-center gap-2.5 px-2.5 h-9 rounded-md text-[13px] tracking-tight text-ink-700 hover:bg-ink-100 ${className}`
      : `inline-flex items-center gap-1.5 text-[12px] font-mono text-ink-600 hover:text-ink-900 ${className}`;

  return (
    <form action={logoutAction} className={variant === "sidebar" ? (collapsed ? undefined : "w-full") : undefined}>
      <button
        type="submit"
        className={buttonClass}
        title={collapsed ? "Sign out" : undefined}
        aria-label={collapsed ? "Sign out" : undefined}
      >
        <Icon name="log-out" className="w-3.5 h-3.5 shrink-0" />
        {variant !== "sidebar" || !collapsed ? (
          <span className={variant === "sidebar" && collapsed ? "sr-only" : undefined}>Sign out</span>
        ) : null}
      </button>
    </form>
  );
}
