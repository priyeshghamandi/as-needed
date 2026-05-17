"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/primitives";

export type CriticalAlert = {
  id: string;
  title: string;
  message: string;
};

export function CriticalAlertBanner({ alert }: { alert: CriticalAlert | null }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!alert) {
      setDismissed(false);
      return;
    }
    const key = `notif-critical-dismiss:${alert.id}`;
    setDismissed(sessionStorage.getItem(key) === "1");
  }, [alert?.id]);

  if (!alert || dismissed) return null;

  const dismiss = () => {
    sessionStorage.setItem(`notif-critical-dismiss:${alert.id}`, "1");
    setDismissed(true);
  };

  return (
    <div
      role="alert"
      className="border-b border-rose-200 bg-rose-50 px-4 md:px-6 py-3 flex items-start gap-3"
    >
      <Icon name="alert-triangle" className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-rose-900">{alert.title}</div>
        <p className="text-[12px] text-rose-800 mt-0.5 line-clamp-2">{alert.message}</p>
        <Link
          href="/notifications?priority=critical&filter=unread"
          className="inline-block mt-2 text-[12px] font-medium text-rose-900 underline underline-offset-2"
        >
          Review alert
        </Link>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss alert"
        className="shrink-0 w-8 h-8 rounded-md hover:bg-rose-100 inline-flex items-center justify-center text-rose-800"
      >
        <Icon name="x" className="w-4 h-4" />
      </button>
    </div>
  );
}
