import Link from "next/link";
import { notFound } from "next/navigation";
import { InviteAcceptForm } from "@/components/invite-accept-form";
import { getInviteByToken } from "@/lib/services/invites";

const ROLE_LABELS: Record<string, string> = {
  agency_admin: "Agency Admin",
  staffing_coordinator: "Staffing Coordinator",
  recruiter: "Recruiter",
  compliance_manager: "Compliance Manager",
  provider: "Healthcare Professional",
  facility_user: "Facility User",
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await getInviteByToken(token);

  if (!invite) {
    notFound();
  }

  if (invite.status === "accepted") {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center px-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-[24px] font-medium tracking-tight">Invite already used</h1>
          <p className="text-[14px] text-ink-600">
            This invitation has already been accepted.
          </p>
          <Link href="/login" className="text-teal-800 font-medium hover:underline text-[14px]">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  if (invite.status === "expired" || invite.status === "revoked") {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center px-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-[24px] font-medium tracking-tight">Invite expired</h1>
          <p className="text-[14px] text-ink-600">
            This invitation is no longer valid. Request a new invite from your agency
            administrator.
          </p>
          <Link href="/login" className="text-teal-800 font-medium hover:underline text-[14px]">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper">
      <InviteAcceptForm
        token={invite.token}
        email={invite.email}
        agencyName={invite.agencyName}
        roleLabel={ROLE_LABELS[invite.role] ?? invite.role}
      />
    </main>
  );
}
