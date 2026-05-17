"use client";

import Link from "next/link";
import { Badge } from "@/components/primitives";
import {
  activityDetailsLine,
  formatActivityAbsoluteTime,
  formatActivityRelativeTime,
} from "@/lib/activity/activity-ui";
import type { ActivityLogItem } from "@/lib/activity/types";

export function ActivityLogList({
  items,
  hideEntityLink = false,
  currentEntityId,
}: {
  items: ActivityLogItem[];
  hideEntityLink?: boolean;
  currentEntityId?: string;
}) {
  if (items.length === 0) return null;

  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-ink-100">
            <tr>
              <th className="py-2 pr-4 font-mono text-[10px] uppercase tracking-wider text-ink-500">
                Time
              </th>
              <th className="py-2 pr-4 font-mono text-[10px] uppercase tracking-wider text-ink-500">
                Actor
              </th>
              <th className="py-2 pr-4 font-mono text-[10px] uppercase tracking-wider text-ink-500">
                Action
              </th>
              <th className="py-2 pr-4 font-mono text-[10px] uppercase tracking-wider text-ink-500">
                Entity
              </th>
              <th className="py-2 font-mono text-[10px] uppercase tracking-wider text-ink-500">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <ActivityTableRow
                key={item.id}
                item={item}
                hideEntityLink={hideEntityLink}
                currentEntityId={currentEntityId}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ol className="md:hidden relative pl-4 border-l border-ink-200" aria-label="Activity timeline">
        {items.map((item) => (
          <ActivityTimelineItem
            key={item.id}
            item={item}
            hideEntityLink={hideEntityLink}
            currentEntityId={currentEntityId}
          />
        ))}
      </ol>
    </>
  );
}

function ActivityTableRow({
  item,
  hideEntityLink,
  currentEntityId,
}: {
  item: ActivityLogItem;
  hideEntityLink?: boolean;
  currentEntityId?: string;
}) {
  const details = activityDetailsLine(item.metadata);
  const showLink =
    !hideEntityLink &&
    item.href &&
    (!currentEntityId || item.entityId !== currentEntityId);

  return (
    <tr className="border-b border-ink-50 last:border-0" data-testid="activity-row">
      <td className="py-3 pr-4 font-mono text-[11px] text-ink-500 whitespace-nowrap">
        <span title={formatActivityAbsoluteTime(item.createdAt)}>
          {formatActivityRelativeTime(item.createdAt)}
        </span>
      </td>
      <td className="py-3 pr-4 text-ink-800">{item.actorName ?? "System"}</td>
      <td className="py-3 pr-4 text-ink-800">{item.actionLabel}</td>
      <td className="py-3 pr-4">
        {showLink ? (
          <Link href={item.href!} className="inline-flex items-center gap-1.5 hover:underline">
            <Badge tone="neutral">{item.entityLabel}</Badge>
          </Link>
        ) : (
          <Badge tone="neutral">{item.entityLabel}</Badge>
        )}
      </td>
      <td className="py-3 text-ink-600 text-[12px]">{details ?? "—"}</td>
    </tr>
  );
}

function ActivityTimelineItem({
  item,
  hideEntityLink,
  currentEntityId,
}: {
  item: ActivityLogItem;
  hideEntityLink?: boolean;
  currentEntityId?: string;
}) {
  const details = activityDetailsLine(item.metadata);
  const showLink =
    !hideEntityLink &&
    item.href &&
    (!currentEntityId || item.entityId !== currentEntityId);

  return (
    <li className="relative pl-4 pb-4 last:pb-0" data-testid="activity-card">
      <span className="absolute -left-[7px] top-1.5 w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-white" />
      <div className="text-[10px] font-mono text-ink-500">{formatActivityRelativeTime(item.createdAt)}</div>
      <p className="mt-1 text-[13px] text-ink-900">
        <span className="font-medium">{item.actorName ?? "System"}</span>{" "}
        <span className="text-ink-700">{item.actionLabel}</span>
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {showLink ? (
          <Link href={item.href!} className="text-[12px] font-medium text-teal-800">
            {item.entityLabel}
          </Link>
        ) : (
          <Badge tone="neutral">{item.entityLabel}</Badge>
        )}
        {details ? <span className="text-[12px] text-ink-600">{details}</span> : null}
      </div>
    </li>
  );
}
