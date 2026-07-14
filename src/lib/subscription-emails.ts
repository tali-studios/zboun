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

export async function sendRestaurantOnboardingEmail(params: {
  to: string;
  businessName: string;
  businessTypeLabel: string;
  publicUrl: string | null;
  dashboardUrl: string;
  /** One-time set-password / recovery link (preferred). */
  setPasswordUrl?: string | null;
  /** @deprecated Prefer setPasswordUrl — plaintext passwords hurt inbox placement. */
  initialPassword?: string | null;
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
  const subscriptionLine = params.lifetimeFree
    ? "Account type: Lifetime complimentary — no monthly billing."
    : params.complimentaryLabel && params.monthlyPrice === 0
      ? `Account type: Complimentary ${params.complimentaryLabel.toLowerCase()} — free until ${endLabel}.`
      : `Subscription: Your first billing period is active until ${endLabel} (${priceLabel}).`;

  const setPasswordUrl = params.setPasswordUrl?.trim() || null;
  const fallbackPassword = params.initialPassword?.trim() || null;

  const accessText = setPasswordUrl
    ? [
        `Sign-in email: ${params.to}`,
        `Set your password (secure link): ${setPasswordUrl}`,
        ``,
        `This link lets you choose your own password. After that, sign in at ${params.dashboardUrl}.`,
      ]
    : fallbackPassword
      ? [
          `Sign-in email: ${params.to}`,
          `Temporary password: ${fallbackPassword}`,
          ``,
          `Sign in at ${params.dashboardUrl} and change your password right away.`,
        ]
      : [
          `Sign-in email: ${params.to}`,
          `Open ${params.dashboardUrl} and use Forgot password if you need access.`,
        ];

  const accessHtml = setPasswordUrl
    ? `
      <p><strong>Sign-in email:</strong> ${params.to}</p>
      <p style="margin:20px 0;">
        <a href="${setPasswordUrl}" style="display:inline-block;background:#4c1d95;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px;">
          Set your password
        </a>
      </p>
      <p style="color:#52525b;font-size:14px;">Or open this link:<br><a href="${setPasswordUrl}">${setPasswordUrl}</a></p>
      <p>After setting your password, sign in at <a href="${params.dashboardUrl}">${params.dashboardUrl}</a>.</p>
    `
    : fallbackPassword
      ? `
      <p><strong>Sign-in email:</strong> ${params.to}<br>
      <strong>Temporary password:</strong> <code style="background:#f4f4f5;padding:2px 6px;border-radius:4px;">${fallbackPassword}</code></p>
      <p>Please sign in at <a href="${params.dashboardUrl}">${params.dashboardUrl}</a> and change your password right away.</p>
    `
      : `
      <p><strong>Sign-in email:</strong> ${params.to}</p>
      <p>Open <a href="${params.dashboardUrl}">${params.dashboardUrl}</a> and use Forgot password if you need access.</p>
    `;

  const text = [
    `Hello,`,
    ``,
    `Your ${params.businessTypeLabel} "${params.businessName}" account is ready on Zboun.`,
    ``,
    subscriptionLine,
    ``,
    ...(params.publicUrl ? [`Store page: ${params.publicUrl}`] : []),
    `Dashboard: ${params.dashboardUrl}`,
    ``,
    ...accessText,
    ``,
    `Your service agreement PDF is attached for your records.`,
    ``,
    `— Zboun Team`,
    `https://zboun.net`,
  ].join("\n");

  const html = emailShell(
    `Your Zboun account is ready`,
    `
      <p>Hello,</p>
      <p>Your <strong>${params.businessTypeLabel}</strong> <strong>${params.businessName}</strong> account is ready on Zboun.</p>
      <p style="margin:20px 0;padding:16px;background:#f4f4f5;border-radius:8px;">
        <strong>${params.lifetimeFree || (params.complimentaryLabel && params.monthlyPrice === 0) ? "Account type" : "Subscription"}</strong><br>
        ${
          params.lifetimeFree
            ? "<strong>Lifetime complimentary</strong><br>No monthly billing or renewal required."
            : params.complimentaryLabel && params.monthlyPrice === 0
              ? `<strong>Complimentary ${params.complimentaryLabel}</strong><br>Free until <strong>${endLabel}</strong>.`
              : `Active until <strong>${endLabel}</strong><br>Plan: ${priceLabel}`
        }
      </p>
      ${params.publicUrl ? `<p><strong>Store page:</strong> <a href="${params.publicUrl}">${params.publicUrl}</a></p>` : ""}
      <p><strong>Dashboard:</strong> <a href="${params.dashboardUrl}">${params.dashboardUrl}</a></p>
      ${accessHtml}
      <p>Your <strong>service agreement (PDF)</strong> is attached for your records.</p>
    `,
  );

  const effectiveDate = new Date();
  const pdf = await generateContractPdfBuffer({
    restaurantName: params.businessName,
    adminEmail: params.to,
    effectiveDate,
    subscriptionEndDate: params.subscriptionEndsAt,
    monthlyPrice: params.monthlyPrice,
    billingInterval: interval,
  });
  const filename = contractPdfFilename(params.businessName);

  await sendMail({
    to: params.to,
    subject: `Your Zboun store account — ${params.businessName}`,
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
