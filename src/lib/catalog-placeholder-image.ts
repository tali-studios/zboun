import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { resolveColorSwatch } from "@/lib/color-swatches";

const PALETTE = [
  "#7c3aed",
  "#2563eb",
  "#0d9488",
  "#ca8a04",
  "#db2777",
  "#ea580c",
  "#4f46e5",
  "#059669",
  "#b45309",
  "#9333ea",
];

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function initialsFromItemName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return "ZB";
  return parts.map((p) => p[0]!.toUpperCase()).join("").slice(0, 2);
}

export function colorForItemName(name: string): string {
  return PALETTE[hashString(name.toLowerCase()) % PALETTE.length]!;
}

/** Simple SVG placeholder — store admin can replace the photo later. */
export function buildCatalogPlaceholderSvg(itemName: string): string {
  const initials = initialsFromItemName(itemName);
  const fill = colorForItemName(itemName);
  const safeName = itemName
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .slice(0, 42);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${fill}"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#g)"/>
  <circle cx="400" cy="340" r="120" fill="rgba(255,255,255,0.18)"/>
  <text x="400" y="370" text-anchor="middle" fill="#ffffff" font-family="system-ui,Segoe UI,sans-serif" font-size="92" font-weight="700">${initials}</text>
  <text x="400" y="520" text-anchor="middle" fill="#ffffff" font-family="system-ui,Segoe UI,sans-serif" font-size="28" font-weight="600" opacity="0.92">${safeName}</text>
  <text x="400" y="570" text-anchor="middle" fill="#ffffff" font-family="system-ui,Segoe UI,sans-serif" font-size="18" opacity="0.7">Placeholder · replace in Catalog</text>
</svg>`;
}

function solidSwatchHex(colorName: string): string {
  const { background } = resolveColorSwatch(colorName);
  if (background.startsWith("#")) return background;
  return "#94a3b8";
}

export function buildColorSwatchSvg(colorName: string): string {
  const fill = solidSwatchHex(colorName);
  const safe = colorName
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .slice(0, 28);
  const labelColor =
    fill === "#f5f5f5" || fill === "#fffff0" || fill === "#fffdd0" || fill === "#d8c3a5"
      ? "#334155"
      : "#ffffff";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="${fill}"/>
  <text x="300" y="310" text-anchor="middle" fill="${labelColor}" font-family="system-ui,Segoe UI,sans-serif" font-size="42" font-weight="700">${safe}</text>
  <text x="300" y="360" text-anchor="middle" fill="${labelColor}" font-family="system-ui,Segoe UI,sans-serif" font-size="16" opacity="0.75">Color swatch · replace later</text>
</svg>`;
}

function getStorageAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or Supabase URL.");
  }
  return createClient(env.supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const knownBuckets = new Set<string>();

async function ensureBucketExists(bucket: string) {
  if (knownBuckets.has(bucket)) return;
  const adminClient = getStorageAdminClient();
  const { data: buckets, error: listError } = await adminClient.storage.listBuckets();
  if (listError) throw listError;
  if ((buckets ?? []).some((b) => b.name === bucket)) {
    knownBuckets.add(bucket);
    return;
  }
  const { error: createError } = await adminClient.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
  });
  if (createError) throw createError;
  knownBuckets.add(bucket);
}

async function uploadSvg(
  restaurantId: string,
  folder: string,
  fileStem: string,
  svg: string,
): Promise<string> {
  const bytes = Buffer.from(svg, "utf8");
  const safeStem = fileStem.replace(/[^a-z0-9-_]/gi, "-").slice(0, 40) || "img";
  const filePath = `${restaurantId}/${folder}/${Date.now()}-${safeStem}-${crypto.randomUUID().slice(0, 8)}.svg`;
  const bucket = process.env.SUPABASE_MENU_BUCKET ?? "menu-items";
  await ensureBucketExists(bucket);
  const adminClient = getStorageAdminClient();

  const { error: uploadError } = await adminClient.storage.from(bucket).upload(filePath, bytes, {
    contentType: "image/svg+xml",
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data } = adminClient.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

/** Upload a generated placeholder SVG and return its public URL. */
export async function uploadCatalogPlaceholderImage(
  restaurantId: string,
  itemName: string,
): Promise<string> {
  return uploadSvg(restaurantId, "placeholders", "item", buildCatalogPlaceholderSvg(itemName));
}

/** Upload a solid color swatch for a fashion/electronics Color option. */
export async function uploadColorSwatchImage(
  restaurantId: string,
  colorName: string,
  cache: Map<string, string>,
): Promise<string> {
  const key = colorName.trim().toLowerCase();
  const hit = cache.get(key);
  if (hit) return hit;
  const url = await uploadSvg(
    restaurantId,
    "color-swatches",
    colorName,
    buildColorSwatchSvg(colorName),
  );
  cache.set(key, url);
  return url;
}
