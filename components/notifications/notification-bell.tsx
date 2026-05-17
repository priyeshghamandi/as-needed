"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/primitives";

export function NotificationBell({
  initialCount = 0,
  className = "",
}: {
  initialCount?: number;
  className?: string;
}) {
  const pathname = usePathname();
  const [count, setCount] = useState(initialCount);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { count: number };
      setCount(data.count);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    void refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    const id = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  return (
    <Link
      href="/notifications"
      aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
      className={`relative w-9 h-9 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-700 ${className}`}
    >
      <Icon name="bell" className="w-4 h-4" />
      {count > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-mono font-medium inline-flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
