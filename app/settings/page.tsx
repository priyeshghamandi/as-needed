import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/auth";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-paper p-8">
      <h1 className="text-[28px] font-medium tracking-tight">Settings</h1>
      <p className="mt-2 text-[14px] text-ink-600">
        Signed in as {session?.user?.email ?? "unknown"}
      </p>
      <div className="mt-6">
        <SignOutButton />
      </div>
    </main>
  );
}
