import Link from "next/link";
import { FacilityShell } from "@/components/facility/facility-shell";
import { StatusBadge } from "@/lib/staffing-requests/staffing-requests-ui";
import type { FacilityDashboardData } from "@/lib/facility/queries";

const PRIMARY_LINK_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-colors h-11 px-5 text-[14px] bg-ink-900 text-paper hover:bg-ink-800 border border-ink-900";

export function FacilityDashboardView({
  facilityName,
  agencyName,
  userName,
  userInitials,
  data,
}: {
  facilityName: string;
  agencyName: string;
  userName: string;
  userInitials: string;
  data: FacilityDashboardData;
}) {
  const kpis = [
    { label: "Open requests", value: data.kpis.openRequests },
    { label: "At risk", value: data.kpis.atRisk },
    { label: "Confirmed this week", value: data.kpis.confirmedThisWeek },
    { label: "Upcoming shifts", value: data.kpis.upcomingShifts },
  ];

  return (
    <FacilityShell
      facilityName={facilityName}
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      title="Dashboard"
      subtitle="Operational summary for your facility staffing requests."
      headerAction={
        <Link href="/facility/requests/new" className={PRIMARY_LINK_CLASS}>
          Create staffing request
        </Link>
      }
    >
      <section aria-labelledby="facility-kpis-heading">
        <h2 id="facility-kpis-heading" className="sr-only">
          Key metrics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-ink-200 bg-white p-4"
            >
              <p className="text-[11px] font-mono uppercase tracking-wider text-ink-500">
                {kpi.label}
              </p>
              <p className="mt-2 text-[28px] font-medium tabular-nums tracking-tight">
                {kpi.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-medium">Active staffing requests</h2>
            <Link href="/facility/requests" className="text-[13px] text-teal-700 hover:underline">
              View all
            </Link>
          </div>
          {data.activeRequests.length === 0 ? (
            <p className="text-[14px] text-ink-600 rounded-xl border border-dashed border-ink-200 p-6">
              No active requests. Create a staffing request to get started.
            </p>
          ) : (
            <div className="rounded-xl border border-ink-200 bg-white overflow-hidden">
              <table className="w-full text-[13px] hidden md:table">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-ink-500">
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.activeRequests.map((row) => (
                    <tr key={row.id} className="border-b border-ink-50 last:border-0">
                      <td className="px-4 py-3">
                        <Link
                          href={`/facility/requests/${row.id}`}
                          className="text-teal-800 hover:underline font-medium"
                        >
                          {row.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink-700">{row.roleLabel}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul className="md:hidden divide-y divide-ink-100">
                {data.activeRequests.map((row) => (
                  <li key={row.id} className="p-4">
                    <Link
                      href={`/facility/requests/${row.id}`}
                      className="font-medium text-teal-800 hover:underline"
                    >
                      {row.title}
                    </Link>
                    <p className="text-[12px] text-ink-600 mt-1">
                      {row.roleLabel} · <StatusBadge status={row.status} />
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-[15px] font-medium mb-3">Upcoming assigned staff</h2>
          {data.upcomingStaff.length === 0 ? (
            <p className="text-[14px] text-ink-600 rounded-xl border border-dashed border-ink-200 p-6">
              No confirmed coverage in the next 14 days.
            </p>
          ) : (
            <ul className="space-y-3">
              {data.upcomingStaff.map((staff) => (
                <li
                  key={staff.assignmentId}
                  className="rounded-xl border border-ink-200 bg-white p-4"
                >
                  <p className="text-[14px] font-medium">{staff.professionalName}</p>
                  <p className="text-[12px] text-ink-600 mt-0.5">
                    {staff.roleLabel} · {staff.requestTitle}
                  </p>
                  <p className="text-[12px] font-mono text-ink-500 mt-1">{staff.shiftWindow}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </FacilityShell>
  );
}
