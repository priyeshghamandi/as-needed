import Link from "next/link";
import { FacilityNotLinked } from "@/components/facility/facility-not-linked";
import { loadFacilityPageContext } from "@/lib/facility/load-page-context";

export default async function FacilityRequestNotFound() {
  const ctx = await loadFacilityPageContext("/facility/requests");

  if (!ctx.linked) {
    return <FacilityNotLinked userName={ctx.userName} />;
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-[24px] font-medium tracking-tight">Request not found</h1>
        <p className="text-[14px] text-ink-600">
          This staffing request does not exist or is not linked to your facility.
        </p>
        <Link
          href="/facility/requests"
          className="inline-flex text-[14px] text-teal-700 hover:underline"
        >
          Back to staffing requests
        </Link>
      </div>
    </div>
  );
}
