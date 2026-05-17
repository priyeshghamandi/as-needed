import { execSync } from "node:child_process";

export default async function globalSetup() {
  execSync("npm run db:migrate", { stdio: "inherit", cwd: process.cwd() });
  execSync("npx tsx --env-file=.env scripts/seed-dashboard-e2e.ts", {
    stdio: "inherit",
    cwd: process.cwd(),
  });
  execSync("npx tsx --env-file=.env scripts/seed-onboarding-e2e.ts", {
    stdio: "inherit",
    cwd: process.cwd(),
  });
}
