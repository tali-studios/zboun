"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MENU_ITEMS_ADMIN_PATH } from "@/lib/menu-items-admin-data";
import {
  CATALOG_IMPORT_INSERT_CHUNK,
  CATALOG_IMPORT_MAX_ROWS,
  buildOptionGroupsFromImportRow,
  type CatalogImportRow,
} from "@/lib/catalog-import";
import { parseCatalogImportWorkbook } from "@/lib/catalog-import-template";
import {
  uploadCatalogPlaceholderImage,
  uploadColorSwatchImage,
} from "@/lib/catalog-placeholder-image";
import { normalizeDisplayUnit, toLegacyGramsValue } from "@/lib/display-quantity";
import { parseItemAudience } from "@/lib/item-audience";
import {
  isColorLikeOptionLabel,
  primaryOptionLabel,
  serializeOptionGroups,
  type MenuOptionGroup,
} from "@/lib/menu-item-options";

async function requireRestaurantAdmin() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) {
    redirect("/dashboard/login");
  }
  return user as typeof user & { restaurant_id: string };
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function resolveOrCreateSectionId(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  restaurantId: string,
  sectionName: string,
  cache: Map<string, string>,
): Promise<string> {
  const key = sectionName.trim().toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;

  const { data: existing } = await supabase
    .from("categories")
    .select("id, name")
    .eq("restaurant_id", restaurantId);

  for (const row of existing ?? []) {
    const name = String(row.name ?? "");
    cache.set(name.toLowerCase(), row.id as string);
  }
  const hit = cache.get(key);
  if (hit) return hit;

  const { data: maxPos } = await supabase
    .from("categories")
    .select("position")
    .eq("restaurant_id", restaurantId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPos = Number(maxPos?.position ?? 0) + 1;

  const { data: created, error } = await supabase
    .from("categories")
    .insert({
      restaurant_id: restaurantId,
      name: sectionName.trim(),
      position: nextPos,
    })
    .select("id")
    .single();

  if (error || !created?.id) {
    throw new Error(error?.message ?? `Could not create section “${sectionName}”.`);
  }
  cache.set(key, created.id as string);
  return created.id as string;
}

async function resolveBrand(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  restaurantId: string,
  brandName: string | null,
  cache: Map<string, { id: string; name: string }>,
): Promise<{ brandId: string | null; brandName: string | null }> {
  if (!brandName) return { brandId: null, brandName: null };
  const key = brandName.trim().toLowerCase();
  if (!key) return { brandId: null, brandName: null };

  const cached = cache.get(key);
  if (cached) return { brandId: cached.id, brandName: cached.name };

  const { data: existing } = await supabase
    .from("menu_brands")
    .select("id, name")
    .eq("restaurant_id", restaurantId)
    .ilike("name", brandName.trim())
    .maybeSingle();

  if (existing?.id) {
    cache.set(key, { id: existing.id as string, name: existing.name as string });
    return { brandId: existing.id as string, brandName: existing.name as string };
  }

  const { data: created, error } = await supabase
    .from("menu_brands")
    .insert({
      restaurant_id: restaurantId,
      name: brandName.trim(),
    })
    .select("id, name")
    .single();

  if (error || !created?.id) {
    // Brand table may be missing — keep free-text brand_name only.
    return { brandId: null, brandName: brandName.trim() };
  }

  cache.set(key, { id: created.id as string, name: created.name as string });
  return { brandId: created.id as string, brandName: created.name as string };
}

async function attachColorSwatches(
  restaurantId: string,
  groups: MenuOptionGroup[],
  swatchCache: Map<string, string>,
): Promise<MenuOptionGroup[]> {
  const next: MenuOptionGroup[] = [];
  for (const group of groups) {
    if (!isColorLikeOptionLabel(group.label)) {
      next.push(group);
      continue;
    }
    const values = [];
    for (const value of group.values) {
      try {
        const imageUrl = await uploadColorSwatchImage(restaurantId, value.name, swatchCache);
        values.push({ ...value, image_url: imageUrl });
      } catch {
        values.push(value);
      }
    }
    next.push({ ...group, values });
  }
  return next;
}

function buildInsertPayload(
  restaurantId: string,
  categoryId: string,
  row: CatalogImportRow,
  imageUrl: string,
  brandId: string | null,
  brandName: string | null,
  optionGroups: MenuOptionGroup[],
) {
  const unit = normalizeDisplayUnit(row.displayUnit);
  const displayQuantity = row.displayQuantity;
  const grams =
    displayQuantity != null ? toLegacyGramsValue(displayQuantity, unit) : null;
  const audience = parseItemAudience(row.audience);
  const serialized = serializeOptionGroups(optionGroups);

  return {
    restaurant_id: restaurantId,
    category_id: categoryId,
    name: row.name,
    brand_id: brandId,
    brand_name: brandName,
    description: row.description,
    contents: row.contents,
    price: row.soldByWeight ? 0 : row.price,
    image_url: imageUrl,
    grams,
    display_quantity: displayQuantity,
    display_unit: unit,
    calories: row.calories,
    protein_g: row.proteinG,
    audience,
    removable_ingredients: row.removableIngredients,
    add_ingredients: row.addOnIngredients,
    option_label: primaryOptionLabel(serialized),
    option_values: serialized,
    option_variant_stock: {} as Record<string, number>,
    option_variant_prices: {} as Record<string, number>,
    track_stock: row.trackStock,
    stock_quantity: row.trackStock ? (row.stockQuantity ?? 0) : null,
    stock_alert_warning_qty: row.stockAlertWarningQty,
    stock_alert_urgent_qty: row.stockAlertUrgentQty,
    stock_alert_critical_qty: row.stockAlertCriticalQty,
    is_available: row.trackStock ? (row.stockQuantity ?? 0) > 0 : row.isAvailable,
    sold_by_weight: row.soldByWeight,
    price_per_kg: row.soldByWeight ? row.pricePerKg : null,
    weight_step_kg: row.soldByWeight ? row.weightStepKg : 0.1,
  };
}

export type CatalogImportActionResult =
  | {
      ok: true;
      imported: number;
      skipped: number;
      createdSections: number;
      errors: Array<{ rowNumber: number; message: string }>;
    }
  | { ok: false; error: string; errors?: Array<{ rowNumber: number; message: string }> };

export async function importCatalogFromExcelAction(
  formData: FormData,
): Promise<CatalogImportActionResult> {
  const user = await requireRestaurantAdmin();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an Excel .xlsx file to import." };
  }
  if (file.size > 4 * 1024 * 1024) {
    return { ok: false, error: "File is too large (max 4MB)." };
  }
  const nameLower = file.name.toLowerCase();
  if (!nameLower.endsWith(".xlsx") && !nameLower.endsWith(".xlsm")) {
    return { ok: false, error: "Upload the official .xlsx template." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = await parseCatalogImportWorkbook(buffer);

  if (parsed.errors.length && parsed.rows.length === 0) {
    return {
      ok: false,
      error: parsed.errors[0]?.message ?? "Could not read the Excel file.",
      errors: parsed.errors,
    };
  }

  if (parsed.rows.length === 0) {
    return { ok: false, error: "No item rows found. Fill the Items sheet and try again." };
  }

  if (parsed.rows.length > CATALOG_IMPORT_MAX_ROWS) {
    return {
      ok: false,
      error: `Max ${CATALOG_IMPORT_MAX_ROWS} items per import. Split your file and try again.`,
    };
  }

  const supabase = await createServerSupabaseClient();
  const restaurantId = user.restaurant_id;
  const sectionCache = new Map<string, string>();
  const brandCache = new Map<string, { id: string; name: string }>();
  const colorSwatchCache = new Map<string, string>();
  const rowErrors = [...parsed.errors];
  let imported = 0;
  let createdSections = 0;
  const sectionsBefore = new Set(
    (
      (
        await supabase
          .from("categories")
          .select("name")
          .eq("restaurant_id", restaurantId)
      ).data ?? []
    ).map((c) => String(c.name ?? "").toLowerCase()),
  );

  // Pre-resolve sections + brands, generate placeholders, then insert in chunks.
  type Prepared = {
    row: CatalogImportRow;
    payload: ReturnType<typeof buildInsertPayload>;
  };
  const prepared: Prepared[] = [];

  for (const row of parsed.rows) {
    try {
      const sectionKey = row.sectionName.toLowerCase();
      const existed = sectionsBefore.has(sectionKey) || sectionCache.has(sectionKey);
      const categoryId = await resolveOrCreateSectionId(
        supabase,
        restaurantId,
        row.sectionName,
        sectionCache,
      );
      if (!existed && !sectionsBefore.has(sectionKey)) {
        createdSections += 1;
        sectionsBefore.add(sectionKey);
      }

      const brand = await resolveBrand(supabase, restaurantId, row.brandName, brandCache);
      const imageUrl = await uploadCatalogPlaceholderImage(restaurantId, row.name);
      const optionGroups = await attachColorSwatches(
        restaurantId,
        buildOptionGroupsFromImportRow(row),
        colorSwatchCache,
      );
      prepared.push({
        row,
        payload: buildInsertPayload(
          restaurantId,
          categoryId,
          row,
          imageUrl,
          brand.brandId,
          brand.brandName,
          optionGroups,
        ),
      });
    } catch (error) {
      rowErrors.push({
        rowNumber: row.rowNumber,
        message: error instanceof Error ? error.message : "Could not prepare this row.",
      });
    }
  }

  for (const batch of chunkArray(prepared, CATALOG_IMPORT_INSERT_CHUNK)) {
    const payloads = batch.map((b) => b.payload);
    const { error } = await supabase.from("menu_items").insert(payloads);
    if (!error) {
      imported += batch.length;
      continue;
    }

    // Fallback: retry without optional columns that may be missing in older DBs.
    const slim = payloads.map((p) => {
      const {
        audience: _a,
        brand_id: _b,
        display_quantity: _d,
        display_unit: _u,
        option_variant_stock: _ovs,
        option_variant_prices: _ovp,
        track_stock: _ts,
        stock_quantity: _sq,
        ...rest
      } = p;
      return {
        ...rest,
        brand_name: p.brand_name,
        is_available: p.is_available,
      };
    });
    const retry = await supabase.from("menu_items").insert(slim);
    if (!retry.error) {
      imported += batch.length;
      continue;
    }

    // Last resort: insert one-by-one so good rows still land.
    for (const item of batch) {
      const one = await supabase.from("menu_items").insert(item.payload);
      if (!one.error) {
        imported += 1;
        continue;
      }
      const oneSlim = await supabase.from("menu_items").insert({
        restaurant_id: item.payload.restaurant_id,
        category_id: item.payload.category_id,
        name: item.payload.name,
        description: item.payload.description,
        price: item.payload.price,
        image_url: item.payload.image_url,
        contents: item.payload.contents,
        removable_ingredients: [],
        add_ingredients: [],
        is_available: item.payload.is_available,
      });
      if (!oneSlim.error) {
        imported += 1;
      } else {
        rowErrors.push({
          rowNumber: item.row.rowNumber,
          message: oneSlim.error.message || one.error.message,
        });
      }
    }
  }

  revalidatePath(MENU_ITEMS_ADMIN_PATH);
  revalidatePath("/dashboard/business");

  const skipped = Math.max(0, parsed.rows.length - imported);
  if (imported === 0) {
    return {
      ok: false,
      error: rowErrors[0]?.message ?? "Import failed. Check your template and try again.",
      errors: rowErrors.slice(0, 20),
    };
  }

  return {
    ok: true,
    imported,
    skipped,
    createdSections,
    errors: rowErrors.slice(0, 20),
  };
}
