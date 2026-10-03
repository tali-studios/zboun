/**
 * Delete menu/QR orders (public.orders) for ONE store, e.g. a sample store.
 * Lists matching orders first; only deletes when --confirm is passed.
 *
 * Usage:
 *   node scripts/delete-store-orders.mjs <store-slug>            # dry run
 *   node scripts/delete-store-orders.mjs <store-slug> --confirm  # delete
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./lib/load-env-local.mjs";

async function main() {
  loadEnvLocal();
  const slug = process.argv[2]?.trim();
  const confirm = process.argv.includes("--confirm");
  if (!slug || slug.startsWith("--")) {
    throw new Error("Usage: node scripts/delete-store-orders.mjs <store-slug> [--confirm]");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const sb = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: store, error: storeError } = await sb
    .from("restaurants")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (storeError) throw storeError;
  if (!store) throw new Error(`No store with slug "${slug}"`);

  const { data: orders, error: ordersError } = await sb
    .from("orders")
    .select("id, customer_name, total_usd, status, created_at")
    .eq("restaurant_id", store.id)
    .order("created_at", { ascending: true });
  if (ordersError) throw ordersError;

  console.log(`Store: ${store.name} (/${store.slug}) — ${orders.length} order(s)`);
  for (const o of orders) {
    console.log(
      `  ${o.id.slice(0, 8).toUpperCase()}  ${o.created_at}  ${o.status}  $${Number(o.total_usd).toFixed(2)}  ${o.customer_name ?? ""}`,
    );
  }

  if (!confirm) {
    console.log("\nDry run — nothing deleted. Re-run with --confirm to delete these orders.");
    return;
  }
  if (orders.length === 0) return;

  const { error: deleteError, count } = await sb
    .from("orders")
    .delete({ count: "exact" })
    .eq("restaurant_id", store.id);
  if (deleteError) throw deleteError;

  console.log(`\nDeleted ${count ?? orders.length} order(s) for /${store.slug}.`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
