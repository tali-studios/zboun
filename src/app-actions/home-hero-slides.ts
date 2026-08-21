"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUserRole } from "@/lib/data";
import { env } from "@/lib/env";
import type { HomeHeroLinkType } from "@/lib/home-hero-slides";

const LINK_TYPES = new Set<HomeHeroLinkType>(["none", "store", "item"]);
const BANNERS_PATH = "/dashboard/super-admin/banners";

async function requireSuperAdmin() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "superadmin") {
    redirect("/dashboard/login");
  }
  return user;
}

function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required.");
  }
  return createClient(env.supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function fail(message: string): never {
  redirect(`${BANNERS_PATH}?error=${encodeURIComponent(message)}`);
}

function ok(success: string): never {
  revalidatePath("/");
  revalidatePath(BANNERS_PATH);
  redirect(`${BANNERS_PATH}?success=${success}`);
}

function parseLinkType(raw: FormDataEntryValue | null): HomeHeroLinkType {
  const value = String(raw ?? "none").trim().toLowerCase() as HomeHeroLinkType;
  return LINK_TYPES.has(value) ? value : "none";
}

function parseOptionalUuid(raw: FormDataEntryValue | null): string | null {
  const value = String(raw ?? "").trim();
  return value || null;
}

function parseOptionalDateTime(raw: FormDataEntryValue | null, label: string): string | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) fail(`Invalid ${label}.`);
  return parsed.toISOString();
}

function parseOptionalAmount(raw: FormDataEntryValue | null): number | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) fail("Invalid promo fee.");
  return Math.round(amount * 100) / 100;
}

function parseSortOrder(raw: FormDataEntryValue | null): number {
  const value = String(raw ?? "").trim();
  if (!value) return 0;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) fail("Invalid sort order.");
  return n;
}

function buildSlidePayload(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) fail("Title is required.");

  const linkType = parseLinkType(formData.get("link_type"));
  let restaurantId = parseOptionalUuid(formData.get("restaurant_id"));
  let menuItemId = parseOptionalUuid(formData.get("menu_item_id"));

  if (linkType === "none") {
    restaurantId = null;
    menuItemId = null;
  } else if (linkType === "store") {
    if (!restaurantId) fail("Pick a store for this banner link.");
    menuItemId = null;
  } else if (linkType === "item") {
    if (!restaurantId) fail("Pick a store for this banner link.");
    if (!menuItemId) fail("Pick a menu item for this banner link.");
  }

  const useStoreLogo =
    linkType !== "none" &&
    (formData.get("use_store_logo") === "true" || formData.get("use_store_logo") === "on");

  const startsAt = parseOptionalDateTime(formData.get("starts_at"), "start date");
  const endsAt = parseOptionalDateTime(formData.get("ends_at"), "end date");
  if (startsAt && endsAt && new Date(endsAt) < new Date(startsAt)) {
    fail("End date must be after start date.");
  }

  return {
    title,
    subtitle: String(formData.get("subtitle") ?? "").trim(),
    link_type: linkType,
    restaurant_id: restaurantId,
    menu_item_id: menuItemId,
    sort_order: parseSortOrder(formData.get("sort_order")),
    is_active: formData.get("is_active") === "true" || formData.get("is_active") === "on",
    use_store_logo: useStoreLogo,
    starts_at: startsAt,
    ends_at: endsAt,
    promo_fee_usd: parseOptionalAmount(formData.get("promo_fee_usd")),
    notes: String(formData.get("notes") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  };
}

export async function createHomeHeroSlideAction(formData: FormData) {
  await requireSuperAdmin();
  const admin = getAdminClient();
  const payload = buildSlidePayload(formData);

  const { error } = await admin.from("home_hero_slides").insert(payload);
  if (error) fail(error.message);
  ok("banner_created");
}

export async function updateHomeHeroSlideAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) fail("Missing banner id.");

  const admin = getAdminClient();
  const payload = buildSlidePayload(formData);

  const { error } = await admin.from("home_hero_slides").update(payload).eq("id", id);
  if (error) fail(error.message);
  ok("banner_updated");
}

export async function toggleHomeHeroSlideActiveAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) fail("Missing banner id.");

  const admin = getAdminClient();
  const nextActive = formData.get("is_active") === "true";
  const { error } = await admin
    .from("home_hero_slides")
    .update({ is_active: nextActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) fail(error.message);
  ok(nextActive ? "banner_activated" : "banner_deactivated");
}

export async function reorderHomeHeroSlideAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const direction = String(formData.get("direction") ?? "").trim();
  if (!id) fail("Missing banner id.");
  if (direction !== "up" && direction !== "down") fail("Invalid reorder direction.");

  const admin = getAdminClient();
  const { data: slides, error } = await admin
    .from("home_hero_slides")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) fail(error.message);
  const list = slides ?? [];
  const index = list.findIndex((s) => s.id === id);
  if (index < 0) fail("Banner not found.");

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= list.length) {
    revalidatePath(BANNERS_PATH);
    redirect(BANNERS_PATH);
  }

  const reordered = [...list];
  const tmp = reordered[index];
  reordered[index] = reordered[swapWith];
  reordered[swapWith] = tmp;

  const nowIso = new Date().toISOString();
  for (let i = 0; i < reordered.length; i += 1) {
    const slide = reordered[i];
    if (slide.sort_order === i) continue;
    const { error: updateError } = await admin
      .from("home_hero_slides")
      .update({ sort_order: i, updated_at: nowIso })
      .eq("id", slide.id);
    if (updateError) fail(updateError.message);
  }

  ok("banner_reordered");
}

export async function deleteHomeHeroSlideAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) fail("Missing banner id.");

  const admin = getAdminClient();
  const { error } = await admin.from("home_hero_slides").delete().eq("id", id);
  if (error) fail(error.message);
  ok("banner_deleted");
}
