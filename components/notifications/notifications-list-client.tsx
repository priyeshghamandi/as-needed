"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { AgencyShell } from "@/components/agency-shell";
import { ProviderShell } from "@/components/provider/provider-shell";
import { NotificationsInboxTable } from "@/components/notifications/notifications-inbox";
import { markAllNotificationsReadAction } from "@/actions/notifications/mark-all-notifications-read";
import { markNotificationReadAction } from "@/actions/notifications/mark-notification-read";
import {
  buildListQueryString,
  type NotificationReadFilter,
} from "@/lib/notifications/list-filters";
import type { NotificationListItem } from "@/lib/notifications/queries";
import type { NotificationPriority } from "@/lib/notifications/types";
import { NOTIFICATION_PRIORITIES } from "@/lib/notifications/types";

type Filters = {
  filter: NotificationReadFilter;
  priority: string;
};

function EmptyState({ filters }: { filters: Filters }) {
  if (filters.filter === "unread") {
    return (
      <div className="rounded-xl border border-dashed border-ink-200 bg-white p-10 text-center">
        <p className="text-[15px] font-medium text-ink-900">You are all caught up</p>
        <p className="text-[13px] text-ink-600 mt-1">No unread notifications.</p>
      </div>
    );
  }
  if (filters.priority) {
    return (
      <div className="rounded-xl border border-dashed border-ink-200 bg-white p-10 text-center">
        <p className="text-[15px] font-medium text-ink-900">
          No {filters.priority} notifications
        </p>
        <p className="text-[13px] text-ink-600 mt-1">Try changing filters.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-dashed border-ink-200 bg-white p-10 text-center">
      <p className="text-[15px] font-medium text-ink-900">No notifications yet</p>
      <p className="text-[13px] text-ink-600 mt-1">
        Operational updates will appear here.
      </p>
    </div>
  );
}

export function NotificationsListClient({
  agencyName,
  userName,
  userInitials,
  primaryRole,
  unreadCount,
  items,
  total,
  nextCursor,
  filters,
  isAgency,
  isProvider,
  loadError,
}: {
  agencyName: string;
  userName: string;
  userInitials: string;
  primaryRole: string;
  unreadCount: number;
  items: NotificationListItem[];
  total: number;
  nextCursor: string | null;
  filters: Filters;
  isAgency: boolean;
  isProvider: boolean;
  loadError?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [moreItems, setMoreItems] = useState<NotificationListItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(nextCursor);
  const [loadingMore, setLoadingMore] = useState(false);

  const allItems = [...items, ...moreItems];

  const pushFilters = useCallback(
    (next: Partial<Filters>) => {
      const merged = { ...filters, ...next };
      const qs = buildListQueryString({
        filter: merged.filter === "unread" ? "unread" : undefined,
        priority: (merged.priority || undefined) as NotificationPriority | undefined,
      });
      startTransition(() => router.push(`/notifications${qs}`));
    },
    [filters, router],
  );

  const refresh = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  const handleMarkRead = async (id: string) => {
    setPendingId(id);
    const result = await markNotificationReadAction(id);
    setPendingId(null);
    if (result.status === "success") refresh();
  };

  const handleMarkAll = async () => {
    const result = await markAllNotificationsReadAction();
    if (result.status === "success") {
      setMoreItems([]);
      setCursor(null);
      refresh();
    }
  };

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const qs = buildListQueryString({
        filter: filters.filter === "unread" ? "unread" : undefined,
        priority: (filters.priority || undefined) as NotificationPriority | undefined,
        cursor,
      });
      const res = await fetch(`/api/notifications${qs}`);
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as {
        items: NotificationListItem[];
        nextCursor: string | null;
      };
      setMoreItems((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  };

  const headerAction = (
    <div className="flex flex-wrap items-center gap-2">
      {unreadCount > 0 ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => void handleMarkAll()}
          className="h-9 px-3 rounded-lg border border-ink-200 bg-white text-[13px] font-medium hover:bg-ink-50 disabled:opacity-50"
        >
          Mark all as read
        </button>
      ) : null}
    </div>
  );

  const filterBar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => pushFilters({ filter: f })}
            className={`h-8 px-3 rounded-full text-[12px] font-medium border ${
              filters.filter === f
                ? "bg-ink-900 text-paper border-ink-900"
                : "bg-white text-ink-700 border-ink-200"
            }`}
          >
            {f === "all" ? "All" : "Unread"}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => pushFilters({ priority: "" })}
          className={`h-8 px-3 rounded-full text-[12px] font-medium border ${
            !filters.priority
              ? "bg-teal-700 text-white border-teal-700"
              : "bg-white text-ink-700 border-ink-200"
          }`}
        >
          Any priority
        </button>
        {NOTIFICATION_PRIORITIES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => pushFilters({ priority: p })}
            className={`h-8 px-3 rounded-full text-[12px] font-medium border capitalize ${
              filters.priority === p
                ? "bg-teal-700 text-white border-teal-700"
                : "bg-white text-ink-700 border-ink-200"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );

  const body = loadError ? (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
      <p className="text-[14px] font-medium text-rose-900">Could not load notifications</p>
      <button
        type="button"
        onClick={refresh}
        className="mt-3 h-9 px-4 rounded-lg bg-rose-900 text-white text-[13px] font-medium"
      >
        Retry
      </button>
    </div>
  ) : allItems.length === 0 ? (
    <EmptyState filters={filters} />
  ) : (
  <>
      <NotificationsInboxTable
        items={allItems}
        onMarkRead={(id) => void handleMarkRead(id)}
        pendingId={pendingId}
      />
      {cursor ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => void loadMore()}
            className="h-9 px-4 rounded-lg border border-ink-200 bg-white text-[13px] font-medium hover:bg-ink-50 disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </>
  );

  const summary = `${unreadCount > 0 ? `${unreadCount} unread` : "All read"} · ${total} total`;

  if (isProvider && !isAgency) {
    return (
      <ProviderShell
        userName={userName}
        title="Notifications"
        subtitle={summary}
        unreadCount={unreadCount}
      >
        <div className="space-y-4">
          {filterBar}
          {body}
        </div>
      </ProviderShell>
    );
  }

  return (
    <AgencyShell
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      title="Notifications"
      subtitle={summary}
      headerAction={headerAction}
      primaryRole={primaryRole}
      unreadCount={unreadCount}
    >
      <div className="space-y-4">
        {filterBar}
        {body}
      </div>
    </AgencyShell>
  );
}
