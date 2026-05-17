"use client";

import Link from "next/link";
import { Dot } from "@/components/primitives";
import { NotificationPriorityBadge } from "@/components/notifications/notification-priority-badge";
import type { NotificationListItem } from "@/lib/notifications/queries";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function NotificationsInboxTable({
  items,
  onMarkRead,
  pendingId,
}: {
  items: NotificationListItem[];
  onMarkRead: (id: string) => void;
  pendingId: string | null;
}) {
  return (
    <>
      <div className="hidden md:block rounded-xl border border-ink-200 bg-white overflow-hidden">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-ink-50/80 border-b border-ink-200">
            <tr>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-ink-500 w-8" />
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-ink-500">
                Notification
              </th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-ink-500">
                Priority
              </th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-ink-500">
                When
              </th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-ink-500 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const unread = !item.readAt;
              return (
                <tr
                  key={item.id}
                  data-testid="notification-row"
                  className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50"
                >
                  <td className="px-4 py-3 align-top">
                    {unread ? <Dot tone="teal" /> : <span className="w-2 inline-block" />}
                  </td>
                  <td className="px-4 py-3 align-top min-w-0">
                    <div
                      className={`tracking-tight ${unread ? "font-semibold text-ink-900" : "font-medium text-ink-800"}`}
                    >
                      {item.title}
                    </div>
                    <p className="text-[12px] text-ink-600 mt-0.5 line-clamp-2">{item.message}</p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <NotificationPriorityBadge priority={item.priority} />
                  </td>
                  <td className="px-4 py-3 align-top text-ink-600 font-mono text-[11px] whitespace-nowrap">
                    {formatWhen(item.createdAt)}
                  </td>
                  <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      {item.relatedEntityLabel ? (
                        <Link
                          href={item.href}
                          className="text-[12px] font-medium text-teal-800 hover:underline"
                        >
                          {item.relatedEntityLabel}
                        </Link>
                      ) : null}
                      {unread ? (
                        <button
                          type="button"
                          disabled={pendingId === item.id}
                          onClick={() => onMarkRead(item.id)}
                          className="text-[12px] font-medium text-ink-700 hover:text-ink-900 disabled:opacity-50"
                        >
                          Mark read
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-ink-400">Read</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {items.map((item) => {
          const unread = !item.readAt;
          return (
            <article
              key={item.id}
              data-testid="notification-card"
              className="rounded-xl border border-ink-200 bg-white p-4"
            >
              <div className="flex items-start gap-2">
                {unread ? <Dot tone="teal" /> : null}
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-[14px] tracking-tight ${unread ? "font-semibold" : "font-medium"}`}
                  >
                    {item.title}
                  </div>
                  <p className="text-[12px] text-ink-600 mt-1">{item.message}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <NotificationPriorityBadge priority={item.priority} />
                    <span className="text-[11px] font-mono text-ink-500">
                      {formatWhen(item.createdAt)}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-3">
                    {item.relatedEntityLabel ? (
                      <Link href={item.href} className="text-[12px] font-medium text-teal-800">
                        {item.relatedEntityLabel}
                      </Link>
                    ) : null}
                    {unread ? (
                      <button
                        type="button"
                        disabled={pendingId === item.id}
                        onClick={() => onMarkRead(item.id)}
                        className="text-[12px] font-medium text-ink-700"
                      >
                        Mark read
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
