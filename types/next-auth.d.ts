import type { DefaultSession } from "next-auth";
import type { ScopedRole } from "@/lib/auth/roles";
import type { AppRole } from "@/lib/auth/roles";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: ScopedRole[];
      primaryRole: AppRole | null;
      agencyId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles?: ScopedRole[];
    primaryRole?: AppRole | null;
    agencyId?: string | null;
  }
}
