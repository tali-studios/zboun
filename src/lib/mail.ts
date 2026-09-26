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

/** ZeptoMail Send Mail Token (transactional). Prefer this over Zoho Mail SMTP. */
export function getZeptoMailToken(): string {
  return (
    process.env.ZEPTOMAIL_TOKEN?.trim() ||
    process.env.ZEPTOMAIL_SEND_MAIL_TOKEN?.trim() ||
    ""
  );
}

export function isZeptoMailConfigured(): boolean {
  return Boolean(getZeptoMailToken() && resolveFromEmail());
}

/**
 * From address for outbound mail.
 * Prefer SMTP_FROM (verified sender in ZeptoMail / Zoho).
 * Never send as no-reply — it hurts inbox placement and blocks replies.
 */
export function resolveFromEmail(): string {
  const smtpUser = (process.env.SMTP_USER ?? "").trim();
  const configured = (process.env.SMTP_FROM ?? "").trim();

  if (configured && !isNoReplyAddress(configured)) {
    return configured;
  }
  // ZeptoMail SMTP username is often "emailapikey" — never use that as From.
  if (smtpUser && !isNoReplyAddress(smtpUser) && smtpUser.toLowerCase() !== "emailapikey") {
    return smtpUser;
  }
  const ops = getOpsEmail();
  if (ops && !isNoReplyAddress(ops)) return ops;
  return configured || (smtpUser !== "emailapikey" ? smtpUser : "") || ops;
}

export function isSmtpConfigured() {
  if (isZeptoMailConfigured()) return true;
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
  const host = process.env.SMTP_HOST?.trim() || "smtp.zoho.com";
  const isZeptoSmtp = /zeptomail/i.test(host);
  const smtpUser = (process.env.SMTP_USER ?? (isZeptoSmtp ? "emailapikey" : "")).trim();
  const smtpPass = (process.env.SMTP_PASS ?? getZeptoMailToken()).trim();
  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP is not configured (SMTP_USER / SMTP_PASS or ZEPTOMAIL_TOKEN).");
  }
  const port = Number(process.env.SMTP_PORT ?? (isZeptoSmtp ? 465 : 465));
  const secure =
    process.env.SMTP_SECURE != null
      ? process.env.SMTP_SECURE !== "false"
      : port === 465;
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

function toAddressList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value])
    .map((v) => String(v).trim())
    .filter(Boolean);
}

function zeptoRecipients(emails: string[]) {
  return emails.map((address) => ({
    email_address: { address, name: address.split("@")[0] || address },
  }));
}

/**
 * Prefer ZeptoMail HTTP API for app mail (OTP, invites, stock alerts, contracts).
 * Zoho Mail SMTP (admin@) has low daily limits and gets blocked — do not use it for transactional volume.
 */
async function sendViaZeptoMailApi(params: SendMailParams) {
  const token = getZeptoMailToken();
  const fromEmail = resolveFromEmail();
  const fromName = process.env.SMTP_FROM_NAME?.trim() || "Zboun";
  const replyTo =
    params.replyTo?.trim() ||
    process.env.SMTP_REPLY_TO?.trim() ||
    getOpsEmail() ||
    fromEmail;

  const to = toAddressList(params.to);
  if (to.length === 0) throw new Error("sendMail: missing recipients");

  const payload: Record<string, unknown> = {
    from: { address: fromEmail, name: fromName },
    to: zeptoRecipients(to),
    subject: params.subject,
    textbody: params.text,
    htmlbody: params.html ?? params.text.replace(/\n/g, "<br/>"),
    reply_to: [{ address: replyTo, name: replyTo.split("@")[0] || "Zboun" }],
  };

  const cc = toAddressList(params.cc);
  const bcc = toAddressList(params.bcc);
  if (cc.length) payload.cc = zeptoRecipients(cc);
  if (bcc.length) payload.bcc = zeptoRecipients(bcc);

  if (params.attachments?.length) {
    payload.attachments = params.attachments.map((file) => ({
      name: file.filename,
      mime_type: file.contentType ?? "application/octet-stream",
      content: file.content.toString("base64"),
    }));
  }

  const apiUrl =
    process.env.ZEPTOMAIL_API_URL?.trim() || "https://cpaas.zoho.com/v1.1/email";

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: token.startsWith("Zoho-enczapikey")
        ? token
        : `Zoho-enczapikey ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ZeptoMail API ${res.status}: ${body.slice(0, 500) || res.statusText}`);
  }
}

async function sendViaSmtp(params: SendMailParams) {
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

export async function sendMail(params: SendMailParams) {
  if (!isSmtpConfigured()) {
    throw new Error("Mail is not configured (set ZEPTOMAIL_TOKEN or SMTP_USER/SMTP_PASS).");
  }

  // Transactional path first — avoids Zoho Mail mailbox rate limits / blocks.
  if (isZeptoMailConfigured()) {
    await sendViaZeptoMailApi(params);
    return;
  }

  await sendViaSmtp(params);
}
