import crypto from "node:crypto";
import nodemailer from "nodemailer";

export type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export type SendMailParams = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: MailAttachment[];
  /** Optional override for Reply-To */
  replyTo?: string;
  /** Optional custom headers */
  headers?: Record<string, string>;
};

export function getOpsEmail() {
  return (process.env.ZBOUN_OPS_EMAIL ?? "admin@zboun.net").trim();
}

function isNoReplyAddress(email: string) {
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  return local === "no-reply" || local === "noreply" || local === "donotreply" || local === "do-not-reply";
}

/**
 * From address for outbound mail.
 * Prefer the authenticated SMTP mailbox (Zoho requires From ≈ login).
 * Never send as no-reply — it hurts inbox placement and blocks replies.
 */
export function resolveFromEmail(): string {
  const smtpUser = (process.env.SMTP_USER ?? "").trim();
  const configured = (process.env.SMTP_FROM ?? "").trim();

  if (configured && !isNoReplyAddress(configured)) {
    return configured;
  }
  if (smtpUser && !isNoReplyAddress(smtpUser)) {
    return smtpUser;
  }
  // Last resort if someone authenticated as no-reply — still avoid advertising it
  const ops = getOpsEmail();
  if (ops && !isNoReplyAddress(ops)) return ops;
  return configured || smtpUser || ops;
}

export function isSmtpConfigured() {
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS;
  return Boolean(smtpUser && smtpPass && resolveFromEmail());
}

/** Prefer SMTP_FROM; fall back to SMTP_USER. Never use no-reply*. */
export function getMailFromAddress() {
  const fromEmail = resolveFromEmail();
  const fromName = process.env.SMTP_FROM_NAME?.trim() || "Zboun";
  if (!fromEmail) return "";
  return `${fromName} <${fromEmail}>`;
}

function getTransporter() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP is not configured (SMTP_USER / SMTP_PASS).");
  }
  const host = process.env.SMTP_HOST?.trim() || "smtp.zoho.com";
  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure = process.env.SMTP_SECURE !== "false";
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user: smtpUser, pass: smtpPass },
  });
}

function mailDomainFromAddress(fromEmail: string) {
  const at = fromEmail.lastIndexOf("@");
  if (at === -1) return "zboun.net";
  return fromEmail.slice(at + 1).toLowerCase() || "zboun.net";
}

export async function sendMail(params: SendMailParams) {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP is not configured.");
  }
  const fromEmail = resolveFromEmail();
  const from = getMailFromAddress();
  const replyTo =
    params.replyTo?.trim() ||
    process.env.SMTP_REPLY_TO?.trim() ||
    (isNoReplyAddress(fromEmail) ? getOpsEmail() : fromEmail);
  const domain = mailDomainFromAddress(fromEmail);
  const messageId = `<${crypto.randomUUID()}@${domain}>`;
  const transporter = getTransporter();

  await transporter.sendMail({
    from,
    replyTo,
    to: params.to,
    cc: params.cc,
    bcc: params.bcc,
    subject: params.subject,
    text: params.text,
    html: params.html,
    textEncoding: "base64",
    // Align SMTP envelope with From (helps SPF alignment / Zoho).
    envelope: {
      from: fromEmail,
      to: Array.isArray(params.to) ? params.to : [params.to],
    },
    messageId,
    headers: {
      "X-Auto-Response-Suppress": "All",
      ...params.headers,
    },
    attachments: params.attachments?.map((file) => ({
      filename: file.filename,
      content: file.content,
      contentType: file.contentType ?? "application/octet-stream",
    })),
  });
}
