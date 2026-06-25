export type AddonKey =
  | "inventory"
  | "accounting"
  | "pos"
  | "crm"
  | "loyalty"
  | "events"
  | "pms"
  | "ecommerce"
  | "fleet"
  | "club";

export type BusinessTypeKey =
  | "restaurant"
  | "cloud_kitchen"
  | "retail_store"
  | "hotel_resort"
  | "fitness_club";

export type BusinessTypePreset = {
  key: BusinessTypeKey;
  label: string;
  description: string;
  recommendedAddons: AddonKey[];
};

export const ADDON_LABELS: Record<AddonKey, string> = {
  inventory: "Inventory Management",
  accounting: "Accounting & Payroll",
  pos: "Cloud POS",
  crm: "CRM",
  loyalty: "Loyalty Management",
  events: "Event Management",
  pms: "Property Management (PMS)",
  ecommerce: "E-commerce",
  fleet: "Fleet Management",
  club: "Club Management",
};

export const BUSINESS_TYPE_PRESETS: BusinessTypePreset[] = [
  {
    key: "retail_store",
    label: "Shop / Retail",
    description:
      "Any store that sells items — vape shops, water delivery, gas stations, home goods, convenience stores, and more.",
    recommendedAddons: ["pos", "inventory", "ecommerce", "crm", "loyalty"],
  },
  {
    key: "restaurant",
    label: "Food & Restaurants",
    description:
      "Restaurants, cafés, cloud kitchens, and any food business with a menu or catalog.",
    recommendedAddons: ["pos", "inventory", "crm", "loyalty", "ecommerce", "fleet"],
  },
  {
    key: "cloud_kitchen",
    label: "Food & Restaurants",
    description: "Delivery-first food operations (legacy category — same as Food & Restaurants).",
    recommendedAddons: ["pos", "inventory", "ecommerce", "fleet", "crm"],
  },
  {
    key: "hotel_resort",
    label: "Hotel",
    description: "Room operations, bookings, and events.",
    recommendedAddons: ["pms", "events", "accounting", "pos", "crm"],
  },
  {
    key: "fitness_club",
    label: "Gym",
    description: "Memberships, retention, and recurring customer management.",
    recommendedAddons: ["club", "crm", "loyalty", "accounting"],
  },
];

/** @deprecated Use home page categories (`browse_sections`) instead of a separate business type picker. */
export const BUSINESS_CATEGORY_OPTIONS: BusinessTypePreset[] = BUSINESS_TYPE_PRESETS.filter(
  (preset) => preset.key === "retail_store" || preset.key === "restaurant",
);

export const DEFAULT_BUSINESS_TYPE: BusinessTypeKey = "retail_store";

/** Business types with a public catalog on the home page and browse categories. */
const HOME_BROWSE_TYPES: BusinessTypeKey[] = ["restaurant", "cloud_kitchen", "retail_store"];

export function isLegacySpecialtyBusiness(type: BusinessTypeKey): boolean {
  return type === "hotel_resort" || type === "fitness_club";
}

/** Standard businesses get menu, QR, and home listing (not legacy hotel/gym). */
export function hasCatalogDashboard(type: BusinessTypeKey): boolean {
  return !isLegacySpecialtyBusiness(type);
}

const BUSINESS_TYPE_KEY_SET = new Set<BusinessTypeKey>(
  BUSINESS_TYPE_PRESETS.map((preset) => preset.key),
);

export function parseBusinessType(raw: FormDataEntryValue | null): BusinessTypeKey {
  const value = String(raw ?? "").trim() as BusinessTypeKey;
  return BUSINESS_TYPE_KEY_SET.has(value) ? value : DEFAULT_BUSINESS_TYPE;
}

export function addonsForBusinessType(type: BusinessTypeKey): AddonKey[] {
  const preset = BUSINESS_TYPE_PRESETS.find((item) => item.key === type);
  return preset?.recommendedAddons ?? [];
}

export function supportsHomeBrowseCategory(type: BusinessTypeKey): boolean {
  return hasCatalogDashboard(type);
}

export function getBusinessTypeLabel(type: BusinessTypeKey): string {
  return BUSINESS_TYPE_PRESETS.find((preset) => preset.key === type)?.label ?? "Business";
}

/** Whether this business type sells items through a public menu/catalog page. */
export function hasPublicCatalog(type: BusinessTypeKey): boolean {
  return HOME_BROWSE_TYPES.includes(type);
}
