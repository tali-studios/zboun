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
};

export function getOpsEmail() {
  return (process.env.ZBOUN_OPS_EMAIL ?? "admin@zboun.net").trim();
}

export function isSmtpConfigured() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM ?? smtpUser;
  return Boolean(smtpUser && smtpPass && fromEmail);
}

export function getMailFromAddress() {
  const fromEmail = (process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "").trim();
  const fromName = process.env.SMTP_FROM_NAME?.trim();
  if (!fromEmail) return "";
  return fromName ? `${fromName} <${fromEmail}>` : fromEmail;
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

export async function sendMail(params: SendMailParams) {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP is not configured.");
  }
  const from = getMailFromAddress();
  const replyTo = process.env.SMTP_REPLY_TO?.trim();
  const transporter = getTransporter();
  await transporter.sendMail({
    from,
    ...(replyTo ? { replyTo } : {}),
    to: params.to,
    cc: params.cc,
    bcc: params.bcc,
    subject: params.subject,
    text: params.text,
    html: params.html,
    attachments: params.attachments?.map((file) => ({
      filename: file.filename,
      content: file.content,
      contentType: file.contentType ?? "application/octet-stream",
    })),
  });
}
