import { env } from "@/data/env/server";

export function isEmailConfigured(): boolean {
  return Boolean(env.SENDGRID_API_KEY && env.EMAIL_FROM);
}
