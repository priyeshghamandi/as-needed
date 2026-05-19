import { Badge } from "@/components/primitives";
import type { FacilityAssignedProfessional } from "@/lib/facility/queries";

export function AssignedProfessionalCard({ pro }: { pro: FacilityAssignedProfessional }) {
  return (
    <article className="rounded-xl border border-ink-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-medium tracking-tight">{pro.professionalName}</h3>
          <p className="text-[13px] text-ink-600 mt-0.5">{pro.roleLabel}</p>
        </div>
        <Badge tone={pro.complianceVerified ? "teal" : "amber"}>
          {pro.complianceVerified ? "Credentials verified" : "Credentials pending"}
        </Badge>
      </div>
      <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
        <div>
          <dt className="text-ink-500 font-mono text-[10px] uppercase tracking-wider">Shift</dt>
          <dd className="text-ink-800 mt-0.5">{pro.shiftWindow}</dd>
        </div>
        <div>
          <dt className="text-ink-500 font-mono text-[10px] uppercase tracking-wider">Status</dt>
          <dd className="text-ink-800 mt-0.5 capitalize">{pro.assignmentStatus.replace(/_/g, " ")}</dd>
        </div>
      </dl>
    </article>
  );
}
