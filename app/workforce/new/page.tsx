import { redirect } from "next/navigation";
import { WorkforceAddForm } from "@/components/workforce/workforce-add-form";
import { canManageWorkforce } from "@/lib/auth/workforce-access-rules";
import { loadWorkforcePageContext } from "@/lib/workforce/load-page-context";

export default async function WorkforceNewPage() {
  const ctx = await loadWorkforcePageContext();

  if (!canManageWorkforce(ctx.primaryRole)) {
    redirect("/workforce?error=forbidden");
  }

  return (
    <WorkforceAddForm
      agencyName={ctx.agencyName}
      userName={ctx.userName}
      userInitials={ctx.userInitials}
      serviceArea={ctx.serviceArea}
    />
  );
}
