import Link from "next/link";
import { FacilityShell } from "@/components/facility/facility-shell";
import { FulfillmentTimeline } from "@/components/facility/fulfillment-timeline";
import { AssignedProfessionalCard } from "@/components/facility/assigned-professional-card";
import { StatusBadge } from "@/lib/staffing-requests/staffing-requests-ui";
import { PRIORITY_LABELS, PRIORITY_TONES } from "@/lib/ui/status-colors";
import { Badge } from "@/components/primitives";
import type { FacilityRequestDetail } from "@/lib/facility/queries";

export function FacilityRequestDetailView({
  facilityName,
  agencyName,
  userName,
  userInitials,
  request,
  showSubmittedBanner,
}: {
  facilityName: string;
  agencyName: string;
  userName: string;
  userInitials: string;
  request: FacilityRequestDetail;
  showSubmittedBanner?: boolean;
}) {
  return (
    <FacilityShell
      facilityName={facilityName}
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      title={request.title}
      subtitle="Staffing request fulfillment progress"
      headerAction={
        <Link href="/facility/requests" className="text-[13px] text-ink-600 hover:text-ink-900">
          Back to requests
        </Link>
      }
    >
      <div className="space-y-8">
        {showSubmittedBanner ? (
          <div
            role="status"
            className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-[14px] text-teal-900"
          >
            Your staffing request was submitted. Agency coordinators will begin matching
            professionals.
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={request.status} />
          <Badge tone={PRIORITY_TONES[request.priority] ?? "neutral"}>
            {PRIORITY_LABELS[request.priority] ?? request.priority}
          </Badge>
          <span className="text-[13px] text-ink-600">
            {request.roleLabel}
            {request.specialty ? ` · ${request.specialty}` : ""} · {request.professionalsRequired}{" "}
            required
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="rounded-xl border border-ink-200 bg-white p-6">
            <h2 className="text-[15px] font-medium mb-4">Fulfillment timeline</h2>
            <FulfillmentTimeline steps={request.timeline} />
          </section>

          <section className="space-y-6">
            <div className="rounded-xl border border-ink-200 bg-white p-6">
              <h2 className="text-[15px] font-medium mb-3">Coordinator</h2>
              {request.coordinator?.email ? (
                <p className="text-[14px] text-ink-700">
                  {request.coordinator.name ?? "Coordinator"}{" "}
                  <a
                    href={`mailto:${request.coordinator.email}`}
                    className="text-teal-700 hover:underline font-mono text-[13px]"
                  >
                    {request.coordinator.email}
                  </a>
                </p>
              ) : (
                <p className="text-[14px] text-ink-600">
                  Your agency will assign a coordinator shortly.
                </p>
              )}
            </div>

            {request.shifts.length > 0 ? (
              <div className="rounded-xl border border-ink-200 bg-white p-6">
                <h2 className="text-[15px] font-medium mb-3">Shift</h2>
                <ul className="space-y-2 text-[13px] text-ink-700">
                  {request.shifts.map((shift) => (
                    <li key={shift.id}>
                      {shift.shiftWindow}{" "}
                      <span className="text-ink-500 capitalize">({shift.status})</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {request.notes || request.facilityInstructions ? (
              <div className="rounded-xl border border-ink-200 bg-white p-6 space-y-3 text-[14px] text-ink-700">
                {request.notes ? (
                  <div>
                    <h3 className="text-[12px] font-mono uppercase tracking-wider text-ink-500 mb-1">
                      Notes
                    </h3>
                    <p>{request.notes}</p>
                  </div>
                ) : null}
                {request.facilityInstructions ? (
                  <div>
                    <h3 className="text-[12px] font-mono uppercase tracking-wider text-ink-500 mb-1">
                      Facility instructions
                    </h3>
                    <p>{request.facilityInstructions}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>

        {request.assignedProfessionals.length > 0 ? (
          <section>
            <h2 className="text-[15px] font-medium mb-3">Assigned professionals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {request.assignedProfessionals.map((pro) => (
                <AssignedProfessionalCard key={pro.assignmentId} pro={pro} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </FacilityShell>
  );
}
