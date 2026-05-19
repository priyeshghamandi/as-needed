import { SignOutButton } from "@/components/sign-out-button";

export function FacilityNotLinked({ userName }: { userName: string }) {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-[24px] font-medium tracking-tight">No facility linked</h1>
        <p className="text-[14px] text-ink-600 leading-relaxed">
          Signed in as {userName}. Your account is not linked to a facility yet. Contact your
          staffing agency to send you an invite, then accept it using the link in your email.
        </p>
        <div className="pt-4">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
