/**
 * Send a one-off SMTP test email using .env.local settings.
 * Usage: node scripts/test-smtp.mjs wissam8802@gmail.com
 */
import nodemailer from "nodemailer";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

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

const smtpUser = process.env.SMTP_USER?.trim();
const smtpPass = process.env.SMTP_PASS?.trim();
const smtpFrom = process.env.SMTP_FROM?.trim() || smtpUser;
const smtpFromName = process.env.SMTP_FROM_NAME?.trim();
const smtpHost = process.env.SMTP_HOST?.trim() || "smtp.zoho.com";
const smtpPort = Number(process.env.SMTP_PORT ?? 465);
const replyTo = process.env.SMTP_REPLY_TO?.trim();

if (!smtpUser || !smtpPass) {
  console.error("SMTP_USER and SMTP_PASS must be set in .env.local");
  process.exit(1);
}

const from = smtpFromName ? `${smtpFromName} <${smtpFrom}>` : smtpFrom;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: process.env.SMTP_SECURE !== "false",
  auth: { user: smtpUser, pass: smtpPass },
});

const sentAt = new Date().toISOString();

try {
  const info = await transporter.sendMail({
    from,
    to,
    ...(replyTo ? { replyTo } : {}),
    subject: "Zboun SMTP test",
    text: [
      "This is a test email from the Zboun app SMTP setup.",
      "",
      `Sent at: ${sentAt}`,
      `From: ${from}`,
      `SMTP host: ${smtpHost}:${smtpPort}`,
      "",
      "If you received this, Zoho Mail is configured correctly.",
    ].join("\n"),
  });
  console.log("Test email sent successfully.");
  console.log("Message ID:", info.messageId);
  console.log("To:", to);
} catch (err) {
  console.error("Failed to send test email:");
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
