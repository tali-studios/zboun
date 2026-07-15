import { sendMail, getOpsEmail, isSmtpConfigured } from "@/lib/mail";
import {
  contractPdfFilename,
  generateContractPdfBuffer,
} from "@/lib/contract-pdf";
import { formatDateLong } from "@/lib/subscription-billing";
import {
  billingCycleLabel,
  inferSubscriptionInterval,
  type SubscriptionInterval,
  ZBOUN_PRICING,
} from "@/lib/pricing";
import { ZBOUN_OPS_EMAIL } from "@/lib/zboun-contact";
import { getPublicAppUrl } from "@/lib/public-app-url";

function emailShell(title: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
        <tr><td style="background:#4c1d95;padding:24px 28px;">
          <p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#ddd6fe;">Zboun</p>
          <h1 style="margin:8px 0 0;font-size:22px;font-weight:600;color:#ffffff;">${title}</h1>
        </td></tr>
        <tr><td style="padding:28px;color:#27272a;font-size:15px;line-height:1.6;">${bodyHtml}</td></tr>
        <tr><td style="padding:0 28px 28px;color:#71717a;font-size:13px;line-height:1.5;">
          This is a transactional account email from Zboun (zboun.net).<br>
          Questions? Reply to this email or contact <a href="mailto:${ZBOUN_OPS_EMAIL}" style="color:#4c1d95;">${ZBOUN_OPS_EMAIL}</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function welcomeEmailShell(bodyHtml: string) {
  const siteUrl = getPublicAppUrl();
  // PNG loads more reliably in email clients than SVG.
  const logoUrl = `${siteUrl}/zbounlogo.png`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Welcome to Zboun</title></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e5e5e5;">
        <tr><td style="padding:28px 32px 12px;">
          <a href="${siteUrl}" style="text-decoration:none;">
            <img src="${logoUrl}" alt="Zboun" width="56" height="56" style="display:block;border:0;outline:none;width:56px;height:56px;" />
          </a>
        </td></tr>
        <tr><td style="padding:8px 32px 32px;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#18181b;font-size:15px;line-height:1.65;">
          ${bodyHtml}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendRestaurantOnboardingEmail(params: {
  to: string;
  businessName: string;
  businessTypeLabel: string;
  publicUrl: string | null;
  dashboardUrl: string;
  subscriptionEndsAt: Date;
  monthlyPrice: number;
  billingInterval?: SubscriptionInterval;
  lifetimeFree?: boolean;
  complimentaryLabel?: string;
}) {
  if (!isSmtpConfigured()) return;

  const endLabel = formatDateLong(params.subscriptionEndsAt);
  const interval = params.billingInterval ?? inferSubscriptionInterval(params.monthlyPrice);
  const priceLabel = billingCycleLabel(params.monthlyPrice, interval);
  const planLine = params.lifetimeFree
    ? "Plan: complimentary (lifetime)"
    : params.complimentaryLabel && params.monthlyPrice === 0
      ? `Plan: complimentary until ${endLabel}`
      : `Plan: ${priceLabel}, active until ${endLabel}`;

  const name = params.businessName.trim();
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(params.to);
  const safeDashboard = escapeHtml(params.dashboardUrl);
  const safeStore = params.publicUrl ? escapeHtml(params.publicUrl) : null;

  const text = [
    `Hello,`,
    ``,
    `${name} is ready on Zboun.`,
    ``,
    planLine,
    ``,
    `Dashboard: ${params.dashboardUrl}`,
    ...(params.publicUrl ? [`Store: ${params.publicUrl}`] : []),
    `Email: ${params.to}`,
    ``,
    `Your login details were shared with you separately.`,
    ``,
    `If you need help, reply to this email or write to ${ZBOUN_OPS_EMAIL}.`,
    ``,
    `— Zboun`,
    `https://zboun.net`,
  ].join("\n");

  const html = welcomeEmailShell(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;letter-spacing:-0.02em;color:#18181b;">Welcome</h1>
      <p style="margin:0 0 16px;"><strong>${safeName}</strong> is ready on Zboun.</p>
      <p style="margin:0 0 20px;color:#52525b;">${escapeHtml(planLine)}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr><td style="background:#18181b;border-radius:6px;">
          <a href="${safeDashboard}" style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">Open dashboard</a>
        </td></tr>
      </table>
      <p style="margin:0 0 8px;font-size:14px;color:#52525b;">
        <span style="color:#18181b;">Email</span> · ${safeEmail}
      </p>
      ${
        safeStore
          ? `<p style="margin:0 0 8px;font-size:14px;color:#52525b;"><span style="color:#18181b;">Store</span> · <a href="${safeStore}" style="color:#18181b;">${safeStore}</a></p>`
          : ""
      }
      <p style="margin:16px 0 0;font-size:14px;color:#71717a;">Your login details were shared with you separately.</p>
  `);

  await sendMail({
    to: params.to,
    subject: `${name} is ready on Zboun`,
    text,
    html,
  });
}

export async function sendSubscriptionRenewalEmail(params: {
  to: string;
  restaurantName: string;
  adminEmail: string;
  periodStart: Date;
  periodEnd: Date;
  monthlyPrice: number;
  billingInterval?: SubscriptionInterval;
}) {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP is not configured.");
  }

  const startLabel = formatDateLong(params.periodStart);
  const endLabel = formatDateLong(params.periodEnd);
  const interval = params.billingInterval ?? inferSubscriptionInterval(params.monthlyPrice);
  const priceLabel = billingCycleLabel(params.monthlyPrice, interval);
  const effectiveDate = params.periodStart;

  const pdf = await generateContractPdfBuffer({
    restaurantName: params.restaurantName,
    adminEmail: params.adminEmail,
    effectiveDate,
    subscriptionEndDate: params.periodEnd,
    monthlyPrice: params.monthlyPrice,
    billingInterval: interval,
  });

  const filename = contractPdfFilename(params.restaurantName);

  const text = [
    `Hello,`,
    ``,
    `Your Zboun subscription for "${params.restaurantName}" has been renewed.`,
    ``,
    `Period: ${startLabel} through ${endLabel}`,
    `Subscription fee: ${priceLabel}`,
    ``,
    `Attached is your Restaurant Platform Service Agreement (PDF) for your records.`,
    ``,
    `Thank you for continuing with Zboun.`,
    ``,
    `— Zboun Team`,
  ].join("\n");

  const html = emailShell(
    "Subscription renewed",
    `
      <p>Hello,</p>
      <p>Your Zboun subscription for <strong>${params.restaurantName}</strong> has been renewed.</p>
      <p style="margin:20px 0;padding:16px;background:#f4f4f5;border-radius:8px;">
        <strong>Current period</strong><br>
        ${startLabel} — ${endLabel}<br>
        Subscription fee: ${priceLabel}
      </p>
      <p>The attached <strong>Restaurant Platform Service Agreement (PDF)</strong> is provided for your records. Please review it and keep a signed copy if required by your business.</p>
      <p>Thank you for continuing with Zboun.</p>
    `,
  );

  await sendMail({
    to: params.to,
    subject: `Zboun subscription renewed — ${params.restaurantName}`,
    text,
    html,
    attachments: [
      {
        filename,
        content: pdf,
        contentType: "application/pdf",
      },
    ],
  });
}

export async function sendSubscriptionExpiryReminderEmail(params: {
  restaurantName: string;
  adminEmail: string;
  dueAt: Date;
  monthlyPrice: number;
  daysBefore: number;
}) {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP is not configured.");
  }

  const days = params.daysBefore;
  const dueLabel = formatDateLong(params.dueAt);
  const interval = inferSubscriptionInterval(params.monthlyPrice);
  const priceLabel = billingCycleLabel(params.monthlyPrice, interval);
  const ops = getOpsEmail();
  const dayWord = days === 1 ? "1 day" : `${days} days`;

  const text = [
    `Subscription reminder`,
    ``,
    `Restaurant: ${params.restaurantName}`,
    `Administrator: ${params.adminEmail}`,
    `Subscription ends: ${dueLabel}`,
    `Subscription fee: ${priceLabel}`,
    ``,
    `This subscription will end in ${dayWord} unless renewed. Contact Zboun to renew your contract before access is deactivated.`,
    ``,
    `— Zboun`,
  ].join("\n");

  const html = emailShell(
    `Subscription ending in ${dayWord}`,
    `
      <p>This is a reminder that the Zboun subscription below ends in <strong>${dayWord}</strong>.</p>
      <p style="margin:20px 0;padding:16px;background:#fef3c7;border-radius:8px;border:1px solid #fcd34d;">
        <strong>${params.restaurantName}</strong><br>
        Admin: ${params.adminEmail}<br>
        Ends: <strong>${dueLabel}</strong><br>
        Plan: ${priceLabel}
      </p>
      <p>Please renew before the end date to avoid automatic deactivation of your account and public menu.</p>
    `,
  );

  await sendMail({
    to: [params.adminEmail, ops],
    subject: `Zboun subscription ends in ${dayWord} — ${params.restaurantName}`,
    text,
    html,
  });
}

export async function sendSubscriptionDeactivatedEmail(params: {
  restaurantName: string;
  adminEmail: string;
  expiredAt: Date;
  monthlyPrice: number;
}) {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP is not configured.");
  }

  const expiredLabel = formatDateLong(params.expiredAt);
  const priceLabel = billingCycleLabel(
    params.monthlyPrice,
    inferSubscriptionInterval(params.monthlyPrice),
  );
  const ops = getOpsEmail();
  const contact = ops;

  const text = [
    `Account deactivated`,
    ``,
    `Restaurant: ${params.restaurantName}`,
    `Administrator: ${params.adminEmail}`,
    `Subscription ended: ${expiredLabel}`,
    ``,
    `Your Zboun account has been deactivated because the subscription period ended without renewal.`,
    ``,
    `Your public menu is offline and dashboard access is suspended until your subscription is renewed.`,
    ``,
    `To re-activate your account, renew your service agreement with Zboun: ${contact}`,
    `Subscription fee: ${priceLabel}`,
    ``,
    `— Zboun Team`,
  ].join("\n");

  const html = emailShell(
    "Account deactivated — renewal required",
    `
      <p>Hello,</p>
      <p>Your Zboun account for <strong>${params.restaurantName}</strong> has been <strong>deactivated</strong> because your subscription ended on <strong>${expiredLabel}</strong> without renewal.</p>
      <p style="margin:20px 0;padding:16px;background:#fee2e2;border-radius:8px;border:1px solid #fca5a5;">
        <strong>What this means</strong><br>
        • Your public menu is no longer visible to customers<br>
        • Dashboard access is suspended<br>
        • Your data is retained until you renew
      </p>
      <p><strong>To re-activate:</strong> contact Zboun to renew your service agreement and subscription (${priceLabel}). After renewal is processed, your account and menu will be restored.</p>
      <p>Email: <a href="mailto:${contact}">${contact}</a></p>
    `,
  );

  await sendMail({
    to: [params.adminEmail, ops],
    subject: `Zboun account deactivated — renewal required — ${params.restaurantName}`,
    text,
    html,
  });
}

export function getDefaultMonthlyPrice() {
  return ZBOUN_PRICING.monthly;
}
