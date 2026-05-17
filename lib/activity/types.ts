export type ActivityPayload = {
  agencyId: string;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
};

export type ActivityLogItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorName: string | null;
  createdAt: string;
  metadata: Record<string, unknown> | null;
  actionLabel: string;
  entityLabel: string | null;
  href: string | null;
};
