export const ITEM_AUDIENCES = ["men", "women", "unisex", "boys", "girls"] as const;

export type ItemAudience = (typeof ITEM_AUDIENCES)[number];

export const ITEM_AUDIENCE_LABELS: Record<ItemAudience, string> = {
  men: "Men",
  women: "Women",
  unisex: "Unisex",
  boys: "Boys",
  girls: "Girls",
};

export function parseItemAudience(
  raw: string | null | undefined,
): ItemAudience | null {
  const value = String(raw ?? "").trim().toLowerCase();
  return (ITEM_AUDIENCES as readonly string[]).includes(value)
    ? (value as ItemAudience)
    : null;
}

export function parseItemAudienceFromForm(formData: FormData): ItemAudience | null {
  return parseItemAudience(String(formData.get("audience") ?? ""));
}

export function itemAudienceLabel(value: string | null | undefined): string | null {
  const parsed = parseItemAudience(value);
  return parsed ? ITEM_AUDIENCE_LABELS[parsed] : null;
}

export function itemMatchesAudienceFilter(
  itemAudience: string | null | undefined,
  filter: string | null | undefined,
): boolean {
  const selected = String(filter ?? "").trim().toLowerCase();
  if (!selected || selected === "all") return true;
  const value = parseItemAudience(itemAudience);
  if (!value) return false;
  if (selected === "kids") return value === "boys" || value === "girls";
  if (selected === "men") return value === "men" || value === "unisex";
  if (selected === "women") return value === "women" || value === "unisex";
  return value === selected;
}

/** Shopper/admin filter values, including virtual "kids" (boys + girls). */
export function parseAudienceFilter(raw: string | null | undefined): string {
  const value = String(raw ?? "").trim().toLowerCase();
  if (value === "kids") return "kids";
  return parseItemAudience(value) ?? "";
}

export function isAudienceColumnMigrationError(
  message: string | null | undefined,
  code?: string | null,
): boolean {
  const msg = message ?? "";
  return (
    /\baudience\b/i.test(msg) &&
    (code === "PGRST204" || code === "42703" || /column|schema cache/i.test(msg))
  );
}
