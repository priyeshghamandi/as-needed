import sgMail from "@sendgrid/mail";
import { env } from "@/data/env/server";
import { isEmailConfigured } from "@/lib/email/is-configured";

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export async function sendEmail(input: SendEmailInput): Promise<void> {
  if (!isEmailConfigured()) {
    return;
  }

  sgMail.setApiKey(env.SENDGRID_API_KEY!);

  await sgMail.send({
    to: input.to,
    from: env.EMAIL_FROM!,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}
