/**
 * Delete all subscription invoices (and linked payments).
 * Lokmati is kept as lifetime free (billing_exempt) — no billing invoices needed.
 *
 * Usage: node scripts/cleanup-invoices.mjs
 */
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal(path) {
  if (!fs.existsSync(path)) return;
  const txt = fs.readFileSync(path, "utf8");
  for (const line of txt.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal(".env.local");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const sb = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: lokmatiRows, error: lokmatiError } = await sb
    .from("restaurants")
    .select("id, name, slug, billing_exempt")
    .or("name.ilike.%lokmati%,slug.ilike.%lokmati%");

  if (lokmatiError) throw lokmatiError;

  if (lokmatiRows?.length) {
    const lokmati = lokmatiRows[0];
    console.log(`Lokmati: ${lokmati.name} (${lokmati.slug})`);
    if (!lokmati.billing_exempt) {
      const { error: exemptError } = await sb
        .from("restaurants")
        .update({ billing_exempt: true })
        .eq("id", lokmati.id);
      if (exemptError) throw exemptError;
      console.log("Set Lokmati billing_exempt = true");
    } else {
      console.log("Lokmati already lifetime free");
    }
  } else {
    console.warn('No restaurant matching "Lokmati" found — continuing with invoice cleanup.');
  }

  const { count: beforeCount, error: countError } = await sb
    .from("invoices")
    .select("*", { count: "exact", head: true });
  if (countError) throw countError;

  console.log(`Invoices before: ${beforeCount ?? 0}`);

  if (!beforeCount) {
    console.log("Nothing to delete.");
    return;
  }

  const { data: allInvoices, error: listError } = await sb.from("invoices").select("id");
  if (listError) throw listError;

  const invoiceIds = (allInvoices ?? []).map((row) => row.id);
  const chunkSize = 100;

  for (let i = 0; i < invoiceIds.length; i += chunkSize) {
    const chunk = invoiceIds.slice(i, i + chunkSize);
    const { error: paymentsError } = await sb.from("payments").delete().in("invoice_id", chunk);
    if (paymentsError) throw paymentsError;

    const { error: invoicesError } = await sb.from("invoices").delete().in("id", chunk);
    if (invoicesError) throw invoicesError;
  }

  const { count: afterCount } = await sb
    .from("invoices")
    .select("*", { count: "exact", head: true });

  console.log("Done.");
  console.log(`Deleted ${invoiceIds.length} invoice(s).`);
  console.log(`Invoices remaining: ${afterCount ?? 0}`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
