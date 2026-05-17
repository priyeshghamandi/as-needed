import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-paper">
      <Suspense
        fallback={
          <div className="max-w-[480px] mx-auto px-8 py-16 text-[14px] text-ink-600">
            Loading…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
