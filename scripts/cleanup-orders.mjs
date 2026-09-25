/**
 * Delete all menu/QR orders (public.orders) platform-wide.
 * Line items live in orders.items JSONB — no separate child table.
 *
 * Usage: node scripts/cleanup-orders.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./lib/load-env-local.mjs";

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const sb = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { count: before, error: countError } = await sb
    .from("orders")
    .select("*", { count: "exact", head: true });
  if (countError) throw countError;

  console.log(`Orders before delete: ${before ?? 0}`);

  // PostgREST requires a filter for delete; match all real UUIDs.
  const { error: deleteError, count: deleted } = await sb
    .from("orders")
    .delete({ count: "exact" })
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteError) throw deleteError;

  const { count: after, error: afterError } = await sb
    .from("orders")
    .select("*", { count: "exact", head: true });
  if (afterError) throw afterError;

  console.log(`Deleted: ${deleted ?? before ?? 0}`);
  console.log(`Orders remaining: ${after ?? 0}`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
