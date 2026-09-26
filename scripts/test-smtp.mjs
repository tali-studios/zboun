/**
 * Send a one-off mail test using .env.local (ZeptoMail token preferred, else SMTP).
 * Usage: node scripts/test-smtp.mjs you@example.com
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import nodemailer from "nodemailer";

function loadEnvLocal() {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  const raw = readFileSync(p, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvLocal();

const to = process.argv[2]?.trim();
if (!to) {
  console.error("Usage: node scripts/test-smtp.mjs <recipient@email.com>");
  process.exit(1);
}

const zeptoToken =
  process.env.ZEPTOMAIL_TOKEN?.trim() || process.env.ZEPTOMAIL_SEND_MAIL_TOKEN?.trim() || "";
const fromEmail =
  process.env.SMTP_FROM?.trim() ||
  (process.env.SMTP_USER?.trim() && process.env.SMTP_USER.trim() !== "emailapikey"
    ? process.env.SMTP_USER.trim()
    : "") ||
  process.env.ZBOUN_OPS_EMAIL?.trim() ||
  "admin@zboun.net";
const fromName = process.env.SMTP_FROM_NAME?.trim() || "Zboun";
const replyTo = process.env.SMTP_REPLY_TO?.trim() || process.env.ZBOUN_OPS_EMAIL?.trim() || fromEmail;
const sentAt = new Date().toISOString();

async function sendZepto() {
  const apiUrl = process.env.ZEPTOMAIL_API_URL?.trim() || "https://cpaas.zoho.com/v1.1/email";
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: zeptoToken.startsWith("Zoho-enczapikey")
        ? zeptoToken
        : `Zoho-enczapikey ${zeptoToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      from: { address: fromEmail, name: fromName },
      to: [{ email_address: { address: to, name: to.split("@")[0] } }],
      reply_to: [{ address: replyTo, name: "Zboun" }],
      subject: "Zboun ZeptoMail test",
      textbody: `ZeptoMail API test from Zboun.\nSent at: ${sentAt}\nFrom: ${fromEmail}`,
      htmlbody: `<p>ZeptoMail API test from Zboun.</p><p>Sent at: ${sentAt}<br/>From: ${fromEmail}</p>`,
    }),
  });
  if (!res.ok) {
    throw new Error(`ZeptoMail ${res.status}: ${await res.text()}`);
  }
  console.log("Test email sent via ZeptoMail API.");
  console.log("To:", to);
  console.log("From:", fromEmail);
}

async function sendSmtp() {
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  const smtpHost = process.env.SMTP_HOST?.trim() || "smtp.zoho.com";
  const smtpPort = Number(process.env.SMTP_PORT ?? 465);
  if (!smtpUser || !smtpPass) {
    throw new Error("Set ZEPTOMAIL_TOKEN, or SMTP_USER + SMTP_PASS in .env.local");
  }
  const from = `${fromName} <${fromEmail}>`;
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: process.env.SMTP_SECURE !== "false",
    auth: { user: smtpUser, pass: smtpPass },
  });
  const info = await transporter.sendMail({
    from,
    to,
    replyTo,
    subject: "Zboun SMTP test",
    text: `SMTP test from Zboun.\nSent at: ${sentAt}\nHost: ${smtpHost}:${smtpPort}\nFrom: ${from}`,
  });
  console.log("Test email sent via SMTP.");
  console.log("Message ID:", info.messageId);
  console.log("To:", to);
  console.log("Host:", `${smtpHost}:${smtpPort}`);
}

try {
  if (zeptoToken) {
    await sendZepto();
  } else {
    await sendSmtp();
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
