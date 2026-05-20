#!/usr/bin/env node
/**
 * Seed QA menu sections + items for an existing restaurant (by slug).
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Usage:
 *   npm run qa:seed-menu -- --slug qa-bistro-test
 *   npm run qa:seed-menu -- --slug akrams-bakery --dry-run
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./lib/load-env-local.mjs";

loadEnvLocal();

const slugArg = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1]
  ?? process.argv[process.argv.indexOf("--slug") + 1];
const dryRun = process.argv.includes("--dry-run");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

if (!slugArg) {
  console.error("Usage: npm run qa:seed-menu -- --slug your-restaurant-slug");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SECTIONS = [
  {
    name: "QA Starters",
    items: [
      { name: "QA Soup", price: 5, description: "Tomato soup (QA seed)" },
      { name: "QA Salad", price: 7.5, description: "House salad (QA seed)" },
    ],
  },
  {
    name: "QA Mains",
    items: [
      { name: "QA Burger", price: 12, description: "Test burger with fries" },
      { name: "QA Pasta", price: 11, description: "Penne pasta (QA seed)" },
    ],
  },
  {
    name: "QA Drinks",
    items: [
      { name: "QA Water", price: 1, description: null },
      { name: "QA Juice", price: 3.5, description: "Fresh juice (QA seed)" },
    ],
  },
];

async function main() {
  const { data: restaurant, error: rErr } = await supabase
    .from("restaurants")
    .select("id, name, slug, is_active")
    .eq("slug", slugArg)
    .maybeSingle();

  if (rErr || !restaurant) {
    console.error(`Restaurant not found for slug: ${slugArg}`, rErr?.message ?? "");
    process.exit(1);
  }

  console.log(`Restaurant: ${restaurant.name} (${restaurant.slug}) active=${restaurant.is_active}`);
  if (dryRun) console.log("(dry-run — no writes)\n");

  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ?? "https://zboun.vercel.app";
  console.log(`Order menu:  ${base}/${restaurant.slug}`);
  console.log(`In-store:    ${base}/${restaurant.slug}/menu\n`);

  for (const section of SECTIONS) {
    let categoryId;

    const { data: existingCat } = await supabase
      .from("categories")
      .select("id")
      .eq("restaurant_id", restaurant.id)
      .eq("name", section.name)
      .maybeSingle();

    if (existingCat?.id) {
      categoryId = existingCat.id;
      console.log(`Section exists: ${section.name}`);
    } else if (dryRun) {
      console.log(`Would create section: ${section.name}`);
      categoryId = "(dry-run)";
    } else {
      const { data: cat, error: cErr } = await supabase
        .from("categories")
        .insert({ name: section.name, restaurant_id: restaurant.id, position: 0 })
        .select("id")
        .single();
      if (cErr) throw cErr;
      categoryId = cat.id;
      console.log(`Created section: ${section.name}`);
    }

    for (const item of section.items) {
      const { data: existingItem } = await supabase
        .from("menu_items")
        .select("id")
        .eq("restaurant_id", restaurant.id)
        .eq("name", item.name)
        .maybeSingle();

      if (existingItem?.id) {
        console.log(`  Item exists: ${item.name}`);
        continue;
      }
      if (dryRun) {
        console.log(`  Would create item: ${item.name} ($${item.price})`);
        continue;
      }

      const { error: iErr } = await supabase.from("menu_items").insert({
        restaurant_id: restaurant.id,
        category_id: typeof categoryId === "string" ? categoryId : null,
        name: item.name,
        description: item.description,
        price: item.price,
        is_available: true,
        removable_ingredients: [],
        add_ingredients: [],
        option_values: [],
      });
      if (iErr) throw iErr;
      console.log(`  Created item: ${item.name}`);
    }
  }

  console.log("\nDone. Open public menus and verify in QA-PLAYBOOK Phase 6–7.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
