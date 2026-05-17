"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/primitives";

type ToastItem = {
  id: string;
  title: string;
  message: string;
  priority: "urgent" | "critical";
  href: string;
};

const MAX_TOASTS = 3;
const DISMISS_MS: Record<ToastItem["priority"], number> = {
  urgent: 8000,
  critical: 12000,
};

export function NotificationToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const shownRef = useRef<Set<string>>(new Set());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/recent-alerts", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { items: ToastItem[] };
      const fresh = data.items.filter((item) => !shownRef.current.has(item.id));
      if (fresh.length === 0) return;

      for (const item of fresh) {
        shownRef.current.add(item.id);
      }

      setToasts((prev) => {
        const merged = [...prev];
        for (const item of fresh) {
          if (merged.length >= MAX_TOASTS) break;
          if (!merged.some((t) => t.id === item.id)) merged.push(item);
        }
        return merged.slice(0, MAX_TOASTS);
      });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void poll();
    const id = window.setInterval(() => void poll(), 60_000);
    const onFocus = () => void poll();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [poll]);

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismiss(toast.id), DISMISS_MS[toast.priority]),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [toasts, dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[min(100vw-2rem,360px)]"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-xl border shadow-lg p-4 bg-white ${
            toast.priority === "critical"
              ? "border-rose-300 ring-1 ring-rose-100"
              : "border-amber-200"
          }`}
        >
          <div className="flex items-start gap-2">
            <Icon
              name={toast.priority === "critical" ? "alert-triangle" : "bell"}
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                toast.priority === "critical" ? "text-rose-700" : "text-amber-700"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-ink-900">{toast.title}</div>
              <p className="text-[12px] text-ink-600 mt-0.5 line-clamp-2">{toast.message}</p>
              <Link
                href={toast.href}
                onClick={() => dismiss(toast.id)}
                className="inline-block mt-2 text-[12px] font-medium text-teal-800 hover:underline"
              >
                View
              </Link>
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismiss(toast.id)}
              className="shrink-0 w-7 h-7 rounded-md hover:bg-ink-100 inline-flex items-center justify-center"
            >
              <Icon name="x" className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
