/**
 * Loads `.env` from the project root before @t3-oss/env-nextjs runs.
 * Next.js loads this automatically; standalone `tsx` scripts do not.
 */
import process from "node:process";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env");

try {
  process.loadEnvFile(envPath);
} catch (error) {
  const code = error instanceof Error && "code" in error ? error.code : undefined;
  if (code !== "ENOENT") {
    throw error;
  }
}
