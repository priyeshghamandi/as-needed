"use client";

import { NotificationToastHost } from "@/components/notifications/notification-toast-host";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <NotificationToastHost />
    </>
  );
}
