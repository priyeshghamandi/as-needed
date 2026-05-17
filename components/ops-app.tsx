"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon, Badge, Dot, Avatar, AvatarStack, Eyebrow } from "@/components/primitives";
import type {
  DashboardSummary,
  ActiveRequest,
  AvailableProfessional,
  ActivityLogEntry,
} from "@/lib/dashboard/queries";

// Serialized versions (dates as ISO strings across RSC boundary)
type SerializedActiveRequest = Omit<ActiveRequest, "updatedAt"> & { updatedAt: string };
type SerializedAvailableProfessional = Omit<AvailableProfessional, "lastShiftAt"> & {
  lastShiftAt: string | null;
};
type SerializedActivityLogEntry = Omit<ActivityLogEntry, "createdAt"> & { createdAt: string };

interface OpsAppProps {
  agencyName: string;
  userName: string;
  userInitials: string;
  primaryRole: string;
  summary: DashboardSummary;
  activeRequests: SerializedActiveRequest[];
  availableWorkforce: SerializedAvailableProfessional[];
  activityFeed: SerializedActivityLogEntry[];
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(diff / 3_600_000);
  if (h < 24) return `${h}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

const ROLE_LABELS: Record<string, string> = {
  rn: "RN",
  cna: "CNA",
  emt: "EMT",
  lpn: "LPN",
  cnm: "CNM",
  cns: "CNS",
  other: "Other",
};

// ───────────── Sidebar ─────────────

const NAV = [
  { id: "dashboard",  label: "Dashboard",         icon: "layout-grid" },
  { id: "requests",   label: "Staffing Requests", icon: "clipboard-list" },
  { id: "workforce",  label: "Workforce",         icon: "users" },
  { id: "facilities", label: "Facilities",        icon: "building-2" },
  { id: "shifts",     label: "Shifts",            icon: "calendar-range" },
  { id: "compliance", label: "Compliance",        icon: "shield-check" },
  { id: "messages",   label: "Messages",          icon: "message-circle" },
  { id: "reports",    label: "Reports",           icon: "bar-chart-3" },
  { id: "settings",   label: "Settings",          icon: "settings-2" },
];

function LogoMark() {
  return (
    <span className="relative w-7 h-7 rounded-lg bg-ink-900 inline-flex items-center justify-center">
      <span className="absolute inset-1.5 rounded-md ring-1 ring-paper/30" />
      <span className="block w-2 h-2 bg-teal-400 rounded-full" />
    </span>
  );
}

function Sidebar({
  agencyName,
  userName,
  userInitials,
  active,
  setActive,
}: {
  agencyName: string;
  userName: string;
  userInitials: string;
  active: string;
  setActive: (id: string) => void;
}) {
  const initials = agencyName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();

  return (
    <aside className="w-[232px] shrink-0 h-screen sticky top-0 border-r border-ink-200/70 bg-paper flex flex-col">
      <div className="px-4 h-14 flex items-center gap-2 border-b border-ink-200/70">
        <LogoMark />
        <span className="font-semibold tracking-tight text-[15px]">AsNeeded</span>
        <button className="ml-auto w-6 h-6 rounded inline-flex items-center justify-center hover:bg-ink-100 text-ink-500">
          <Icon name="chevrons-left" className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mx-3 mt-3 px-2.5 py-2 rounded-lg border border-ink-200 bg-white flex items-center gap-2.5">
        <span className="w-7 h-7 rounded-md bg-teal-700 text-white inline-flex items-center justify-center font-mono text-[11px] shrink-0">
          {initials || "AG"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-medium tracking-tight truncate">{agencyName}</div>
        </div>
      </div>

      <nav className="px-2 mt-3 flex flex-col gap-px">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => setActive(n.id)}
            className={`group flex items-center gap-2.5 px-2.5 h-9 rounded-md text-[13px] tracking-tight ${
              active === n.id ? "bg-ink-900 text-paper" : "text-ink-700 hover:bg-ink-100"
            }`}
          >
            <Icon
              name={n.icon}
              className={`w-4 h-4 ${active === n.id ? "text-paper" : "text-ink-500 group-hover:text-ink-800"}`}
            />
            <span className="flex-1 text-left">{n.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto p-3">
        <div className="rounded-lg border border-ink-200 bg-white p-3">
          <div className="flex items-center gap-2">
            <Dot tone="green" pulse />
            <div className="text-[11px] font-mono text-ink-700">All systems operational</div>
          </div>
          <div className="mt-1.5 text-[10px] font-mono text-ink-500">SOC 2 · HIPAA · 99.95% uptime</div>
        </div>
        <div className="mt-3 w-full flex items-center gap-2 px-2 h-9 rounded-md text-[13px] text-ink-800">
          <Avatar initials={userInitials} tone="teal" size={20} />
          <div className="flex-1 text-left text-[12px] tracking-tight truncate">{userName}</div>
          <Icon name="more-horizontal" className="w-3.5 h-3.5 text-ink-400" />
        </div>
      </div>
    </aside>
  );
}

// ───────────── Topbar ─────────────

function Topbar() {
  return (
    <div className="sticky top-0 z-30 h-14 bg-paper/85 backdrop-blur border-b border-ink-200/70">
      <div className="h-full px-6 flex items-center gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">Operations</div>
          <div className="text-[14px] font-medium tracking-tight leading-none mt-0.5">Live console</div>
        </div>
        <div className="ml-6 relative w-[420px] max-w-[40vw]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
            <Icon name="search" className="w-4 h-4" />
          </span>
          <input
            placeholder="Search requests, facilities, professionals…"
            className="w-full h-9 pl-9 pr-16 rounded-lg border border-ink-200 bg-white text-[13px] focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-ink-400 px-1.5 h-5 inline-flex items-center rounded border border-ink-200 bg-paper">
            ⌘K
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button className="relative w-9 h-9 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-700">
            <Icon name="bell" className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-md hover:bg-ink-100 inline-flex items-center justify-center text-ink-700">
            <Icon name="help-circle" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────── KPI strip ─────────────

function KpiCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string | number;
  sub: string;
  tone: "ink" | "green" | "teal" | "amber" | "rose";
}) {
  const toneClass =
    tone === "green"
      ? "text-emerald-700"
      : tone === "rose"
        ? "text-rose-700"
        : tone === "amber"
          ? "text-amber-700"
          : tone === "teal"
            ? "text-teal-700"
            : "text-ink-600";

  return (
    <div className="col-span-12 sm:col-span-6 xl:col-span-2 rounded-xl border border-ink-200 bg-white p-5">
      <div className="text-[11px] font-mono uppercase tracking-wider text-ink-500">{label}</div>
      <div className="mt-2 text-[32px] font-medium tracking-tight tabular-nums leading-none">
        {value}
      </div>
      <div className={`mt-2 text-[11px] font-mono ${toneClass}`}>{sub}</div>
    </div>
  );
}

function KpiStrip({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid grid-cols-12 gap-3">
      <KpiCard
        label="Open Requests"
        value={summary.openRequests}
        sub="needing attention"
        tone="ink"
      />
      <KpiCard
        label="Fill Rate"
        value={summary.fillRate > 0 ? `${summary.fillRate}%` : "—"}
        sub="rolling across requests"
        tone="green"
      />
      <KpiCard
        label="Available Professionals"
        value={summary.availableProfessionals}
        sub="ready for assignment"
        tone="teal"
      />
      <KpiCard
        label="Urgent Shifts"
        value={summary.urgentShifts}
        sub="starting within 24h"
        tone="amber"
      />
      <KpiCard
        label="Compliance Alerts"
        value={summary.complianceAlerts}
        sub="credentials need attention"
        tone="rose"
      />
    </div>
  );
}

// ───────────── Card scaffolding ─────────────

function Panel({
  title,
  sub,
  action,
  children,
  className = "",
}: {
  title: React.ReactNode;
  sub?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-ink-200 bg-white ${className}`}>
      <div className="px-5 py-3.5 border-b border-ink-100 flex items-center gap-3">
        <div>
          <div className="text-[14px] font-medium tracking-tight">{title}</div>
          {sub && <div className="text-[11px] font-mono text-ink-500 mt-0.5">{sub}</div>}
        </div>
        {action && <div className="ml-auto flex items-center gap-2">{action}</div>}
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string }> = {
    open:             { bg: "bg-ink-100 text-ink-700",    dot: "ink"   },
    matching:         { bg: "bg-teal-50 text-teal-700",   dot: "teal"  },
    partially_filled: { bg: "bg-amber-50 text-amber-700", dot: "amber" },
    confirmed:        { bg: "bg-emerald-50 text-emerald-700", dot: "green" },
    at_risk:          { bg: "bg-rose-50 text-rose-700",   dot: "rose"  },
  };
  const s = map[status] ?? map.open;
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={`inline-flex items-center gap-1.5 h-5 px-1.5 rounded text-[10px] font-mono uppercase tracking-wider ${s.bg}`}
    >
      <Dot tone={s.dot as "ink" | "teal" | "amber" | "green" | "rose"} pulse={status === "matching" || status === "at_risk"} />
      {label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const m: Record<string, string> = {
    urgent:   "bg-rose-700 text-white",
    high:     "bg-amber-100 text-amber-800",
    normal:   "bg-ink-100 text-ink-700",
    low:      "bg-ink-50 text-ink-500",
  };
  return (
    <span
      className={`inline-flex items-center h-5 px-1.5 rounded text-[10px] font-mono uppercase tracking-wider ${m[priority] ?? m.normal}`}
    >
      {priority}
    </span>
  );
}

