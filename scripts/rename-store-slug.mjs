/**
 * Change a store's URL slug (zboun.net/<slug>).
 * Dry run by default; only updates when --confirm is passed.
 *
 * Usage:
 *   node scripts/rename-store-slug.mjs <old-slug> <new-slug>            # dry run
 *   node scripts/rename-store-slug.mjs <old-slug> <new-slug> --confirm  # rename
 */
import { readdirSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./lib/load-env-local.mjs";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function main() {
  loadEnvLocal();
  const [oldSlug, newSlug] = process.argv.slice(2).filter((a) => !a.startsWith("--")).map((a) => a.trim());
  const confirm = process.argv.includes("--confirm");
  if (!oldSlug || !newSlug) {
    throw new Error("Usage: node scripts/rename-store-slug.mjs <old-slug> <new-slug> [--confirm]");
  }
  if (!SLUG_PATTERN.test(newSlug)) {
    throw new Error(`"${newSlug}" is not a valid slug (lowercase letters, numbers, single dashes).`);
  }

  const appRoutes = new Set(
    readdirSync(new URL("../app", import.meta.url), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name.toLowerCase()),
  );
  if (appRoutes.has(newSlug)) {
    throw new Error(`"${newSlug}" clashes with an app route (/${newSlug}).`);
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
    .eq("slug", oldSlug)
    .maybeSingle();
  if (storeError) throw storeError;
  if (!store) throw new Error(`No store with slug "${oldSlug}"`);

  const { data: taken, error: takenError } = await sb
    .from("restaurants")
    .select("id, name")
    .eq("slug", newSlug)
    .maybeSingle();
  if (takenError) throw takenError;
  if (taken) throw new Error(`Slug "${newSlug}" is already used by ${taken.name}.`);

  console.log(`Store: ${store.name}`);
  console.log(`  /${oldSlug}  ->  /${newSlug}`);

  if (!confirm) {
    console.log("\nDry run — nothing changed. Re-run with --confirm to rename.");
    return;
  }

  const { error: updateError } = await sb
    .from("restaurants")
    .update({ slug: newSlug })
    .eq("id", store.id);
  if (updateError) throw updateError;

  console.log(`\nRenamed. Store is now at /${newSlug}`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
