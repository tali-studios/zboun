import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal(path) {
  const txt = fs.readFileSync(path, "utf8");
  for (const line of txt.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal("f:/zboun/.env.local");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const sb = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Delete all restaurant admin auth users first (cascades/deletes linked public.users rows)
  const { data: restaurantAdmins, error: adminsError } = await sb
    .from("users")
    .select("id")
    .eq("role", "restaurant_admin");
  if (adminsError) throw adminsError;

  for (const admin of restaurantAdmins ?? []) {
    const { error } = await sb.auth.admin.deleteUser(admin.id);
    if (error) {
      console.error(`Failed deleting auth user ${admin.id}: ${error.message}`);
    }
  }

  // Delete all restaurants (categories/menu_items cascade by FK)
  const { error: restaurantsError } = await sb
    .from("restaurants")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (restaurantsError) throw restaurantsError;

  // Remove any remaining restaurant_admin profile rows
  const { error: orphanError } = await sb.from("users").delete().eq("role", "restaurant_admin");
  if (orphanError) throw orphanError;

  const [{ count: restaurants }, { count: categories }, { count: items }, { count: users }] =
    await Promise.all([
      sb.from("restaurants").select("*", { count: "exact", head: true }),
      sb.from("categories").select("*", { count: "exact", head: true }),
      sb.from("menu_items").select("*", { count: "exact", head: true }),
      sb.from("users").select("*", { count: "exact", head: true }),
    ]);

  console.log("Cleanup complete.");
  console.log(`restaurants: ${restaurants ?? 0}`);
  console.log(`categories: ${categories ?? 0}`);
  console.log(`menu_items: ${items ?? 0}`);
  console.log(`users rows (remaining): ${users ?? 0}`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
