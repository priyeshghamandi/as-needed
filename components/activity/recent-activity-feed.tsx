"use client";

import { useCallback, useState } from "react";
import { Icon } from "@/components/primitives";
import { ActivityLogList } from "@/components/activity/activity-log-list";
import type { ActivityLogItem } from "@/lib/activity/types";

const DASHBOARD_MAX = 50;
const LOAD_MORE_SIZE = 15;

function Panel({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-ink-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-ink-200/70 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-medium tracking-tight">{title}</h2>
          <p className="mt-0.5 text-[12px] font-mono text-ink-500">{sub}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function RecentActivityFeed({
  initialItems,
  initialCursor,
}: {
  initialItems: ActivityLogItem[];
  initialCursor: string | null;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const canLoadMore = Boolean(cursor) && items.length < DASHBOARD_MAX;

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    setError(false);
    try {
      const sp = new URLSearchParams({ limit: String(LOAD_MORE_SIZE), cursor });
      const res = await fetch(`/api/activity-logs?${sp.toString()}`);
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as {
        items: ActivityLogItem[];
        nextCursor: string | null;
      };
      setItems((prev) => [...prev, ...data.items].slice(0, DASHBOARD_MAX));
      setCursor(data.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading]);

  const retry = useCallback(async () => {
    setError(false);
    setLoading(true);
    try {
      const res = await fetch("/api/activity-logs?limit=15");
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as {
        items: ActivityLogItem[];
        nextCursor: string | null;
      };
      setItems(data.items);
      setCursor(data.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <Panel
      title="Recent activity"
      sub="Latest operational events across your agency"
    >
      {error ? (
        <div className="px-5 py-8 text-center">
          <p className="text-[14px] font-medium text-ink-900">Unable to load activity</p>
          <button
            type="button"
            onClick={() => void retry()}
            className="mt-3 h-11 px-4 rounded-lg bg-ink-900 text-paper text-[13px] font-medium"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <Icon name="activity" className="w-8 h-8 text-ink-300 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-ink-700">No activity yet</p>
          <p className="mt-1 text-[12px] font-mono text-ink-400">
            Events appear as your team uses the platform.
          </p>
        </div>
      ) : (
        <div className="px-5 py-4 max-h-[420px] overflow-y-auto scrollarea">
          <ActivityLogList items={items} />
          {canLoadMore ? (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                disabled={loading}
                onClick={() => void loadMore()}
                className="min-h-11 h-11 px-4 rounded-lg border border-ink-200 bg-white text-[13px] font-medium hover:bg-ink-50 disabled:opacity-50"
              >
                {loading ? "Loading…" : "Load more"}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </Panel>
  );
}
