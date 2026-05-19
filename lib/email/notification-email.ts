import type { NotificationPriority } from "@/lib/notifications/types";

const EMAIL_PRIORITIES = new Set<NotificationPriority>([
  "important",
  "urgent",
  "critical",
]);

export function shouldEmailNotificationPriority(
  priority: NotificationPriority | undefined,
): boolean {
  return EMAIL_PRIORITIES.has(priority ?? "info");
}

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

export function buildNotificationEmail(input: {
  title: string;
  message: string;
  priority: NotificationPriority | undefined;
  actionHref: string;
  recipientName: string | null;
}): { subject: string; text: string; html: string } {
  const subject = `[AsNeeded] ${input.title}`;
  const actionUrl = `${appBaseUrl()}${input.actionHref.startsWith("/") ? input.actionHref : `/${input.actionHref}`}`;
  const greeting = input.recipientName?.trim()
    ? `Hi ${input.recipientName.trim()},`
    : "Hi,";

  const text = [
    greeting,
    "",
    input.title,
    "",
    input.message,
    "",
    `View in AsNeeded: ${actionUrl}`,
    "",
    "— AsNeeded Operations",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f6f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7f8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#0f766e;">AsNeeded Alert</p>
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;font-weight:600;">${escapeHtml(input.title)}</h1>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;white-space:pre-wrap;">${escapeHtml(input.message)}</p>
                <a href="${escapeHtml(actionUrl)}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:14px;font-weight:500;padding:12px 20px;border-radius:999px;">View in AsNeeded</a>
                <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#6b7280;">Priority: ${escapeHtml(input.priority ?? "info")}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
