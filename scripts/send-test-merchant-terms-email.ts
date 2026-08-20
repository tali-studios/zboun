import { readFileSync } from "fs";
import { resolve } from "path";
import { sendAdminInviteEmail } from "../src/lib/subscription-emails";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env) || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvLocal();

  const to = "wissam8802@gmail.com";
  const endsAt = new Date();
  endsAt.setMonth(endsAt.getMonth() + 1);

  console.log("SMTP configured:", Boolean(process.env.SMTP_USER && process.env.SMTP_PASS));
  console.log("Sending test invite email to", to, "...");

  await sendAdminInviteEmail({
    to,
    businessName: "Test Store (Terms Preview)",
    inviteLink: "https://zboun.net/login",
    categoryLabel: "Retail",
    subscriptionEndsAt: endsAt,
    monthlyPrice: 10,
    billingInterval: "monthly",
    publicUrl: "https://zboun.net/test-store",
  });

  console.log("Sent successfully.");
}

main().catch((err) => {
  console.error("Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
