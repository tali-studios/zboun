import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export type HomeHeroLinkType = "none" | "store" | "item";

export type HomeHeroSlideRow = {
  id: string;
  title: string;
  subtitle: string;
  link_type: HomeHeroLinkType;
  restaurant_id: string | null;
  menu_item_id: string | null;
  sort_order: number;
  is_active: boolean;
  use_store_logo: boolean;
  starts_at: string | null;
  ends_at: string | null;
  promo_fee_usd: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/** Public carousel slide (title/subtitle + optional href / image). */
export type HomeHeroSlideView = {
  id?: string;
  title: string;
  subtitle: string;
  href: string | null;
  /** When set, shown instead of the default Z bag. */
  imageUrl: string | null;
};

export const DEFAULT_HOME_HERO_SLIDES: HomeHeroSlideView[] = [
  {
    title: "Support local.",
    subtitle: "Your favorite stores, now on WhatsApp.",
    href: null,
    imageUrl: null,
  },
  {
    title: "Order in one tap.",
    subtitle: "Clear WhatsApp orders — no app needed.",
    href: null,
    imageUrl: null,
  },
  {
    title: "FREE & FAST delivery.",
    subtitle: "🎁 FREE = No delivery fee • ⚡ FAST = Express delivery available.",
    href: null,
    imageUrl: null,
  },
  {
    title: "Discover nearby.",
    subtitle: "Browse menus from stores around you.",
    href: null,
    imageUrl: null,
  },
];

export function isHomeHeroSlidesMigrationError(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.code === "42P01" ||
    msg.includes("home_hero_slides") ||
    msg.includes("does not exist") ||
    msg.includes("schema cache")
  );
}

function getServiceRoleClient(): SupabaseClient | null {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !serviceRoleKey) return null;
  return createClient(env.supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function isSlideInScheduleWindow(
  slide: Pick<HomeHeroSlideRow, "starts_at" | "ends_at">,
  now = new Date(),
) {
  if (slide.starts_at) {
    const start = new Date(slide.starts_at);
    if (!Number.isNaN(start.getTime()) && now < start) return false;
  }
  if (slide.ends_at) {
    const end = new Date(slide.ends_at);
    if (!Number.isNaN(end.getTime()) && now > end) return false;
  }
  return true;
}

export function resolveHomeHeroSlideHref(params: {
  link_type: HomeHeroLinkType | string;
  restaurantSlug: string | null | undefined;
  menuItemId: string | null | undefined;
}): string | null {
  const slug = (params.restaurantSlug ?? "").trim();
  if (!slug) return null;
  if (params.link_type === "store") return `/${slug}`;
  if (params.link_type === "item") {
    const itemId = (params.menuItemId ?? "").trim();
    if (!itemId) return `/${slug}`;
    return `/${slug}?item=${encodeURIComponent(itemId)}`;
  }
  return null;
}

type SlideJoinRow = HomeHeroSlideRow & {
  restaurants:
    | { slug: string; logo_url: string | null }
    | { slug: string; logo_url: string | null }[]
    | null;
};

function restaurantFromJoin(join: SlideJoinRow["restaurants"]): {
  slug: string | null;
  logoUrl: string | null;
} {
  if (!join) return { slug: null, logoUrl: null };
  const row = Array.isArray(join) ? join[0] : join;
  if (!row) return { slug: null, logoUrl: null };
  return {
    slug: row.slug ?? null,
    logoUrl: row.logo_url?.trim() || null,
  };
}

const SLIDE_COLUMNS =
  "id, title, subtitle, link_type, restaurant_id, menu_item_id, sort_order, is_active, use_store_logo, starts_at, ends_at, promo_fee_usd, notes, created_at, updated_at";

export async function listAllHomeHeroSlides(
  client?: SupabaseClient,
): Promise<HomeHeroSlideRow[]> {
  const admin = client ?? getServiceRoleClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("home_hero_slides")
    .select(SLIDE_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (isHomeHeroSlidesMigrationError(error)) return [];
    throw error;
  }
  return (data ?? []).map((row) => ({
    ...(row as HomeHeroSlideRow),
    use_store_logo: Boolean((row as HomeHeroSlideRow).use_store_logo),
  }));
}

export async function getActiveHomeHeroSlides(
  client?: SupabaseClient,
): Promise<HomeHeroSlideView[]> {
  const admin = client ?? getServiceRoleClient();
  if (!admin) return DEFAULT_HOME_HERO_SLIDES;

  const { data, error } = await admin
    .from("home_hero_slides")
    .select(`${SLIDE_COLUMNS}, restaurants(slug, logo_url)`)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (isHomeHeroSlidesMigrationError(error)) return DEFAULT_HOME_HERO_SLIDES;
    console.error("getActiveHomeHeroSlides:", error.message);
    return DEFAULT_HOME_HERO_SLIDES;
  }

  const now = new Date();
  const views: HomeHeroSlideView[] = [];
  for (const raw of (data ?? []) as SlideJoinRow[]) {
    if (!isSlideInScheduleWindow(raw, now)) continue;
    const title = String(raw.title ?? "").trim();
    if (!title) continue;
    const restaurant = restaurantFromJoin(raw.restaurants);
    const useStoreLogo = Boolean(raw.use_store_logo);
    views.push({
      id: raw.id,
      title,
      subtitle: String(raw.subtitle ?? ""),
      href: resolveHomeHeroSlideHref({
        link_type: raw.link_type,
        restaurantSlug: restaurant.slug,
        menuItemId: raw.menu_item_id,
      }),
      imageUrl: useStoreLogo ? restaurant.logoUrl : null,
    });
  }

  return views.length > 0 ? views : DEFAULT_HOME_HERO_SLIDES;
}
