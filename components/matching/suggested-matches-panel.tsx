"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { inviteProfessionalToShiftAction } from "@/actions/matching/invite-professional";
import { canManageAssignments } from "@/lib/auth/assignments-access-rules";
import { AvailabilityBadge } from "@/lib/matching/match-ui";
import type { MatchCandidateRow } from "@/lib/matching/types";

export function SuggestedMatchesPanel({
  requestId,
  shiftId,
  primaryRole,
  candidates,
}: {
  requestId: string;
  shiftId: string;
  primaryRole: string;
  candidates: MatchCandidateRow[];
}) {
  const router = useRouter();
  const canWrite = canManageAssignments(primaryRole);

  async function handleInvite(professionalId: string) {
    const result = await inviteProfessionalToShiftAction(shiftId, professionalId);
    if (result.status === "success") {
      router.refresh();
    }
  }

  return (
    <section className="rounded-xl border border-ink-200 bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[14px] font-medium tracking-tight">Suggested matches</h2>
        <Link
          href={`/staffing-requests/${requestId}/match?shiftId=${shiftId}`}
          className="text-[13px] text-teal-700 hover:underline"
        >
          View all
        </Link>
      </div>
      {candidates.length === 0 ? (
        <p className="mt-2 text-[13px] text-ink-500">No matching professionals found.</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink-100">
          {candidates.map((candidate) => (
            <li
              key={candidate.id}
              className="py-2 flex flex-wrap items-center justify-between gap-2 text-[13px]"
            >
              <div>
                <span className="font-medium">
                  {candidate.firstName} {candidate.lastName}
                </span>
                <span className="text-ink-500 ml-2 uppercase text-[11px]">{candidate.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <AvailabilityBadge status={candidate.availabilityStatus} />
                {canWrite &&
                (!candidate.assignmentStatus ||
                  candidate.assignmentStatus === "declined" ||
                  candidate.assignmentStatus === "cancelled") ? (
                  <button
                    type="button"
                    aria-label={`Invite ${candidate.firstName} ${candidate.lastName}`}
                    onClick={() => handleInvite(candidate.id)}
                    className="text-teal-700 hover:underline"
                  >
                    Invite
                  </button>
                ) : candidate.assignmentStatus === "invited" ? (
                  <span className="text-[12px] text-ink-500">Invited</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
