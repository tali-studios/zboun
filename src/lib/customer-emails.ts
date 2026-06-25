import { sendMail, isSmtpConfigured } from "@/lib/mail";
import { ZBOUN_OPS_EMAIL } from "@/lib/zboun-contact";
import { getSiteUrl } from "@/lib/site";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function emailShell(title: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
        <tr><td style="background:#4c1d95;padding:24px 28px;">
          <p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#ddd6fe;">Zboun</p>
          <h1 style="margin:8px 0 0;font-size:22px;font-weight:600;color:#ffffff;">${escapeHtml(title)}</h1>
        </td></tr>
        <tr><td style="padding:28px;color:#27272a;font-size:15px;line-height:1.6;">${bodyHtml}</td></tr>
        <tr><td style="padding:0 28px 28px;color:#71717a;font-size:13px;line-height:1.5;">
          Questions? Contact us at <a href="mailto:${ZBOUN_OPS_EMAIL}" style="color:#4c1d95;">${ZBOUN_OPS_EMAIL}</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendCustomerWelcomeEmail(params: { to: string; name: string }) {
  if (!isSmtpConfigured()) return;

  const siteUrl = getSiteUrl();
  const loginUrl = `${siteUrl}/login`;
  const firstName = params.name.trim().split(/\s+/)[0] || "there";
  const safeName = escapeHtml(firstName);

  const bodyHtml = `
    <p style="margin:0 0 16px;">Hi ${safeName},</p>
    <p style="margin:0 0 16px;">
      Welcome to <strong>Zboun</strong> — your account is verified and you're all set.
    </p>
    <p style="margin:0 0 16px;">Here's what you can do:</p>
    <ul style="margin:0 0 20px;padding-left:20px;">
      <li style="margin-bottom:8px;">Discover restaurants near you</li>
      <li style="margin-bottom:8px;">Browse digital menus and build your order</li>
      <li style="margin-bottom:8px;">Send clear orders on WhatsApp in one tap</li>
      <li style="margin-bottom:8px;">Save favorites and track your order history</li>
    </ul>
    <p style="margin:0 0 24px;text-align:center;">
      <a href="${loginUrl}" style="display:inline-block;background:#4c1d95;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 28px;border-radius:999px;">
        Start browsing
      </a>
    </p>
    <p style="margin:0;color:#71717a;font-size:14px;">
      Glad to have you with us — happy ordering!
    </p>`;

  const text = [
    `Hi ${firstName},`,
    "",
    "Welcome to Zboun — your account is verified and you're all set.",
    "",
    "Here's what you can do:",
    "- Discover restaurants near you",
    "- Browse digital menus and build your order",
    "- Send clear orders on WhatsApp in one tap",
    "- Save favorites and track your order history",
    "",
    `Start browsing: ${loginUrl}`,
    "",
    "Glad to have you with us — happy ordering!",
    "",
    `Questions? Contact us at ${ZBOUN_OPS_EMAIL}.`,
  ].join("\n");

  await sendMail({
    to: params.to,
    subject: "Welcome to Zboun — you're all set!",
    text,
    html: emailShell("Welcome to Zboun", bodyHtml),
  });
}
