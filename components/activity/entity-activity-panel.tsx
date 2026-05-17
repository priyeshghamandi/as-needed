"use client";

import { useCallback, useEffect, useState } from "react";
import { ActivityLogList } from "@/components/activity/activity-log-list";
import { activityEntityTypeLabel } from "@/lib/activity/entity-route";
import type { ActivityLogItem } from "@/lib/activity/types";

export function EntityActivityPanel({
  entityType,
  entityId,
  initialItems,
  initialCursor,
}: {
  entityType: string;
  entityId: string;
  initialItems?: ActivityLogItem[];
  initialCursor?: string | null;
}) {
  const [items, setItems] = useState<ActivityLogItem[]>(initialItems ?? []);
  const [cursor, setCursor] = useState<string | null>(initialCursor ?? null);
  const [loading, setLoading] = useState(!initialItems);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const fetchPage = useCallback(
    async (nextCursor?: string) => {
      const sp = new URLSearchParams({
        entityType,
        entityId,
        limit: "20",
      });
      if (nextCursor) sp.set("cursor", nextCursor);
      const res = await fetch(`/api/activity-logs?${sp.toString()}`);
      if (!res.ok) throw new Error("failed");
      return res.json() as Promise<{
        items: ActivityLogItem[];
        nextCursor: string | null;
      }>;
    },
    [entityType, entityId],
  );

  useEffect(() => {
    if (initialItems) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    void fetchPage()
      .then((data) => {
        if (!cancelled) {
          setItems(data.items);
          setCursor(data.nextCursor);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchPage, initialItems]);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchPage(cursor);
      setItems((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoadingMore(false);
    }
  };

  const entityLabel = activityEntityTypeLabel(entityType).toLowerCase();

  return (
    <section className="rounded-xl border border-ink-200 bg-white p-5 space-y-3">
      <h2 className="text-[14px] font-medium tracking-tight">Activity</h2>

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 rounded-md bg-ink-100 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div>
          <p className="text-[13px] text-ink-600">Unable to load activity</p>
          <button
            type="button"
            onClick={() => {
              setError(false);
              setLoading(true);
              void fetchPage()
                .then((data) => {
                  setItems(data.items);
                  setCursor(data.nextCursor);
                })
                .catch(() => setError(true))
                .finally(() => setLoading(false));
            }}
            className="mt-2 min-h-11 h-11 px-3 rounded-lg border border-ink-200 text-[13px] font-medium"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="text-[13px] text-ink-500">No activity recorded for this {entityLabel}.</p>
      ) : (
        <>
          <ActivityLogList
            items={items}
            hideEntityLink
            currentEntityId={entityId}
          />
          {cursor ? (
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => void loadMore()}
              className="min-h-11 h-11 px-4 rounded-lg border border-ink-200 text-[13px] font-medium hover:bg-ink-50 disabled:opacity-50"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
