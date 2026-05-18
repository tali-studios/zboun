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
  return (process.env.ZBOUN_OPS_EMAIL ?? "zbounlb@outlook.com").trim();
}

export function isSmtpConfigured() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM ?? smtpUser;
  return Boolean(smtpUser && smtpPass && fromEmail);
}

function getTransporter() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP is not configured (SMTP_USER / SMTP_PASS).");
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: smtpUser, pass: smtpPass },
  });
}

export async function sendMail(params: SendMailParams) {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP is not configured.");
  }
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const transporter = getTransporter();
  await transporter.sendMail({
    from,
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
