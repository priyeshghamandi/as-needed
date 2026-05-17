export const NOTIFICATION_PRIORITIES = [
  "info",
  "important",
  "urgent",
  "critical",
] as const;

export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

export type NotificationPayload = {
  userId: string;
  agencyId?: string | null;
  title: string;
  message: string;
  priority?: NotificationPriority;
  relatedEntityType?: string;
  relatedEntityId?: string;
};
