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
  | "hotel_resort"
  | "fitness_club"
  | "retail_store";

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
    key: "restaurant",
    label: "Restaurant / Cafe",
    description: "Best for dine-in, takeaway, and neighborhood restaurants.",
    recommendedAddons: ["pos", "inventory", "crm", "loyalty"],
  },
  {
    key: "cloud_kitchen",
    label: "Cloud Kitchen / Delivery Brand",
    description: "Best for delivery-first operations and high order throughput.",
    recommendedAddons: ["pos", "inventory", "ecommerce", "fleet", "crm"],
  },
  {
    key: "hotel_resort",
    label: "Hotel / Resort / Venue",
    description: "Best for room operations, bookings, and events.",
    recommendedAddons: ["pms", "events", "accounting", "pos", "crm"],
  },
  {
    key: "fitness_club",
    label: "Gym / Fitness / Private Club",
    description: "Best for memberships, retention, and recurring customer management.",
    recommendedAddons: ["club", "crm", "loyalty", "accounting"],
  },
  {
    key: "retail_store",
    label: "Retail Store",
    description: "Best for non-food stores with omnichannel sales.",
    recommendedAddons: ["pos", "inventory", "ecommerce", "crm", "loyalty"],
  },
];

export const DEFAULT_BUSINESS_TYPE: BusinessTypeKey = "restaurant";
const HOME_BROWSE_TYPES: BusinessTypeKey[] = ["restaurant"];

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
  return HOME_BROWSE_TYPES.includes(type);
}

export function getBusinessTypeLabel(type: BusinessTypeKey): string {
  return BUSINESS_TYPE_PRESETS.find((preset) => preset.key === type)?.label ?? "Business";
}
