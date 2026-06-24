import { sendMail, getOpsEmail, isSmtpConfigured } from "@/lib/mail";
import { formatDateLong } from "@/lib/subscription-billing";

type ReminderKind = "one_month" | "one_week" | "three_days";

function reminderLeadLabel(kind: ReminderKind): string {
  if (kind === "one_month") return "1 month";
  if (kind === "one_week") return "1 week";
  return "3 days";
}

export async function sendPlatformOpsPaymentReminderEmail(params: {
  title: string;
  category: string;
  amount: number | null;
  currency: string;
  dueAt: Date;
  notes: string | null;
  reminderKind: ReminderKind;
}) {
  if (!isSmtpConfigured()) return false;

  const dueLabel = formatDateLong(params.dueAt);
  const lead = reminderLeadLabel(params.reminderKind);
  const amountLine =
    params.amount != null && Number.isFinite(params.amount)
      ? `${params.currency} ${params.amount.toFixed(2)}`
      : "Amount not set";

  const subject = `[Zboun] Payment due in ${lead}: ${params.title}`;
  const text = [
    `Platform payment reminder`,
    ``,
    `Item: ${params.title}`,
    `Category: ${params.category}`,
    `Amount: ${amountLine}`,
    `Due date: ${dueLabel}`,
    params.notes?.trim() ? `Notes: ${params.notes.trim()}` : "",
    ``,
    `This is your ${lead}-before reminder. Open the super admin dashboard to mark it paid when done.`,
    ``,
    `— Zboun`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `<p><strong>Payment due in ${lead}</strong></p>
<p><strong>${params.title}</strong><br>
Category: ${params.category}<br>
Amount: ${amountLine}<br>
Due: ${dueLabel}</p>
${params.notes?.trim() ? `<p>Notes: ${params.notes.trim()}</p>` : ""}
<p style="color:#71717a;font-size:13px;">Mark as paid in Super Admin → Platform payments when complete.</p>`;

  await sendMail({
    to: getOpsEmail(),
    subject,
    text,
    html,
  });
  return true;
}
