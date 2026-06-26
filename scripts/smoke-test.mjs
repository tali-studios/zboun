#!/usr/bin/env node
/**
 * Zboun smoke test — HTTP checks + optional Supabase + subscription cron.
 *
 * Usage:
 *   npm run test:smoke
 *   npm run test:smoke -- --base-url https://zboun.vercel.app
 *   npm run test:smoke -- --local
 *
 * Requires dev server for local: npm run dev (another terminal)
 * Reads .env.local for CRON_SECRET, Supabase keys, TEST_RESTAURANT_SLUG (optional)
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./lib/load-env-local.mjs";

loadEnvLocal();

const args = process.argv.slice(2);
const useLocal = args.includes("--local");
const baseUrlArg = args.find((a, i) => args[i - 1] === "--base-url");
const baseUrl = (
  baseUrlArg ??
  (useLocal ? "http://localhost:3000" : null) ??
  process.env.TEST_BASE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000"
).replace(/\/+$/, "");

const cronSecret = process.env.CRON_SECRET ?? "";
const testSlug = process.env.TEST_RESTAURANT_SLUG ?? "";

const results = [];
let failed = 0;
let passed = 0;
let skipped = 0;

function pass(name, detail = "") {
  passed += 1;
  results.push({ status: "PASS", name, detail });
  console.log(`  \x1b[32m✓\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  failed += 1;
  results.push({ status: "FAIL", name, detail });
  console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`);
}

function skip(name, detail = "") {
  skipped += 1;
  results.push({ status: "SKIP", name, detail });
  console.log(`  \x1b[33m○\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`);
}

function section(title) {
  console.log(`\n\x1b[1m${title}\x1b[0m`);
}

async function fetchStatus(path, options = {}) {
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 25000);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      redirect: options.followRedirect === false ? "manual" : "follow",
      headers: { "User-Agent": "zboun-smoke-test/1.0", ...options.headers },
    });
    clearTimeout(timeout);
    const text = await res.text().catch(() => "");
    return { url, status: res.status, ok: res.ok, text, headers: res.headers };
  } catch (err) {
    clearTimeout(timeout);
    return {
      url,
      status: 0,
      ok: false,
      text: "",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function expectStatus(name, res, allowed) {
  const allowedSet = Array.isArray(allowed) ? allowed : [allowed];
  if (res.error) {
    fail(name, res.error);
    return false;
  }
  if (allowedSet.includes(res.status)) {
    pass(name, `HTTP ${res.status}`);
    return true;
  }
  fail(name, `expected ${allowedSet.join("|")}, got ${res.status}`);
  return false;
}

async function testPublicPages(slug) {
  section("Public pages");
  const pages = [
    ["/", [200]],
    ["/contact", [200]],
    ["/for-restaurants", [200]],
    ["/dashboard/login", [200]],
  ];
  for (const [path, codes] of pages) {
    const res = await fetchStatus(path);
    expectStatus(path, res, codes);
  }
  if (slug) {
    const res = await fetchStatus(`/${slug}`);
    expectStatus(`/${slug} (order menu)`, res, [200, 404]);
    const resView = await fetchStatus(`/${slug}/menu`);
    expectStatus(`/${slug}/menu (in-store)`, resView, [200, 404]);
    if (res.status === 404) {
      skip("Menu slug", `slug "${slug}" not found or inactive`);
    }
  } else {
    skip("Menu slug", "set TEST_RESTAURANT_SLUG in .env.local");
  }
}

async function testSeoRoutes() {
  section("SEO / metadata routes");
  for (const path of [
    "/robots.txt",
    "/sitemap.xml",
    "/manifest.webmanifest",
    "/llms.txt",
    "/llms-full.txt",
    "/BingSiteAuth.xml",
  ]) {
    const res = await fetchStatus(path);
    expectStatus(path, res, [200, 307, 308]);
  }
}

async function testAuthRedirects() {
  section("Protected routes (should redirect to login)");
  const protectedPaths = [
    "/dashboard",
    "/dashboard/business",
    "/dashboard/super-admin",
    "/dashboard/billing",
    "/dashboard/business/flyer",
    "/dashboard/business/qr",
    "/dashboard/business/inventory",
    "/dashboard/business/pos",
    "/dashboard/business/crm",
    "/dashboard/business/loyalty",
    "/dashboard/business/events",
    "/dashboard/business/pms",
    "/dashboard/business/ecommerce",
    "/dashboard/business/fleet",
    "/dashboard/business/club",
    "/dashboard/business/gym",
    "/dashboard/business/cloud-kitchen",
    "/dashboard/business/accounting",
    "/dashboard/business/retail",
    "/dashboard/change-password",
  ];
  for (const path of protectedPaths) {
    const res = await fetchStatus(path, { followRedirect: false });
    if (res.status === 307 || res.status === 308 || res.status === 302) {
      const loc = res.headers.get("location") ?? "";
      if (loc.includes("login")) {
        pass(path, `redirect → login (${res.status})`);
      } else {
        pass(path, `redirect ${res.status} → ${loc.slice(0, 60)}`);
      }
    } else if (res.status === 200) {
      fail(path, "returned 200 without auth (session cookie may be set)");
    } else {
      expectStatus(path, res, [307, 302, 308]);
    }
  }
}

async function testCron() {
  section("Subscription cron API");
  const path = "/api/cron/subscription-reminders";

  const noAuth = await fetchStatus(path, { followRedirect: false });
  if (noAuth.status === 401) {
    pass("Cron without secret", "401 Unauthorized");
  } else {
    fail("Cron without secret", `expected 401, got ${noAuth.status}`);
  }

  const bad = await fetchStatus(`${path}?secret=invalid`, { followRedirect: false });
  if (bad.status === 401) {
    pass("Cron wrong secret", "401 Unauthorized");
  } else {
    fail("Cron wrong secret", `expected 401, got ${bad.status}`);
  }

  if (!cronSecret) {
    skip("Cron valid secret", "CRON_SECRET not set in .env.local");
    return;
  }

  const encoded = encodeURIComponent(cronSecret);
  const ok = await fetchStatus(`${path}?secret=${encoded}`, { followRedirect: false });
  if (ok.status !== 200) {
    fail("Cron valid secret", `HTTP ${ok.status}`);
    return;
  }
  try {
    const json = JSON.parse(ok.text);
    if (json.ok === true && json.tenDay && json.threeDay && json.expirations) {
      pass("Cron valid secret", `ok=true, expirations.checked=${json.expirations.checked}`);
    } else {
      fail("Cron valid secret", "unexpected JSON shape");
    }
  } catch {
    fail("Cron valid secret", "response is not JSON");
  }
}

async function testSupabase() {
  section("Supabase (database)");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    skip("Supabase", "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing");
    return;
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const tables = [
    "restaurants",
    "categories",
    "menu_items",
    "users",
    "subscription_plans",
    "restaurant_subscriptions",
    "invoices",
    "payments",
    "subscription_reminder_log",
    "restaurant_addons",
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (error) {
      fail(`Table ${table}`, error.message);
    } else {
      pass(`Table ${table}`, "readable");
    }
  }

  const { data: activeRestaurant, error: rErr } = await supabase
    .from("restaurants")
    .select("slug, name, is_active")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  if (rErr) {
    fail("Sample active restaurant", rErr.message);
  } else if (activeRestaurant?.slug) {
    pass("Sample active restaurant", `${activeRestaurant.name} → /${activeRestaurant.slug}`);
  } else {
    skip("Sample active restaurant", "none active");
  }

  const { count: subCount, error: sErr } = await supabase
    .from("restaurant_subscriptions")
    .select("id", { count: "exact", head: true });
  if (sErr) {
    fail("Subscription count", sErr.message);
  } else {
    pass("Subscription count", String(subCount ?? 0));
  }
}

async function resolveMenuSlug() {
  if (testSlug) return testSlug;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return "";
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data } = await supabase
    .from("restaurants")
    .select("slug")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  return data?.slug ?? "";
}

async function main() {
  console.log("\x1b[1mZboun smoke test\x1b[0m");
  console.log(`Base URL: ${baseUrl}`);

  const health = await fetchStatus("/");
  if (health.error || health.status === 0) {
    console.error(
      "\n\x1b[31mCannot reach server.\x1b[0m Start it with: npm run dev\n   Or use: npm run test:smoke -- --base-url https://zboun.vercel.app\n",
    );
    process.exit(1);
  }

  const slug = await resolveMenuSlug();
  await testPublicPages(slug);
  await testSeoRoutes();
  await testAuthRedirects();
  await testCron();
  await testSupabase();

  section("Summary");
  console.log(`  Passed:  ${passed}`);
  console.log(`  Failed:  ${failed}`);
  console.log(`  Skipped: ${skipped}`);
  console.log("\n  Manual flows (login, CRUD, emails): see scripts/TESTING.md\n");

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
