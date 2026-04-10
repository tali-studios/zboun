/**
 * One-time: create Auth user + public.users row for superadmin.
 * Requires service role key (never ship to the browser).
 *
 * Run from project root:
 *   npm run seed:superadmin
 *
 * Uses .env.local (see .env.example). Quote passwords that contain # or $.
 */
import { createClient } from "@supabase/supabase-js";
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SUPERADMIN_EMAIL;
const password = process.env.SUPERADMIN_PASSWORD;
const name = process.env.SUPERADMIN_NAME || "Super Admin";

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}
if (!email || !password) {
  console.error(
    "Missing SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserIdByEmail(target) {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) throw error;
  const lower = target.toLowerCase();
  const u = data.users.find((x) => x.email?.toLowerCase() === lower);
  return u?.id ?? null;
}

async function main() {
  let userId = await findUserIdByEmail(email);

  if (userId) {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
    console.log("Updated existing Auth user password / confirmation:", email);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user.id;
    console.log("Created Auth user:", email);
  }

  const { error: rowError } = await supabase.from("users").upsert(
    {
      id: userId,
      name,
      email,
      role: "superadmin",
      restaurant_id: null,
    },
    { onConflict: "id" },
  );
  if (rowError) throw rowError;

  console.log("Upserted public.users as superadmin. Sign in at /dashboard/login");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
