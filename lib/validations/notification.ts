import { z } from "zod";
import { NOTIFICATION_PRIORITIES } from "@/lib/notifications/types";

export const notificationPrioritySchema = z.enum(NOTIFICATION_PRIORITIES);

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  agencyId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(2000),
  priority: notificationPrioritySchema.optional(),
  relatedEntityType: z.string().trim().max(80).optional(),
  relatedEntityId: z.string().uuid().optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
