import { ForbiddenError, requireAuthContext } from "@/lib/auth/authorization";
import { isProviderRole, type AppRole } from "@/lib/auth/roles";
import {
  resolveProfessionalByUserId,
  type ResolvedProfessional,
} from "@/lib/provider/resolve-professional";

export type ProviderContext = {
  userId: string;
  professional: ResolvedProfessional | null;
};

export async function requireProviderContext(): Promise<ProviderContext> {
  const { context } = await requireAuthContext();
  if (!isProviderRole((context.primaryRole ?? "") as AppRole)) {
    throw new ForbiddenError("Provider access required.");
  }

  const professional = await resolveProfessionalByUserId(context.userId);
  return { userId: context.userId, professional };
}

export async function requireLinkedProviderContext(): Promise<
  ProviderContext & { professional: ResolvedProfessional }
> {
  const ctx = await requireProviderContext();
  if (!ctx.professional) {
    throw new ForbiddenError("Your account is not linked to a professional profile.");
  }
  return { ...ctx, professional: ctx.professional };
}
