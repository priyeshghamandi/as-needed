import { Suspense } from "react";
import { NotificationsListClient } from "@/components/notifications/notifications-list-client";
import { loadNotificationsPageContext } from "@/lib/notifications/load-page-context";
import { parseNotificationListParams } from "@/lib/notifications/list-filters";
import { listNotifications } from "@/lib/notifications/queries";
import type { NotificationListItem } from "@/lib/notifications/queries";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NotificationsPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") sp.set(key, value);
  }
  const params = parseNotificationListParams(sp);

  let loadError = false;
  let ctx;
  let items: NotificationListItem[] = [];
  let total = 0;
  let nextCursor: string | null = null;

  try {
    const loaded = await loadNotificationsPageContext();
    ctx = loaded;
    const result = await listNotifications(loaded.userId, loaded.agencyId, params);
    items = result.items;
    total = result.total;
    nextCursor = result.nextCursor;
  } catch {
    loadError = true;
    ctx = {
      agencyName: "AsNeeded",
      userName: "User",
      userInitials: "U",
      primaryRole: "staffing_coordinator",
      unreadCount: 0,
      isAgency: true,
      isProvider: false,
      userId: "",
      agencyId: null,
    };
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-500">Loading notifications…</div>}>
      <NotificationsListClient
        agencyName={ctx.agencyName}
        userName={ctx.userName}
        userInitials={ctx.userInitials}
        primaryRole={ctx.primaryRole}
        unreadCount={ctx.unreadCount}
        items={items}
        total={total}
        nextCursor={nextCursor}
        filters={{
          filter: params.filter ?? "all",
          priority: params.priority ?? "",
        }}
        isAgency={ctx.isAgency}
        isProvider={ctx.isProvider}
        loadError={loadError}
      />
    </Suspense>
  );
}