function FillBar({
  filled,
  need,
  status,
}: {
  filled: number;
  need: number;
  status: string;
}) {
  const pct = need > 0 ? (filled / need) * 100 : 0;
  const tone =
    status === "confirmed"
      ? "bg-emerald-500"
      : status === "at_risk"
        ? "bg-rose-500"
        : status === "matching"
          ? "bg-teal-500"
          : status === "partially_filled"
            ? "bg-amber-500"
            : "bg-ink-300";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${tone} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono tabular-nums text-ink-700 w-10 text-right">
        {filled}/{need}
      </span>
    </div>
  );
}

// ───────────── Active staffing requests ─────────────

function RequestsTable({ requests }: { requests: SerializedActiveRequest[] }) {
  const [filter, setFilter] = useState<string>("All");
  const filters = ["All", "open", "matching", "partially_filled", "at_risk"];
  const rows = requests.filter((r) => filter === "All" || r.status === filter);

  return (
    <Panel
      title="Active Staffing Requests"
      sub="Requests needing coordinator attention"
      action={
        <>
          <div className="inline-flex items-center gap-1 p-0.5 rounded-md bg-ink-50 border border-ink-200">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 h-6 rounded text-[11px] font-mono capitalize ${
                  filter === f ? "bg-white text-ink-900 shadow-sm" : "text-ink-600 hover:text-ink-900"
                }`}
              >
                {f === "All" ? "All" : f.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <Link
            href="/staffing-requests/new"
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-ink-900 text-paper text-[12px] hover:bg-ink-800"
          >
            <Icon name="plus" className="w-3.5 h-3.5" /> New request
          </Link>
        </>
      }
    >
      {rows.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <Icon name="clipboard-list" className="w-8 h-8 text-ink-300 mx-auto mb-3" />
          <div className="text-[14px] font-medium text-ink-700">No active staffing requests</div>
          <div className="mt-1 text-[12px] font-mono text-ink-400">
            When facilities or your team create requests, they will appear here.
          </div>
          <Link
            href="/staffing-requests/new"
            className="mt-4 inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-ink-900 text-paper text-[12px] hover:bg-ink-800"
          >
            <Icon name="plus" className="w-3.5 h-3.5" /> Create your first request
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto scrollarea">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-ink-500 border-b border-ink-100">
                <th className="px-5 py-2 font-medium">Request · Facility</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Priority</th>
                <th className="px-3 py-2 font-medium">Progress</th>
                <th className="px-3 py-2 font-medium">Coordinator</th>
                <th className="px-3 py-2 font-medium">Updated</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b last:border-0 border-ink-100 hover:bg-ink-50/40 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-md bg-paper/60 border border-ink-200 inline-flex items-center justify-center text-ink-600">
                        <Icon name="building-2" className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="font-medium tracking-tight truncate max-w-[200px]">
                          {r.title}
                        </div>
                        <div className="text-[10px] font-mono text-ink-500">{r.facilityName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1.5 text-[12px]">
                      <Icon name="stethoscope" className="w-3.5 h-3.5 text-ink-400" />
                      {ROLE_LABELS[r.roleNeeded] ?? r.roleNeeded.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-3 py-3">
                    <PriorityBadge priority={r.priority} />
                  </td>
                  <td className="px-3 py-3 w-[160px]">
                    <FillBar filled={r.filledCount} need={r.professionalsRequired} status={r.status} />
                  </td>
                  <td className="px-3 py-3 text-[12px] text-ink-600">
                    {r.coordinatorName ?? (
                      <span className="text-ink-400 font-mono text-[11px]">Unassigned</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-[11px] font-mono text-ink-500">
                    {formatRelativeTime(r.updatedAt)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button className="w-7 h-7 rounded hover:bg-ink-100 inline-flex items-center justify-center text-ink-500">
                      <Icon name="more-horizontal" className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

// ───────────── Workforce panel ─────────────

function ComplianceBadge({ status }: { status: "clear" | "attention" | "blocked" }) {
  if (status === "blocked")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-700">
        <Icon name="shield-x" className="w-3 h-3" /> Blocked
      </span>
    );
  if (status === "attention")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-700">
        <Icon name="shield-alert" className="w-3 h-3" /> Attention
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700">
      <Icon name="shield-check" className="w-3 h-3" /> Clear
    </span>
  );
}

function WorkforcePanel({ professionals }: { professionals: SerializedAvailableProfessional[] }) {
  return (
    <Panel
      title="Available Workforce"
      sub="Healthcare professionals ready for assignment"
      action={
        <Link
          href="/workforce/new"
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-ink-900 text-paper text-[12px] hover:bg-ink-800"
        >
          <Icon name="user-plus" className="w-3.5 h-3.5" /> Add professional
        </Link>
      }
    >
      {professionals.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <Icon name="users" className="w-8 h-8 text-ink-300 mx-auto mb-3" />
          <div className="text-[14px] font-medium text-ink-700">No available professionals</div>
          <div className="mt-1 text-[12px] font-mono text-ink-400">
            Add healthcare professionals to your roster and mark them available.
          </div>
          <Link
            href="/workforce/new"
            className="mt-4 inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-ink-900 text-paper text-[12px] hover:bg-ink-800"
          >
            <Icon name="user-plus" className="w-3.5 h-3.5" /> Add healthcare professional
          </Link>
        </div>
      ) : (
        <div className="max-h-[420px] overflow-y-auto scrollarea">
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-ink-500 border-b border-ink-100">
                <th className="px-5 py-2 font-medium">Professional</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium hidden md:table-cell">Location</th>
                <th className="px-3 py-2 font-medium">Compliance</th>
                <th className="px-3 py-2 font-medium hidden md:table-cell">Reliability</th>
                <th className="px-3 py-2 font-medium">Last shift</th>
              </tr>
            </thead>
            <tbody>
              {professionals.map((p, i) => (
                <tr key={p.id} className="border-b last:border-0 border-ink-100 hover:bg-ink-50/40">
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        initials={`${p.firstName[0] ?? ""}${p.lastName[0] ?? ""}`}
                        tone={(["teal", "violet", "amber", "rose", "ink"] as const)[i % 5]}
                        size={26}
                      />
                      <Link
                        href={`/workforce/${p.id}`}
                        className="font-medium tracking-tight hover:text-teal-700"
                      >
                        {p.firstName} {p.lastName}
                      </Link>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-ink-700">
                    {ROLE_LABELS[p.role] ?? p.role.toUpperCase()}
                  </td>
                  <td className="px-3 py-2.5 text-[12px] font-mono text-ink-600 hidden md:table-cell">
                    {p.city && p.state ? `${p.city}, ${p.state}` : <span className="text-ink-400">—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <ComplianceBadge status={p.complianceStatus} />
                  </td>
                  <td className="px-3 py-2.5 text-[12px] font-mono text-ink-600 hidden md:table-cell">
                    {p.reliabilityScore ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-[11px] font-mono text-ink-500">
                    {p.lastShiftAt ? formatRelativeTime(p.lastShiftAt) : "No shifts yet"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

// ───────────── Activity feed ─────────────

const ENTITY_ICONS: Record<string, string> = {
  staffing_request: "clipboard-list",
  shift: "calendar-range",
  professional: "user",
  credential: "shield-check",
  facility: "building-2",
  user: "user",
  agency: "building",
  invite: "mail",
};

const ACTION_TONES: Record<string, string> = {
  created: "teal",
  updated: "ink",
  deleted: "rose",
  completed: "green",
  cancelled: "rose",
  submitted: "teal",
  verified: "green",
  expired: "amber",
  invited: "teal",
  accepted: "green",
  declined: "rose",
};

function formatActivityLabel(action: string, entityType: string): string {
  const entityLabel =
    entityType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const verb = action.split(".").pop() ?? action;
  const verbLabel = verb.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return `${entityLabel} ${verbLabel}`;
}

function ActivityFeed({ feed }: { feed: SerializedActivityLogEntry[] }) {
  return (
    <Panel
      title="Recent Activity"
      sub="Latest operational events for your agency"
      action={
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-700">
          <Dot tone="green" pulse /> live
        </span>
      }
    >
      {feed.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <Icon name="activity" className="w-8 h-8 text-ink-300 mx-auto mb-3" />
          <div className="text-[14px] font-medium text-ink-700">No recent activity</div>
          <div className="mt-1 text-[12px] font-mono text-ink-400">
            Operational events will appear here as your team works.
          </div>
        </div>
      ) : (
        <div className="px-5 py-4 max-h-[360px] overflow-y-auto scrollarea">
          <ol className="relative pl-4 border-l border-ink-200">
            {feed.map((a) => {
              const verbKey = (a.action.split(".").pop() ?? a.action).toLowerCase();
              const tone = ACTION_TONES[verbKey] ?? "ink";
              const icon = ENTITY_ICONS[a.entityType] ?? "activity";
              const dotColor =
                tone === "green"
                  ? "bg-emerald-500"
                  : tone === "rose"
                    ? "bg-rose-500"
                    : tone === "amber"
                      ? "bg-amber-500"
                      : tone === "teal"
                        ? "bg-teal-500"
                        : "bg-ink-400";

              return (
                <li key={a.id} className="relative pl-4 pb-3 last:pb-0">
                  <span
                    className={`absolute -left-[7px] top-1 w-2.5 h-2.5 rounded-full ring-2 ring-white ${dotColor}`}
                  />
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-mono text-ink-500 w-10 shrink-0">
                      {formatRelativeTime(a.createdAt)}
                    </span>
                    <Icon
                      name={icon}
                      className={`w-3.5 h-3.5 ${
                        tone === "green"
                          ? "text-emerald-600"
                          : tone === "rose"
                            ? "text-rose-600"
                            : tone === "amber"
                              ? "text-amber-600"
                              : tone === "teal"
                                ? "text-teal-600"
                                : "text-ink-500"
                      }`}
                    />
                    <div className="flex-1 text-[12px] leading-snug">
                      <span className="font-medium tracking-tight">
                        {a.actorName ?? "System"}
                      </span>{" "}
                      <span className="text-ink-600">
                        {formatActivityLabel(a.action, a.entityType).toLowerCase()}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </Panel>
  );
}

// ───────────── Quick actions ─────────────

const ALL_QUICK_ACTIONS = [
  {
    icon: "send",
    label: "Create staffing request",
    href: "/staffing-requests/new",
    roles: ["agency_owner", "agency_admin", "staffing_coordinator"],
    primary: true,
  },
  {
    icon: "user-plus",
    label: "Add healthcare professional",
    href: "/workforce/new",
    roles: ["agency_owner", "agency_admin", "recruiter"],
    primary: false,
  },
  {
    icon: "building-2",
    label: "Add facility",
    href: "/facilities/new",
    roles: ["agency_owner", "agency_admin", "staffing_coordinator"],
    primary: false,
  },
  {
    icon: "users",
    label: "View workforce",
    href: "/workforce",
    roles: ["agency_owner", "agency_admin", "staffing_coordinator", "recruiter", "compliance_manager"],
    primary: false,
  },
  {
    icon: "building",
    label: "View facilities",
    href: "/facilities",
    roles: ["agency_owner", "agency_admin", "staffing_coordinator", "recruiter", "compliance_manager"],
    primary: false,
  },
];

function QuickActions({ primaryRole }: { primaryRole: string }) {
  const visibleActions = ALL_QUICK_ACTIONS.filter((a) => a.roles.includes(primaryRole));

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {visibleActions.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className={`inline-flex items-center gap-2 h-9 px-4 rounded-full text-[13px] font-medium ${
            a.primary
              ? "bg-ink-900 text-paper hover:bg-ink-800"
              : "border border-ink-200 bg-white text-ink-800 hover:bg-ink-50"
          }`}
        >
          <Icon name={a.icon} className="w-3.5 h-3.5" />
          {a.label}
        </Link>
      ))}
    </div>
  );
}

// ───────────── Page ─────────────

export function OpsApp({
  agencyName,
  userName,
  userInitials,
  primaryRole,
  summary,
  activeRequests,
  availableWorkforce,
  activityFeed,
}: OpsAppProps) {
  const [active, setActive] = useState("dashboard");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const now = new Date();
    setDateStr(
      now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
    );
  }, []);

  const firstName = userName.split(" ")[0] ?? userName;
  const hour = typeof window !== "undefined" ? new Date().getHours() : 12;
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  return (
    <div className="min-h-screen bg-paper text-ink-900 flex">
      <Sidebar
        agencyName={agencyName}
        userName={userName}
        userInitials={userInitials}
        active={active}
        setActive={setActive}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="px-6 py-6 space-y-6 rise-in">
          {/* Greeting */}
          <div className="flex items-end justify-between">
            <div>
              <Eyebrow><span suppressHydrationWarning>{dateStr || " "}</span></Eyebrow>
              <h1 className="mt-1 text-[28px] leading-tight tracking-[-0.01em] font-medium">
                Good {greeting}, {firstName}.
                <span className="font-serif italic text-teal-800"> Operations board.</span>
              </h1>
            </div>
            <QuickActions primaryRole={primaryRole} />
          </div>

          {/* KPI strip */}
          <KpiStrip summary={summary} />

          {/* Main two-column grid */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-7">
              <RequestsTable requests={activeRequests} />
            </div>
            <div className="col-span-12 lg:col-span-5">
              <WorkforcePanel professionals={availableWorkforce} />
            </div>
          </div>

          {/* Activity feed */}
          <ActivityFeed feed={activityFeed} />

          <div className="text-center text-[10px] font-mono text-ink-400 py-4">
            AsNeeded · operations · all signals nominal
          </div>
        </main>
      </div>
    </div>
  );
}
